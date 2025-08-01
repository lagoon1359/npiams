# Demo Accounts Setup Guide

## Quick Setup (Recommended)

The application now automatically creates user profiles when someone logs in for the first time. However, you still need to create the authentication accounts in Supabase.

### Step 1: Create Demo Users in Supabase Auth

Go to your Supabase Dashboard → Authentication → Users, and create the following users:

1. **Admin Account**
   - Email: `admin@npi.pg`
   - Password: `admin123`
   - Confirm email: Yes

2. **Instructor Account**
   - Email: `instructor@npi.pg`
   - Password: `instructor123`
   - Confirm email: Yes

3. **Student Account**
   - Email: `student@npi.pg`
   - Password: `student123`
   - Confirm email: Yes

4. **Registrar Account** (Optional)
   - Email: `registrar@npi.pg`
   - Password: `registrar123`
   - Confirm email: Yes

### Step 2: Fix Database RLS Policies (IMPORTANT)

If you're experiencing "Profile fetch timeout" errors, run this SQL in your Supabase SQL Editor:

```sql
-- First, ensure the users table exists with proper structure
CREATE TABLE IF NOT EXISTS public.users (
    id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
    email text UNIQUE NOT NULL,
    full_name text NOT NULL,
    role text NOT NULL CHECK (role IN ('admin', 'department_head', 'instructor', 'tutor', 'student')),
    phone text,
    date_of_birth date,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- Create new, more permissive policies for development
CREATE POLICY "Enable read for authenticated users" ON public.users
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.users
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = id);

CREATE POLICY "Enable update for own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Grant necessary permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
```

### Step 3: Test Login

After running the SQL above, try logging in again. The profile fetch timeouts should be resolved.

## Alternative: Manual SQL Setup

If you prefer to run SQL directly, you can use the following in your Supabase SQL Editor:

```sql
-- Enable Row Level Security on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own profile
CREATE POLICY "Users can read their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Create policy to allow authenticated users to insert their profile
CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);
```

## Troubleshooting

### If you get "Profile fetch timeout" errors:
1. **Run the RLS setup SQL above** - This is the most common cause
2. Make sure the users table exists in your database
3. Check that RLS policies allow authenticated users to read/write
4. Verify the Supabase environment variables in your `.env.production`

### If login redirects back to login page:
1. Check browser console for error messages
2. Verify the Supabase URL and anon key are correct
3. Make sure the users were created with confirmed email addresses

### If you see "Permission denied" errors:
1. Check that RLS policies are set up correctly
2. Ensure the user has the proper role (authenticated)
3. Verify table permissions are granted to authenticated users

## Demo Account Credentials

- **Admin**: admin@npi.pg / admin123 (Full system access)
- **Instructor**: instructor@npi.pg / instructor123 (Teaching and grading access)
- **Student**: student@npi.pg / student123 (Student portal access)
- **Registrar**: registrar@npi.pg / registrar123 (Registration management)

The application will automatically assign roles and create profiles when these users first log in.
