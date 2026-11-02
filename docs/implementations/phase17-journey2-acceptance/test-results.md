# Phase 17 Journey 2 Acceptance Test Results

- Verification date: `2026-11-02`
- Baseline commit: `58a181eaaa34365ab05a4c7dee3e15ecc14cfb49`
- Working tree status: `clean except for the intentionally untracked secret file pm2.env.md`
- Jest config: `Haypbooks/Backend/jest.acceptance.config.js`
- Exit code: `0`
- Result: `PASS` (`1` suite passed, `3` tests passed)

## Command

```bash
cd Haypbooks/Backend
npx jest --config ./jest.acceptance.config.js --testMatch '<rootDir>/test/acceptance/**/*.e2e-spec.ts' --runInBand
```

## Verbatim output

```text
Applying migration `20260509174615_add_expense_form_fields`
Applying migration `20260513164808_add_journal_entry_id_to_expense_models`
Applying migration `20260513171440_add_journal_entry_id_index_to_expense_models`
Applying migration `20260513183512_add_workspace_id_to_mileage_log`
Applying migration `20260514170447_add_bill_pending_voided_rejected`
Applying migration `20260514181859_add_bill_rejection_reason`
Applying migration `20260515173258_add_credit_note_balance`
Applying migration `20260515180440_add_je_balance_check_trigger`
Applying migration `20260515183132_add_expense_policy_settings`
Applying migration `20260515203804_add_phone_encrypted_field`
Applying migration `20260517194820_backfill_billpayment_posting_status`
Applying migration `20260519183235_add_recurring_expense_model`
Applying migration `20260712164620_add_invoice_dunning_fields`
Applying migration `20260715174432_add_statement_scheduling`
Applying migration `20260718023757_add_created_by_to_statement_schedule`
Applying migration `20260718053807_add_name_to_accounting_period`
Applying migration `20260814182015_add_storage_limit_model`
Applying migration `20260815074557_add_practice_invite`
Applying migration `20260816061721_add_currency_and_exchange_rate_models`
Applying migration `20260816062640_standardize_currency_nullability_payment_bank_deposit`
Applying migration `20260816063331_finalize_currency_nullability_and_defaults`
Applying migration `20260816152550_add_onboarding_mode`
Applying migration `20260817000000_add_budget_audit_currency`
Applying migration `20260830160000_add_journal_entry_id_to_payroll_and_fixed_asset_models`
Applying migration `20260929000000_add_journal_entry_idempotency_key`
Applying migration `20261007190000_add_practice_user_role_status`
Applying migration `20261022000000_replace_global_journal_entry_unique_index`
Applying migration `fix_je_trigger`

The following migrations have been applied:

migrations/
  └─ 20260302000000_baseline_v10/
    └─ migration.sql
  └─ 20260302181133_nav_completeness_lastmile_ux/
    └─ migration.sql
  └─ 20260307024316_add_xor_constraints/
    └─ migration.sql
  └─ 20260307025648_standardize_decimals/
    └─ migration.sql
  └─ 20260307044205_generalize_ph_models/
    └─ migration.sql
  └─ 20260307051800_schema_enhancements/
    └─ migration.sql
  └─ 20260307062732_practice_hub_enhancements/
    └─ migration.sql
  └─ 20260307142933_phase1_admin_security/
    └─ migration.sql
  └─ 20260307144237_phase2_3_admin_security/
    └─ migration.sql
  └─ 20260308000000_fix_schema_drift/
    └─ migration.sql
  └─ 20260308000001_fix_schema_drift2/
    └─ migration.sql
  └─ 20260308000002_remove_extra_fk/
    └─ migration.sql
  └─ 20260308181750_add_missing_models/
    └─ migration.sql
  └─ 20260309181325_add_department_model/
    └─ migration.sql
  └─ 20260310161011_bank_txn_category_split_transfer/
    └─ migration.sql
  └─ 20260313195258_add_workspace_capability_flags/
    └─ migration.sql
  └─ 20260404120000_add_account_is_from_template/
    └─ migration.sql
  └─ 20260405170618_add_email_templates/
    └─ migration.sql
  └─ 20260414000000_add_item_description/
    └─ migration.sql
  └─ 20260416033000_add_payment_unapplied_amount/
    └─ migration.sql
  └─ 20260506034909_fix_relations/
    └─ migration.sql
  └─ 20260506190036_enforce_companyid_required/
    └─ migration.sql
  └─ 20260508191556_add_recurring_bill_and_fields/
    └─ migration.sql
  └─ 20260509174615_add_expense_form_fields/
    └─ migration.sql
  └─ 20260513164808_add_journal_entry_id_to_expense_models/
    └─ migration.sql
  └─ 20260513171440_add_journal_entry_id_index_to_expense_models/
    └─ migration.sql
  └─ 20260513183512_add_workspace_id_to_mileage_log/
    └─ migration.sql
  └─ 20260514170447_add_bill_pending_voided_rejected/
    └─ migration.sql
  └─ 20260514181859_add_bill_rejection_reason/
    └─ migration.sql
  └─ 20260515173258_add_credit_note_balance/
    └─ migration.sql
  └─ 20260515180440_add_je_balance_check_trigger/
    └─ migration.sql
  └─ 20260515183132_add_expense_policy_settings/
    └─ migration.sql
  └─ 20260515203804_add_phone_encrypted_field/
    └─ migration.sql
  └─ 20260517194820_backfill_billpayment_posting_status/
    └─ migration.sql
  └─ 20260519183235_add_recurring_expense_model/
    └─ migration.sql
  └─ 20260712164620_add_invoice_dunning_fields/
    └─ migration.sql
  └─ 20260715174432_add_statement_scheduling/
    └─ migration.sql
  └─ 20260718023757_add_created_by_to_statement_schedule/
    └─ migration.sql
  └─ 20260718053807_add_name_to_accounting_period/
    └─ migration.sql
  └─ 20260814182015_add_storage_limit_model/
    └─ migration.sql
  └─ 20260815074557_add_practice_invite/
    └─ migration.sql
  └─ 20260816061721_add_currency_and_exchange_rate_models/
    └─ migration.sql
  └─ 20260816062640_standardize_currency_nullability_payment_bank_deposit/
    └─ migration.sql
  └─ 20260816063331_finalize_currency_nullability_and_defaults/
    └─ migration.sql
  └─ 20260816152550_add_onboarding_mode/
    └─ migration.sql
  └─ 20260817000000_add_budget_audit_currency/
    └─ migration.sql
  └─ 20260830160000_add_journal_entry_id_to_payroll_and_fixed_asset_models/
    └─ migration.sql
  └─ 20260929000000_add_journal_entry_idempotency_key/
    └─ migration.sql
  └─ 20261007190000_add_practice_user_role_status/
    └─ migration.sql
  └─ 20261022000000_replace_global_journal_entry_unique_index/
    └─ migration.sql
  └─ fix_je_trigger/
    └─ migration.sql

All migrations have been successfully applied.

[jest runs progress: omitted 13 progress line(s)]

[jest runs progress: omitted 1 progress line(s)]
    [COMPANY-QUERY] Fetching companies for user {
      userId: '06e19b6b-8271-48cb-8f56-210aaac70478',
      filter: undefined,
      email: undefined
    }

      at CompanyRepository.findForUser (src/companies/company.repository.prisma.ts:374:13)


[jest runs progress: omitted 18 progress line(s)]

[jest runs progress: omitted 1 progress line(s)]

[jest runs progress: omitted 1 progress line(s)]

[jest runs progress: omitted 1 progress line(s)]

[jest runs progress: omitted 1 progress line(s)]

[jest runs progress: omitted 1 progress line(s)]

[jest runs progress: omitted 1 progress line(s)]

[jest runs progress: omitted 1 progress line(s)]
Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        135.271 s
Ran all test suites.
[Acceptance Global Teardown] Performing sequential cleanup for: acceptance_test
Successfully completed sequential teardown of acceptance test schema.
Jest did not exit one second after the test run has completed.

'This usually means that there are asynchronous operations that weren't stopped in your tests. Consider running Jest with `--detectOpenHandles` to troubleshoot this issue.
```
