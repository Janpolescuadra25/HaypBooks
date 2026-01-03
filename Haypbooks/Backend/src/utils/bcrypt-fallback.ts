let bcrypt: any
try {
  bcrypt = require('bcrypt')
} catch (e) {
  console.warn('bcrypt native not available, falling back to bcryptjs')
  bcrypt = require('bcryptjs')
}

export const hash = (...args: any[]) => bcrypt.hash(...args)
export const compare = (...args: any[]) => bcrypt.compare(...args)
export default { hash, compare }
