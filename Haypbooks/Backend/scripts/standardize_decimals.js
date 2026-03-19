const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// Regex to find all fields that are of Decimal type.
// Example: amount Decimal @db.Decimal(20, 4)
// Also handles optional Decimals: amount Decimal? @db.Decimal(12, 2)
// Group 1: field name
// Group 2: Decimal or Decimal?
// Group 3: @db.Decimal(...)
const regex = /^(\s+)([a-zA-Z0-9_]+)(\s+Decimal\??)(.*?)@db\.Decimal\(\s*\d+\s*,\s*\d+\s*\)(.*)$/gm;

// We map based on field name conventions in the schema.
function getStandard(fieldName) {
    const lower = fieldName.toLowerCase();

    // 1. Exchange Rates
    if (lower.includes('exchangerate') || lower.includes('exchange_rate')) return '(18, 12)';

    // 2. Quantities
    if (lower.includes('quantity') || lower.includes('qty')) return '(16, 6)';

    // 3. Percentages / Rates (excluding exchange rates)
    if (lower.includes('rate') || lower.includes('percent') || lower.includes('pct')) return '(8, 4)';

    // 4. Default to Money Amount
    // Includes: amount, total, balance, cost, price, debit, credit
    return '(19, 4)';
}

let modifiedCount = 0;
schema = schema.replace(regex, (match, prefix, fieldName, type, beforeDb, afterDb) => {
    const std = getStandard(fieldName);
    modifiedCount++;
    return `${prefix}${fieldName}${type}${beforeDb}@db.Decimal${std}${afterDb}`;
});

console.log(`Updated ${modifiedCount} Decimal fields.`);

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('Successfully wrote standardized schema.prisma');
