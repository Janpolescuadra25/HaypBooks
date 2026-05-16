export class TrialBalanceAccountDto {
  accountId!: string
  accountCode!: string
  accountName!: string
  accountType!: string
  accountSubtype?: string
  totalDebit!: number
  totalCredit!: number
  netBalance!: number
}

export class TrialBalanceReportDto {
  companyId!: string
  asOf!: Date
  generatedAt!: Date
  accounts!: TrialBalanceAccountDto[]
  totals!: {
    totalDebit: number
    totalCredit: number
    netBalance: number
  }
}
