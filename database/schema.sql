-- NPI PNG Student Assessment System Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Roles ENUM
CREATE TYPE user_role AS ENUM ('admin', 'department_head', 'instructor', 'tutor', 'student');

-- Grade Types ENUM
CREATE TYPE grade_type AS ENUM ('HD', 'D', 'C', 'P', 'F', 'W', 'I');

-- Assessment Types ENUM
CREATE TYPE assessment_type AS ENUM ('assignment', 'midterm', 'practical', 'final', 'project', 'quiz');

-- Semester Types ENUM
CREATE TYPE semester_type AS ENUM ('1', '2');

-- 1. Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    phone TEXT,
    date_of_birth DATE,
    profile_picture_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Departments table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    head_id UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Programs table
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    department_id UUID NOT NULL REFERENCES departments(id),
    duration_years INTEGER NOT NULL CHECK (duration_years BETWEEN 1 AND 4),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    department_id UUID NOT NULL REFERENCES departments(id),
    program_id UUID NOT NULL REFERENCES programs(id),
    year_level INTEGER NOT NULL CHECK (year_level BETWEEN 1 AND 4),
    semester semester_type NOT NULL,
    credit_hours INTEGER NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Academic Years table
CREATE TABLE academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year_name TEXT UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Semesters table
CREATE TABLE semesters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    semester_type semester_type NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    grading_deadline DATE NOT NULL,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(academic_year_id, semester_type)
);

-- 7. Course Instructors table (many-to-many)
CREATE TABLE course_instructors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id),
    instructor_id UUID NOT NULL REFERENCES users(id),
    semester_id UUID NOT NULL REFERENCES semesters(id),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(course_id, instructor_id, semester_id)
);

-- 8. Students table (additional student-specific data)
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    student_number TEXT UNIQUE NOT NULL,
    program_id UUID NOT NULL REFERENCES programs(id),
    year_level INTEGER NOT NULL CHECK (year_level BETWEEN 1 AND 4),
    enrollment_year INTEGER NOT NULL,
    guardian_name TEXT,
    guardian_phone TEXT,
    address TEXT,
    national_id TEXT,
    birth_certificate_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Student Enrollments table
CREATE TABLE student_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    semester_id UUID NOT NULL REFERENCES semesters(id),
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'withdrawn', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, course_id, semester_id)
);

-- 10. Assessment Definitions table
CREATE TABLE assessment_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id),
    semester_id UUID NOT NULL REFERENCES semesters(id),
    name TEXT NOT NULL,
    type assessment_type NOT NULL,
    weight_percentage DECIMAL(5,2) NOT NULL CHECK (weight_percentage > 0 AND weight_percentage <= 100),
    max_score INTEGER NOT NULL,
    due_date DATE,
    description TEXT,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Student Assessments table (actual scores)
CREATE TABLE student_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id),
    assessment_definition_id UUID NOT NULL REFERENCES assessment_definitions(id),
    score DECIMAL(5,2),
    submitted_date DATE,
    graded_date DATE,
    graded_by UUID REFERENCES users(id),
    comments TEXT,
    is_moderated BOOLEAN DEFAULT false,
    moderated_by UUID REFERENCES users(id),
    moderated_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, assessment_definition_id)
);

-- 12. Grade Criteria table
CREATE TABLE grade_criteria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NOT NULL REFERENCES departments(id),
    grade grade_type NOT NULL,
    min_percentage DECIMAL(5,2) NOT NULL,
    max_percentage DECIMAL(5,2) NOT NULL,
    grade_points DECIMAL(3,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(department_id, grade)
);

-- 13. Course Results table (final course grades)
CREATE TABLE course_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    semester_id UUID NOT NULL REFERENCES semesters(id),
    total_score DECIMAL(5,2),
    final_grade grade_type,
    grade_points DECIMAL(3,2),
    is_passed BOOLEAN,
    remarks TEXT,
    finalized_date DATE,
    finalized_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, course_id, semester_id)
);

-- 14. Transcripts table
CREATE TABLE transcripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id),
    semester_id UUID NOT NULL REFERENCES semesters(id),
    total_credit_hours INTEGER NOT NULL DEFAULT 0,
    semester_gpa DECIMAL(3,2),
    cumulative_gpa DECIMAL(3,2),
    cumulative_credit_hours INTEGER NOT NULL DEFAULT 0,
    academic_status TEXT DEFAULT 'good_standing',
    generated_date DATE DEFAULT CURRENT_DATE,
    generated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, semester_id)
);

-- 15. System Settings table
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_courses_department_id ON courses(department_id);
CREATE INDEX idx_students_program_id ON students(program_id);
CREATE INDEX idx_student_enrollments_student_id ON student_enrollments(student_id);
CREATE INDEX idx_student_enrollments_course_id ON student_enrollments(course_id);
CREATE INDEX idx_student_assessments_student_id ON student_assessments(student_id);
CREATE INDEX idx_course_results_student_id ON course_results(student_id);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;

-- Insert default grade criteria (example for engineering department)
INSERT INTO grade_criteria (department_id, grade, min_percentage, max_percentage, grade_points, description) VALUES
((SELECT id FROM departments WHERE code = 'ENG'), 'HD', 80.00, 100.00, 4.00, 'High Distinction'),
((SELECT id FROM departments WHERE code = 'ENG'), 'D', 70.00, 79.99, 3.00, 'Distinction'),
((SELECT id FROM departments WHERE code = 'ENG'), 'C', 60.00, 69.99, 2.00, 'Credit'),
((SELECT id FROM departments WHERE code = 'ENG'), 'P', 50.00, 59.99, 1.00, 'Pass'),
((SELECT id FROM departments WHERE code = 'ENG'), 'F', 0.00, 49.99, 0.00, 'Fail');

-- Insert system settings
INSERT INTO system_settings (key, value, description) VALUES
('institution_name', 'National Polytechnic Institute of PNG', 'Institution Name'),
('min_passing_grade', '50', 'Minimum percentage for passing'),
('max_gpa', '4.0', 'Maximum GPA scale'),
('academic_year_start_month', '2', 'Academic year start month'),
('semester_duration_weeks', '16', 'Standard semester duration in weeks');

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessment_definitions_updated_at BEFORE UPDATE ON assessment_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_assessments_updated_at BEFORE UPDATE ON student_assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_results_updated_at BEFORE UPDATE ON course_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
