Act as a senior full-stack engineer experienced with Next.js, NestJS, Prisma, PostgreSQL, and authentication flows.

Your task is to ensure **all user inputs in the authentication system** (Login, Sign In, Sign Up, OTP verification, and Forgot Password) are correctly:

- Validated on frontend and backend  
- Saved or updated in the PostgreSQL database via Prisma  
- Verified end-to-end for functionality and data persistence

Please do the following:

1. **Review frontend forms** (Next.js + React Hook Form):  
   - Validate inputs (email format, password strength, required fields)  
   - Connect form submission to API endpoints  
   - Show clear validation errors

2. **Review backend controllers and services** (NestJS + Prisma):  
   - Validate and sanitize inputs with DTOs + Zod  
   - Handle create/update/read operations for:  
       • User (signup, password update)  
       • Sessions (login tracking)  
       • OTP codes (generate, verify, expire)  
   - Save all data correctly to PostgreSQL via Prisma client  
   - Handle errors gracefully with descriptive messages

3. **Verify the following flows end-to-end, ensuring database records are created or updated as expected:**  
   - **Sign Up:** user record created, password hashed  
   - **Sign In:** session created or JWT issued, failed attempts handled  
   - **OTP:** OTP generated, stored with expiry, verified and invalidated after use  
   - **Forgot Password:** OTP or reset token generated and stored, user password updated after verification

4. **Add or fix any missing database schema fields** or migrations needed for this flow.


6. **Create a test checklist** for QA to verify every field and flow stores data as expected.

Your output must include:  
- Any updated Prisma schema models  
- Backend service/controller code snippets for input handling and database save  
- Frontend form validation and submission examples  
- Step-by-step test checklist  
5. **Provide instructions** on how to use a supported database inspector to monitor database changes live (we've removed Prisma Studio tooling in this project).

- Recommended tools: `psql` (CLI), `pgAdmin`, `Adminer`, or `Supabase Studio` for a web-based interface.
- Use `psql` or `pgcli` for quick live inspection and scripted checks. Example:

```powershell
# connect using psql
pq "PGPASSWORD=your_password psql 'postgresql://postgres:password@localhost:5432/haypbooks_dev'"

# sample query
\dt
SELECT * FROM users LIMIT 5;
```

If you want a lightweight GUI for local testing, use `Adminer` or `pgAdmin`. For cloud or hosted environments prefer `Supabase Studio` or your cloud provider's DB console.

Goal:  
Ensure the authentication system is fully functional, inputs validated, and all data persists correctly in the database.

