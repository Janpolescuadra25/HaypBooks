let bcrypt: any
try {
  bcrypt = require('bcrypt')
} catch (e) {
  console.warn('bcrypt native not available, falling back to bcryptjs')
  bcrypt = require('bcryptjs')
}

// Normalize to Promise-based API for both bcrypt native and bcryptjs
export const hash = (value: string, saltOrRounds: number) => {
  return new Promise<string>((resolve, reject) => {
    try {
      bcrypt.hash(value, saltOrRounds, (err: any, hash: string) => {
        if (err) return reject(err)
        resolve(hash)
      })
    } catch (e) {
      reject(e)
    }
  })
}

export const compare = (value: string, hash: string) => {
  return new Promise<boolean>((resolve) => {
    try {
      bcrypt.compare(value, hash, (err: any, ok: boolean) => {
        resolve(Boolean(ok))
      })
    } catch (e) {
      resolve(false)
    }
  })
}

export default { hash, compare }
