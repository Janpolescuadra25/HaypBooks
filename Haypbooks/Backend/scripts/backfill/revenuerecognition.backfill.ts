import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function run() {
  console.log('[backfill] starting rev-rec schedule -> phases backfill')
  const schedules = await prisma.revenueRecognitionSchedule.findMany({ where: {}, take: 1000 })
  let created = 0

  for (const s of schedules) {
    try {
      const existingPhases = await prisma.revenueRecognitionPhase.findMany({ where: { scheduleId: s.id } })
      if (existingPhases.length > 0) {
        console.log(`[backfill] schedule ${s.id} already has ${existingPhases.length} phases — skip`)
        continue
      }

      const scheduleJson = s.schedule
      if (!scheduleJson) {
        console.log(`[backfill] schedule ${s.id} has no schedule JSON — skip`)
        continue
      }

      // Expect scheduleJson to be an array of phases, or {phases: []}, else try to infer
      let phases: any[] = []
      if (Array.isArray(scheduleJson)) phases = scheduleJson
      else if (Array.isArray((scheduleJson as any).phases)) phases = (scheduleJson as any).phases

      if (phases.length === 0) {
        // If not structured, try to evenly split totalAmount into a single phase
        // not ideal but avoids data loss
        phases = [
          {
            phaseNumber: 1,
            percentage: 1,
            amount: s.totalAmount,
            recognitionDate: new Date(),
          },
        ]
      }

      // Normalise and insert
      for (let i = 0; i < phases.length; i++) {
        const p = phases[i]
        const phaseNumber = p.phaseNumber ?? i + 1
        const percentage = p.percentage ?? (p.amount ? (Number(p.amount) / Number(s.totalAmount)) : 0)
        const amount = p.amount ?? (percentage ? Number(s.totalAmount) * Number(percentage) : 0)
        const recognitionDate = p.recognitionDate ? new Date(p.recognitionDate) : new Date()

        await prisma.revenueRecognitionPhase.create({
          data: {
            workspaceId: s.workspaceId,
            scheduleId: s.id,
            phaseNumber,
            percentage: String(percentage),
            amount: String(amount),
            recognitionDate,
            status: 'PENDING',
          },
        })
        created++
      }
      console.log(`[backfill] schedule ${s.id} -> created ${phases.length} phases`)
    } catch (err) {
      console.error('[backfill] error for schedule', s.id, err)
    }
  }

  console.log(`[backfill] complete — created ${created} phases`)
}

run()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
