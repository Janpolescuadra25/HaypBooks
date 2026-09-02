# Public Route Group

This route group hosts the public-facing landing and auth shell experience.

- Routes live under the public route group without adding a URL segment, e.g. `/` and `/landing`.
- The layout in this directory is intentionally a server component so the public pages can participate in the normal App Router build pipeline.
- The `dynamic = 'force-dynamic'` export remains in place to preserve the public pages' runtime behavior while keeping the route-group layout compatible with production builds.
