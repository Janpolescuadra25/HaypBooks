const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

const newModels = `
// -----------------------------------------------------------------------------
// PHASE 4 ENHANCEMENTS: BANK RULES, INVOICE TEMPLATES, APPROVAL WORKFLOWS
// -----------------------------------------------------------------------------

model BankRule {
  id              String   @id @default(uuid())
  workspaceId     String
  name            String
  description     String?
  matchCriteria   Json     // e.g. { "field": "description", "operator": "contains", "value": "STARBUCKS" }
  assignAccountId String   // The account ID to auto-categorize to
  priority        Int      @default(0) // Lower number = higher priority
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  account   Account   @relation(fields: [assignAccountId], references: [id], onDelete: Restrict)

  @@index([workspaceId, isActive, priority])
}

model InvoiceTemplate {
  id           String   @id @default(uuid())
  workspaceId  String
  name         String
  fontFamily   String   @default("Inter, sans-serif")
  primaryColor String   @default("#000000")
  logoUrl      String?
  headerText   String?  @db.Text
  footerText   String?  @db.Text
  isDefault    Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  invoices  Invoice[]

  @@index([workspaceId, isDefault])
}

model ApprovalWorkflow {
  id          String   @id @default(uuid())
  workspaceId String
  name        String
  entityType  String   // e.g. 'PURCHASE_ORDER', 'BILL', 'EXPENSE_CLAIM'
  steps       Json     // Array of step definitions (thresholds, required roles/users)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  workspace        Workspace         @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  approvalRequests ApprovalRequest[]

  @@unique([workspaceId, entityType])
}

model ApprovalRequest {
  id               String   @id @default(uuid())
  workflowId       String
  entityId         String   // The ID of the PurchaseOrder/Bill being approved
  status           String   @default("PENDING") // PENDING, APPROVED, REJECTED
  requestedById    String   // The user who submitted it
  currentStepIndex Int      @default(0)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  workflow  ApprovalWorkflow @relation(fields: [workflowId], references: [id], onDelete: Cascade)
  requester User             @relation(fields: [requestedById], references: [id], onDelete: Restrict)

  // Explicit relations back to potential entities requesting approval
  purchaseOrder PurchaseOrder? @relation(fields: [entityId], references: [id], onDelete: Cascade, map: "fk_approval_po")
  bill          Bill?          @relation(fields: [entityId], references: [id], onDelete: Cascade, map: "fk_approval_bill")

  @@index([workflowId, status])
  @@index([requestedById])
}
`;

// Append models to end of file if not already there
if (!schema.includes('model BankRule')) {
    schema += newModels;
}

// Inject relations to Workspace
schema = schema.replace(
    /model Workspace \{([\s\S]*?)@@index\(\[companyId\]\)\n\}/g,
    (match, body) => {
        let newBody = body;
        if (!newBody.includes('bankRules')) {
            newBody += `  bankRules                BankRule[]\n`;
            newBody += `  invoiceTemplates         InvoiceTemplate[]\n`;
            newBody += `  approvalWorkflows        ApprovalWorkflow[]\n`;
        }
        return `model Workspace {${newBody}  @@index([companyId])\n}`;
    }
);

// Inject relation to Invoice
schema = schema.replace(
    /model Invoice \{([\s\S]*?)@@index\(\[companyId, status\]\)\n\}/g,
    (match, body) => {
        let newBody = body;
        if (!newBody.includes('templateId')) {
            // Add field
            newBody = newBody.replace(
                /userId\s+String\?\n/,
                `userId           String?\n  templateId       String?\n`
            );
            // Add relation
            newBody = newBody.replace(
                /user\s+User\?\s+@relation\(fields: \[userId\], references: \[id\], onDelete: SetNull\)\n/,
                `user             User?                  @relation(fields: [userId], references: [id], onDelete: SetNull)\n  template         InvoiceTemplate?       @relation(fields: [templateId], references: [id], onDelete: SetNull)\n`
            );
        }
        return `model Invoice {${newBody}  @@index([companyId, status])\n}`;
    }
);

// Inject relation to Account
schema = schema.replace(
    /model Account \{([\s\S]*?)@@index\(\[companyId, code\]\)\n\}/g,
    (match, body) => {
        let newBody = body;
        if (!newBody.includes('BankRule')) {
            newBody += `  bankRules                  BankRule[]\n`;
        }
        return `model Account {${newBody}  @@index([companyId, code])\n}`;
    }
);

// Inject relation to User
schema = schema.replace(
    /model User \{([\s\S]*?)@@index\(\[email\]\)\n\}/g,
    (match, body) => {
        let newBody = body;
        if (!newBody.includes('approvalRequests')) {
            newBody += `  approvalRequests              ApprovalRequest[]\n`;
        }
        return `model User {${newBody}  @@index([email])\n}`;
    }
);

// Inject relation to PurchaseOrder
schema = schema.replace(
    /model PurchaseOrder \{([\s\S]*?)@@index\(\[companyId, status\]\)\n\}/g,
    (match, body) => {
        let newBody = body;
        if (!newBody.includes('approvalRequests')) {
            newBody += `  approvalRequests ApprovalRequest[]\n`;
        }
        return `model PurchaseOrder {${newBody}  @@index([companyId, status])\n}`;
    }
);

// Inject relation to Bill
schema = schema.replace(
    /model Bill \{([\s\S]*?)@@index\(\[companyId, status\]\)\n\}/g,
    (match, body) => {
        let newBody = body;
        if (!newBody.includes('approvalRequests')) {
            newBody += `  approvalRequests ApprovalRequest[]\n`;
        }
        return `model Bill {${newBody}  @@index([companyId, status])\n}`;
    }
);

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('Successfully injected schema enhancements!');
