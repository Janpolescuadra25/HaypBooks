const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

const newModels = `
// -----------------------------------------------------------------------------
// PHASE 5 ENHANCEMENTS: PRACTICE MANAGEMENT (CRM, TIME & BILLING)
// -----------------------------------------------------------------------------

model PracticeRoleRate {
  id            String   @id @default(uuid())
  practiceId    String
  role          String   // e.g., 'PARTNER', 'MANAGER', 'SENIOR', 'JUNIOR', 'BOOKKEEPER'
  hourlyRate    Decimal  @db.Decimal(19, 4)
  effectiveDate DateTime @default(now())
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  practice Practice @relation(fields: [practiceId], references: [id], onDelete: Cascade)

  @@index([practiceId, isActive])
}

model EngagementTimeEntry {
  id                String   @id @default(uuid())
  engagementId      String
  practiceUserId    String
  date              DateTime
  hours             Decimal  @db.Decimal(19, 4)
  notes             String?  @db.Text
  isBillable        Boolean  @default(true)
  hourlyRateApplied Decimal  @db.Decimal(19, 4)
  wipStatus         String   @default("UNBILLED") // UNBILLED, BILLED, WRITTEN_OFF
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  engagement   Engagement   @relation(fields: [engagementId], references: [id], onDelete: Cascade)
  practiceUser PracticeUser @relation(fields: [practiceUserId], references: [id], onDelete: Restrict)

  @@index([engagementId, wipStatus])
  @@index([practiceUserId, date])
}

model PracticeWipLedger {
  id             String   @id @default(uuid())
  practiceId     String
  engagementId   String
  period         String   // e.g., '2026-03'
  unbilledHours  Decimal  @default(0) @db.Decimal(19, 4)
  unbilledAmount Decimal  @default(0) @db.Decimal(19, 4)
  billedAmount   Decimal  @default(0) @db.Decimal(19, 4)
  writeOffAmount Decimal  @default(0) @db.Decimal(19, 4)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  practice   Practice   @relation(fields: [practiceId], references: [id], onDelete: Cascade)
  engagement Engagement @relation(fields: [engagementId], references: [id], onDelete: Cascade)

  @@unique([engagementId, period]) // Only one summary per engagement per month
  @@index([practiceId, period])
}

model PracticeClientLead {
  id             String   @id @default(uuid())
  practiceId     String
  companyName    String
  contactName    String?
  email          String?
  phone          String?
  status         String   @default("NEW") // NEW, IN_PROGRESS, CONVERTED, LOST
  estimatedValue Decimal? @db.Decimal(19, 4)
  notes          String?  @db.Text
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  practice Practice @relation(fields: [practiceId], references: [id], onDelete: Cascade)

  @@index([practiceId, status])
}
`;

// Append models to end of file if not already there
if (!schema.includes('model PracticeRoleRate')) {
    schema += newModels;
}

// Inject relations to Practice
schema = schema.replace(
    /model Practice \{([\s\S]*?)@@index\(\[workspaceId\]\)\n\}/g,
    (match, body) => {
        let newBody = body;
        if (!newBody.includes('roleRates')) {
            newBody += `  roleRates      PracticeRoleRate[]\n`;
            newBody += `  wipLedgers     PracticeWipLedger[]\n`;
            newBody += `  clientLeads    PracticeClientLead[]\n`;
        }
        return `model Practice {${newBody}  @@index([workspaceId])\n}`;
    }
);

// Inject relation to Engagement
schema = schema.replace(
    /model Engagement \{([\s\S]*?)@@index\(\[practiceId, status\]\)\n\}/g,
    (match, body) => {
        let newBody = body;
        if (!newBody.includes('timeEntries')) {
            newBody += `  timeEntries    EngagementTimeEntry[]\n`;
            newBody += `  wipLedgers     PracticeWipLedger[]\n`;
        }
        return `model Engagement {${newBody}  @@index([practiceId, status])\n}`;
    }
);

// Inject relation to PracticeUser
schema = schema.replace(
    /model PracticeUser \{([\s\S]*?)@@unique\(\[practiceId, userId\]\)\n\}/g,
    (match, body) => {
        let newBody = body;
        if (!newBody.includes('timeEntries')) {
            newBody += `  timeEntries EngagementTimeEntry[]\n`;
        }
        return `model PracticeUser {${newBody}  @@unique([practiceId, userId])\n}`;
    }
);

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('Successfully injected Practice Hub enhancements!');
