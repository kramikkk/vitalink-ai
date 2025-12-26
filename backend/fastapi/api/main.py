from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware
from routers import metrics, auth, devices, alerts, websocket
from database import Base, engine
import os
from dotenv import load_dotenv

load_dotenv()


Base.metadata.create_all(bind=engine)
app = FastAPI(title="IoT Health & Activity API")


# Configure CORS
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
allowed_origins = [origin.strip() for origin in allowed_origins_str.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)



def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Health Metrics API",
        version="1.0.0",
        description="API for user authentication and heart metrics tracking",
        routes=app.routes,
    )
    
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }
    for path in openapi_schema["paths"].values():
        for method in path.values():
            method["security"] = [{"BearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
app.include_router(metrics.router)
app.include_router(auth.router, prefix="/auth")
app.include_router(devices.router)
app.include_router(alerts.router)
app.include_router(websocket.router)  # WebSocket endpoint



@app.get("/")
def root():
    return {"message": "IoT Backend is running"}





