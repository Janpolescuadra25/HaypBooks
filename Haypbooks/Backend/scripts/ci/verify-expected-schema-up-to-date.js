const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const genScript = path.resolve(__dirname, './generate-expected-schema.js')
const expectedPath = path.resolve(__dirname, './expected_schema.json')
const tmpPath = path.resolve(__dirname, './expected_schema.tmp.json')

try {
  // generate into a tmp file
  execSync(`node "${genScript}"`, { stdio: 'inherit' })
  // read generated file
  const generated = fs.readFileSync(expectedPath, 'utf8')
  const committed = fs.readFileSync(expectedPath, 'utf8')
  const g = JSON.stringify(JSON.parse(generated), null, 2)
  const c = JSON.stringify(JSON.parse(committed), null, 2)
  if (g !== c) {
    console.error('❌ expected_schema.json is out of date with schema.prisma. Please run `npm run generate:expected-schema` and commit the changes.')
    process.exit(1)
  }
  console.log('✅ expected_schema.json is up-to-date with schema.prisma')
} catch (e) {
  console.error('❌ Verification failed:', e.message)
  process.exit(1)
}
