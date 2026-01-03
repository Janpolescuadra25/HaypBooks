During signup (for the Owner or Accountant hub), collect user details (email, phone, password, etc.).
When the user clicks "Create Account":
- Do not save the user record in the database yet.
- Prompt OTP verification.
- Require successful OTP verification through at least one method: either email or phone (not both).
- Only after the user correctly enters the OTP for email or phone, create and save the verified user in the database. Then proceed to the appropriate flow (Accountant hub or Owner hub).
- Note: In test and developer environments where Redis is not available, the backend falls back to an in-memory pending-signup store; this means pre-signup entries will not persist across process restarts.
- If neither method is verified, block account creation and show an error (e.g., "Please verify your email or phone to complete signup").
