-- Sample Data for NPI PNG Student Assessment System

-- Insert Departments
INSERT INTO departments (id, name, code, description, is_active) VALUES
(uuid_generate_v4(), 'Engineering Department', 'ENG', 'Faculty of Engineering and Technology', true),
(uuid_generate_v4(), 'Business Department', 'BUS', 'Faculty of Business and Commerce', true),
(uuid_generate_v4(), 'Sciences Department', 'SCI', 'Faculty of Applied Sciences', true);

-- Insert Academic Years
INSERT INTO academic_years (id, year_name, start_date, end_date, is_current) VALUES
(uuid_generate_v4(), '2024', '2024-02-01', '2024-12-15', true),
(uuid_generate_v4(), '2023', '2023-02-01', '2023-12-15', false);

-- Insert Semesters
INSERT INTO semesters (id, academic_year_id, semester_type, start_date, end_date, grading_deadline, is_current) VALUES
(uuid_generate_v4(), (SELECT id FROM academic_years WHERE year_name = '2024'), '1', '2024-02-01', '2024-06-30', '2024-07-15', true),
(uuid_generate_v4(), (SELECT id FROM academic_years WHERE year_name = '2024'), '2', '2024-08-01', '2024-12-15', '2025-01-15', false);

-- Insert Sample Users
INSERT INTO users (id, email, full_name, role, phone, is_active) VALUES
-- Admin Users
(uuid_generate_v4(), 'admin@npi.pg', 'John Administrator', 'admin', '+675-123-4567', true),

-- Department Heads
(uuid_generate_v4(), 'eng.head@npi.pg', 'Dr. Mary Engineering', 'department_head', '+675-234-5678', true),
(uuid_generate_v4(), 'bus.head@npi.pg', 'Prof. Peter Business', 'department_head', '+675-345-6789', true),
(uuid_generate_v4(), 'sci.head@npi.pg', 'Dr. Sarah Sciences', 'department_head', '+675-456-7890', true),

-- Instructors
(uuid_generate_v4(), 'instructor@npi.pg', 'Dr. James Wilson', 'instructor', '+675-567-8901', true),
(uuid_generate_v4(), 'sarah.johnson@npi.pg', 'Prof. Sarah Johnson', 'instructor', '+675-678-9012', true),
(uuid_generate_v4(), 'michael.chen@npi.pg', 'Dr. Michael Chen', 'instructor', '+675-789-0123', true),
(uuid_generate_v4(), 'emily.davis@npi.pg', 'Ms. Emily Davis', 'instructor', '+675-890-1234', true),
(uuid_generate_v4(), 'robert.brown@npi.pg', 'Dr. Robert Brown', 'instructor', '+675-901-2345', true),

-- Students
(uuid_generate_v4(), 'student@npi.pg', 'Alice Student', 'student', '+675-111-2222', true),
(uuid_generate_v4(), 'bob.student@npi.pg', 'Bob Johnson', 'student', '+675-222-3333', true),
(uuid_generate_v4(), 'carol.smith@npi.pg', 'Carol Smith', 'student', '+675-333-4444', true);

-- Update Department Heads
UPDATE departments SET head_id = (SELECT id FROM users WHERE email = 'eng.head@npi.pg') WHERE code = 'ENG';
UPDATE departments SET head_id = (SELECT id FROM users WHERE email = 'bus.head@npi.pg') WHERE code = 'BUS';
UPDATE departments SET head_id = (SELECT id FROM users WHERE email = 'sci.head@npi.pg') WHERE code = 'SCI';

-- Insert Programs
INSERT INTO programs (id, name, code, department_id, duration_years, description, is_active) VALUES
(uuid_generate_v4(), 'Diploma in Civil Engineering', 'DCE', (SELECT id FROM departments WHERE code = 'ENG'), 3, 'Three-year diploma program in civil engineering', true),
(uuid_generate_v4(), 'Diploma in Electrical Engineering', 'DEE', (SELECT id FROM departments WHERE code = 'ENG'), 3, 'Three-year diploma program in electrical engineering', true),
(uuid_generate_v4(), 'Diploma in Business Management', 'DBM', (SELECT id FROM departments WHERE code = 'BUS'), 2, 'Two-year diploma program in business management', true),
(uuid_generate_v4(), 'Diploma in Applied Sciences', 'DAS', (SELECT id FROM departments WHERE code = 'SCI'), 2, 'Two-year diploma program in applied sciences', true);

-- Insert Courses
INSERT INTO courses (id, name, code, department_id, program_id, year_level, semester, credit_hours, description, is_active) VALUES
-- Engineering Courses
(uuid_generate_v4(), 'Engineering Mathematics I', 'ENG101', (SELECT id FROM departments WHERE code = 'ENG'), (SELECT id FROM programs WHERE code = 'DCE'), 1, '1', 4, 'Fundamental mathematics for engineering students', true),
(uuid_generate_v4(), 'Advanced Engineering Mathematics', 'ENG201', (SELECT id FROM departments WHERE code = 'ENG'), (SELECT id FROM programs WHERE code = 'DCE'), 2, '1', 4, 'Advanced mathematical concepts for engineering', true),
(uuid_generate_v4(), 'Structural Analysis', 'ENG301', (SELECT id FROM departments WHERE code = 'ENG'), (SELECT id FROM programs WHERE code = 'DCE'), 3, '1', 3, 'Analysis of structural systems', true),
(uuid_generate_v4(), 'Engineering Project Management', 'ENG401', (SELECT id FROM departments WHERE code = 'ENG'), (SELECT id FROM programs WHERE code = 'DCE'), 3, '2', 3, 'Project management in engineering context', true),

-- Electrical Engineering
(uuid_generate_v4(), 'Circuit Analysis', 'ELE201', (SELECT id FROM departments WHERE code = 'ENG'), (SELECT id FROM programs WHERE code = 'DEE'), 2, '1', 4, 'Analysis of electrical circuits', true),
(uuid_generate_v4(), 'Digital Electronics', 'ELE301', (SELECT id FROM departments WHERE code = 'ENG'), (SELECT id FROM programs WHERE code = 'DEE'), 3, '1', 3, 'Digital electronic systems', true),

-- Business Courses
(uuid_generate_v4(), 'Business Fundamentals', 'BUS101', (SELECT id FROM departments WHERE code = 'BUS'), (SELECT id FROM programs WHERE code = 'DBM'), 1, '1', 3, 'Introduction to business concepts', true),
(uuid_generate_v4(), 'Financial Management', 'BUS201', (SELECT id FROM departments WHERE code = 'BUS'), (SELECT id FROM programs WHERE code = 'DBM'), 2, '1', 4, 'Principles of financial management', true),

-- Science Courses
(uuid_generate_v4(), 'General Chemistry', 'SCI101', (SELECT id FROM departments WHERE code = 'SCI'), (SELECT id FROM programs WHERE code = 'DAS'), 1, '1', 4, 'Fundamental principles of chemistry', true),
(uuid_generate_v4(), 'Applied Physics', 'SCI201', (SELECT id FROM departments WHERE code = 'SCI'), (SELECT id FROM programs WHERE code = 'DAS'), 2, '1', 3, 'Physics applications in technology', true);

-- Insert Sample Students
INSERT INTO students (id, user_id, student_number, program_id, year_level, enrollment_year, is_active) VALUES
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'student@npi.pg'), 'NPI2024001', (SELECT id FROM programs WHERE code = 'DCE'), 2, 2023, true),
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'bob.student@npi.pg'), 'NPI2024002', (SELECT id FROM programs WHERE code = 'DEE'), 1, 2024, true),
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'carol.smith@npi.pg'), 'NPI2024003', (SELECT id FROM programs WHERE code = 'DBM'), 1, 2024, true);

-- Insert Course Instructors
INSERT INTO course_instructors (id, course_id, instructor_id, semester_id, is_primary) VALUES
(uuid_generate_v4(), (SELECT id FROM courses WHERE code = 'ENG201'), (SELECT id FROM users WHERE email = 'instructor@npi.pg'), (SELECT id FROM semesters WHERE semester_type = '1'), true),
(uuid_generate_v4(), (SELECT id FROM courses WHERE code = 'ENG301'), (SELECT id FROM users WHERE email = 'sarah.johnson@npi.pg'), (SELECT id FROM semesters WHERE semester_type = '1'), true),
(uuid_generate_v4(), (SELECT id FROM courses WHERE code = 'ENG401'), (SELECT id FROM users WHERE email = 'michael.chen@npi.pg'), (SELECT id FROM semesters WHERE semester_type = '1'), true),
(uuid_generate_v4(), (SELECT id FROM courses WHERE code = 'BUS201'), (SELECT id FROM users WHERE email = 'emily.davis@npi.pg'), (SELECT id FROM semesters WHERE semester_type = '1'), true);

-- Insert Student Enrollments
INSERT INTO student_enrollments (id, student_id, course_id, semester_id, enrollment_date, status) VALUES
-- Alice Student (DCE Year 2)
(uuid_generate_v4(), (SELECT id FROM students WHERE student_number = 'NPI2024001'), (SELECT id FROM courses WHERE code = 'ENG201'), (SELECT id FROM semesters WHERE semester_type = '1'), '2024-02-01', 'enrolled'),
(uuid_generate_v4(), (SELECT id FROM students WHERE student_number = 'NPI2024001'), (SELECT id FROM courses WHERE code = 'ENG301'), (SELECT id FROM semesters WHERE semester_type = '1'), '2024-02-01', 'enrolled'),

-- Bob Student (DEE Year 1)
(uuid_generate_v4(), (SELECT id FROM students WHERE student_number = 'NPI2024002'), (SELECT id FROM courses WHERE code = 'ENG101'), (SELECT id FROM semesters WHERE semester_type = '1'), '2024-02-01', 'enrolled'),

-- Carol Smith (DBM Year 1)
(uuid_generate_v4(), (SELECT id FROM students WHERE student_number = 'NPI2024003'), (SELECT id FROM courses WHERE code = 'BUS101'), (SELECT id FROM semesters WHERE semester_type = '1'), '2024-02-01', 'enrolled');

-- Insert Grade Criteria for each department
INSERT INTO grade_criteria (id, department_id, grade, min_percentage, max_percentage, grade_points, description) VALUES
-- Engineering Department
(uuid_generate_v4(), (SELECT id FROM departments WHERE code = 'ENG'), 'HD', 80.00, 100.00, 4.00, 'High Distinction'),
(uuid_generate_v4(), (SELECT id FROM departments WHERE code = 'ENG'), 'D', 70.00, 79.99, 3.00, 'Distinction'),
(uuid_generate_v4(), (SELECT id FROM departments WHERE code = 'ENG'), 'C', 60.00, 69.99, 2.00, 'Credit'),
(uuid_generate_v4(), (SELECT id FROM departments WHERE code = 'ENG'), 'P', 50.00, 59.99, 1.00, 'Pass'),
(uuid_generate_v4(), (SELECT id FROM departments WHERE code = 'ENG'), 'F', 0.00, 49.99, 0.00, 'Fail'),

-- Business Department
(uuid_generate_v4(), (SELECT id FROM departments WHERE code = 'BUS'), 'HD', 85.00, 100.00, 4.00, 'High Distinction'),
(uuid_generate_v4(), (SELECT id FROM departments WHERE code = 'BUS'), 'D', 75.00, 84.99, 3.00, 'Distinction'),
(uuid_generate_v4(), (SELECT id FROM departments WHERE code = 'BUS'), 'C', 65.00, 74.99, 2.00, 'Credit'),
(uuid_generate_v4(), (SELECT id FROM departments WHERE code = 'BUS'), 'P', 55.00, 64.99, 1.00, 'Pass'),
(uuid_generate_v4(), (SELECT id FROM departments WHERE code = 'BUS'), 'F', 0.00, 54.99, 0.00, 'Fail'),

-- Sciences Department
(uuid_generate_v4(), (SELECT id FROM departments WHERE code = 'SCI'), 'HD', 80.00, 100.00, 4.00, 'High Distinction'),
(uuid_generate_v4(), (SELECT id FROM departments WHERE code = 'SCI'), 'D', 70.00, 79.99, 3.00, 'Distinction'),
(uuid_generate_v4(), (SELECT id FROM departments WHERE code = 'SCI'), 'C', 60.00, 69.99, 2.00, 'Credit'),
(uuid_generate_v4(), (SELECT id FROM departments WHERE code = 'SCI'), 'P', 50.00, 59.99, 1.00, 'Pass'),
(uuid_generate_v4(), (SELECT id FROM departments WHERE code = 'SCI'), 'F', 0.00, 49.99, 0.00, 'Fail');

-- Insert Assessment Definitions
INSERT INTO assessment_definitions (id, course_id, semester_id, name, type, weight_percentage, max_score, description, is_required) VALUES
-- ENG201 Assessments
(uuid_generate_v4(), (SELECT id FROM courses WHERE code = 'ENG201'), (SELECT id FROM semesters WHERE semester_type = '1'), 'Assignment 1', 'assignment', 15.00, 100, 'First assignment on differential equations', true),
(uuid_generate_v4(), (SELECT id FROM courses WHERE code = 'ENG201'), (SELECT id FROM semesters WHERE semester_type = '1'), 'Midterm Exam', 'midterm', 30.00, 100, 'Midterm examination', true),
(uuid_generate_v4(), (SELECT id FROM courses WHERE code = 'ENG201'), (SELECT id FROM semesters WHERE semester_type = '1'), 'Assignment 2', 'assignment', 20.00, 100, 'Second assignment on integration techniques', true),
(uuid_generate_v4(), (SELECT id FROM courses WHERE code = 'ENG201'), (SELECT id FROM semesters WHERE semester_type = '1'), 'Final Exam', 'final', 35.00, 100, 'Final examination', true),

-- ENG301 Assessments
(uuid_generate_v4(), (SELECT id FROM courses WHERE code = 'ENG301'), (SELECT id FROM semesters WHERE semester_type = '1'), 'Design Project', 'project', 40.00, 100, 'Structural design project', true),
(uuid_generate_v4(), (SELECT id FROM courses WHERE code = 'ENG301'), (SELECT id FROM semesters WHERE semester_type = '1'), 'Practical Assessment', 'practical', 25.00, 100, 'Laboratory practical work', true),
(uuid_generate_v4(), (SELECT id FROM courses WHERE code = 'ENG301'), (SELECT id FROM semesters WHERE semester_type = '1'), 'Final Exam', 'final', 35.00, 100, 'Final theoretical examination', true);

-- Insert Sample Student Assessment Results
INSERT INTO student_assessments (id, student_id, assessment_definition_id, score, submitted_date, graded_date, graded_by, comments) VALUES
-- Alice Student - ENG201 results
(uuid_generate_v4(),
 (SELECT id FROM students WHERE student_number = 'NPI2024001'),
 (SELECT id FROM assessment_definitions WHERE name = 'Assignment 1' AND course_id = (SELECT id FROM courses WHERE code = 'ENG201')),
 78.0, '2024-02-15', '2024-02-20', (SELECT id FROM users WHERE email = 'instructor@npi.pg'), 'Good understanding of concepts'),

(uuid_generate_v4(),
 (SELECT id FROM students WHERE student_number = 'NPI2024001'),
 (SELECT id FROM assessment_definitions WHERE name = 'Midterm Exam' AND course_id = (SELECT id FROM courses WHERE code = 'ENG201')),
 82.5, '2024-03-15', '2024-03-20', (SELECT id FROM users WHERE email = 'instructor@npi.pg'), 'Excellent work on problem solving');
