-- Allow Otp.email to be nullable so phone-only OTPs can be created
ALTER TABLE public."Otp" ALTER COLUMN "email" DROP NOT NULL;