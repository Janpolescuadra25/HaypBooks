export type Term = string

let terms: Term[] = ['Due on receipt', 'Net 15', 'Net 30', 'Net 45', 'Net 60']

export function listTerms(): Term[] { return terms }

export function addTerm(t: Term) {
  if (!terms.includes(t)) terms.push(t)
}
