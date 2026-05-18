import { ExpenseStatusTransitionGuard } from '../../../src/expenses/expense-status-transition.guard'

describe('ExpenseStatusTransitionGuard', () => {
  const guard = new ExpenseStatusTransitionGuard({} as any)

  it('should allow APPROVED → VOIDED', () => {
    expect(() => guard.canTransition('APPROVED', 'VOIDED')).not.toThrow()
  })

  it('should allow PAID → VOIDED', () => {
    expect(() => guard.canTransition('PAID', 'VOIDED')).not.toThrow()
  })

  it('should still allow DRAFT → PAID (forward only)', () => {
    expect(() => guard.canTransition('DRAFT', 'PAID')).not.toThrow()
  })

  it('should still reject backward transitions like PAID → DRAFT', () => {
    expect(() => guard.canTransition('PAID', 'DRAFT')).toThrow()
  })

  it('should still reject PAID → APPROVED', () => {
    expect(() => guard.canTransition('PAID', 'APPROVED')).toThrow()
  })
})
