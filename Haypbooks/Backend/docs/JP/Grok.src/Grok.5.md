During signup (for the Owner or Accountant hub), collect user details (email, phone, password, etc.).
When the user clicks "Create Account":
- Do not save the user record in the database yet.
- Prompt OTP verification.
- Require successful OTP verification through at least one method: either email or phone (not both).
- Only after the user correctly enters the OTP for email or phone, create and save the verified user in the database. Then proceed to the appropriate flow (Accountant hub or Owner hub).
- Note: In test and developer environments where Redis is not available, or when Redis is unreachable at runtime, the backend falls back to an in-memory pending-signup store; this means pre-signup entries will not persist across process restarts. The service will also gracefully fall back if Redis commands fail at runtime.
- If neither method is verified, block account creation and show an error (e.g., "Please verify your email or phone to complete signup").


===========================================================================


You are a senior backend engineer and security architect.

Build a production-ready user registration system with OTP verification using best practices.

REQUIREMENTS:

1. SIGN-UP FLOW
- User submits: first_name, last_name, email, phone_number, password
- Password must be hashed immediately (bcrypt or argon2)
- Create the user with status = "PENDING"
- Store created_at and expires_at (24 hours after creation)
- User cannot access protected routes until verified

2. OTP VERIFICATION
- Generate a 6-digit numeric OTP
- OTP expiration: 5 minutes
- OTP resend cooldown: 1 minute
- Max OTP verification attempts: 5
- Max OTP resend attempts: 5
- Store OTP as a hash, never plain text
- OTP must be invalidated after successful verification

3. RESEND OTP LOGIC
- Allow resend only if current time >= resend_after
- Return remaining cooldown time if requested too early
- Invalidate previous OTP when resending

4. ACCOUNT VERIFICATION
- If OTP is valid and not expired:
  - Mark user as VERIFIED
  - Delete OTP record
- If OTP attempts exceed limit:
  - Lock OTP and require new resend

5. LOGIN BEHAVIOR
- Allow login for PENDING users
- If PENDING:
  - Block dashboard access
  - Redirect to verification screen
- VERIFIED users get full access

6. AUTO CLEANUP
- Create a scheduled job (cron/background worker)
- Automatically delete users where:
  status = "PENDING" AND expires_at < current_time

7. SECURITY REQUIREMENTS
- Rate-limit OTP requests
- Do not reveal whether email or phone exists
- Protect all sensitive routes
- Validate inputs server-side

OUTPUT:
- Database schema (users, otp_verifications)
- API endpoints
- Business logic
- Clear comments
- Clean, maintainable, production-ready code

STACK:
- Language: [PUT YOUR LANGUAGE HERE]
- Framework: [PUT YOUR FRAMEWORK HERE]
- Database: [PUT YOUR DATABASE HERE]

Follow industry best practices.
