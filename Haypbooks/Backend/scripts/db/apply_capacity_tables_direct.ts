import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const stmts = [
`CREATE TABLE IF NOT EXISTS "PlanCapacity" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id text NOT NULL REFERENCES "Plan"(id) ON DELETE CASCADE,
  key text NOT NULL,
  value integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (plan_id, key)
);`,
`CREATE INDEX IF NOT EXISTS "idx_plan_capacity_plan_key" ON "PlanCapacity" (plan_id, key);`,
`CREATE TABLE IF NOT EXISTS "WorkspaceCapacity" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES "Workspace"(id) ON DELETE CASCADE,
  key text NOT NULL,
  limit_value integer NOT NULL DEFAULT 0,
  used_value integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, key)
);`,
`CREATE INDEX IF NOT EXISTS "idx_workspace_capacity_workspace_key" ON "WorkspaceCapacity" (workspace_id, key);`
]

async function main(){
  try{
    for (const s of stmts){
      console.log('Running stmt...')
      await prisma.$executeRawUnsafe(s)
      console.log('OK')
    }
  }catch(e){
    console.error('ERROR', e)
  }finally{
    await prisma.$disconnect()
  }
}

main().catch(e=>{console.error(e); process.exit(1)})
