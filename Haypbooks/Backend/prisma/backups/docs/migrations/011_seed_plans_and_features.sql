-- Migration: Seed default Plans, Features, and PlanFeature links (idempotent)
-- Run in Postgres; uses INSERT ... ON CONFLICT DO NOTHING to be safe for repeated runs.

-- 1) Features
INSERT INTO "Feature" (id, name, description, category, isPremium, "createdAt", scope)
VALUES
  ('f_free_features', 'Basic Accounting', 'Core invoicing, bills, basic reports', 'Core', FALSE, now(), 'COMPANY'),
  ('f_advanced_reporting', 'Advanced Reporting', 'Saved reports, custom report builder, scheduled exports', 'Reporting', TRUE, now(), 'COMPANY'),
  ('f_custom_templates', 'Custom Document Templates', 'Branding and custom templates for invoices/statements', 'Docs', TRUE, now(), 'COMPANY'),
  ('f_multi_currency', 'Multi-Currency', 'FX invoices, revaluation, exchange rates', 'Finance', TRUE, now(), 'COMPANY'),
  ('f_api_access', 'API Access', 'Programmatic access to data and actions', 'Integrations', TRUE, now(), 'GLOBAL'),
  ('f_priority_support', 'Priority Support', 'Faster SLA for support and escalations', 'Support', TRUE, now(), 'COMPANY'),
  ('f_payroll', 'Payroll Module', 'Payroll processing, payslips, statutory reports', 'Payroll', TRUE, now(), 'COMPANY'),
  ('f_inventory', 'Inventory & WMS', 'Inventory tracking, costing, assemblies', 'Inventory', TRUE, now(), 'COMPANY'),
  ('f_practice_dashboard', 'Practice Dashboard', 'Practice-level analytics and KPIs', 'Practice', TRUE, now(), 'PRACTICE'),
  ('f_practice_billing', 'Practice Billing', 'Practice-level billing and client fee management', 'Practice', TRUE, now(), 'PRACTICE'),
  ('f_practice_analytics', 'Practice Analytics', 'Advanced analytics and benchmarking for practices', 'Practice', TRUE, now(), 'PRACTICE')
ON CONFLICT (id) DO NOTHING;

-- 2) Plans
INSERT INTO "Plan" (id, name, type, description, monthlyPrice, annualPrice, currency, maxCompanies, maxClients, isActive, sortOrder, "createdAt", "updatedAt")
VALUES
  ('plan_free', 'Free', 'company', 'Free tier for small users: core invoicing and bills', 0, 0, 'USD', 1, 50, TRUE, 100, now(), now()),
  ('plan_starter', 'Starter', 'company', 'Starter: basic reporting and templates', 29, 290, 'USD', 5, 500, TRUE, 200, now(), now()),
  ('plan_growth', 'Growth', 'company', 'Growth: Advanced Reporting, API access, Multi-currency', 99, 990, 'USD', 20, 5000, TRUE, 300, now(), now()),
  ('plan_pro', 'Pro', 'company', 'Pro: Payroll, Inventory, Priority support', 249, 2490, 'USD', NULL, NULL, TRUE, 400, now(), now()),
  ('plan_enterprise', 'Enterprise', 'company', 'Enterprise: custom SLAs, dedicated support', NULL, NULL, 'USD', NULL, NULL, TRUE, 500, now(), now())
ON CONFLICT (id) DO NOTHING;

-- 3) Link Plan -> Features (PlanFeature)
-- Free plan: only Basic Accounting
INSERT INTO "PlanFeature" ("planId", "featureId", included, "sortOrder") VALUES ('plan_free', 'f_free_features', TRUE, 1) ON CONFLICT DO NOTHING;

-- Starter: basic + templates
INSERT INTO "PlanFeature" ("planId", "featureId", included, "sortOrder") VALUES
  ('plan_starter','f_free_features', TRUE,1),
  ('plan_starter','f_custom_templates', TRUE,2) ON CONFLICT DO NOTHING;

-- Growth: reporting, API, multi-currency
INSERT INTO "PlanFeature" ("planId", "featureId", included, "sortOrder") VALUES
  ('plan_growth','f_free_features', TRUE,1),
  ('plan_growth','f_custom_templates', TRUE,2),
  ('plan_growth','f_advanced_reporting', TRUE,3),
  ('plan_growth','f_api_access', TRUE,4),
  ('plan_growth','f_multi_currency', TRUE,5) ON CONFLICT DO NOTHING;

-- Pro: payroll, inventory, priority support
INSERT INTO "PlanFeature" ("planId", "featureId", included, "sortOrder") VALUES
  ('plan_pro','f_free_features', TRUE,1),
  ('plan_pro','f_custom_templates', TRUE,2),
  ('plan_pro','f_advanced_reporting', TRUE,3),
  ('plan_pro','f_api_access', TRUE,4),
  ('plan_pro','f_payroll', TRUE,5),
  ('plan_pro','f_inventory', TRUE,6),
  ('plan_pro','f_priority_support', TRUE,7) ON CONFLICT DO NOTHING;

-- Enterprise: all features included by default (mark included true where applicable)
INSERT INTO "PlanFeature" ("planId", "featureId", included, "sortOrder")
SELECT 'plan_enterprise', f.id, TRUE, ROW_NUMBER() OVER (ORDER BY f.id)
FROM "Feature" f
ON CONFLICT DO NOTHING;

-- 4) Practice add-ons (installed as features but may be sold separately to practices)
-- Add practice-level features to Growth and Pro as optional paid add-ons
INSERT INTO "PlanFeature" ("planId","featureId", included, "sortOrder") VALUES
  ('plan_growth','f_practice_dashboard', FALSE, 10),
  ('plan_growth','f_practice_billing', FALSE, 11),
  ('plan_growth','f_practice_analytics', FALSE, 12),
  ('plan_pro','f_practice_dashboard', TRUE, 10),
  ('plan_pro','f_practice_analytics', TRUE, 11)
ON CONFLICT DO NOTHING;

-- end of migration
