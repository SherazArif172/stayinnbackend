# Admin Role System Documentation

## Overview
Admin role system for StayInn Hostels that allows only admin users to access the admin dashboard and manage the website.

## Features

1. **Role-based Access Control**: Users have either `user` or `admin` role
2. **Separate Admin Login**: Admin login endpoint separate from regular user login
3. **Admin Middleware**: Protects admin routes and verifies admin role
4. **Dashboard Stats**: Admin dashboard endpoint with user statistics

## User Model Changes

The User model now includes a `role` field:
- `role`: String, enum: `['user', 'admin']`, default: `'user'`

## Creating an Admin User

### Method 1: Using the Script (Recommended)

Run the create admin script:

```bash
npm run create-admin
```

Or with custom details:

```bash
npm run create-admin admin@stayinnhostels.com adminpassword123 "Admin Name"
```

**Default credentials:**
- Email: `admin@stayinnhostels.com`
- Password: `admin123456`
- Full Name: `Admin User`

⚠️ **Important**: Change the password after first login!

### Method 2: Manual Database Update

You can also manually update a user's role in MongoDB:

```javascript
// In MongoDB shell or using Mongoose
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)
```

## API Endpoints

### 1. Admin Login
**POST** `/api/admin/login`

**Request Body:**
```json
{
  "email": "admin@stayinnhostels.com",
  "password": "admin123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "...",
    "fullName": "Admin User",
    "email": "admin@stayinnhostels.com",
    "role": "admin",
    "isEmailVerified": true
  }
}
```

**Error Responses:**
- `401`: Invalid email or password
- `403`: User is not an admin OR email not verified

### 2. Admin Dashboard Stats
**GET** `/api/admin/dashboard`

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "users": {
      "total": 150,
      "verified": 120,
      "unverified": 30
    },
    "admins": {
      "total": 3
    }
  }
}
```

## Admin Middleware

Use `authenticateAdmin` middleware to protect admin-only routes:

```javascript
import { authenticateAdmin } from '../middleware/auth.js';

router.get('/admin-only-route', authenticateAdmin, (req, res) => {
  // req.user contains the authenticated admin user
  res.json({ admin: req.user });
});
```

## Security Features

1. **Role Verification**: Admin middleware checks if user has `admin` role
2. **Email Verification**: Admins must have verified email (can be auto-verified during creation)
3. **Separate Login**: Admin login endpoint prevents non-admins from accessing admin routes
4. **JWT Token**: Admin tokens include role information

## Differences: Regular Login vs Admin Login

| Feature | Regular Login (`/api/auth/login`) | Admin Login (`/api/admin/login`) |
|---------|-----------------------------------|----------------------------------|
| **Endpoint** | `/api/auth/login` | `/api/admin/login` |
| **Access** | All verified users | Only admin users |
| **Role Check** | No | Yes (must be admin) |
| **Use Case** | User dashboard, booking | Admin dashboard, management |

## Protecting Routes

### Regular User Routes
```javascript
import { authenticate } from '../middleware/auth.js';

router.get('/user-route', authenticate, (req, res) => {
  // Any authenticated user can access
});
```

### Admin-Only Routes
```javascript
import { authenticateAdmin } from '../middleware/auth.js';

router.get('/admin-route', authenticateAdmin, (req, res) => {
  // Only admins can access
});
```

## Testing with Postman

### 1. Create Admin User
```bash
npm run create-admin
```

### 2. Admin Login
- **Method**: POST
- **URL**: `http://localhost:5000/api/admin/login`
- **Body**:
```json
{
  "email": "admin@stayinnhostels.com",
  "password": "admin123456"
}
```

### 3. Access Admin Dashboard
- **Method**: GET
- **URL**: `http://localhost:5000/api/admin/dashboard`
- **Headers**:
```
Authorization: Bearer <token-from-login>
```

## Example: Adding More Admin Routes

```javascript
// src/routes/adminRoutes.js
import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import { getDashboardStats } from '../controllers/adminController.js';

const router = express.Router();

// Admin login (no auth required)
router.post('/login', adminLogin);

// Protected admin routes
router.get('/dashboard', authenticateAdmin, getDashboardStats);
router.get('/users', authenticateAdmin, getAllUsers);
router.post('/rooms', authenticateAdmin, createRoom);
router.put('/rooms/:id', authenticateAdmin, updateRoom);
router.delete('/rooms/:id', authenticateAdmin, deleteRoom);

export default router;
```

## Notes

- Admin users are automatically email-verified when created via script
- Regular users cannot access admin routes even with a valid token
- Admin tokens include role information in the JWT payload
- Always change default admin password after first login

