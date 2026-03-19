const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// 1. Rename Enum
schema = schema.replace(/enum PhilippinePayrollDeductionType/g, 'enum PayrollDeductionType');
schema = schema.replace(/PhilippinePayrollDeductionType/g, 'PayrollDeductionType');

// 2. Rename PhilippinePayrollDeduction to PayrollDeduction + add @@map + add countryId
schema = schema.replace(
    /model PhilippinePayrollDeduction \{([\s\S]*?)@@index\(\[deductionType\]\)\n\}/g,
    (match, body) => {
        // Add countryId to body if it doesn't exist
        let newBody = body;
        if (!newBody.includes('countryId')) {
            // Insert countryId after employeeId
            newBody = newBody.replace(/employeeId\s+String\n/, "employeeId    String\n  countryId     String?\n");
            // Define the relation before the unqiue/index block
            newBody = newBody.replace(/\/\/ Prevent duplicate deduction entries/, "country  Country? @relation(fields: [countryId], references: [id])\n\n  // Prevent duplicate deduction entries");
        }

        return `model PayrollDeduction {${newBody}@@map("PhilippinePayrollDeduction")\n  @@index([deductionType])\n}`;
    }
);

// We need to also rename any references to PhilippinePayrollDeduction in Employee model
schema = schema.replace(/PhilippinePayrollDeduction/g, 'PayrollDeduction');

// 3. Rename PhilippineFinancialStatementTemplate to FinancialStatementTemplate + add @@map + add countryId
schema = schema.replace(
    /model PhilippineFinancialStatementTemplate \{([\s\S]*?)@@index\(\[companyId\]\)\n\}/g,
    (match, body) => {
        let newBody = body;
        if (!newBody.includes('countryId')) {
            newBody = newBody.replace(/statementType\s+String/, "countryId     String?\n  statementType String");
            newBody = newBody.replace(/@@unique/, "country Country? @relation(fields: [countryId], references: [id])\n\n  @@unique");
        }
        return `model FinancialStatementTemplate {${newBody}@@map("PhilippineFinancialStatementTemplate")\n  @@index([companyId])\n}`;
    }
);

schema = schema.replace(/PhilippineFinancialStatementTemplate/g, 'FinancialStatementTemplate');

// Fix any dangling relation names if user used it specifically
schema = schema.replace(/"PhilPayrollDeduction_Account"/g, '"PayrollDeduction_Account"');

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('Successfully refactored schema.prisma for global localization!');
