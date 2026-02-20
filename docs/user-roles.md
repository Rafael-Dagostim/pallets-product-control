# User Roles & Permissions

## Roles

| Role       | Description                                                  |
|------------|--------------------------------------------------------------|
| `ADMIN`    | Full system access. Manages users, pallets, orders, production. |
| `MANAGER`  | Manages production records, pallets, and orders. Cannot manage users. |
| `EMPLOYEE` | Can view and create their own production records only.       |

## Permissions Matrix

| Resource             | Action          | ADMIN | MANAGER | EMPLOYEE |
|----------------------|-----------------|-------|---------|----------|
| **Users**            | List / View     | Yes   | No      | No       |
|                      | Create          | Yes   | No      | No       |
|                      | Update          | Yes   | No      | No       |
|                      | Delete          | Yes   | No      | No       |
| **Pallets**          | List / View     | Yes   | Yes     | Yes      |
|                      | Create          | Yes   | Yes     | No       |
|                      | Update          | Yes   | Yes     | No       |
|                      | Delete          | Yes   | No      | No       |
|                      | New Version     | Yes   | Yes     | No       |
| **Production**       | List All        | Yes   | Yes     | No       |
|                      | View Own        | Yes   | Yes     | Yes      |
|                      | Create          | Yes   | Yes     | Yes      |
|                      | Update Status   | Yes   | Yes     | No       |
|                      | Delete          | Yes   | No      | No       |
| **Orders**           | List / View     | Yes   | Yes     | No       |
|                      | Create          | Yes   | Yes     | No       |
|                      | Update          | Yes   | Yes     | No       |
|                      | Delete          | Yes   | No      | No       |
| **Customers**        | List / View     | Yes   | Yes     | No       |
|                      | Create          | Yes   | Yes     | No       |
|                      | Update          | Yes   | Yes     | No       |
|                      | Delete          | Yes   | No      | No       |

## Implementation

### Decorators

**`@Roles(...roles)`** - Restricts a route to specific roles:
```typescript
@Roles(UserRole.ADMIN, UserRole.MANAGER)
@Get()
findAll() { ... }
```

**`@IsPublic()`** - Makes a route public (bypasses JWT auth):
```typescript
@IsPublic()
@Post('login')
login(@Body() dto: LoginDto) { ... }
```

### Guards

- **`JwtAuthGuard`** (global): Validates JWT token on every request. Skipped for `@IsPublic()` routes.
- **`RoleGuard`**: Checks if the authenticated user's role matches the `@Roles()` requirement. If no `@Roles()` is set, the route is accessible to all authenticated users.

### Auth Flow

1. User logs in via `POST /auth/login` with document + password
2. Server returns JWT access token + refresh token
3. Client sends `Authorization: Bearer <token>` on subsequent requests
4. `JwtAuthGuard` validates the token and attaches user data to the request
5. `RoleGuard` checks if the user's role is allowed for the endpoint
