# Manual Onboarding Test Guide

## Purpose
Manually test the onboarding flow to identify where Company creation is failing.

## Prerequisites
1. Backend running on port 4000 (check with `Get-Process -Name node`)
2. Frontend running on port 3000
3. Backend terminal visible to see logs

## Test Steps

### Step 1: Signup
1. Open browser: `http://localhost:3000/signup`
2. Fill form:
   - Email: `manual-test-$(Get-Date -Format 'HHmmss')@test.com`
   - Password: `Test1234!`
   - Name: `Manual Test`
   - Role: `Business Owner`
   - Phone: `+1234567890`
3. Click "Sign Up"
4. **Expected Backend Logs**: 
   ```
   [HTTP] POST /api/auth/signup - 200
   [auth:signup] Signup success
   ```

### Step 2: Verify Email
1. Check backend logs for OTP code
2. Enter OTP in verification page
3. **Expected Backend Logs**:
   ```
   [HTTP] POST /api/auth/email/verify-code - 200
   [HTTP] POST /api/auth/complete-signup - 200
   ```

### Step 3: Onboarding Step 1 (Business Info)
1. Fill Business Information:
   - Business Name: `Manual Test Company`
   - Legal Name: `Manual Test Company LLC`
   - Business Type: `Corporation`
   - Industry: `Technology`
   - Country: `United States`
   - Address: `123 Test St`
2. Click "Save and continue"
3. **Expected Backend Logs**:
   ```
   [HTTP] POST /api/onboarding/save - 200
   [ONBOARDING-SAVE] 📝 Request received: { userId: '...', step: 'business', ... }
   [ONBOARDING-SAVE] ✅ Step saved successfully
   ```
4. **CHECK**: If no logs appear, API call failed!

### Step 4: Onboarding Steps 2-6
1. Click "Save and continue" through remaining steps
2. **Expected Backend Logs**: Should see `[ONBOARDING-SAVE]` for each step

### Step 5: Complete Onboarding
1. On Review step, click "Finish onboarding"
2. **Expected Backend Logs**:
   ```
   [HTTP] POST /api/onboarding/complete - 200
   [ONBOARDING-COMPLETE] 🎯 Request received
   [ONBOARDING-COMPLETE] 🚀 Step 1: Starting Tenant creation
   [ONBOARDING-COMPLETE] ✅ Step 3: Tenant created successfully
   [ONBOARDING-COMPLETE] 🚀 Step 4: Preparing to create Company
   [ONBOARDING-COMPLETE] 🚀 Step 5: Full companyPayload before createCompanyUnderTenant
   [COMPANY-CHILD-CREATE] 🚀 Starting createCompanyRecord
   [COMPANY-CHILD-CREATE] ✅ Company record created
   [ONBOARDING-COMPLETE] ✅ Step 6: Company created successfully
   ```
3. **CHECK DATABASE**:
   ```powershell
   cd C:\Users\HomePC\Desktop\Haypbooksv9\Haypbooks\Backend
   npx ts-node scripts/check-db-status.ts
   ```
   Should show: Companies: 1 (increased from 0)

### Step 6: Verify Owner Workspace
1. Should redirect to `/hub/companies`
2. Should see company card with "Manual Test Company"

## What to Look For

### If NO backend logs appear:
- ❌ Frontend is not calling backend API
- Check browser Console for errors
- Check Network tab for failed requests
- Verify NEXT_PUBLIC_API_URL in .env.local

### If backend logs show 401 Unauthorized:
- ❌ JWT token/cookie not being sent
- Check browser cookies (should have `token` cookie)
- Check token expiration

### If backend logs show save requests BUT no database entries:
- ❌ Save API returning success but not persisting
- Bug in onboarding repository

### If Tenant created but no Company:
- ❌ Company creation failing (check detailed logs)
- Should see error logs with stack trace

## Quick Database Checks

```powershell
# Check if user exists
cd C:\Users\HomePC\Desktop\Haypbooksv9\Haypbooks\Backend
npx ts-node -e "import {PrismaClient} from '@prisma/client'; const p=new PrismaClient(); p.user.findFirst({where:{email:{contains:'manual-test'}},select:{email:true,onboardingComplete:true}}).then(u=>console.log('User:',u)).finally(()=>p.\$disconnect())"

# Check onboarding steps
npx ts-node scripts/check-onboarding-steps.ts

# Check overall status
npx ts-node scripts/check-db-status.ts
```
