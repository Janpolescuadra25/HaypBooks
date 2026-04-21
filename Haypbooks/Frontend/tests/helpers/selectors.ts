/**
 * tests/helpers/selectors.ts
 *
 * Reusable selectors for the sales module.
 * NOTE: Most sales components use role-based selectors rather than data-testid.
 * data-testid attributes only exist on a few components (WorkspacePage, CompanyModal, etc.).
 */

export const selectors = {
  // ── Navigation ───────────────────────────────────────────────────────────
  /** Main app nav — best targeted by visible text */
  navSales: 'nav a:has-text("Sales"), aside a:has-text("Sales")',

  // ── Common actions ────────────────────────────────────────────────────────
  /** Primary create / new button at the top of a page */
  createButton:
    'button:has-text("Create"), button:has-text("New"), button:has-text("+ New"), button:has-text("Add")',

  /** Search / filter input */
  searchInput: 'input[placeholder*="Search" i], input[placeholder*="search" i], input[type="search"]',

  /** Export to CSV button */
  exportButton: 'button:has-text("Export")',

  /** Column visibility toggle */
  columnsButton: 'button:has-text("Columns")',

  // ── Table ─────────────────────────────────────────────────────────────────
  /** Any table-like row container */
  tableRow: 'table tbody tr, [role="row"]:not([role="columnheader"])',

  /** Header row checkbox (select-all) */
  selectAllCheckbox: 'table thead input[type="checkbox"], th input[type="checkbox"]',

  /** Row-level checkbox */
  rowCheckbox: 'table tbody input[type="checkbox"], td input[type="checkbox"]',

  // ── Batch operation bar ───────────────────────────────────────────────────
  /** Container shown when rows are selected */
  batchBar:
    '[class*="selected"] button, [class*="batch"] button, div:has(> button:has-text("Delete")):has(> span:has-text("selected"))',

  /** Batch delete button */
  batchDelete: 'button:has-text("Delete")',

  // ── Modals & drawers ──────────────────────────────────────────────────────
  /** Modal overlay / dialog */
  modal: 'dialog, [role="dialog"], [role="dialog"][aria-modal="true"], div[class*="modal"], div[class*="drawer"], div.fixed.inset-0',

  /** Close / Cancel button inside a modal */
  modalCancel: 'button:has-text("Cancel"), button:has-text("Close"), button[aria-label="Close"]',

  /** Primary submit button inside a modal */
  modalSave: 'button[type="submit"], button:has-text("Save"), button:has-text("Create")',

  // ── Status badges ─────────────────────────────────────────────────────────
  statusBadge: 'span[class*="badge" i], span[class*="status" i]',

  // ── Pagination ───────────────────────────────────────────────────────────
  nextPageButton: 'button:has-text("Next"), button[aria-label*="next" i]',
  pageSizeSelect: 'select[aria-label*="page size" i], select[aria-label*="rows" i]',
} as const
