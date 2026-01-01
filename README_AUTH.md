# Authentication System Documentation

## Overview
Complete authentication system for StayInn Hostels booking website using JWT, bcrypt, and MongoDB.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the backend directory with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://<db_username>:<db_password>@stayinnhostels.i25hv.mongodb.net/?appName=stayinnhostels

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Email Configuration (for Resend)
# Get your API key from: https://resend.com/api-keys
RESEND_API_KEY=re_your_resend_api_key_here
FROM_EMAIL=noreply@yourdomain.com

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000
```

### 3. Email Setup (Resend)
1. Sign up for a free account at https://resend.com
2. Get your API key from https://resend.com/api-keys
3. Add your domain in Resend dashboard (or use the default domain for testing)
4. Set `RESEND_API_KEY` in your `.env` file
5. Set `FROM_EMAIL` to your verified domain email (e.g., `noreply@yourdomain.com`)

## API Endpoints

### 1. Register User
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "cnicFront": "https://example.com/cnic-front.jpg",
  "cnicBack": "https://example.com/cnic-back.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "user": {
    "id": "...",
    "fullName": "John Doe",
    "email": "john@example.com",
    "isEmailVerified": false
  }
}
```

### 2. Verify Email
**POST** `/api/auth/verify-email`

**Request Body:**
```json
{
  "token": "email-verification-token-from-email"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully. You can now login."
}
```

### 3. Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "...",
    "fullName": "John Doe",
    "email": "john@example.com",
    "isEmailVerified": true
  }
}
```

### 4. Forgot Password
**POST** `/api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

### 5. Reset Password
**POST** `/api/auth/reset-password`

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "password": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successful. You can now login with your new password."
}
```

### 6. Change Password (Protected)
**POST** `/api/auth/change-password`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "oldPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

## Authentication Middleware

Use the `authenticate` middleware to protect routes:

```javascript
import { authenticate } from '../middleware/auth.js';

router.get('/protected-route', authenticate, (req, res) => {
  // req.user contains the authenticated user
  res.json({ user: req.user });
});
```

## User Model

The User model includes:
- `fullName` (String, required)
- `email` (String, required, unique)
- `password` (String, required, hashed)
- `cnicFront` (String, required)
- `cnicBack` (String, required)
- `isEmailVerified` (Boolean, default: false)
- `emailVerifyToken` (String)
- `emailVerifyTokenExpiry` (Date)
- `resetPasswordToken` (String)
- `resetPasswordExpiry` (Date)
- `timestamps` (createdAt, updatedAt)

## Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt with 10 salt rounds
2. **JWT Tokens**: Secure token-based authentication
3. **Email Verification**: Users must verify email before login
4. **Token Expiry**: Email verification tokens expire in 24 hours, reset tokens in 1 hour
5. **Password Validation**: Minimum 6 characters required
6. **Protected Routes**: Authentication middleware for protected endpoints

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message here",
  "details": [...] // Optional validation details
}
```

## Testing with Postman

1. Register a new user
2. Check email for verification link (or use token from response)
3. Verify email
4. Login to get JWT token
5. Use JWT token in Authorization header for protected routes

Example Authorization Header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

