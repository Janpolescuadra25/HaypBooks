'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function MultiCurrencyRevaluationPage() {
  return (
    <PageDocumentation
      title="Multi-Currency Revaluation"
      module="ACCOUNTING — PERIOD CLOSE"
      breadcrumb="Accounting / Period Close / Multi-Currency Revaluation"
      purpose="Revalue foreign currency monetary balances at period-end exchange rates, recognizing unrealized gains and losses in the income statement."
      components={[
        { name: "Revaluation Run Wizard", description: "Step through currency, accounts, and exchange rate selection for the run" },
        { name: "Preview Table", description: "Asset/liability balances before and after revaluation with gain/loss" },
        { name: "Run History", description: "Past revaluation runs with journal entry links" },
      ]}
      tabs={[
        "Revalue",
        "Run History",
        "Exchange Rates",
      ]}
      features={[
        "Live exchange rate feed or manual input",
        "Selective account revaluation",
        "Unrealized gain/loss posting",
        "Auto-reversal option",
        "Multi-entity support",
      ]}
      dataDisplayed={[
        "Account balances in foreign currency",
        "Current exchange rate",
        "Revalued carrying amount",
        "Unrealized gain or loss",
        "Prior period exchange rate for comparison",
      ]}
      userActions={[
        "Run period-end revaluation",
        "Enter or pull exchange rate",
        "Preview gain/loss before posting",
        "Post revaluation journal",
        "Reverse prior revaluation run",
      ]}
    />
  )
}

