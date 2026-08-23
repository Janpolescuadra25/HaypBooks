# Hub Role Navigation Filtering (Phase H-2)

**Status: DONE**

## Overview
Extended the owner sidebar navigation filtering system with a `roleRestrictions` property that filters nav sections/groups/items by the user's hub role (`user.role`). This was implemented to hide the practice-only COLLABORATION section from company admins.

## Background
The navigation system already supported two filtering mechanisms:
1. `countries` — filter by company country code
2. `systemRoleRestrictions` — filter by platform role (SUPER_ADMIN only)

A third mechanism was needed to filter by hub role (`'accountant'` vs `'business'`) since practice-only features should not appear in company admin navigation.

## Hub Role Values
| Role String | User Type | Description |
|-------------|-----------|-------------|
| `'accountant'` | Practice Admin | Manages practice workspace, client requests |
| `'business'` | Company Admin | Manages company workspace, financial data |

These values are defined in the signup page's type union: `useState<'business' | 'accountant' | null>(null)`.

## Architecture

### Interface Extension
Three interfaces in `ownerNavConfig.ts` now support `roleRestrictions?: string[]`:
- `NavItem`
- `NavGroup`
- `NavSection`

Placed after `systemRoleRestrictions` in each interface, following the same optional array pattern.

### Filter Logic
`filterNavItems()` and `filterNavigationData()` in `OwnerSidebar.tsx` now accept a 4th parameter `userRole?: string`. The check follows the same pattern as systemRole filtering:

```typescript
if (item.roleRestrictions && !item.roleRestrictions.includes(userRole ?? '')) return null
```

Applied at all three levels: section, group, and item.

### Data Flow
1. `useUser()` returns the full user object (including `user.role` and `user.systemRole`)
2. `useMemo` calls `filterNavigationData(navigationData, country, user?.systemRole, user?.role)`
3. Each filter level checks `roleRestrictions` alongside `systemRoleRestrictions` and `countries`
4. Items not matching the user's role are excluded from the rendered nav

### Filtering Priority Order
1. `systemRoleRestrictions` — platform role check (runs first)
2. `roleRestrictions` — hub role check (runs second)
3. `countries` — country-based check (runs third)

## Current Usage
| Nav Section | Restriction | Visible To |
|-------------|-------------|------------|
| STORAGE | `systemRoleRestrictions: ['SUPER_ADMIN']` | Platform owners only |
| METRICS | `systemRoleRestrictions: ['SUPER_ADMIN']` | Platform owners only |
| USERS | `systemRoleRestrictions: ['SUPER_ADMIN']` | Platform owners only |
| COLLABORATION | `roleRestrictions: ['accountant']` | Practice admins only |
| All others | None | All users |

## Files Modified
| File | Change |
|------|--------|
| `Frontend/src/components/owner/ownerNavConfig.ts` | Added `roleRestrictions` to 3 interfaces + applied to COLLABORATION section |
| `Frontend/src/components/owner/OwnerSidebar.tsx` | Extended `filterNavItems` and `filterNavigationData` with 4th parameter + updated useMemo call |

## Commit
`0da77d86` — feat(frontend): hide COLLABORATION section from company admins
