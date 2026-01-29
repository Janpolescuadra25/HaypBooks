Add constraint to enforce exactly one owner for Subscription (companyId XOR practiceId)

This migration contains raw SQL to create a CHECK constraint that ensures a subscription has exactly
one owner: either companyId (company-owned) or practiceId (practice-owned), but not both or neither.

This file is informational; migration SQL is in migration.sql.