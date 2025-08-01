-- Demo Users Setup for NPI PNG Assessment System
-- Run this SQL in your Supabase SQL Editor to create demo accounts

-- Insert demo users into auth.users table (Supabase authentication)
-- Note: In production, you should use Supabase's signup API instead of direct SQL
-- This is for demo purposes only

-- First, insert into auth.users table
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmed_at
) VALUES
-- Admin User
(
    '00000000-0000-0000-0000-000000000000',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'authenticated',
    'authenticated',
    'admin@npi.pg',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "System Administrator"}',
    false,
    NOW()
),
-- Instructor User
(
    '00000000-0000-0000-0000-000000000000',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'authenticated',
    'authenticated',
    'instructor@npi.pg',
    crypt('instructor123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Dr. John Instructor"}',
    false,
    NOW()
),
-- Student User
(
    '00000000-0000-0000-0000-000000000000',
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'authenticated',
    'authenticated',
    'student@npi.pg',
    crypt('student123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Mary Student"}',
    false,
    NOW()
);

-- Insert corresponding records into the users table
INSERT INTO users (
    id,
    email,
    full_name,
    role,
    phone,
    is_active,
    created_at,
    updated_at
) VALUES
-- Admin User
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'admin@npi.pg',
    'System Administrator',
    'admin',
    '+675 123 4567',
    true,
    NOW(),
    NOW()
),
-- Instructor User
(
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'instructor@npi.pg',
    'Dr. John Instructor',
    'instructor',
    '+675 234 5678',
    true,
    NOW(),
    NOW()
),
-- Student User
(
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'student@npi.pg',
    'Mary Student',
    'student',
    '+675 345 6789',
    true,
    NOW(),
    NOW()
);

-- Create a demo department
INSERT INTO departments (
    id,
    name,
    code,
    description,
    head_id,
    is_active,
    created_at,
    updated_at
) VALUES (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'Engineering Department',
    'ENG',
    'Engineering and Technology Department',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    true,
    NOW(),
    NOW()
) ON CONFLICT (code) DO NOTHING;

-- Create a demo program
INSERT INTO programs (
    id,
    name,
    code,
    department_id,
    duration_years,
    description,
    is_active,
    created_at,
    updated_at
) VALUES (
    'p0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'Electrical Engineering Technology',
    'EET',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    3,
    'Three-year Electrical Engineering Technology program',
    true,
    NOW(),
    NOW()
) ON CONFLICT (code) DO NOTHING;

-- Create demo courses
INSERT INTO courses (
    id,
    name,
    code,
    department_id,
    program_id,
    year_level,
    semester,
    credit_hours,
    description,
    is_active,
    created_at,
    updated_at
) VALUES
(
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
    'Engineering Mathematics I',
    'MATH101',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'p0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    1,
    '1',
    4,
    'Fundamental mathematics for engineering students',
    true,
    NOW(),
    NOW()
),
(
    'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
    'Computer Programming',
    'COMP101',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'p0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    1,
    '1',
    3,
    'Introduction to programming concepts and languages',
    true,
    NOW(),
    NOW()
) ON CONFLICT (code) DO NOTHING;

-- Create student record for the demo student
INSERT INTO students (
    id,
    user_id,
    student_number,
    program_id,
    year_level,
    enrollment_year,
    guardian_name,
    guardian_phone,
    address,
    is_active,
    created_at,
    updated_at
) VALUES (
    's0eebc99-9c0b-4ef8-bb6d-6bb9bd380a88',
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'NPI2024001',
    'p0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    1,
    2024,
    'Peter Student',
    '+675 456 7890',
    'Port Moresby, PNG',
    true,
    NOW(),
    NOW()
) ON CONFLICT (student_number) DO NOTHING;

-- Create academic year
INSERT INTO academic_years (
    id,
    year_name,
    start_date,
    end_date,
    is_current,
    created_at
) VALUES (
    'y0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99',
    '2024',
    '2024-02-01',
    '2024-12-15',
    true,
    NOW()
) ON CONFLICT (year_name) DO NOTHING;

-- Create current semester
INSERT INTO semesters (
    id,
    academic_year_id,
    semester_type,
    start_date,
    end_date,
    grading_deadline,
    is_current,
    created_at
) VALUES (
    'sem0ebc99-9c0b-4ef8-bb6d-6bb9bd380aaa',
    'y0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99',
    '1',
    '2024-02-01',
    '2024-06-30',
    '2024-07-15',
    true,
    NOW()
) ON CONFLICT (academic_year_id, semester_type) DO NOTHING;

-- Assign instructor to courses
INSERT INTO course_instructors (
    id,
    course_id,
    instructor_id,
    semester_id,
    is_primary,
    created_at
) VALUES
(
    'ci0ebc99-9c0b-4ef8-bb6d-6bb9bd380abb',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'sem0ebc99-9c0b-4ef8-bb6d-6bb9bd380aaa',
    true,
    NOW()
),
(
    'ci1ebc99-9c0b-4ef8-bb6d-6bb9bd380acc',
    'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'sem0ebc99-9c0b-4ef8-bb6d-6bb9bd380aaa',
    true,
    NOW()
) ON CONFLICT (course_id, instructor_id, semester_id) DO NOTHING;

-- Enroll student in courses
INSERT INTO student_enrollments (
    id,
    student_id,
    course_id,
    semester_id,
    enrollment_date,
    status,
    created_at
) VALUES
(
    'se0ebc99-9c0b-4ef8-bb6d-6bb9bd380add',
    's0eebc99-9c0b-4ef8-bb6d-6bb9bd380a88',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
    'sem0ebc99-9c0b-4ef8-bb6d-6bb9bd380aaa',
    '2024-02-01',
    'enrolled',
    NOW()
),
(
    'se1ebc99-9c0b-4ef8-bb6d-6bb9bd380aee',
    's0eebc99-9c0b-4ef8-bb6d-6bb9bd380a88',
    'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
    'sem0ebc99-9c0b-4ef8-bb6d-6bb9bd380aaa',
    '2024-02-01',
    'enrolled',
    NOW()
) ON CONFLICT (student_id, course_id, semester_id) DO NOTHING;

-- Create some demo assessments
INSERT INTO assessment_definitions (
    id,
    course_id,
    semester_id,
    name,
    type,
    weight_percentage,
    max_score,
    due_date,
    description,
    is_required,
    created_at,
    updated_at
) VALUES
(
    'ad0ebc99-9c0b-4ef8-bb6d-6bb9bd380aff',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
    'sem0ebc99-9c0b-4ef8-bb6d-6bb9bd380aaa',
    'Midterm Exam',
    'midterm',
    30.00,
    100,
    '2024-04-15',
    'Comprehensive midterm examination covering first half of course',
    true,
    NOW(),
    NOW()
),
(
    'ad1ebc99-9c0b-4ef8-bb6d-6bb9bd380b00',
    'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
    'sem0ebc99-9c0b-4ef8-bb6d-6bb9bd380aaa',
    'Programming Assignment 1',
    'assignment',
    15.00,
    50,
    '2024-03-20',
    'Basic programming concepts and syntax',
    true,
    NOW(),
    NOW()
);

-- Create initial student assessment records
INSERT INTO student_assessments (
    id,
    student_id,
    assessment_definition_id,
    score,
    submitted_date,
    graded_date,
    graded_by,
    comments,
    is_moderated,
    created_at,
    updated_at
) VALUES
(
    'sa0ebc99-9c0b-4ef8-bb6d-6bb9bd380b11',
    's0eebc99-9c0b-4ef8-bb6d-6bb9bd380a88',
    'ad0ebc99-9c0b-4ef8-bb6d-6bb9bd380aff',
    85.00,
    '2024-04-15',
    '2024-04-18',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Good understanding of mathematical concepts. Keep up the excellent work!',
    false,
    NOW(),
    NOW()
),
(
    'sa1ebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
    's0eebc99-9c0b-4ef8-bb6d-6bb9bd380a88',
    'ad1ebc99-9c0b-4ef8-bb6d-6bb9bd380b00',
    45.00,
    '2024-03-20',
    '2024-03-22',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Well-structured code with good documentation. Excellent work!',
    false,
    NOW(),
    NOW()
) ON CONFLICT (student_id, assessment_definition_id) DO NOTHING;

-- Insert grade criteria for the engineering department
INSERT INTO grade_criteria (
    id,
    department_id,
    grade,
    min_percentage,
    max_percentage,
    grade_points,
    description,
    created_at
) VALUES
(
    'gc0ebc99-9c0b-4ef8-bb6d-6bb9bd380b33',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'HD',
    80.00,
    100.00,
    4.00,
    'High Distinction',
    NOW()
),
(
    'gc1ebc99-9c0b-4ef8-bb6d-6bb9bd380b44',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'D',
    70.00,
    79.99,
    3.00,
    'Distinction',
    NOW()
),
(
    'gc2ebc99-9c0b-4ef8-bb6d-6bb9bd380b55',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'C',
    60.00,
    69.99,
    2.00,
    'Credit',
    NOW()
),
(
    'gc3ebc99-9c0b-4ef8-bb6d-6bb9bd380b66',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'P',
    50.00,
    59.99,
    1.00,
    'Pass',
    NOW()
),
(
    'gc4ebc99-9c0b-4ef8-bb6d-6bb9bd380b77',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'F',
    0.00,
    49.99,
    0.00,
    'Fail',
    NOW()
) ON CONFLICT (department_id, grade) DO NOTHING;

-- Demo Users Summary:
-- 1. admin@npi.pg / admin123 - System Administrator (admin role)
-- 2. instructor@npi.pg / instructor123 - Dr. John Instructor (instructor role)
-- 3. student@npi.pg / student123 - Mary Student (student role)

COMMIT;
