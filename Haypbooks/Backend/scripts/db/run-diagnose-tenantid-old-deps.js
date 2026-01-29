// Wrapper to set DATABASE_URL then run the TypeScript diagnostic via ts-node
const url = process.argv[2]
if (url) process.env.DATABASE_URL = url
require('ts-node/register')
require('./diagnose-tenantid-old-deps.ts')
