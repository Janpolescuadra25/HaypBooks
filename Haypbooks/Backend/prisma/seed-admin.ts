import { PrismaClient } from '@prisma/client'
// Prefer native bcrypt when available, otherwise fall back to bcryptjs
let bcrypt: any
try { bcrypt = require('bcrypt') } catch (e) { bcrypt = require('bcryptjs') }
import * as dotenv from 'dotenv'

dotenv.config({ path: process.cwd() + '/.env' })

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding Super Admin Account...')

    // Create the default super admin password hash
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'SuperSecretPassword123!'
    const passwordHash = await bcrypt.hash(defaultPassword, 10)

    // Desired founder email (can be overridden via env var)
    const adminEmail = process.env.ADMIN_EMAIL || 'founder@haypbooks.com'

    const superAdmin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            // If it exists, ensure the role is set correctly
            systemRole: 'SUPER_ADMIN',
        },
        create: {
            email: adminEmail,
            name: 'HaypBooks Founder',
            password: passwordHash,
            systemRole: 'SUPER_ADMIN', // Gives global platform access
            isEmailVerified: true,
        },
    })

    console.log(`✅ Super Admin created or updated:`)
    console.log(`   Email: ${superAdmin.email}`)
    console.log(`   Role:  ${superAdmin.systemRole}`)
    console.warn(`   Note: If this is a new account in production, please change the password immediately!`)
}

main()
    .catch((e) => {
        console.error('❌ Failed to seed Super Admin:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
