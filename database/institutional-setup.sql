-- NPI PNG TVET Institution - Clean Setup Script
-- Run this script in your Supabase SQL editor for a fresh institutional setup

-- First, create the current academic year (this is the only initial data needed)
INSERT INTO academic_years (year_name, start_date, end_date, is_current) VALUES
('2024-2025', '2024-02-01', '2025-01-31', true)
ON CONFLICT (year_name) DO NOTHING;

-- Create semesters for the current academic year
INSERT INTO semesters (academic_year_id, semester_type, start_date, end_date, grading_deadline, is_current)
SELECT
  ay.id,
  '1',
  '2024-02-01',
  '2024-06-30',
  '2024-07-15',
  true
FROM academic_years ay WHERE ay.year_name = '2024-2025'
ON CONFLICT (academic_year_id, semester_type) DO NOTHING;

INSERT INTO semesters (academic_year_id, semester_type, start_date, end_date, grading_deadline, is_current)
SELECT
  ay.id,
  '2',
  '2024-07-01',
  '2024-12-31',
  '2025-01-15',
  false
FROM academic_years ay WHERE ay.year_name = '2024-2025'
ON CONFLICT (academic_year_id, semester_type) DO NOTHING;

-- Create the main system administrator account (the only user we'll pre-create)
INSERT INTO users (email, full_name, role, phone, date_of_birth, is_active) VALUES
('admin@npi.edu.pg', 'System Administrator', 'admin', '+675-325-9999', '1970-01-01', true)
ON CONFLICT (email) DO NOTHING;

-- System settings for the TVET institution
INSERT INTO system_settings (key, value, description) VALUES
('institution_name', 'National Polytechnic Institute of PNG', 'Official institution name'),
('institution_type', 'TVET', 'Institution type - Technical and Vocational Education and Training'),
('institution_code', 'NPI', 'Institution code for official documents'),
('contact_email', 'info@npi.edu.pg', 'Official contact email'),
('contact_phone', '+675-325-9999', 'Official contact phone number'),
('address', 'University Drive, Lae, Morobe Province, Papua New Guinea', 'Institution address'),
('academic_year_start_month', '2', 'Month when academic year starts (February)'),
('semester_duration_weeks', '20', 'Standard duration of a semester in weeks'),
('grading_scale', '4.0', 'Maximum GPA scale used by the institution'),
('minimum_passing_grade', '50', 'Minimum percentage required to pass a course'),
('max_enrollment_per_semester', '8', 'Maximum courses a student can enroll per semester'),
('setup_completed', 'false', 'Whether initial institution setup is completed')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- Clean up any existing sample data (optional - only run if you want a fresh start)
-- TRUNCATE TABLE student_assessments, course_results, student_enrollments, course_instructors,
--          students, assessment_definitions, courses, programs, departments, grade_criteria RESTART IDENTITY CASCADE;

-- Success message
SELECT 'Clean institutional setup completed!' AS message
UNION ALL
SELECT 'Next steps:'
UNION ALL
SELECT '1. Create your first admin auth account in Supabase Authentication'
UNION ALL
SELECT '2. Login to the system with admin@npi.edu.pg'
UNION ALL
SELECT '3. Go to System Setup to configure your TVET institution'
UNION ALL
SELECT '4. Create departments, programs, staff, and courses'
UNION ALL
SELECT 'Your TVET institution management system is ready to configure!';
