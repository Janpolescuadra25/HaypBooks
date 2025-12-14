const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

;(async () => {
  const prisma = new PrismaClient()
  try {
    const email = 'demo@haypbooks.test'
    const password = 'password'
    const user = await prisma.user.findUnique({ where: { email } })
    console.log('Found user:', !!user)
    const ok = await bcrypt.compare(password, user.password)
    console.log('Password match:', ok)
    const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'dev-secret-change-in-production', { expiresIn: '15m' })
    console.log('Token generated length:', token.length)
    const refresh = jwt.sign({ sub: user.id }, process.env.JWT_SECRET || 'dev-secret-change-in-production', { expiresIn: '7d' })
    console.log('Refresh token length:', refresh.length)
    const session = await prisma.session.create({ data: { userId: user.id, refreshToken: refresh, expiresAt: new Date(Date.now()+7*24*60*60*1000) } })
    console.log('Created session id:', session.id)
  } catch (e) {
    console.error('ERR', e)
  } finally {
    await prisma.$disconnect()
  }
})()
