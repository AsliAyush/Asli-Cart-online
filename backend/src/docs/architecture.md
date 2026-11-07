# Asli Cart Backend Architecture & RBAC Guide

## 1. Role-Based Module Architecture

The system uses a database-backed dynamic Role-Based Access Control (RBAC) architecture.
Users belong to a specific Role (e.g. `SUPER_ADMIN`, `PRODUCT_MANAGER`, `SOCIAL_MEDIA_MANAGER`, `CUSTOMER`).

Permissions are modeled dynamically:
- `Module`: Represents a functional platform boundary (e.g. `user`, `role`, `product`, `offer`, `dashboard`).
- `ModulePermission`: Represents an action within a module (`view`, `create`, `update`, `delete`, `approve`, `reject`, `publish`, `assign`, `manage`).
- `RoleModulePermission`: Mapping table assigning specific module permissions to roles.

## 2. Super Admin Privileges
- The `SUPER_ADMIN` role is marked with `isSystem = true`.
- It possesses automatic full permissions across all modules.
- Accidental privilege removal and demotion/deactivation of the last active Super Admin is protected in the service layer.

## 3. Authentication & Token Management
- Access tokens are short-lived JWTs (15 minutes).
- Refresh tokens are long-lived (7 days).
- Refresh tokens are hashed using SHA-256 and stored in the database (`RefreshToken` table).
- Refresh token rotation is enforced: presenting a valid refresh token revokes it and issues a fresh pair.
- Reuse detection: if a revoked refresh token is presented, all active sessions for the user are immediately revoked.

## 4. API Structure
- Base URL: `/api/v1`
- Admin routes: `/api/v1/admin/*`
- Health check: `/api/v1/health`

