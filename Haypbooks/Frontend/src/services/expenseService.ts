// Thin wrapper that exposes the expenses API under the `expenseService` name.
// This avoids changing existing imports while providing a clearer service name
// for new code that focuses on expense capture and reimbursements.

import { expensesService } from './expenses.service'

export const expenseService = expensesService

export default expenseService
