/**
 * Client-side input validation and sanitization
 * Prevents XSS, SQL injection, and validates input formats
 */

// Email validation (RFC 5322 compliant)
export function validateEmail(email: string): { valid: boolean; error?: string } {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!email || email.trim() === '') {
    return { valid: false, error: 'Email is required' };
  }

  if (email.length > 254) {
    return { valid: false, error: 'Email is too long' };
  }

  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
}

// Password validation
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' };
  }

  if (password.length > 128) {
    return { valid: false, error: 'Password is too long (max 128 characters)' };
  }

  // Check for at least one uppercase, one lowercase, one number, one special char
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUpperCase) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' };
  }

  if (!hasLowerCase) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' };
  }

  if (!hasNumber) {
    return { valid: false, error: 'Password must contain at least one number' };
  }

  if (!hasSpecialChar) {
    return { valid: false, error: 'Password must contain at least one special character (!@#$%^&*...)' };
  }

  return { valid: true };
}

// Username validation (alphanumeric, underscore, hyphen)
export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username || username.trim() === '') {
    return { valid: false, error: 'Username is required' };
  }

  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters long' };
  }

  if (username.length > 30) {
    return { valid: false, error: 'Username is too long (max 30 characters)' };
  }

  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }

  return { valid: true };
}

// Name validation (letters, spaces, common punctuation)
export function validateName(name: string, fieldName: string = 'Name'): { valid: boolean; error?: string } {
  if (!name || name.trim() === '') {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (name.length < 2) {
    return { valid: false, error: `${fieldName} must be at least 2 characters long` };
  }

  if (name.length > 100) {
    return { valid: false, error: `${fieldName} is too long (max 100 characters)` };
  }

  // Allow letters, spaces, apostrophes, hyphens, dots
  const nameRegex = /^[a-zA-Z\s'\-.]+$/;
  if (!nameRegex.test(name)) {
    return { valid: false, error: `${fieldName} contains invalid characters` };
  }

  return { valid: true };
}

// Student/Admin ID validation
export function validateID(id: string, type: 'student' | 'admin'): { valid: boolean; error?: string } {
  if (!id || id.trim() === '') {
    return { valid: false, error: `${type === 'student' ? 'Student' : 'Admin'} ID is required` };
  }

  // Alphanumeric and hyphens only
  const idRegex = /^[a-zA-Z0-9-]+$/;
  if (!idRegex.test(id)) {
    return { valid: false, error: 'ID can only contain letters, numbers, and hyphens' };
  }

  if (id.length < 3 || id.length > 20) {
    return { valid: false, error: 'ID must be between 3 and 20 characters' };
  }

  return { valid: true };
}

// Phone number validation (basic)
export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (!phone || phone.trim() === '') {
    return { valid: true }; // Phone is optional
  }

  // Remove common separators for validation
  const cleaned = phone.replace(/[\s()+-]/g, '');

  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, error: 'Phone number can only contain digits and separators (+, -, (), spaces)' };
  }

  if (cleaned.length < 10 || cleaned.length > 15) {
    return { valid: false, error: 'Phone number must be between 10 and 15 digits' };
  }

  return { valid: true };
}

// Generic text sanitization (prevent XSS)
export function sanitizeText(text: string): string {
  if (!text) return '';

  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Validate all signup fields
export interface SignupFormData {
  full_name: string;
  username: string;
  student_id?: string;
  admin_id?: string;
  email: string;
  password: string;
  confirm_password: string;
}

export function validateSignupForm(data: SignupFormData): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  // Validate full name
  const nameCheck = validateName(data.full_name, 'Full name');
  if (!nameCheck.valid) errors.full_name = nameCheck.error!;

  // Validate username
  const usernameCheck = validateUsername(data.username);
  if (!usernameCheck.valid) errors.username = usernameCheck.error!;

  // Validate student/admin ID
  if (data.student_id) {
    const idCheck = validateID(data.student_id, 'student');
    if (!idCheck.valid) errors.student_id = idCheck.error!;
  }

  if (data.admin_id) {
    const idCheck = validateID(data.admin_id, 'admin');
    if (!idCheck.valid) errors.admin_id = idCheck.error!;
  }

  // Validate email
  const emailCheck = validateEmail(data.email);
  if (!emailCheck.valid) errors.email = emailCheck.error!;

  // Validate password
  const passwordCheck = validatePassword(data.password);
  if (!passwordCheck.valid) errors.password = passwordCheck.error!;

  // Confirm password match
  if (data.password !== data.confirm_password) {
    errors.confirm_password = 'Passwords do not match';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

// Validate login form
export interface LoginFormData {
  email: string;
  password: string;
}

export function validateLoginForm(data: LoginFormData): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  // Validate email
  const emailCheck = validateEmail(data.email);
  if (!emailCheck.valid) errors.email = emailCheck.error!;

  // Basic password check (don't enforce complexity on login)
  if (!data.password || data.password.length === 0) {
    errors.password = 'Password is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
