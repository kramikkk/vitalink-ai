from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models_db import Device, User
from datetime import datetime, timezone, timedelta
from utils.auth_utils import get_current_user, require_admin
import secrets

# Philippine timezone (UTC+8)
PH_TZ = timezone(timedelta(hours=8))

router = APIRouter(prefix="/api/devices", tags=["devices"])


class PairRequest(BaseModel):
    device_id: str
    pairing_code: str


class PairWithCodeRequest(BaseModel):
    pairing_code: str


class DeviceResponse(BaseModel):
    id: int
    device_id: str
    user_id: int | None
    paired: bool
    pairing_code: str | None
    created_at: datetime
    paired_at: datetime | None

    class Config:
        from_attributes = True


@router.post("/pair", status_code=status.HTTP_201_CREATED)
def register_device_for_pairing(request: PairRequest, db: Session = Depends(get_db)):
    """
    ESP32 calls this endpoint when it boots up and generates a pairing code.
    This creates/updates a device record with the pairing code, waiting for a student to pair.
    """
    # Check if device already exists
    device = db.query(Device).filter(Device.device_id == request.device_id).first()
    
    if device:
        # Update existing device with new pairing code (if not already paired)
        if not device.paired:
            device.pairing_code = request.pairing_code
            device.created_at = datetime.now(PH_TZ)
            db.commit()
            db.refresh(device)
            return {"message": "Device pairing code updated", "device_id": device.device_id}
        else:
            return {"message": "Device already paired", "device_id": device.device_id, "paired": True}
    
    # Create new device
    new_device = Device(
        device_id=request.device_id,
        pairing_code=request.pairing_code,
        paired=False,
        created_at=datetime.now(PH_TZ)
    )
    db.add(new_device)
    db.commit()
    db.refresh(new_device)
    
    return {
        "message": "Device registered for pairing",
        "device_id": new_device.device_id,
        "pairing_code": new_device.pairing_code
    }


@router.get("/{device_id}/status")
def check_device_pairing_status(device_id: str, db: Session = Depends(get_db)):
    """
    ESP32 polls this endpoint to check if it has been paired by a student.
    """
    device = db.query(Device).filter(Device.device_id == device_id).first()
    
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found"
        )
    
    return {
        "device_id": device.device_id,
        "paired": device.paired,
        "user_id": device.user_id
    }


@router.post("/pair-with-code")
def pair_device_with_code(
    request: PairWithCodeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Student calls this endpoint from the frontend to pair a device using the 6-digit code.
    The user is authenticated via JWT token.
    """
    # Find device with matching pairing code
    device = db.query(Device).filter(
        Device.pairing_code == request.pairing_code,
        Device.paired == False
    ).first()
    
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid pairing code or device already paired"
        )
    
    # Check if user already has a paired device
    existing_device = db.query(Device).filter(
        Device.user_id == current_user.id,
        Device.paired == True
    ).first()
    
    if existing_device:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has a paired device"
        )
    
    # Pair the device
    device.user_id = current_user.id
    device.paired = True
    device.paired_at = datetime.now(PH_TZ)
    device.pairing_code = None  # Clear the pairing code for security
    
    db.commit()
    db.refresh(device)
    
    return {
        "message": "Device successfully paired",
        "device_id": device.device_id,
        "user_id": device.user_id
    }


@router.get("/my-device")
def get_my_device(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Get the device paired to the current user.
    """
    device = db.query(Device).filter(
        Device.user_id == current_user.id,
        Device.paired == True
    ).first()
    
    if not device:
        return {"device": None}
    
    return {
        "device_id": device.device_id,
        "paired_at": device.paired_at
    }


@router.post("/unpair")
def unpair_device(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Unpair the device from the current user.
    """
    device = db.query(Device).filter(
        Device.user_id == current_user.id,
        Device.paired == True
    ).first()
    
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No paired device found"
        )
    
    # Unpair the device
    device.user_id = None
    device.paired = False
    device.paired_at = None
    
    db.commit()
    
    return {
        "message": "Device unpaired successfully",
        "device_id": device.device_id
    }


@router.get("/all")
def get_all_devices(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get all devices (admin/super_admin only).
    Returns device info with owner details.
    """
    devices = db.query(Device).all()
    
    result = []
    for device in devices:
        device_data = {
            "id": device.id,
            "device_id": device.device_id,
            "owner_id": device.user_id,
            "status": "paired" if device.paired else "unpaired",
            "paired_at": device.paired_at.isoformat() if device.paired_at else None,
            "last_seen": device.created_at.isoformat() if device.created_at else None,
            "owner_name": None,
            "owner_email": None
        }
        
        # Get owner info if device is paired
        if device.user_id:
            user = db.query(User).filter(User.id == device.user_id).first()
            if user:
                device_data["owner_name"] = user.full_name
                device_data["owner_email"] = user.email
        
        result.append(device_data)
    
    return result


@router.delete("/{device_id}/unpair")
def admin_unpair_device(
    device_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Admin unpair a device from any user (admin/super_admin only).
    """
    device = db.query(Device).filter(Device.device_id == device_id).first()
    
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found"
        )
    
    if not device.paired:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Device is not paired"
        )
    
    # Unpair the device
    device.user_id = None
    device.paired = False
    device.paired_at = None
    
    db.commit()
    
    return {
        "message": "Device unpaired successfully",
        "device_id": device.device_id
    }


@router.delete("/{device_id}")
def delete_device(
    device_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Delete a device completely (admin/super_admin only).
    """
    device = db.query(Device).filter(Device.device_id == device_id).first()
    
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found"
        )
    
    # Delete the device
    db.delete(device)
    db.commit()
    
    return {
        "message": "Device deleted successfully",
        "device_id": device_id
    }
