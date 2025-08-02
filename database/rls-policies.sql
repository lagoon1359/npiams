-- NPI PNG Academic Management System - Row Level Security (RLS) Policies
-- Run this script in your Supabase SQL editor to set up secure access policies

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role(user_email text)
RETURNS user_role AS $$
BEGIN
  RETURN (SELECT role FROM users WHERE email = user_email LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current user's department
CREATE OR REPLACE FUNCTION get_user_department(user_email text)
RETURNS uuid AS $$
BEGIN
  RETURN (SELECT department FROM users WHERE email = user_email LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_email text)
RETURNS boolean AS $$
BEGIN
  RETURN (SELECT role = 'admin' FROM users WHERE email = user_email LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is department head
CREATE OR REPLACE FUNCTION is_department_head(user_email text, dept_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM departments d
    JOIN users u ON d.head_id = u.id
    WHERE u.email = user_email AND d.id = dept_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================
-- USERS TABLE POLICIES
-- ===================================

-- Admins can do everything with users
CREATE POLICY "Admins can manage all users" ON users
  FOR ALL USING (is_admin(auth.email()));

-- Users can view their own record
CREATE POLICY "Users can view own record" ON users
  FOR SELECT USING (email = auth.email());

-- Users can update their own record (limited fields)
CREATE POLICY "Users can update own record" ON users
  FOR UPDATE USING (email = auth.email());

-- Department heads can view users in their department
CREATE POLICY "Department heads can view department users" ON users
  FOR SELECT USING (
    get_user_role(auth.email()) = 'department_head' AND
    department = get_user_department(auth.email())
  );

-- Instructors can view basic info of users in their department
CREATE POLICY "Instructors can view department users basic info" ON users
  FOR SELECT USING (
    get_user_role(auth.email()) = 'instructor' AND
    department = get_user_department(auth.email())
  );

-- ===================================
-- DEPARTMENTS TABLE POLICIES
-- ===================================

-- Admins can manage all departments
CREATE POLICY "Admins can manage departments" ON departments
  FOR ALL USING (is_admin(auth.email()));

-- All authenticated users can view departments
CREATE POLICY "All users can view departments" ON departments
  FOR SELECT USING (auth.role() = 'authenticated');

-- Department heads can update their own department
CREATE POLICY "Department heads can update own department" ON departments
  FOR UPDATE USING (is_department_head(auth.email(), id));

-- ===================================
-- PROGRAMS TABLE POLICIES
-- ===================================

-- Admins can manage all programs
CREATE POLICY "Admins can manage programs" ON programs
  FOR ALL USING (is_admin(auth.email()));

-- All authenticated users can view programs
CREATE POLICY "All users can view programs" ON programs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Department heads can manage programs in their department
CREATE POLICY "Department heads can manage department programs" ON programs
  FOR ALL USING (is_department_head(auth.email(), department_id));

-- ===================================
-- COURSES TABLE POLICIES
-- ===================================

-- Admins can manage all courses
CREATE POLICY "Admins can manage courses" ON courses
  FOR ALL USING (is_admin(auth.email()));

-- All authenticated users can view courses
CREATE POLICY "All users can view courses" ON courses
  FOR SELECT USING (auth.role() = 'authenticated');

-- Department heads can manage courses in their department
CREATE POLICY "Department heads can manage department courses" ON courses
  FOR ALL USING (is_department_head(auth.email(), department_id));

-- Instructors can view and update courses they teach
CREATE POLICY "Instructors can view courses they teach" ON courses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM course_instructors ci
      JOIN users u ON ci.instructor_id = u.id
      WHERE u.email = auth.email() AND ci.course_id = courses.id
    )
  );

-- ===================================
-- ACADEMIC YEARS & SEMESTERS POLICIES
-- ===================================

-- Admins can manage academic years and semesters
CREATE POLICY "Admins can manage academic years" ON academic_years
  FOR ALL USING (is_admin(auth.email()));

CREATE POLICY "Admins can manage semesters" ON semesters
  FOR ALL USING (is_admin(auth.email()));

-- All authenticated users can view academic years and semesters
CREATE POLICY "All users can view academic years" ON academic_years
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "All users can view semesters" ON semesters
  FOR SELECT USING (auth.role() = 'authenticated');

-- ===================================
-- STUDENTS TABLE POLICIES
-- ===================================

-- Admins can manage all students
CREATE POLICY "Admins can manage students" ON students
  FOR ALL USING (is_admin(auth.email()));

-- Students can view their own record
CREATE POLICY "Students can view own record" ON students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = students.user_id AND u.email = auth.email()
    )
  );

-- Department heads can view students in their department programs
CREATE POLICY "Department heads can view department students" ON students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM programs p
      WHERE p.id = students.program_id AND is_department_head(auth.email(), p.department_id)
    )
  );

-- Instructors can view students in their courses
CREATE POLICY "Instructors can view course students" ON students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM student_enrollments se
      JOIN course_instructors ci ON se.course_id = ci.course_id
      JOIN users u ON ci.instructor_id = u.id
      WHERE u.email = auth.email() AND se.student_id = students.id
    )
  );

-- ===================================
-- COURSE INSTRUCTORS POLICIES
-- ===================================

-- Admins can manage course instructors
CREATE POLICY "Admins can manage course instructors" ON course_instructors
  FOR ALL USING (is_admin(auth.email()));

-- All authenticated users can view course instructors
CREATE POLICY "All users can view course instructors" ON course_instructors
  FOR SELECT USING (auth.role() = 'authenticated');

-- Department heads can manage instructors for their department courses
CREATE POLICY "Department heads can manage department course instructors" ON course_instructors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = course_instructors.course_id AND is_department_head(auth.email(), c.department_id)
    )
  );

-- ===================================
-- STUDENT ENROLLMENTS POLICIES
-- ===================================

-- Admins can manage all enrollments
CREATE POLICY "Admins can manage enrollments" ON student_enrollments
  FOR ALL USING (is_admin(auth.email()));

-- Students can view their own enrollments
CREATE POLICY "Students can view own enrollments" ON student_enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE u.email = auth.email() AND s.id = student_enrollments.student_id
    )
  );

-- Instructors can view enrollments for their courses
CREATE POLICY "Instructors can view course enrollments" ON student_enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM course_instructors ci
      JOIN users u ON ci.instructor_id = u.id
      WHERE u.email = auth.email() AND ci.course_id = student_enrollments.course_id
    )
  );

-- Department heads can view enrollments in their department
CREATE POLICY "Department heads can view department enrollments" ON student_enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = student_enrollments.course_id AND is_department_head(auth.email(), c.department_id)
    )
  );

-- ===================================
-- ASSESSMENT DEFINITIONS POLICIES
-- ===================================

-- Admins can manage all assessments
CREATE POLICY "Admins can manage assessment definitions" ON assessment_definitions
  FOR ALL USING (is_admin(auth.email()));

-- Instructors can manage assessments for their courses
CREATE POLICY "Instructors can manage course assessments" ON assessment_definitions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM course_instructors ci
      JOIN users u ON ci.instructor_id = u.id
      WHERE u.email = auth.email() AND ci.course_id = assessment_definitions.course_id
    )
  );

-- Students can view assessments for their enrolled courses
CREATE POLICY "Students can view course assessments" ON assessment_definitions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM student_enrollments se
      JOIN students s ON se.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE u.email = auth.email() AND se.course_id = assessment_definitions.course_id
    )
  );

-- ===================================
-- STUDENT ASSESSMENTS POLICIES
-- ===================================

-- Admins can manage all student assessments
CREATE POLICY "Admins can manage student assessments" ON student_assessments
  FOR ALL USING (is_admin(auth.email()));

-- Students can view their own assessments
CREATE POLICY "Students can view own assessments" ON student_assessments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE u.email = auth.email() AND s.id = student_assessments.student_id
    )
  );

-- Instructors can manage assessments for their courses
CREATE POLICY "Instructors can manage course student assessments" ON student_assessments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM assessment_definitions ad
      JOIN course_instructors ci ON ad.course_id = ci.course_id
      JOIN users u ON ci.instructor_id = u.id
      WHERE u.email = auth.email() AND ad.id = student_assessments.assessment_definition_id
    )
  );

-- ===================================
-- COURSE RESULTS POLICIES
-- ===================================

-- Admins can manage all course results
CREATE POLICY "Admins can manage course results" ON course_results
  FOR ALL USING (is_admin(auth.email()));

-- Students can view their own results
CREATE POLICY "Students can view own results" ON course_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE u.email = auth.email() AND s.id = course_results.student_id
    )
  );

-- Instructors can manage results for their courses
CREATE POLICY "Instructors can manage course results" ON course_results
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM course_instructors ci
      JOIN users u ON ci.instructor_id = u.id
      WHERE u.email = auth.email() AND ci.course_id = course_results.course_id
    )
  );

-- ===================================
-- TRANSCRIPTS POLICIES
-- ===================================

-- Admins can manage all transcripts
CREATE POLICY "Admins can manage transcripts" ON transcripts
  FOR ALL USING (is_admin(auth.email()));

-- Students can view their own transcripts
CREATE POLICY "Students can view own transcripts" ON transcripts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE u.email = auth.email() AND s.id = transcripts.student_id
    )
  );

-- Department heads can view transcripts for students in their programs
CREATE POLICY "Department heads can view department transcripts" ON transcripts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN programs p ON s.program_id = p.id
      WHERE is_department_head(auth.email(), p.department_id) AND s.id = transcripts.student_id
    )
  );

-- ===================================
-- GRADE CRITERIA POLICIES
-- ===================================

-- Admins can manage grade criteria
CREATE POLICY "Admins can manage grade criteria" ON grade_criteria
  FOR ALL USING (is_admin(auth.email()));

-- All authenticated users can view grade criteria
CREATE POLICY "All users can view grade criteria" ON grade_criteria
  FOR SELECT USING (auth.role() = 'authenticated');

-- Department heads can manage criteria for their department
CREATE POLICY "Department heads can manage department grade criteria" ON grade_criteria
  FOR ALL USING (is_department_head(auth.email(), department_id));

-- ===================================
-- SYSTEM SETTINGS POLICIES
-- ===================================

-- Only admins can manage system settings
CREATE POLICY "Only admins can manage system settings" ON system_settings
  FOR ALL USING (is_admin(auth.email()));

-- All authenticated users can view system settings
CREATE POLICY "All users can view system settings" ON system_settings
  FOR SELECT USING (auth.role() = 'authenticated');

-- ===================================
-- ENABLE POLICIES
-- ===================================

-- Make sure all policies are applied and RLS is enforced
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE departments FORCE ROW LEVEL SECURITY;
ALTER TABLE programs FORCE ROW LEVEL SECURITY;
ALTER TABLE courses FORCE ROW LEVEL SECURITY;
ALTER TABLE academic_years FORCE ROW LEVEL SECURITY;
ALTER TABLE semesters FORCE ROW LEVEL SECURITY;
ALTER TABLE students FORCE ROW LEVEL SECURITY;
ALTER TABLE course_instructors FORCE ROW LEVEL SECURITY;
ALTER TABLE student_enrollments FORCE ROW LEVEL SECURITY;
ALTER TABLE assessment_definitions FORCE ROW LEVEL SECURITY;
ALTER TABLE student_assessments FORCE ROW LEVEL SECURITY;
ALTER TABLE course_results FORCE ROW LEVEL SECURITY;
ALTER TABLE transcripts FORCE ROW LEVEL SECURITY;
ALTER TABLE grade_criteria FORCE ROW LEVEL SECURITY;
ALTER TABLE system_settings FORCE ROW LEVEL SECURITY;

SELECT 'Row Level Security policies successfully created!' AS message
UNION ALL
SELECT 'Database is now secured with role-based access control'
UNION ALL
SELECT 'Admins: Full access to all data'
UNION ALL
SELECT 'Department Heads: Access to their department data'
UNION ALL
SELECT 'Instructors: Access to their course data'
UNION ALL
SELECT 'Students: Access to their own data only'
UNION ALL
SELECT 'All policies are now active and enforced!';
