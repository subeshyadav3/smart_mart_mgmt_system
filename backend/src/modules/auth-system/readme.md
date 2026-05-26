# 🔐 Auth System Module

## Overview
The Auth System module is the core authentication and authorization layer for the Smart Mart Management System. It handles secure user authentication for both staff and members, implements role-based access control (RBAC), and manages JWT-based session tokens.

---

## 🎯 Purpose & Responsibilities

### Key Responsibilities
- **User Authentication**: Secure login for staff and members with password validation
- **Member Registration**: Allow customers to register and create membership accounts
- **Staff Management**: Create, update, and manage staff members with role assignments
- **Token Management**: Generate and validate JWT tokens for session management
- **Access Control**: Implement role-based access control with middleware protection
- **Account Management**: Enable/disable accounts and manage user statuses
- **Data Security**: Hash passwords and sanitize sensitive user data

---

## 📋 Supported User Types

### Staff
- **Roles**: ADMIN, STAFF
- **Login**: Uses email and password
- **Permissions**: Full access to admin and staff management functions
- **Features**: Can create and manage members and other staff

### Members
- **Role**: MEMBER (fixed)
- **Login**: Uses membership ID and password
- **Permissions**: Limited to member-specific operations
- **Features**: Can register themselves or be created by staff

---

## 🔌 API Endpoints

### Public Authentication Endpoints

#### Staff Login
```
POST /api/auth/staff/login
Body: { email: string, password: string }
Response: { success: true, statusCode: 200, message: "Login successful", data: { user, token } }
```

#### Member Login
```
POST /api/auth/member/login
Body: { membershipId: string, password: string }
Response: { success: true, statusCode: 200, message: "Login successful", data: { user, token } }
```

#### Member Registration
```
POST /api/auth/member/register
Body: { fullName: string, phoneNumber: string, password: string }
Response: { success: true, statusCode: 201, message: "Membership registration successful", data: user }
```

### Protected Endpoints (Require Authentication)

#### Get Current User
```
GET /api/auth/me
Headers: { Authorization: "Bearer <token>" }
Response: { success: true, data: currentUser }
```

#### Logout
```
POST /api/auth/logout
Headers: { Authorization: "Bearer <token>" }
Response: { success: true, message: "Logged out" }
```

### Staff Management (Admin Only)

#### Create Staff
```
POST /api/auth/staff/create
Headers: { Authorization: "Bearer <admin-token>" }
Body: { fullName: string, email: string, password?: string, phoneNumber: string, role?: "ADMIN"|"STAFF", isActive?: boolean }
Response: { success: true, statusCode: 201, data: staff }
```

#### Get All Staff
```
GET /api/auth/staffs
Headers: { Authorization: "Bearer <admin-token>" }
Response: { success: true, data: [staffList] }
```

#### Update Staff Role
```
PATCH /api/auth/staffs/:id/role
Headers: { Authorization: "Bearer <admin-token>" }
Body: { role: "ADMIN"|"STAFF" }
Response: { success: true, data: updatedStaff }
```

#### Update Staff Status
```
PATCH /api/auth/staffs/:id/status
Headers: { Authorization: "Bearer <admin-token>" }
Body: { isActive: boolean }
Response: { success: true, data: updatedStaff }
```

### Member Management (Admin & Staff)

#### Create Member (by Staff)
```
POST /api/auth/member/create
Headers: { Authorization: "Bearer <staff-token>" }
Body: { fullName: string, phoneNumber: string, password: string }
Response: { success: true, statusCode: 201, message: "Member created successfully", data: member }
```

#### Get All Members
```
GET /api/auth/members
Headers: { Authorization: "Bearer <staff-token>" }
Response: { success: true, data: [memberList] }
```

#### Get Single Member
```
GET /api/auth/members/:id
Headers: { Authorization: "Bearer <staff-token>" }
Response: { success: true, data: member }
```

#### Update Member Status
```
PATCH /api/auth/members/:id/status
Headers: { Authorization: "Bearer <staff-token>" }
Body: { isActive: boolean }
Response: { success: true, data: updatedMember }
```

---

## 📁 Module Structure

```
auth-system/
├── auth.controller.js       # Request handlers and response management
├── auth.service.js          # Business logic and database operations
├── auth.routes.js           # Route definitions and middleware attachments
└── readme.md               # Documentation (this file)
```

### File Responsibilities

| File | Purpose |
|------|---------|
| **auth.controller.js** | Handles HTTP requests, calls service layer, manages responses |
| **auth.service.js** | Contains business logic: validation, password hashing, token generation |
| **auth.routes.js** | Defines all routes, applies authentication and authorization middleware |

---

## 🔒 Security Features

- **Password Hashing**: Passwords are hashed using bcrypt before storage
- **JWT Tokens**: Stateless authentication using JWT with user context
- **Role-Based Access Control (RBAC)**: Middleware validates user roles before granting access
- **User Type Validation**: Separate handling for STAFF and MEMBER types
- **Data Sanitization**: Passwords are never returned in API responses
- **Account Status**: Users must have active accounts to log in
- **Input Validation**: Required fields are validated before processing

---

## 🛡️ Middleware Integration

The module uses three main middleware for security:

1. **authMiddleware**: Verifies JWT token and extracts user information
2. **authorizeRoles**: Validates user has required role (ADMIN, STAFF, etc.)
3. **allowUserTypes**: Validates user type (STAFF or MEMBER)

---

## 🔄 Authentication Flow

```
1. User submits credentials (email/password or membershipId/password)
2. Service validates credentials against database
3. Service checks account is active
4. Service generates JWT token with user context
5. Token returned to client
6. Client includes token in Authorization header for protected routes
7. Middleware verifies token and extracts user info
8. Request proceeds with user context attached
```

---

## 📦 Dependencies

- **prisma**: Database ORM for user queries
- **jsonwebtoken**: JWT token generation and verification
- **bcrypt**: Password hashing and comparison
- **Express**: HTTP routing and middleware support

---
