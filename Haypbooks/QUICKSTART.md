# 🚀 Quick Start - Haypbooks v9 Landing Page & Auth

## What's Been Done

✅ **Fixed duplicate login page error** - Removed old `/login/page.tsx`  
✅ **Created NestJS backend** - Real JWT authentication with bcrypt  
✅ **Built frontend service layer** - API client + auth service  
✅ **Implemented landing page** - Hero, Features, Pricing, Footer  
✅ **Added environment config** - `.env.local` for API URL  
✅ **Created startup script** - `start-dev.ps1` for one-click launch  

## 🎯 Test the Landing Page

### 1. Start Both Servers

```powershell
# Run this from project root
./start-dev.ps1
```

This will open 2 terminal windows:
- **Backend** (NestJS): http://127.0.0.1:4000
- **Frontend** (Next.js): http://localhost:3000

### 2. Access the Landing Page

Open browser to: **http://localhost:3000**

You'll automatically be redirected to: **http://localhost:3000/landing**

### 3. Test Signup Flow

1. Click "Get Started Free" on landing page
2. Fill in signup form:
   - First Name: `John`
   - Last Name: `Doe`
   - Company: `ACME Corp`
   - Email: `john@acme.com`
   - Password: `password123`
   - Confirm Password: `password123`
3. Click "Create account"
4. Should redirect to `/onboarding`

### 4. Test Login Flow

1. Navigate to http://localhost:3000/login
2. Use demo credentials:
   - Email: `demo@haypbooks.test`
   - Password: `password`
3. Click "Sign in"
4. Should redirect to `/dashboard` (or `/onboarding` if not completed)

### Quick business onboarding (new)

Onboarding pages require authentication — you must be logged in before visiting onboarding pages. There is a focused quick onboarding page for the Business step at:

```
http://localhost:3000/onboarding/business
```

This page provides a single-step form to quickly set the company/business details and save them to the onboarding API.
## 🔍 What to Check

### Frontend (http://localhost:3000)

- [ ] Landing page loads without errors
- [ ] "Get Started" button goes to `/signup`
- [ ] Signup form validates password strength
- [ ] Signup creates user and redirects to onboarding
- [ ] Login validates credentials
- [ ] Login sets JWT token in localStorage
- [ ] Middleware redirects `/` to `/landing` when unauthenticated

### Backend (http://localhost:4000)

- [ ] Server starts without errors
- [ ] `POST /api/auth/signup` creates users
- [ ] `POST /api/auth/login` returns JWT token
- [ ] `GET /api/users/me` returns user profile (protected)
- [ ] Password hashing works (bcrypt)
- [ ] JWT tokens are valid for 7 days

## 📋 API Testing (Optional)

### Test Signup
```powershell
curl -X POST http://127.0.0.1:4000/api/auth/signup `
  -H "Content-Type: application/json" `
  -d '{"email":"test@test.com","password":"password","firstName":"Test","lastName":"User","companyName":"Test Co"}'
```

### Test Login
```powershell
curl -X POST http://127.0.0.1:4000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"demo@haypbooks.test","password":"password"}'
```

### Test Protected Endpoint
```powershell
# Replace YOUR_TOKEN with the access_token from login response
curl http://127.0.0.1:4000/api/users/me `
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🐛 Troubleshooting

### Frontend Build Warnings

The build shows some warnings about:
- localStorage usage during SSG (expected - these pages are client-side only)
- ESLint/TypeScript warnings in existing code (non-blocking)

These are **not breaking issues** - the app works fine in development mode.

### CORS Errors

If you see CORS errors in browser console:
1. Verify backend is running on port 4000
2. Check backend console - should show CORS enabled
3. Make sure `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:4000`

### Authentication Not Working

1. Open DevTools → Application → Local Storage
2. Check for `authToken` entry
3. Open Network tab and verify API calls go to `localhost:4000`
4. Check backend console for incoming requests

### Port Already in Use

```powershell
# Kill backend (port 4000)
Get-Process -Id (Get-NetTCPConnection -LocalPort 4000).OwningProcess | Stop-Process

# Kill frontend (port 3000)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

## ✅ Success Criteria

You know it's working when:

1. ✅ Landing page loads at `http://localhost:3000`
2. ✅ Signup creates new user and redirects to onboarding
3. ✅ Login with demo credentials works
4. ✅ Browser localStorage shows `authToken`
5. ✅ Backend logs show successful auth requests
6. ✅ No duplicate route errors in build
7. ✅ Middleware correctly redirects unauthenticated users

## 📚 Next Steps

After confirming everything works:

1. **Finish core features** (as you planned)
2. Migrate to Prisma + PostgreSQL
3. Re-enable TypeScript strict mode
4. Fix ESLint warnings
5. Add email verification
6. Implement password reset
7. Enable subscription plans

## 📁 Key Files Reference

**Frontend:**
- Landing page: `src/app/(public)/landing/page.tsx`
- Login: `src/app/(public)/login/page.tsx`
- Signup: `src/app/(public)/signup/page.tsx`
- Auth service: `src/services/auth.service.ts`
- API client: `src/lib/api-client.ts`
- Middleware: `middleware.ts`

**Backend:**
- Main: `Backend/src/main.ts`
- Auth module: `Backend/src/auth/`
- User repository: `Backend/src/repositories/mock/user.repository.mock.ts`
- Environment: `Backend/.env` (create if needed)

**Documentation:**
- Full setup: `SETUP_GUIDE.md`
- Backend API: `Backend/README.md`
- Roadmap: `Roadmap.v2/`

---

**Status**: ✅ Ready to test! Run `./start-dev.ps1` and open http://localhost:3000
