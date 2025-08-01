-- Student Registration & Academic Management System Database Schema
-- Extended schema for comprehensive student management

-- Student Types ENUM
CREATE TYPE student_type AS ENUM ('full_time', 'part_time', 'certification', 'industrial_training');

-- Room Types ENUM
CREATE TYPE room_type AS ENUM ('single', 'double', 'dorm');

-- Fee Types ENUM
CREATE TYPE fee_type AS ENUM ('tuition', 'project', 'library', 'boarding', 'sports', 'it_lab');

-- Payment Status ENUM
CREATE TYPE payment_status AS ENUM ('pending', 'verified', 'rejected', 'partial');

-- Transcript Types ENUM
CREATE TYPE transcript_type AS ENUM ('semester', 'yearly', 'full');

-- Student Category ENUM
CREATE TYPE student_category AS ENUM ('day_scholar', 'boarder', 'bridging_course');

-- Gender ENUM
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');

-- Extended Students Table
CREATE TABLE students_extended (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    student_number TEXT UNIQUE NOT NULL,
    program_id UUID NOT NULL REFERENCES programs(id),
    student_type student_type NOT NULL DEFAULT 'full_time',
    student_category student_category NOT NULL DEFAULT 'day_scholar',
    year_level INTEGER NOT NULL CHECK (year_level BETWEEN 1 AND 4),
    enrollment_year INTEGER NOT NULL,
    gender gender_type NOT NULL,
    date_of_birth DATE NOT NULL,
    guardian_name TEXT,
    guardian_phone TEXT,
    guardian_email TEXT,
    address TEXT,
    national_id TEXT,
    passport_number TEXT,
    birth_certificate_url TEXT,
    photo_url TEXT,
    biometric_hash TEXT, -- Stores biometric data hash
    biometric_enrolled BOOLEAN DEFAULT false,
    registration_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fee Structure Table
CREATE TABLE fee_structure (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    program_id UUID NOT NULL REFERENCES programs(id),
    fee_type fee_type NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    is_mandatory BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(academic_year_id, program_id, fee_type)
);

-- Student Payments Table
CREATE TABLE student_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students_extended(id),
    fee_structure_id UUID NOT NULL REFERENCES fee_structure(id),
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL, -- 'online', 'cash', 'bank_transfer'
    receipt_number TEXT,
    receipt_url TEXT, -- For uploaded receipts
    payment_date DATE NOT NULL,
    verification_status payment_status DEFAULT 'pending',
    verified_by UUID REFERENCES users(id),
    verified_date DATE,
    manual_entry_flag BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rooms Table
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_number TEXT UNIQUE NOT NULL,
    room_type room_type NOT NULL,
    capacity INTEGER NOT NULL,
    current_occupancy INTEGER DEFAULT 0,
    gender_restriction gender_type,
    floor_number INTEGER,
    building_name TEXT,
    amenities TEXT[], -- Array of amenities
    is_available BOOLEAN DEFAULT true,
    monthly_fee DECIMAL(8,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Room Allocations Table
CREATE TABLE room_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students_extended(id),
    room_id UUID NOT NULL REFERENCES rooms(id),
    allocated_date DATE NOT NULL DEFAULT CURRENT_DATE,
    vacated_date DATE,
    is_active BOOLEAN DEFAULT true,
    allocation_fee_paid BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meal Cards Table
CREATE TABLE meal_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students_extended(id),
    card_number TEXT UNIQUE NOT NULL,
    balance DECIMAL(8,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    issued_date DATE DEFAULT CURRENT_DATE,
    last_used_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Biometric Records Table
CREATE TABLE biometric_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students_extended(id),
    fingerprint_data TEXT, -- Encrypted biometric data
    face_scan_data TEXT, -- Encrypted face scan data
    enrollment_date DATE DEFAULT CURRENT_DATE,
    last_updated DATE DEFAULT CURRENT_DATE,
    quality_score INTEGER CHECK (quality_score BETWEEN 1 AND 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student ID Cards Table
CREATE TABLE student_id_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students_extended(id),
    card_number TEXT UNIQUE NOT NULL,
    issue_date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,
    is_active BOOLEAN DEFAULT true,
    qr_code_data TEXT, -- QR code for verification
    barcode_data TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transcripts Table (Extended)
CREATE TABLE transcripts_extended (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students_extended(id),
    transcript_type transcript_type NOT NULL,
    academic_year_id UUID REFERENCES academic_years(id),
    semester_id UUID REFERENCES semesters(id),
    courses_data JSONB, -- Store course details as JSON
    semester_gpa DECIMAL(3,2),
    cumulative_gpa DECIMAL(3,2),
    total_credits_attempted INTEGER DEFAULT 0,
    total_credits_earned INTEGER DEFAULT 0,
    academic_standing TEXT,
    remarks TEXT,
    generated_by UUID NOT NULL REFERENCES users(id),
    generated_date DATE DEFAULT CURRENT_DATE,
    is_official BOOLEAN DEFAULT false,
    signature_data TEXT, -- Digital signature
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student Registration Logs Table
CREATE TABLE student_registration_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students_extended(id),
    action TEXT NOT NULL, -- 'registration_started', 'payment_uploaded', 'verified', 'completed'
    performed_by UUID NOT NULL REFERENCES users(id),
    details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Reconciliation Table
CREATE TABLE payment_reconciliation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    total_online_payments DECIMAL(12,2) DEFAULT 0,
    total_manual_payments DECIMAL(12,2) DEFAULT 0,
    total_verified_payments DECIMAL(12,2) DEFAULT 0,
    discrepancies TEXT,
    reconciled_by UUID REFERENCES users(id),
    reconciliation_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Access Logs Table (for biometric access tracking)
CREATE TABLE access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students_extended(id),
    access_point TEXT NOT NULL, -- 'library', 'lab', 'hostel', 'cafeteria'
    access_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    access_granted BOOLEAN DEFAULT true,
    verification_method TEXT, -- 'biometric', 'card', 'manual'
    notes TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_students_extended_student_number ON students_extended(student_number);
CREATE INDEX idx_students_extended_program_id ON students_extended(program_id);
CREATE INDEX idx_students_extended_student_type ON students_extended(student_type);
CREATE INDEX idx_student_payments_student_id ON student_payments(student_id);
CREATE INDEX idx_student_payments_verification_status ON student_payments(verification_status);
CREATE INDEX idx_room_allocations_student_id ON room_allocations(student_id);
CREATE INDEX idx_room_allocations_room_id ON room_allocations(room_id);
CREATE INDEX idx_transcripts_extended_student_id ON transcripts_extended(student_id);
CREATE INDEX idx_access_logs_student_id ON access_logs(student_id);
CREATE INDEX idx_access_logs_access_time ON access_logs(access_time);

-- Create triggers for automatic updates
CREATE TRIGGER update_students_extended_updated_at
BEFORE UPDATE ON students_extended
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_payments_updated_at
BEFORE UPDATE ON student_payments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at
BEFORE UPDATE ON rooms
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_room_allocations_updated_at
BEFORE UPDATE ON room_allocations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update room occupancy
CREATE OR REPLACE FUNCTION update_room_occupancy()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.is_active THEN
        UPDATE rooms
        SET current_occupancy = current_occupancy + 1
        WHERE id = NEW.room_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.is_active AND NOT NEW.is_active THEN
            UPDATE rooms
            SET current_occupancy = current_occupancy - 1
            WHERE id = NEW.room_id;
        ELSIF NOT OLD.is_active AND NEW.is_active THEN
            UPDATE rooms
            SET current_occupancy = current_occupancy + 1
            WHERE id = NEW.room_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.is_active THEN
        UPDATE rooms
        SET current_occupancy = current_occupancy - 1
        WHERE id = OLD.room_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for room occupancy updates
CREATE TRIGGER room_allocation_occupancy_trigger
    AFTER INSERT OR UPDATE OR DELETE ON room_allocations
    FOR EACH ROW EXECUTE FUNCTION update_room_occupancy();

-- Function to generate student number
CREATE OR REPLACE FUNCTION generate_student_number(program_code TEXT, enrollment_year INTEGER)
RETURNS TEXT AS $$
DECLARE
    sequence_num INTEGER;
    student_number TEXT;
BEGIN
    -- Get the next sequence number for this program and year
    SELECT COALESCE(MAX(CAST(RIGHT(student_number, 3) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM students_extended s
    JOIN programs p ON s.program_id = p.id
    WHERE p.code = program_code
    AND s.enrollment_year = enrollment_year;

    -- Format: NPI[YEAR][PROGRAM_CODE][SEQUENCE]
    student_number := 'NPI' || enrollment_year || program_code || LPAD(sequence_num::TEXT, 3, '0');

    RETURN student_number;
END;
$$ LANGUAGE plpgsql;
