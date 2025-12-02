

# Complaints Management API Documentation

## Table of Contents
- [Introduction](#introduction)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Authentication Endpoints](#authentication-endpoints)
  - [Complaints Management Endpoints](#complaints-management-endpoints)
- [Error Handling](#error-handling)
- [Security Considerations](#security-considerations)

## Introduction

This API provides functionality for managing complaints in a system where users can submit complaints without authentication, while authorized personnel (manager, admin, mukhtar) can manage these complaints.

The system uses JWT tokens for authentication with access tokens (short-lived) and refresh tokens (long-lived) for secure session management.

## Authentication

### Token Types

1. **Access Token**: 
   - Short-lived JWT token
   - Sent in Authorization header as Bearer token
   - Required for protected endpoints
   - Example: `Authorization: Bearer <access_token>`

2. **Refresh Token**:
   - Long-lived token stored in HTTP-only cookie
   - Used to obtain new access tokens
   - Automatically sent by browser with requests
   - Not accessible via JavaScript (security measure)

### Authentication Flow

1. User logs in or registers → receives access token and refresh token cookie
2. Access token is stored in localStorage/memory for API requests
3. Refresh token is stored automatically in HTTP-only cookie
4. When access token expires → use refresh endpoint to get new access token
5. Browser automatically sends refresh token cookie with refresh request

## Endpoints

### Authentication Endpoints

#### Register User
- **Method**: `POST`
- **Path**: `/v1/auth/register`
- **Description**: Register a new user in the system
- **Authentication**: None (public)
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "User Name",
    "role": "admin|manager|mukhtar",
    "neighborhood": "Neighborhood Name" // Required only for mukhtar role
  }
  ```
- **Response**:
  ```json
  {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "User Name",
      "role": "admin",
      "is_active": true,
      "neighborhood": null,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
  ```
- **Status Codes**: 
  - `201` (Created)
  - `400` (Bad Request)
  - `409` (Conflict - email already exists)

#### Login User
- **Method**: `POST`
- **Path**: `/v1/auth/login`
- **Description**: Authenticate a user and return tokens
- **Authentication**: None (public)
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "User Name",
      "role": "admin",
      "is_active": true,
      "neighborhood": null
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
  ```
- **Status Codes**: 
  - `200` (OK)
  - `401` (Unauthorized - invalid credentials)
  - `403` (Forbidden - account inactive)

#### Refresh Token
- **Method**: `POST`
- **Path**: `/v1/auth/refresh`
- **Description**: Get a new access token using a refresh token
- **Authentication**: None (uses refresh token cookie)
- **Request Body**: None
- **Response**:
  ```json
  {
    "accessToken": "new_jwt_token"
  }
  ```
- **Status Codes**: 
  - `200` (OK)
  - `401` (Unauthorized - invalid or expired refresh token)

#### Logout User
- **Method**: `POST`
- **Path**: `/v1/auth/logout`
- **Description**: Logout a user and invalidate their refresh token
- **Authentication**: Bearer token
- **Request Body**: None
- **Response**:
  ```json
  {
    "message": "Logged out successfully"
  }
  ```
- **Status Codes**: 
  - `200` (OK)
  - `401` (Unauthorized)

### Complaints Management Endpoints

#### Create Complaint
- **Method**: `POST`
- **Path**: `/v1/complaints`
- **Description**: Create a new complaint (public endpoint)
- **Authentication**: None (public)
- **Request Body**:
  ```json
  {
    "submitterName": "John Doe",
    "contactNumber": "1234567890",
    "description": "Description of the complaint",
    "location": "123 Main St",
    "neighborhood": "Downtown",
    "complaint_type": "noise|infrastructure|sanitation|other",
    "priority": "high|mid|low", // Optional, defaults to "mid"
    "suggestedSolution": "Suggested solution" // Optional
  }
  ```
- **Response**:
  ```json
  {
    "id": "123",
    "submitterName": "John Doe",
    "contactNumber": "1234567890",
    "description": "Description of the complaint",
    "location": "123 Main St",
    "neighborhood": "Downtown",
    "complaint_type": "noise",
    "priority": "high",
    "trackingTag": "uuid",
    "estimatedReviewTime": "1-2 business days",
    "complaint_status": "pending",
    "solutionInfo": null,
    "refusalReason": null,
    "suggestedSolution": "Suggested solution",
    "notes": null,
    "deletedAt": null,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
  ```
- **Status Codes**: 
  - `201` (Created)
  - `400` (Bad Request)
  - `500` (Server Error)

#### Track Complaint
- **Method**: `GET`
- **Path**: `/v1/complaints/track/:trackingTag`
- **Description**: Track a complaint by its tracking tag (public endpoint)
- **Authentication**: None (public)
- **Request Parameters**:
  - `trackingTag` (path): The unique tracking tag of the complaint
- **Response**: Same as Create Complaint response (without `notes` field)
- **Status Codes**: 
  - `200` (OK)
  - `404` (Not Found)
  - `500` (Server Error)

#### List Complaints
- **Method**: `GET`
- **Path**: `/v1/complaints`
- **Description**: List complaints based on user role
- **Authentication**: Bearer token (roles: manager, admin, mukhtar)
- **Request Parameters**: None
- **Response**: Array of complaint objects (filtered by role):
  - **Manager**: All high priority complaints (including soft-deleted)
  - **Admin**: All mid priority active complaints
  - **Mukhtar**: All low priority active complaints
- **Status Codes**: 
  - `200` (OK)
  - `401` (Unauthorized)
  - `403` (Forbidden)
  - `500` (Server Error)

#### Get Complaint Details
- **Method**: `GET`
- **Path**: `/v1/complaints/:id`
- **Description**: Get details of a specific complaint
- **Authentication**: Bearer token (roles: manager, admin, mukhtar)
- **Request Parameters**:
  - `id` (path): The ID of the complaint
- **Response**: Complaint object
- **Status Codes**: 
  - `200` (OK)
  - `401` (Unauthorized)
  - `403` (Forbidden)
  - `404` (Not Found)
  - `500` (Server Error)

#### Accept Complaint
- **Method**: `PATCH`
- **Path**: `/v1/complaints/:id/accept`
- **Description**: Accept a complaint and provide solution info
- **Authentication**: Bearer token (roles: manager, admin, mukhtar)
- **Request Parameters**:
  - `id` (path): The ID of the complaint
- **Request Body**:
  ```json
  {
    "solutionInfo": "Details of the solution provided"
  }
  ```
- **Response**: Updated complaint object with status "accepted"
- **Status Codes**: 
  - `200` (OK)
  - `400` (Bad Request - missing solutionInfo or invalid status transition)
  - `401` (Unauthorized)
  - `403` (Forbidden)
  - `404` (Not Found)
  - `500` (Server Error)

#### Refuse Complaint
- **Method**: `PATCH`
- **Path**: `/v1/complaints/:id/refuse`
- **Description**: Refuse a complaint and provide refusal reason
- **Authentication**: Bearer token (roles: manager, admin, mukhtar)
- **Request Parameters**:
  - `id` (path): The ID of the complaint
- **Request Body**:
  ```json
  {
    "refusalReason": "Reason for refusing the complaint"
  }
  ```
- **Response**: Updated complaint object with status "refused"
- **Status Codes**: 
  - `200` (OK)
  - `400` (Bad Request - missing refusalReason or invalid status transition)
  - `401` (Unauthorized)
  - `403` (Forbidden)
  - `404` (Not Found)
  - `500` (Server Error)

#### Update Complaint
- **Method**: `PATCH`
- **Path**: `/v1/complaints/:id`
- **Description**: Update complaint details (excluding status)
- **Authentication**: Bearer token (roles: manager, admin, mukhtar)
- **Request Parameters**:
  - `id` (path): The ID of the complaint
- **Request Body**:
  ```json
  {
    "priority": "high|mid|low", // Optional
    "notes": "Internal notes", // Optional
    "estimatedReviewTime": "2-3 business days" // Optional
  }
  ```
- **Response**: Updated complaint object
- **Status Codes**: 
  - `200` (OK)
  - `401` (Unauthorized)
  - `403` (Forbidden)
  - `404` (Not Found)
  - `500` (Server Error)

#### Delete Complaint
- **Method**: `DELETE`
- **Path**: `/v1/complaints/:id`
- **Description**: Delete a complaint (hard delete for manager, soft delete for mukhtar)
- **Authentication**: Bearer token (roles: manager, mukhtar)
- **Request Parameters**:
  - `id` (path): The ID of the complaint
- **Response**:
  ```json
  {
    "message": "Complaint permanently deleted" // For manager
  }
  ```
  or
  ```json
  {
    "message": "Complaint soft deleted" // For mukhtar
  }
  ```
- **Status Codes**: 
  - `200` (OK)
  - `401` (Unauthorized)
  - `403` (Forbidden - admin cannot delete)
  - `404` (Not Found)
  - `500` (Server Error)

## Error Handling

### Standard Error Response Format

All endpoints return errors in the following format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Validation Errors

For validation errors, the response may include additional details:

```json
{
  "error": "Validation failed",
  "details": "Specific field validation error"
}
```

### Common HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| `200` | OK - Request successful |
| `201` | Created - Resource created successfully |
| `400` | Bad Request - Invalid request data |
| `401` | Unauthorized - Authentication required or invalid |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Resource not found |
| `409` | Conflict - Resource already exists |
| `500` | Internal Server Error - Server error |

## Security Considerations

### Token Storage

1. **Access Token**:
   - Store in localStorage or memory
   - Short lifespan (typically 15-60 minutes)
   - Sent with each API request in Authorization header

2. **Refresh Token**:
   - Stored in HTTP-only cookie (automatically managed by browser)
   - Long lifespan (typically 7-30 days)
   - Protected from XSS attacks
   - Automatically sent with refresh requests

### Frontend Implementation Example

```javascript
// Login request
const response = await fetch('/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  }),
  credentials: 'include' // Important: includes cookies in the request
});

// Store the access token
const { accessToken } = await response.json();
localStorage.setItem('accessToken', accessToken);

// Making authenticated requests
const apiResponse = await fetch('/v1/complaints', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json',
  },
  credentials: 'include' // Include cookies for refresh token
});

// Refreshing access token
const refreshResponse = await fetch('/v1/auth/refresh', {
  method: 'POST',
  credentials: 'include' // Automatically sends refresh token cookie
});

const { accessToken: newAccessToken } = await refreshResponse.json();
localStorage.setItem('accessToken', newAccessToken);
```

### Best Practices

1. Always use HTTPS in production
2. Implement proper error handling for token expiration
3. Clear stored tokens on logout
4. Use the `credentials: 'include'` option in fetch requests
5. Validate and sanitize all input data on the frontend
6. Implement proper loading states and user feedback
7. Handle network errors gracefully

## Data Models

### Complaint Status Values

| Status | Description |
|--------|-------------|
| `pending` | Complaint is awaiting review |
| `accepted` | Complaint has been accepted and resolved |
| `refused` | Complaint has been refused with a reason |

### Priority Levels

| Priority | Estimated Review Time |
|----------|---------------------|
| `high` | 1-2 business days |
| `mid` | 3-5 business days |
| `low` | 1 week |

### User Roles

| Role | Permissions |
|------|-------------|
| `manager` | Can view all high priority complaints (including deleted), hard delete complaints |
| `admin` | Can view and manage mid priority complaints |
| `mukhtar` | Can view and manage low priority complaints in their neighborhood, soft delete complaints |
