# Central Hub — Companies & Clients (Standalone Page)

> See `Central.hub.spec.md` for a detailed implementation plan: routes, components, API contracts, and tests. This page is a concise overview and the spec contains the step-by-step developer guidance.

That said, here's my **revised and unique recommended navigation design** for the "Companies & Clients" Central Hub. I've enhanced it with precise locations, visual hierarchy, and unique touches to make HaypBooks feel premium, intuitive, and distinctly yours — inspired by top SaaS patterns but tailored for multi-company accounting.








### Revised Layout with Exact Navigation Locations

1. **After Login Flow**
   - User logs in → **Always redirect to `/companies`** (the Central Hub page).
   - Even with 1 company → Show the full hub (educates users about multi-company early).
   - Optional quick banner: "Open your company books" button for single-company users.

2. **Left Sidebar Navigation (Fixed Position: Left Edge, Full Height)**
   - **Top Section** (padded 24px):
     - HaypBooks logo (clickable → back to hub)
   - **Main Menu Items** (vertical list, 48px height each):
     - "Companies & Clients" — highlighted/active (bold + accent color background)
     - Future: "Billing" (below, for subscription details)
     - "Settings"
     - "Support"
   - **Bottom Section** (absolute bottom, padded 24px):
     - User avatar + name/email
     - Dropdown: Profile, Logout
   - Mobile: Collapsible to hamburger icon (top-left).








3. **Main Content Area (Right of Sidebar, Responsive Padding)**
   - **Top Header Bar** (full width, sticky optional):
     - Title: "My Companies & Clients" (left)
     - Global search bar (center)
     - "Create New Company" button (right, primary color)
   - **Subscription Summary Banner** (full width card, below header, subtle accent background):
     - "You have 3 companies · $87/month · Next billing Jan 17" + "Upgrade" button
   - **Pending Invites Banner/Card** (if any, below summary):
     - "2 pending invitations" + list with Accept/Decline buttons








   - **Tabbed Sections** (main content, tabs at top of list area):
     - Tab 1: **My Companies** (default, owned)
       - Grid of cards (3-4 per row desktop, 1-2 mobile)
       - Each card: Company name (bold), Status badge, Plan tier, Last accessed, Primary "Open Books" button, menu (Edit, Billing)
     - Tab 2: **Invited Companies**
       - Similar card grid: Name, Your Role badge, Owner, Last accessed, "Open Books" button, "Leave" link
   - **Empty States** (centered in section if no items):
     - "No companies yet — create your first!"
     - "No invitations yet"








4. **Unique Persistent Top Header Mini-Switcher (Global Navigation Enhancement)**
   - Location: Top-right of main header (next to user avatar, always visible on ALL pages including dashboard)
   - Shows current company name + dropdown arrow
   - Dropdown: Recent first, then owned (bold), invited (italic)
   - Instant switch without returning to hub








### Why This Revised Design Is Unique & Best
- **Hub-first** → Your vision preserved (transparency from login)
- **Tabbed + card grid** → Scales better than plain divider/lists
- **Subscription & invites prominent** → Reinforces pay-per-company
- **Persistent mini-switcher** → Solves frequent switching elegantly
- **Feels exclusive to HaypBooks** → Not copying QuickBooks/Xero exactly

This navigation feels **thoughtful, powerful, and modern** — users will instantly understand their access and costs.

