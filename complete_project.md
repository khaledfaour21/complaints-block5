

Of course. Here is a single, comprehensive API documentation file that combines the information from the provided documents and includes the new `users` management endpoints we just created.

# API Documentation: Complaints & Management System

This document outlines the REST API endpoints for managing announcements, achievements, complaints, and users within the system.

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Announcements Endpoints](#announcements-endpoints)
- [Achievements Endpoints](#achievements-endpoints)
- [Complaints Endpoints](#complaints-endpoints)
- [Users Management Endpoints](#users-management-endpoints)

---

## Base URL

All endpoints are prefixed with the base URL of your server, e.g., `http://localhost:3000/v1`.

---

## Authentication

Access to protected endpoints requires a valid JSON Web Token (JWT) to be included in the `Authorization` header.

**Header Format:** `Authorization: Bearer <your_jwt_token>`

### Token Types

1.  **Access Token**:
    -   Short-lived JWT token.
    -   Sent in the `Authorization` header as a `Bearer` token.
    -   Required for protected endpoints.
    -   Example: `Authorization: Bearer <access_token>`

2.  **Refresh Token**:
    -   Long-lived token stored in an HTTP-only cookie.
    -   Used to obtain new access tokens.
    -   Automatically sent by the browser with requests.
    -   Not accessible via JavaScript (security measure).

### Roles & Permissions

| Role | Permissions |
| :--- | :--- |
| **`manager`** | **Superuser**: Can perform all actions. Can create, read, update, and delete announcements, achievements, and users. Can view and manage all complaints. |
| **`admin`** | Can create, read, update announcements and achievements. Can view and manage `mid` priority complaints. Can view, update (no password), and deactivate `mukhtar` users and their complaints. |
| **`mukhtar`** | Can only read (view) announcements and achievements. Can view and manage `low` priority complaints in their assigned neighborhood. Can soft-delete complaints. |
| **Public Users** | Can only read (view) active announcements and achievements. Can submit new complaints and track them. |

---

## Announcements Endpoints

### `POST /v1/announcements`
Creates a new announcement. Access is restricted to `admin` and `manager` roles.

*   **Authorization:** Required (`Bearer` token with `admin` or `manager` role).
*   **Request Body (JSON):**
    ```json
    {
      "title": "string (required)",
      "content": "string (required)",
      "status": "active | inactive (optional, defaults to 'active')"
    }
    ```
*   **Success Response (201 Created):** Returns the full announcement object that was created.
*   **Error Responses:**
    *   `401 Unauthorized`: If no token is provided or the token is invalid.
    *   `403 Forbidden`: If the user's role is not `admin` or `manager`.
    *   `500 Internal Server Error`: If the server fails to create the announcement.

### `GET /v1/announcements`
Retrieves a list of all active announcements. This endpoint is public.

*   **Authorization:** Not required.
*   **Success Response (200 OK):** Returns an array of active announcement objects.

### `GET /v1/announcements/:id`
Retrieves a single active announcement by its ID. This endpoint is public.

*   **Authorization:** Not required.
*   **URL Parameters:**
    *   `id` (string, required): The UUID of the announcement.
*   **Success Response (200 OK):** Returns the announcement object.
*   **Error Responses:**
    *   `404 Not Found`: If no announcement with the given `id` exists or if it is inactive.

### `PATCH /v1/announcements/:id`
Updates an existing announcement. Access is restricted to `admin` and `manager` roles.

*   **Authorization:** Required (`Bearer` token with `admin` or `manager` role).
*   **URL Parameters:**
    *   `id` (string, required): The UUID of the announcement to update.
*   **Request Body (JSON):** Provide only the fields you want to update.
*   **Success Response (200 OK):** Returns the full, updated announcement object.
*   **Error Responses:** `401`, `403`, `404`.

### `DELETE /v1/announcements/:id`
Deletes an announcement. Access is restricted to `admin` and `manager` roles.

*   **Authorization:** Required (`Bearer` token with `admin` or `manager` role).
*   **URL Parameters:**
    *   `id` (string, required): The UUID of the announcement to delete.
*   **Success Response (204 No Content):** The server returns no content, indicating a successful deletion.
*   **Error Responses:** `401`, `403`, `404`.

---

## Achievements Endpoints

### `POST /v1/achievements`
Creates a new achievement. Access is restricted to `admin` and `manager` roles.

*   **Authorization:** Required (`Bearer` token with `admin` or `manager` role).
*   **Request Body (JSON):**
    ```json
    {
      "title": "string (required)",
      "description": "string (required)",
      "iconUrl": "string (optional)",
      "status": "active | inactive (optional, defaults to 'active')"
    }
    ```
*   **Success Response (201 Created):** Returns the full achievement object that was created.
*   **Error Responses:** `401`, `403`, `500`.

### `GET /v1/achievements`
Retrieves a list of all active achievements. This endpoint is public.

*   **Authorization:** Not required.
*   **Success Response (200 OK):** Returns an array of active achievement objects.

### `GET /v1/achievements/:id`
Retrieves a single active achievement by its ID. This endpoint is public.

*   **Authorization:** Not required.
*   **URL Parameters:**
    *   `id` (string, required): The UUID of the achievement.
*   **Success Response (200 OK):** Returns the achievement object.
*   **Error Responses:** `404 Not Found`.

### `PATCH /v1/achievements/:id`
Updates an existing achievement. Access is restricted to `admin` and `manager` roles.

*   **Authorization:** Required (`Bearer` token with `admin` or `manager` role).
*   **URL Parameters:**
    *   `id` (string, required): The UUID of the achievement to update.
*   **Request Body (JSON):** Provide only the fields you want to update.
*   **Success Response (200 OK):** Returns the full, updated achievement object.
*   **Error Responses:** `401`, `403`, `404`.

### `DELETE /v1/achievements/:id`
Deletes an achievement. Access is restricted to `admin` and `manager` roles.

*   **Authorization:** Required (`Bearer` token with `admin` or `manager` role).
*   **URL Parameters:**
    *   `id` (string, required): The UUID of the achievement to delete.
*   **Success Response (204 No Content):** The server returns no content, indicating a successful deletion.
*   **Error Responses:** `401`, `403`, `404`.

---

## Complaints Endpoints

### `POST /v1/complaints`
Create a new complaint (public endpoint).

*   **Authorization:** None (public).
*   **Request Body (JSON):**
    ```json
    {
      "submitterName": "string",
      "contactNumber": "string (required)",
      "description": "string",
      "location": "string",
      "neighborhood": "string (required)",
      "complaint_type": "noise|infrastructure|sanitation|other (required)",
      "priority": "high|mid|low (optional, defaults to 'mid')",
      "suggestedSolution": "string (optional)"
    }
    ```
*   **Success Response (201 Created):** Returns the full complaint object, including a unique `trackingTag`.
*   **Error Responses:** `400`, `500`.

### `GET /v1/complaints/track/:trackingTag`
Track a complaint by its tracking tag (public endpoint).

*   **Authorization:** None (public).
*   **URL Parameters:**
    *   `trackingTag` (string, required): The unique tracking tag of the complaint.
*   **Success Response (200 OK):** Returns the complaint object (without internal `notes`).
*   **Error Responses:** `404`, `500`.

### `GET /v1/complaints`
List complaints based on user role.

*   **Authorization:** Required (`Bearer` token with `manager`, `admin`, or `mukhtar` role).
*   **Success Response (200 OK):** Returns an array of complaint objects filtered by role:
    *   **Manager**: All high priority complaints (including soft-deleted).
    *   **Admin**: All mid priority active complaints.
    *   **Mukhtar**: All low priority active complaints.
*   **Error Responses:** `401`, `403`, `500`.

### `GET /v1/complaints/:id`
Get details of a specific complaint.

*   **Authorization:** Required (`Bearer` token with `manager`, `admin`, or `mukhtar` role).
*   **URL Parameters:**
    *   `id` (string, required): The ID of the complaint.
*   **Success Response (200 OK):** Returns the complaint object.
*   **Error Responses:** `401`, `403`, `404`, `500`.

### `PATCH /v1/complaints/:id/accept`
Accept a complaint and provide solution info.

*   **Authorization:** Required (`Bearer` token with `manager`, `admin`, or `mukhtar` role).
*   **Request Body (JSON):**
    ```json
    {
      "solutionInfo": "string (required)"
    }
    ```
*   **Success Response (200 OK):** Returns the updated complaint object with status "accepted".
*   **Error Responses:** `400`, `401`, `403`, `404`, `500`.

### `PATCH /v1/complaints/:id/refuse`
Refuse a complaint and provide refusal reason.

*   **Authorization:** Required (`Bearer` token with `manager`, `admin`, or `mukhtar` role).
*   **Request Body (JSON):**
    ```json
    {
      "refusalReason": "string (required)"
    }
    ```
*   **Success Response (200 OK):** Returns the updated complaint object with status "refused".
*   **Error Responses:** `400`, `401`, `403`, `404`, `500`.

### `PATCH /v1/complaints/:id`
Update complaint details (excluding status).

*   **Authorization:** Required (`Bearer` token with `manager`, `admin`, or `mukhtar` role).
*   **Request Body (JSON):**
    ```json
    {
      "priority": "high|mid|low (optional)",
      "notes": "string (optional)",
      "estimatedReviewTime": "string (optional)"
    }
    ```
*   **Success Response (200 OK):** Returns the updated complaint object.
*   **Error Responses:** `401`, `403`, `404`, `500`.

### `DELETE /v1/complaints/:id`
Delete a complaint.

*   **Authorization:** Required (`Bearer` token with `manager` or `mukhtar` role).
*   **URL Parameters:**
    *   `id` (string, required): The ID of the complaint to delete.
*   **Success Response (200 OK):**
    *   **Manager**: Returns `{ "message": "Complaint permanently deleted" }`.
    *   **Mukhtar**: Returns `{ "message": "Complaint soft deleted" }`.
*   **Error Responses:** `401`, `403`, `404`, `500`.

---

## Users Management Endpoints

### `GET /v1/users/:id`
Retrieves a specific user's details and the complaints they have handled.

*   **Authorization:** Required (`Bearer` token with `manager` or `admin` role).
*   **URL Parameters:**
    *   `id` (string, required): The UUID of the user.
*   **Permissions:**
    *   A `manager` can retrieve any user's details.
    *   An `admin` can only retrieve `mukhtar` users' details.
*   **Success Response (200 OK):** Returns the user object, including an array of `complaintsHandled`.
*   **Error Responses:**
    *   `401 Unauthorized`: Authentication failed.
    *   `403 Forbidden`: User lacks the required role or permissions.
    *   `404 Not Found`: No user with the given `id` exists.

### `GET /v1/users/:id/complaints`
Retrieves complaints handled by a specific user.

*   **Authorization:** Required (`Bearer` token with `manager` or `admin` role).
*   **URL Parameters:**
    *   `id` (string, required): The UUID of the user.
*   **Permissions:**
    *   A `manager` can retrieve complaints handled by any user.
    *   An `admin` can only retrieve complaints handled by a `mukhtar`.
*   **Success Response (200 OK):** Returns an array of complaint objects.
*   **Error Responses:** `401`, `403`, `404`.

### `PATCH /v1/users/:id`
Updates a user's information.

*   **Authorization:** Required (`Bearer` token with `manager` or `admin` role).
*   **URL Parameters:**
    *   `id` (string, required): The UUID of the user to update.
*   **Permissions:**
    *   A `manager` can update any user, including their password.
    *   An `admin` can only update `mukhtar` users and **cannot** change their password.
*   **Request Body (JSON):** Provide only the fields you want to update.
    ```json
    {
      "name": "string (optional)",
      "email": "string (optional)",
      "password": "string (optional, only for managers)",
      "neighborhood": "string (optional)"
    }
    ```
*   **Success Response (200 OK):** Returns the full, updated user object.
*   **Error Responses:** `401`, `403`, `404`.

### `PATCH /v1/users/:id/deactivate`
Deactivates a user account by setting `is_active` to `false`.

*   **Authorization:** Required (`Bearer` token with `manager` or `admin` role).
*   **URL Parameters:**
    *   `id` (string, required): The UUID of the user to deactivate.
*   **Permissions:**
    *   A `manager` can deactivate any user.
    *   An `admin` can only deactivate `mukhtar` users.
*   **Request Body:** None.
*   **Success Response (200 OK):** Returns the updated user object with `is_active: false`.
*   **Error Responses:** `401`, `403`, `404`.

### `DELETE /v1/users/:id`
Permanently deletes a user account from the system.

*   **Authorization:** Required (`Bearer` token with `manager` role **only**).
*   **URL Parameters:**
    *   `id` (string, required): The UUID of the user to delete.
*   **Permissions:** Only a `manager` can perform this action.
*   **Success Response (200 OK):**
    ```json
    { "message": "User deleted successfully" }
    ```
*   **Error Responses:**
    *   `401 Unauthorized`: Authentication failed.
    *   `403 Forbidden`: User is not a `manager`.
    *   `404 Not Found`: No user with the given `id` exists.
