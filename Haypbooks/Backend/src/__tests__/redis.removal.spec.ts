import * as fs from 'fs'
import * as path from 'path'

function walk(dir: string, files: string[] = []) {
  for (const f of fs.readdirSync(dir)) {
    if (f === 'node_modules' || f === 'dist' || f.startsWith('.git')) continue
    const full = path.join(dir, f)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) walk(full, files)
    else files.push(full)
  }
  return files
}

describe('Redis removal checks', () => {
  test('no ioredis/redis imports or requires in code files', () => {
    const root = path.resolve(__dirname, '..', '..')
    const files = walk(root)
      .filter(f => f.endsWith('.ts') || f.endsWith('.js') || f.endsWith('.json'))

    const bad: string[] = []
    const re = /(?:from\s+['\"](ioredis|redis)['\"])|(?:require\(['\"](ioredis|redis)['\"]\))/g

    for (const file of files) {
      // skip package.json check here
      if (file.endsWith('package.json')) continue
      const content = fs.readFileSync(file, 'utf8')
      if (re.test(content)) bad.push(file)
    }

    if (bad.length > 0) {
      throw new Error(`Found imports/requires of ioredis/redis in files: ${bad.join(', ')}`)
    }
  })

  test('package.json does not contain ioredis or redis dependencies', () => {
    const pj = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', 'package.json'), 'utf8'))
    const deps = { ...(pj.dependencies || {}), ...(pj.devDependencies || {}) }
    const found = Object.keys(deps).filter(k => k === 'ioredis' || k === 'redis')
    if (found.length > 0) throw new Error(`Found redis packages in package.json: ${found.join(', ')}`)
  })
})
