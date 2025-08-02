-- NPI PNG Academic Management System - Comprehensive Sample Data
-- Run this script in your Supabase SQL editor to populate the database with test data

-- First, create the current academic year
INSERT INTO academic_years (year_name, start_date, end_date, is_current) VALUES
('2024-2025', '2024-02-01', '2025-01-31', true),
('2023-2024', '2023-02-01', '2024-01-31', false),
('2025-2026', '2025-02-01', '2026-01-31', false);

-- Create semesters for the current academic year
INSERT INTO semesters (academic_year_id, semester_type, start_date, end_date, grading_deadline, is_current)
SELECT
  ay.id,
  '1',
  '2024-02-01',
  '2024-06-30',
  '2024-07-15',
  true
FROM academic_years ay WHERE ay.year_name = '2024-2025';

INSERT INTO semesters (academic_year_id, semester_type, start_date, end_date, grading_deadline, is_current)
SELECT
  ay.id,
  '2',
  '2024-07-01',
  '2024-12-31',
  '2025-01-15',
  false
FROM academic_years ay WHERE ay.year_name = '2024-2025';

-- Sample Users (Admin, Department Heads, Instructors, Students)
INSERT INTO users (email, full_name, role, phone, date_of_birth, is_active) VALUES
-- System Admin
('admin@npi.edu.pg', 'Dr. Sarah Wilson', 'admin', '+675-123-4567', '1975-03-15', true),

-- Department Heads
('john.smith@npi.edu.pg', 'Prof. John Smith', 'department_head', '+675-234-5678', '1970-08-22', true),
('mary.johnson@npi.edu.pg', 'Dr. Mary Johnson', 'department_head', '+675-345-6789', '1972-11-05', true),
('david.brown@npi.edu.pg', 'Prof. David Brown', 'department_head', '+675-456-7890', '1968-06-18', true),
('lisa.davis@npi.edu.pg', 'Dr. Lisa Davis', 'department_head', '+675-567-8901', '1973-09-12', true),

-- Instructors
('michael.taylor@npi.edu.pg', 'Dr. Michael Taylor', 'instructor', '+675-678-9012', '1980-12-03', true),
('jennifer.white@npi.edu.pg', 'Ms. Jennifer White', 'instructor', '+675-789-0123', '1985-04-27', true),
('robert.clark@npi.edu.pg', 'Mr. Robert Clark', 'instructor', '+675-890-1234', '1978-07-14', true),
('susan.lewis@npi.edu.pg', 'Dr. Susan Lewis', 'instructor', '+675-901-2345', '1982-01-09', true),
('james.hall@npi.edu.pg', 'Prof. James Hall', 'instructor', '+675-012-3456', '1976-10-28', true),
('patricia.young@npi.edu.pg', 'Ms. Patricia Young', 'instructor', '+675-123-4567', '1983-05-16', true),
('william.king@npi.edu.pg', 'Dr. William King', 'instructor', '+675-234-5678', '1979-08-31', true),
('elizabeth.scott@npi.edu.pg', 'Ms. Elizabeth Scott', 'instructor', '+675-345-6789', '1984-02-20', true),

-- Tutors
('andrew.green@npi.edu.pg', 'Mr. Andrew Green', 'tutor', '+675-456-7890', '1990-03-08', true),
('michelle.adams@npi.edu.pg', 'Ms. Michelle Adams', 'tutor', '+675-567-8901', '1992-07-22', true),
('kevin.baker@npi.edu.pg', 'Mr. Kevin Baker', 'tutor', '+675-678-9012', '1991-11-15', true),
('nancy.carter@npi.edu.pg', 'Ms. Nancy Carter', 'tutor', '+675-789-0123', '1993-04-03', true),

-- Students
('student001@npi.edu.pg', 'Peter Namaliu', 'student', '+675-111-1111', '2001-05-15', true),
('student002@npi.edu.pg', 'Grace Temu', 'student', '+675-111-2222', '2000-08-22', true),
('student003@npi.edu.pg', 'Joseph Kabui', 'student', '+675-111-3333', '2001-12-10', true),
('student004@npi.edu.pg', 'Maria Kopong', 'student', '+675-111-4444', '2002-03-08', true),
('student005@npi.edu.pg', 'David Siaguru', 'student', '+675-111-5555', '2001-07-18', true),
('student006@npi.edu.pg', 'Helen Kaupa', 'student', '+675-111-6666', '2000-11-25', true),
('student007@npi.edu.pg', 'Michael Somare', 'student', '+675-111-7777', '2001-09-14', true),
('student008@npi.edu.pg', 'Anne Dickson', 'student', '+675-111-8888', '2002-01-30', true),
('student009@npi.edu.pg', 'Paul Natera', 'student', '+675-111-9999', '2001-06-12', true),
('student010@npi.edu.pg', 'Sarah Ramo', 'student', '+675-111-0000', '2000-10-05', true);

-- Sample Departments
INSERT INTO departments (name, code, description, head_id, is_active)
SELECT
  'School of Engineering',
  'ENG',
  'Engineering and Technology programs including Civil, Electrical, and Mechanical Engineering',
  u.id,
  true
FROM users u WHERE u.email = 'john.smith@npi.edu.pg';

INSERT INTO departments (name, code, description, head_id, is_active)
SELECT
  'School of Business',
  'BUS',
  'Business Administration, Accounting, and Management programs',
  u.id,
  true
FROM users u WHERE u.email = 'mary.johnson@npi.edu.pg';

INSERT INTO departments (name, code, description, head_id, is_active)
SELECT
  'School of Information Technology',
  'IT',
  'Computer Science, Information Systems, and Software Engineering programs',
  u.id,
  true
FROM users u WHERE u.email = 'david.brown@npi.edu.pg';

INSERT INTO departments (name, code, description, head_id, is_active)
SELECT
  'School of Applied Sciences',
  'SCI',
  'Mathematics, Physics, Chemistry, and Applied Sciences programs',
  u.id,
  true
FROM users u WHERE u.email = 'lisa.davis@npi.edu.pg';

-- Update users with department assignments
UPDATE users SET department = (SELECT id FROM departments WHERE code = 'ENG')
WHERE email IN ('john.smith@npi.edu.pg', 'michael.taylor@npi.edu.pg', 'robert.clark@npi.edu.pg', 'james.hall@npi.edu.pg');

UPDATE users SET department = (SELECT id FROM departments WHERE code = 'BUS')
WHERE email IN ('mary.johnson@npi.edu.pg', 'jennifer.white@npi.edu.pg', 'patricia.young@npi.edu.pg');

UPDATE users SET department = (SELECT id FROM departments WHERE code = 'IT')
WHERE email IN ('david.brown@npi.edu.pg', 'susan.lewis@npi.edu.pg', 'william.king@npi.edu.pg');

UPDATE users SET department = (SELECT id FROM departments WHERE code = 'SCI')
WHERE email IN ('lisa.davis@npi.edu.pg', 'elizabeth.scott@npi.edu.pg');

-- Sample Academic Programs
INSERT INTO programs (name, code, department_id, duration_years, description, is_active)
SELECT
  'Bachelor of Engineering (Civil)',
  'BE-CIV',
  d.id,
  4,
  'Comprehensive civil engineering program covering structural, environmental, and construction engineering',
  true
FROM departments d WHERE d.code = 'ENG';

INSERT INTO programs (name, code, department_id, duration_years, description, is_active)
SELECT
  'Bachelor of Engineering (Electrical)',
  'BE-ELE',
  d.id,
  4,
  'Electrical engineering program focusing on power systems, electronics, and telecommunications',
  true
FROM departments d WHERE d.code = 'ENG';

INSERT INTO programs (name, code, department_id, duration_years, description, is_active)
SELECT
  'Bachelor of Business Administration',
  'BBA',
  d.id,
  3,
  'Comprehensive business administration program with specializations in management and marketing',
  true
FROM departments d WHERE d.code = 'BUS';

INSERT INTO programs (name, code, department_id, duration_years, description, is_active)
SELECT
  'Bachelor of Accounting',
  'BAcc',
  d.id,
  3,
  'Professional accounting program preparing students for CPA certification',
  true
FROM departments d WHERE d.code = 'BUS';

INSERT INTO programs (name, code, department_id, duration_years, description, is_active)
SELECT
  'Bachelor of Computer Science',
  'BCS',
  d.id,
  4,
  'Computer science program covering software development, algorithms, and system design',
  true
FROM departments d WHERE d.code = 'IT';

INSERT INTO programs (name, code, department_id, duration_years, description, is_active)
SELECT
  'Bachelor of Information Systems',
  'BIS',
  d.id,
  3,
  'Information systems program focusing on business applications and database management',
  true
FROM departments d WHERE d.code = 'IT';

INSERT INTO programs (name, code, department_id, duration_years, description, is_active)
SELECT
  'Bachelor of Applied Mathematics',
  'BAM',
  d.id,
  3,
  'Applied mathematics program with focus on statistics and mathematical modeling',
  true
FROM departments d WHERE d.code = 'SCI';

-- Sample Courses
INSERT INTO courses (name, code, department_id, program_id, year_level, semester, credit_hours, description, is_active)
SELECT
  'Engineering Mathematics I',
  'ENG101',
  d.id,
  p.id,
  1,
  '1',
  4,
  'Fundamental mathematics for engineering including calculus and linear algebra',
  true
FROM departments d, programs p WHERE d.code = 'ENG' AND p.code = 'BE-CIV';

INSERT INTO courses (name, code, department_id, program_id, year_level, semester, credit_hours, description, is_active)
SELECT
  'Engineering Drawing',
  'ENG102',
  d.id,
  p.id,
  1,
  '1',
  3,
  'Technical drawing and CAD fundamentals for engineering design',
  true
FROM departments d, programs p WHERE d.code = 'ENG' AND p.code = 'BE-CIV';

INSERT INTO courses (name, code, department_id, program_id, year_level, semester, credit_hours, description, is_active)
SELECT
  'Physics for Engineers',
  'ENG103',
  d.id,
  p.id,
  1,
  '2',
  4,
  'Applied physics concepts for engineering applications',
  true
FROM departments d, programs p WHERE d.code = 'ENG' AND p.code = 'BE-CIV';

INSERT INTO courses (name, code, department_id, program_id, year_level, semester, credit_hours, description, is_active)
SELECT
  'Circuit Analysis',
  'ELE201',
  d.id,
  p.id,
  2,
  '1',
  4,
  'Fundamental circuit analysis and electrical network theory',
  true
FROM departments d, programs p WHERE d.code = 'ENG' AND p.code = 'BE-ELE';

INSERT INTO courses (name, code, department_id, program_id, year_level, semester, credit_hours, description, is_active)
SELECT
  'Digital Electronics',
  'ELE202',
  d.id,
  p.id,
  2,
  '2',
  3,
  'Digital logic design and electronic circuit fundamentals',
  true
FROM departments d, programs p WHERE d.code = 'ENG' AND p.code = 'BE-ELE';

INSERT INTO courses (name, code, department_id, program_id, year_level, semester, credit_hours, description, is_active)
SELECT
  'Principles of Management',
  'BUS101',
  d.id,
  p.id,
  1,
  '1',
  3,
  'Introduction to management principles and organizational behavior',
  true
FROM departments d, programs p WHERE d.code = 'BUS' AND p.code = 'BBA';

INSERT INTO courses (name, code, department_id, program_id, year_level, semester, credit_hours, description, is_active)
SELECT
  'Financial Accounting',
  'ACC101',
  d.id,
  p.id,
  1,
  '1',
  4,
  'Fundamental principles of financial accounting and reporting',
  true
FROM departments d, programs p WHERE d.code = 'BUS' AND p.code = 'BAcc';

INSERT INTO courses (name, code, department_id, program_id, year_level, semester, credit_hours, description, is_active)
SELECT
  'Programming Fundamentals',
  'CS101',
  d.id,
  p.id,
  1,
  '1',
  4,
  'Introduction to programming using Python and algorithm design',
  true
FROM departments d, programs p WHERE d.code = 'IT' AND p.code = 'BCS';

INSERT INTO courses (name, code, department_id, program_id, year_level, semester, credit_hours, description, is_active)
SELECT
  'Database Systems',
  'IS201',
  d.id,
  p.id,
  2,
  '1',
  3,
  'Database design, SQL, and database management systems',
  true
FROM departments d, programs p WHERE d.code = 'IT' AND p.code = 'BIS';

INSERT INTO courses (name, code, department_id, program_id, year_level, semester, credit_hours, description, is_active)
SELECT
  'Calculus I',
  'MATH101',
  d.id,
  p.id,
  1,
  '1',
  4,
  'Differential and integral calculus with applications',
  true
FROM departments d, programs p WHERE d.code = 'SCI' AND p.code = 'BAM';

-- Sample Students
INSERT INTO students (user_id, student_number, program_id, year_level, enrollment_year, guardian_name, guardian_phone, address, national_id, is_active)
SELECT
  u.id,
  'NPI2024001',
  p.id,
  1,
  2024,
  'John Namaliu Sr.',
  '+675-222-1111',
  'Port Moresby, NCD',
  'PNG123456789',
  true
FROM users u, programs p WHERE u.email = 'student001@npi.edu.pg' AND p.code = 'BE-CIV';

INSERT INTO students (user_id, student_number, program_id, year_level, enrollment_year, guardian_name, guardian_phone, address, national_id, is_active)
SELECT
  u.id,
  'NPI2024002',
  p.id,
  1,
  2024,
  'David Temu',
  '+675-222-2222',
  'Lae, Morobe Province',
  'PNG234567890',
  true
FROM users u, programs p WHERE u.email = 'student002@npi.edu.pg' AND p.code = 'BBA';

INSERT INTO students (user_id, student_number, program_id, year_level, enrollment_year, guardian_name, guardian_phone, address, national_id, is_active)
SELECT
  u.id,
  'NPI2024003',
  p.id,
  2,
  2023,
  'Peter Kabui Sr.',
  '+675-222-3333',
  'Mount Hagen, Western Highlands',
  'PNG345678901',
  true
FROM users u, programs p WHERE u.email = 'student003@npi.edu.pg' AND p.code = 'BCS';

INSERT INTO students (user_id, student_number, program_id, year_level, enrollment_year, guardian_name, guardian_phone, address, national_id, is_active)
SELECT
  u.id,
  'NPI2024004',
  p.id,
  1,
  2024,
  'James Kopong',
  '+675-222-4444',
  'Madang, Madang Province',
  'PNG456789012',
  true
FROM users u, programs p WHERE u.email = 'student004@npi.edu.pg' AND p.code = 'BAcc';

INSERT INTO students (user_id, student_number, program_id, year_level, enrollment_year, guardian_name, guardian_phone, address, national_id, is_active)
SELECT
  u.id,
  'NPI2024005',
  p.id,
  2,
  2023,
  'Michael Siaguru Sr.',
  '+675-222-5555',
  'Vanimo, Sandaun Province',
  'PNG567890123',
  true
FROM users u, programs p WHERE u.email = 'student005@npi.edu.pg' AND p.code = 'BE-ELE';

-- Add more students for other programs
INSERT INTO students (user_id, student_number, program_id, year_level, enrollment_year, guardian_name, guardian_phone, address, national_id, is_active)
SELECT
  u.id,
  'NPI2024006',
  p.id,
  1,
  2024,
  'Joseph Kaupa',
  '+675-222-6666',
  'Wewak, East Sepik',
  'PNG678901234',
  true
FROM users u, programs p WHERE u.email = 'student006@npi.edu.pg' AND p.code = 'BIS';

INSERT INTO students (user_id, student_number, program_id, year_level, enrollment_year, guardian_name, guardian_phone, address, national_id, is_active)
SELECT
  u.id,
  'NPI2024007',
  p.id,
  3,
  2022,
  'Arthur Somare',
  '+675-222-7777',
  'Wewak, East Sepik',
  'PNG789012345',
  true
FROM users u, programs p WHERE u.email = 'student007@npi.edu.pg' AND p.code = 'BAM';

INSERT INTO students (user_id, student_number, program_id, year_level, enrollment_year, guardian_name, guardian_phone, address, national_id, is_active)
SELECT
  u.id,
  'NPI2024008',
  p.id,
  1,
  2024,
  'Robert Dickson',
  '+675-222-8888',
  'Kokopo, East New Britain',
  'PNG890123456',
  true
FROM users u, programs p WHERE u.email = 'student008@npi.edu.pg' AND p.code = 'BE-CIV';

INSERT INTO students (user_id, student_number, program_id, year_level, enrollment_year, guardian_name, guardian_phone, address, national_id, is_active)
SELECT
  u.id,
  'NPI2024009',
  p.id,
  2,
  2023,
  'William Natera',
  '+675-222-9999',
  'Mendi, Southern Highlands',
  'PNG901234567',
  true
FROM users u, programs p WHERE u.email = 'student009@npi.edu.pg' AND p.code = 'BBA';

INSERT INTO students (user_id, student_number, program_id, year_level, enrollment_year, guardian_name, guardian_phone, address, national_id, is_active)
SELECT
  u.id,
  'NPI2024010',
  p.id,
  2,
  2023,
  'Daniel Ramo',
  '+675-222-0000',
  'Kerema, Gulf Province',
  'PNG012345678',
  true
FROM users u, programs p WHERE u.email = 'student010@npi.edu.pg' AND p.code = 'BCS';

-- Sample Course Instructors (assign instructors to courses)
INSERT INTO course_instructors (course_id, instructor_id, semester_id, is_primary)
SELECT
  c.id,
  u.id,
  s.id,
  true
FROM courses c, users u, semesters s, departments d
WHERE c.code = 'ENG101'
  AND u.email = 'michael.taylor@npi.edu.pg'
  AND s.semester_type = '1'
  AND s.is_current = true
  AND d.code = 'ENG'
  AND c.department_id = d.id;

INSERT INTO course_instructors (course_id, instructor_id, semester_id, is_primary)
SELECT
  c.id,
  u.id,
  s.id,
  true
FROM courses c, users u, semesters s, departments d
WHERE c.code = 'BUS101'
  AND u.email = 'jennifer.white@npi.edu.pg'
  AND s.semester_type = '1'
  AND s.is_current = true
  AND d.code = 'BUS'
  AND c.department_id = d.id;

INSERT INTO course_instructors (course_id, instructor_id, semester_id, is_primary)
SELECT
  c.id,
  u.id,
  s.id,
  true
FROM courses c, users u, semesters s, departments d
WHERE c.code = 'CS101'
  AND u.email = 'susan.lewis@npi.edu.pg'
  AND s.semester_type = '1'
  AND s.is_current = true
  AND d.code = 'IT'
  AND c.department_id = d.id;

-- Sample Student Enrollments
INSERT INTO student_enrollments (student_id, course_id, semester_id, enrollment_date, status)
SELECT
  st.id,
  c.id,
  s.id,
  '2024-02-15',
  'enrolled'
FROM students st, courses c, semesters s
WHERE st.student_number = 'NPI2024001'
  AND c.code = 'ENG101'
  AND s.semester_type = '1'
  AND s.is_current = true;

INSERT INTO student_enrollments (student_id, course_id, semester_id, enrollment_date, status)
SELECT
  st.id,
  c.id,
  s.id,
  '2024-02-15',
  'enrolled'
FROM students st, courses c, semesters s
WHERE st.student_number = 'NPI2024002'
  AND c.code = 'BUS101'
  AND s.semester_type = '1'
  AND s.is_current = true;

INSERT INTO student_enrollments (student_id, course_id, semester_id, enrollment_date, status)
SELECT
  st.id,
  c.id,
  s.id,
  '2024-02-15',
  'enrolled'
FROM students st, courses c, semesters s
WHERE st.student_number = 'NPI2024003'
  AND c.code = 'CS101'
  AND s.semester_type = '1'
  AND s.is_current = true;

-- Sample Grade Criteria for each department
INSERT INTO grade_criteria (department_id, grade, min_percentage, max_percentage, grade_points, description)
SELECT d.id, 'HD', 80.00, 100.00, 4.00, 'High Distinction' FROM departments d WHERE d.code = 'ENG'
UNION ALL
SELECT d.id, 'D', 70.00, 79.99, 3.00, 'Distinction' FROM departments d WHERE d.code = 'ENG'
UNION ALL
SELECT d.id, 'C', 60.00, 69.99, 2.00, 'Credit' FROM departments d WHERE d.code = 'ENG'
UNION ALL
SELECT d.id, 'P', 50.00, 59.99, 1.00, 'Pass' FROM departments d WHERE d.code = 'ENG'
UNION ALL
SELECT d.id, 'F', 0.00, 49.99, 0.00, 'Fail' FROM departments d WHERE d.code = 'ENG';

INSERT INTO grade_criteria (department_id, grade, min_percentage, max_percentage, grade_points, description)
SELECT d.id, 'HD', 85.00, 100.00, 4.00, 'High Distinction' FROM departments d WHERE d.code = 'BUS'
UNION ALL
SELECT d.id, 'D', 75.00, 84.99, 3.00, 'Distinction' FROM departments d WHERE d.code = 'BUS'
UNION ALL
SELECT d.id, 'C', 65.00, 74.99, 2.00, 'Credit' FROM departments d WHERE d.code = 'BUS'
UNION ALL
SELECT d.id, 'P', 50.00, 64.99, 1.00, 'Pass' FROM departments d WHERE d.code = 'BUS'
UNION ALL
SELECT d.id, 'F', 0.00, 49.99, 0.00, 'Fail' FROM departments d WHERE d.code = 'BUS';

INSERT INTO grade_criteria (department_id, grade, min_percentage, max_percentage, grade_points, description)
SELECT d.id, 'HD', 80.00, 100.00, 4.00, 'High Distinction' FROM departments d WHERE d.code = 'IT'
UNION ALL
SELECT d.id, 'D', 70.00, 79.99, 3.00, 'Distinction' FROM departments d WHERE d.code = 'IT'
UNION ALL
SELECT d.id, 'C', 60.00, 69.99, 2.00, 'Credit' FROM departments d WHERE d.code = 'IT'
UNION ALL
SELECT d.id, 'P', 50.00, 59.99, 1.00, 'Pass' FROM departments d WHERE d.code = 'IT'
UNION ALL
SELECT d.id, 'F', 0.00, 49.99, 0.00, 'Fail' FROM departments d WHERE d.code = 'IT';

INSERT INTO grade_criteria (department_id, grade, min_percentage, max_percentage, grade_points, description)
SELECT d.id, 'HD', 85.00, 100.00, 4.00, 'High Distinction' FROM departments d WHERE d.code = 'SCI'
UNION ALL
SELECT d.id, 'D', 75.00, 84.99, 3.00, 'Distinction' FROM departments d WHERE d.code = 'SCI'
UNION ALL
SELECT d.id, 'C', 65.00, 74.99, 2.00, 'Credit' FROM departments d WHERE d.code = 'SCI'
UNION ALL
SELECT d.id, 'P', 55.00, 64.99, 1.00, 'Pass' FROM departments d WHERE d.code = 'SCI'
UNION ALL
SELECT d.id, 'F', 0.00, 54.99, 0.00, 'Fail' FROM departments d WHERE d.code = 'SCI';

-- Sample Assessment Definitions
INSERT INTO assessment_definitions (course_id, semester_id, name, type, weight_percentage, max_score, due_date, description, is_required)
SELECT
  c.id,
  s.id,
  'Assignment 1',
  'assignment',
  20.00,
  100,
  '2024-03-15',
  'Problem solving exercises in engineering mathematics',
  true
FROM courses c, semesters s
WHERE c.code = 'ENG101' AND s.semester_type = '1' AND s.is_current = true;

INSERT INTO assessment_definitions (course_id, semester_id, name, type, weight_percentage, max_score, due_date, description, is_required)
SELECT
  c.id,
  s.id,
  'Midterm Exam',
  'midterm',
  30.00,
  100,
  '2024-04-10',
  'Midterm examination covering calculus fundamentals',
  true
FROM courses c, semesters s
WHERE c.code = 'ENG101' AND s.semester_type = '1' AND s.is_current = true;

INSERT INTO assessment_definitions (course_id, semester_id, name, type, weight_percentage, max_score, due_date, description, is_required)
SELECT
  c.id,
  s.id,
  'Final Exam',
  'final',
  50.00,
  100,
  '2024-06-15',
  'Comprehensive final examination',
  true
FROM courses c, semesters s
WHERE c.code = 'ENG101' AND s.semester_type = '1' AND s.is_current = true;

-- Add similar assessments for other courses
INSERT INTO assessment_definitions (course_id, semester_id, name, type, weight_percentage, max_score, due_date, description, is_required)
SELECT
  c.id,
  s.id,
  'Case Study Analysis',
  'assignment',
  25.00,
  100,
  '2024-03-20',
  'Business case study analysis and presentation',
  true
FROM courses c, semesters s
WHERE c.code = 'BUS101' AND s.semester_type = '1' AND s.is_current = true;

INSERT INTO assessment_definitions (course_id, semester_id, name, type, weight_percentage, max_score, due_date, description, is_required)
SELECT
  c.id,
  s.id,
  'Programming Project',
  'project',
  40.00,
  100,
  '2024-05-15',
  'Development of a complete software application',
  true
FROM courses c, semesters s
WHERE c.code = 'CS101' AND s.semester_type = '1' AND s.is_current = true;

-- Update system settings
INSERT INTO system_settings (key, value, description) VALUES
('institution_name', 'National Polytechnic Institute of PNG', 'Official institution name'),
('institution_code', 'NPI', 'Institution code for official documents'),
('current_semester_id', (SELECT id FROM semesters WHERE is_current = true LIMIT 1), 'Current active semester'),
('grading_scale', '4.0', 'Maximum GPA scale used by the institution'),
('minimum_passing_grade', '50', 'Minimum percentage required to pass a course'),
('academic_year_start_month', '2', 'Month when academic year starts (February)'),
('semester_duration_weeks', '20', 'Standard duration of a semester in weeks'),
('max_enrollment_per_semester', '8', 'Maximum courses a student can enroll per semester'),
('contact_email', 'info@npi.edu.pg', 'Official contact email'),
('contact_phone', '+675-325-9999', 'Official contact phone number'),
('address', 'University Drive, Lae, Morobe Province, Papua New Guinea', 'Institution address');

-- Success message
SELECT 'Sample data successfully inserted! You now have:' AS message
UNION ALL
SELECT '- 1 Admin user (admin@npi.edu.pg)'
UNION ALL
SELECT '- 4 Departments with Department Heads'
UNION ALL
SELECT '- 7 Academic Programs'
UNION ALL
SELECT '- 10 Sample Courses'
UNION ALL
SELECT '- 8 Instructors and 4 Tutors'
UNION ALL
SELECT '- 10 Students with enrollments'
UNION ALL
SELECT '- Academic years and semesters'
UNION ALL
SELECT '- Grade criteria and assessments'
UNION ALL
SELECT '- Complete sample data ready for testing!';
