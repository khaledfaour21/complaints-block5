# API Documentation: Announcements & Achievements

This document outlines the REST API endpoints for managing announcements and achievements.

## Base URL

All endpoints are prefixed with the base URL of your server, e.g., `http://localhost:3000/v1`.

## Authentication

Access to protected endpoints (Create, Update, Delete) requires a valid JSON Web Token (JWT) to be included in the `Authorization` header.

**Header Format:** `Authorization: Bearer <your_jwt_token>`

**Roles & Permissions:**
*   **`admin` & `manager`**: Can create, read, update, and delete announcements and achievements.
*   **`mukhtar` & Public Users**: Can only read (view) announcements and achievements.

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

*   **Success Response (201 Created):**
    Returns the full announcement object that was created.

    ```json
    {
      "id": "uuid",
      "title": "New Admin Announcement",
      "content": "This is the content for the new announcement.",
      "status": "active",
      "createdAt": "2023-10-27T10:00:00.000Z",
      "updatedAt": "2023-10-27T10:00:00.000Z",
      "createdBy": "uuid_of_the_admin_user"
    }
    ```

*   **Error Responses:**
    *   `401 Unauthorized`: If no token is provided, the token is invalid, or the user does not exist.
        ```json
        { "error": "User not authenticated" }
        ```
    *   `403 Forbidden`: If the user's role is not `admin` or `manager`.
        ```json
        { "error": "Forbidden" }
        ```
    *   `500 Internal Server Error`: If the server fails to create the announcement.
        ```json
        { "error": "Failed to create announcement" }
        ```

### `GET /v1/announcements`
Retrieves a list of all active announcements. This endpoint is public.

*   **Authorization:** Not required.
*   **Request Body:** None.
*   **Success Response (200 OK):**
    Returns an array of announcement objects.

    ```json
    [
      {
        "id": "uuid",
        "title": "Public Announcement",
        "content": "Content visible to everyone.",
        "status": "active",
        "createdAt": "2023-10-27T10:00:00.000Z",
        "updatedAt": "2023-10-27T10:00:00.000Z",
        "createdBy": "uuid_of_the_admin_user"
      },
      // ... more announcements
    ]
    ```

### `GET /v1/announcements/:id`
Retrieves a single active announcement by its ID. This endpoint is public.

*   **Authorization:** Not required.
*   **URL Parameters:**
    *   `id` (string, required): The UUID of the announcement.
*   **Success Response (200 OK):**
    Returns the announcement object.

    ```json
    {
      "id": "uuid",
      "title": "Public Announcement",
      "content": "Content visible to everyone.",
      "status": "active",
      "createdAt": "2023-10-27T10:00:00.000Z",
      "updatedAt": "2023-10-27T10:00:00.000Z",
      "createdBy": "uuid_of_the_admin_user"
    }
    ```

*   **Error Responses:**
    *   `404 Not Found`: If no announcement with the given `id` exists or if it is inactive.
        ```json
        { "error": "Not Found" }
        ```

### `PATCH /v1/announcements/:id`
Updates an existing announcement. Access is restricted to `admin` and `manager` roles.

*   **Authorization:** Required (`Bearer` token with `admin` or `manager` role).
*   **URL Parameters:**
    *   `id` (string, required): The UUID of the announcement to update.
*   **Request Body (JSON):** Provide only the fields you want to update.

    ```json
    {
      "title": "Updated Title (optional)",
      "content": "Updated content (optional)",
      "status": "inactive (optional)"
    }
    ```

*   **Success Response (200 OK):**
    Returns the full, updated announcement object.

    ```json
    {
      "id": "uuid",
      "title": "Updated Title",
      "content": "Updated content",
      "status": "inactive",
      "createdAt": "2023-10-27T10:00:00.000Z",
      "updatedAt": "2023-10-27T11:30:00.000Z",
      "createdBy": "uuid_of_the_admin_user"
    }
    ```

*   **Error Responses:**
    *   `401 Unauthorized`: Authentication failed.
    *   `403 Forbidden`: User role is not `admin` or `manager`.
    *   `404 Not Found`: No announcement with the given `id` exists.

### `DELETE /v1/announcements/:id`
Deletes an announcement. Access is restricted to `admin` and `manager` roles.

*   **Authorization:** Required (`Bearer` token with `admin` or `manager` role).
*   **URL Parameters:**
    *   `id` (string, required): The UUID of the announcement to delete.
*   **Success Response (204 No Content):**
    The server returns no content, indicating a successful deletion.

*   **Error Responses:**
    *   `401 Unauthorized`: Authentication failed.
    *   `403 Forbidden`: User role is not `admin` or `manager`.
    *   `404 Not Found`: No announcement with the given `id` exists.

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

*   **Success Response (201 Created):**
    Returns the full achievement object that was created.

    ```json
    {
      "id": "uuid",
      "title": "First Achievement",
      "description": "Awarded for completing the onboarding.",
      "iconUrl": "http://example.com/icon.png",
      "status": "active",
      "createdAt": "2023-10-27T10:00:00.000Z",
      "updatedAt": "2023-10-27T10:00:00.000Z",
      "createdBy": "uuid_of_the_admin_user"
    }
    ```

*   **Error Responses:**
    *   `401 Unauthorized`: Authentication failed.
    *   `403 Forbidden`: User role is not `admin` or `manager`.
    *   `500 Internal Server Error`: Server failed to create the achievement.

### `GET /v1/achievements`
Retrieves a list of all active achievements. This endpoint is public.

*   **Authorization:** Not required.
*   **Request Body:** None.
*   **Success Response (200 OK):**
    Returns an array of achievement objects.

    ```json
    [
      {
        "id": "uuid",
        "title": "First Achievement",
        "description": "Awarded for completing the onboarding.",
        "iconUrl": "http://example.com/icon.png",
        "status": "active",
        "createdAt": "2023-10-27T10:00:00.000Z",
        "updatedAt": "2023-10-27T10:00:00.000Z",
        "createdBy": "uuid_of_the_admin_user"
      },
      // ... more achievements
    ]
    ```

### `GET /v1/achievements/:id`
Retrieves a single active achievement by its ID. This endpoint is public.

*   **Authorization:** Not required.
*   **URL Parameters:**
    *   `id` (string, required): The UUID of the achievement.
*   **Success Response (200 OK):**
    Returns the achievement object.

    ```json
    {
      "id": "uuid",
      "title": "First Achievement",
      "description": "Awarded for completing the onboarding.",
      "iconUrl": "http://example.com/icon.png",
      "status": "active",
      "createdAt": "2023-10-27T10:00:00.000Z",
      "updatedAt": "2023-10-27T10:00:00.000Z",
      "createdBy": "uuid_of_the_admin_user"
    }
    ```

*   **Error Responses:**
    *   `404 Not Found`: If no achievement with the given `id` exists or if it is inactive.

### `PATCH /v1/achievements/:id`
Updates an existing achievement. Access is restricted to `admin` and `manager` roles.

*   **Authorization:** Required (`Bearer` token with `admin` or `manager` role).
*   **URL Parameters:**
    *   `id` (string, required): The UUID of the achievement to update.
*   **Request Body (JSON):** Provide only the fields you want to update.

    ```json
    {
      "title": "Updated Title (optional)",
      "description": "Updated description (optional)",
      "iconUrl": "http://example.com/new-icon.png (optional)",
      "status": "inactive (optional)"
    }
    ```

*   **Success Response (200 OK):**
    Returns the full, updated achievement object.

    ```json
    {
      "id": "uuid",
      "title": "Updated Title",
      "description": "Updated description",
      "iconUrl": "http://example.com/new-icon.png",
      "status": "inactive",
      "createdAt": "2023-10-27T10:00:00.000Z",
      "updatedAt": "2023-10-27T11:30:00.000Z",
      "createdBy": "uuid_of_the_admin_user"
    }
    ```

*   **Error Responses:**
    *   `401 Unauthorized`: Authentication failed.
    *   `403 Forbidden`: User role is not `admin` or `manager`.
    *   `404 Not Found`: No achievement with the given `id` exists.

### `DELETE /v1/achievements/:id`
Deletes an achievement. Access is restricted to `admin` and `manager` roles.

*   **Authorization:** Required (`Bearer` token with `admin` or `manager` role).
*   **URL Parameters:**
    *   `id` (string, required): The UUID of the achievement to delete.
*   **Success Response (204 No Content):**
    The server returns no content, indicating a successful deletion.

*   **Error Responses:**
    *   `401 Unauthorized`: Authentication failed.
    *   `403 Forbidden`: User role is not `admin` or `manager`.
    *   `404 Not Found`: No achievement with the given `id` exists.
