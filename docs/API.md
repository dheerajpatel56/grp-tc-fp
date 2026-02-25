# API Documentation - Group Live Location Tracking System

## Authentication
- `POST /api/auth/register`: Register a new user.
- `POST /api/auth/login`: Login and receive JWT.

## Groups
- `POST /api/groups/create`: Create a new group. (Auth required)
- `POST /api/groups/join`: Join a group using group code. (Auth required)
- `GET /api/groups/my-groups`: List all groups the user belongs to. (Auth required)
- `GET /api/groups/:groupId/members`: List all members of a specific group. (Auth required)
- `DELETE /api/groups/:groupId`: Delete a group (Only creator/admin). (Auth required)

## Location
- `POST /api/locations/update`: Update current user's location. (Auth required)
- `GET /api/locations/group/:groupId`: Get live locations of all group members. (Auth required)
- `GET /api/locations/history/:userId?date=YYYY-MM-DD`: Get location history for a user on a specific date. (Auth required)

## Notifications
- `GET /api/notifications`: Get all notifications for the current user. (Auth required)

## Admin
- `GET /api/admin/users`: View all users. (Admin only)
- `GET /api/admin/groups`: View all groups. (Admin only)
- `DELETE /api/admin/users/:userId`: Block/Delete a user. (Admin only)
- `DELETE /api/admin/groups/:groupId`: Delete any group. (Admin only)
