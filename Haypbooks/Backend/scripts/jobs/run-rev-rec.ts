import { postPendingRevenueRecognition } from '../../src/jobs/revenue-recognition.job'

postPendingRevenueRecognition()
  .then((n) => console.log('[run-rev-rec] done — processed', n))
  .catch((err) => {
    console.error('[run-rev-rec] error', err)
    process.exit(1)
  })
  .finally(() => process.exit(0))
