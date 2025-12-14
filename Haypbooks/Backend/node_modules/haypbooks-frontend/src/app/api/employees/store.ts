export type Employee = { id: string; name: string; email?: string; phone?: string }

let employees: Employee[] = []

export function seedEmployees(seed: Employee[]) {
  const byId = new Map(employees.map((e) => [e.id, e]))
  for (const e of seed) {
    if (!byId.has(e.id)) employees.push(e)
  }
}

export function listEmployees(): Employee[] { return employees }

export function addEmployee(e: Employee): Employee { employees.push(e); return e }

export function updateEmployee(id: string, patch: Partial<Employee>): Employee | null {
  const idx = employees.findIndex((e) => e.id === id)
  if (idx === -1) return null
  employees[idx] = { ...employees[idx], ...patch }
  return employees[idx]
}

export function ensureSampleEmployees(count = 10) {
  if (employees.length === 0) {
    seedEmployees(Array.from({ length: count }, (_, i) => ({
      id: `emp_${i + 1}`,
      name: `Employee ${i + 1}`,
      email: `employee${i + 1}@example.com`,
      phone: `555-03${(i + 1).toString().padStart(2, '0')}`,
    })))
  }
}
