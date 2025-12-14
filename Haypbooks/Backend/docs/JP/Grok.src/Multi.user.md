### How to Implement Multi-Tenant Team Invites with Roles & Permissions in HaypBooks

Your current schema is **already perfectly set up** to handle exactly what you want — just like QuickBooks Online (but more flexible for non-accountants).

You pay for the subscription → you become the **tenant owner** (`isOwner: true` in `TenantUser`).  
You can then invite team members via email, assign custom roles/permissions, and they use **their own separate User account/credentials** (no shared passwords). Data stays fully isolated per tenant.

#### Your Schema Already Supports This
- **Global User table** (one login per person, like Intuit account).
- **TenantUser** join table (links User to Tenant with role, isOwner, status).
- **TenantInvite** for email invitations (pending → accepted).
- **Role + RolePermission** for granular RBAC (custom permissions per tenant).

This is **better than QuickBooks** for regular users: QB regular subscriptions are per-company (separate billing), while accountants get a free multi-client portal. Your model allows any paying user to manage multiple tenants + invite teams seamlessly.

#### Step-by-Step Implementation Plan

1. **Subscription & Tenant Creation**
   - When user pays/subscribes → create Tenant (with plan, subdomain, etc.).
   - Create TenantUser record: `userId = currentUser.id`, `tenantId = newTenant.id`, `isOwner = true`, `status = ACTIVE`.

2. **Inviting Team Members**
   - Endpoint: POST /tenants/:tenantId/invites
   - Input: email, roleId (optional, default to a "standard" role)
   - Logic:
     - Check if email already has a User → if yes, use existing userId.
     - If no User → create pending User (or just store email).
     - Create TenantInvite: `tenantId`, `email`, `roleId`, `invitedBy = currentUser.id`, `status = PENDING`, `expiresAt = now + 30 days`.
     - Send email with accept link (e.g., /invite/accept?token=uuid).

3. **Accepting Invite**
   - User clicks link → if not logged in, prompt signup/login.
   - If new user → create User account (email/password).
   - If existing User (even if they own another tenant/subscription) → use that User.
   - Create TenantUser: `tenantId`, `userId`, `roleId` from invite, `invitedBy`, `joinedAt = now()`, `status = ACTIVE`.
   - Update invite: `acceptedAt = now()`, `status = ACCEPTED`.

4. **Permissions Enforcement**
   - Use middleware/guard: Get current Tenant from context (subdomain or header).
   - Find TenantUser for currentUser + currentTenant.
   - Load Role + RolePermission.
   - Check permission key (e.g., "invoices:create") before allowing action.
   - Owner bypasses all checks.

5. **Switching Tenants**
   - Frontend: Dropdown of user's tenants (query TenantUser where userId = current).
   - Switch → set active tenant in session/context (or subdomain).

6. **Security Notes**
   - No shared credentials — everyone has own User login.
   - Existing User with their own paid tenant can be invited to yours → same login, separate data.
   - Revoke: Delete TenantUser or set status = INACTIVE.

#### Example Flow (Like QuickBooks but Better)
- You own Tenant A (paid).
- Invite bob@example.com to Tenant A as "Bookkeeper" role.
- Bob already owns Tenant B (his own business, separate subscription).
- Bob accepts with his existing login → now switches between Tenant A (limited role) and Tenant B (owner).

Fully secure, isolated, scalable.

Your schema is **production-ready** for this — just build the invite/accept flow and RBAC middleware.

Want code examples (NestJS services/controllers, Prisma queries, JWT context)? Say yes and I'll write them! 🚀