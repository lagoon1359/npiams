-- Assessment System Database Triggers and Functions
-- Run this SQL in your Supabase SQL editor to create automated GPA calculations

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('grade_released', 'assessment_created', 'deadline_reminder', 'general')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Enable RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Function to calculate grade letter from percentage
CREATE OR REPLACE FUNCTION calculate_grade_letter(percentage DECIMAL)
RETURNS grade_type AS $$
BEGIN
    IF percentage >= 80 THEN
        RETURN 'HD';
    ELSIF percentage >= 70 THEN
        RETURN 'D';
    ELSIF percentage >= 60 THEN
        RETURN 'C';
    ELSIF percentage >= 50 THEN
        RETURN 'P';
    ELSE
        RETURN 'F';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate grade points from grade letter
CREATE OR REPLACE FUNCTION calculate_grade_points(grade grade_type)
RETURNS DECIMAL AS $$
BEGIN
    CASE grade
        WHEN 'HD' THEN RETURN 4.0;
        WHEN 'D' THEN RETURN 3.0;
        WHEN 'C' THEN RETURN 2.0;
        WHEN 'P' THEN RETURN 1.0;
        ELSE RETURN 0.0;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate course final score
CREATE OR REPLACE FUNCTION calculate_course_final_score(p_student_id UUID, p_course_id UUID, p_semester_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    total_weighted_score DECIMAL := 0;
    total_weight DECIMAL := 0;
    assessment_record RECORD;
BEGIN
    -- Sum up all assessment scores weighted by their percentage
    FOR assessment_record IN
        SELECT
            sa.score,
            ad.max_score,
            ad.weight_percentage
        FROM student_assessments sa
        JOIN assessment_definitions ad ON sa.assessment_definition_id = ad.id
        WHERE sa.student_id = p_student_id
          AND ad.course_id = p_course_id
          AND ad.semester_id = p_semester_id
          AND sa.score IS NOT NULL
          AND ad.is_required = true
    LOOP
        total_weighted_score := total_weighted_score +
            ((assessment_record.score / assessment_record.max_score) * assessment_record.weight_percentage);
        total_weight := total_weight + assessment_record.weight_percentage;
    END LOOP;

    -- Return percentage (0-100)
    IF total_weight > 0 THEN
        RETURN total_weighted_score / total_weight * 100;
    ELSE
        RETURN 0;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update course result
CREATE OR REPLACE FUNCTION update_course_result(p_student_id UUID, p_course_id UUID, p_semester_id UUID)
RETURNS VOID AS $$
DECLARE
    final_score DECIMAL;
    letter_grade grade_type;
    grade_points DECIMAL;
    is_passed BOOLEAN;
BEGIN
    -- Calculate final score
    final_score := calculate_course_final_score(p_student_id, p_course_id, p_semester_id);

    -- Determine letter grade and grade points
    letter_grade := calculate_grade_letter(final_score);
    grade_points := calculate_grade_points(letter_grade);
    is_passed := letter_grade != 'F';

    -- Insert or update course result
    INSERT INTO course_results (
        student_id,
        course_id,
        semester_id,
        total_score,
        final_grade,
        grade_points,
        is_passed,
        finalized_date,
        created_at,
        updated_at
    ) VALUES (
        p_student_id,
        p_course_id,
        p_semester_id,
        final_score,
        letter_grade,
        grade_points,
        is_passed,
        NOW(),
        NOW(),
        NOW()
    )
    ON CONFLICT (student_id, course_id, semester_id)
    DO UPDATE SET
        total_score = EXCLUDED.total_score,
        final_grade = EXCLUDED.final_grade,
        grade_points = EXCLUDED.grade_points,
        is_passed = EXCLUDED.is_passed,
        finalized_date = EXCLUDED.finalized_date,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to calculate and update GPA
CREATE OR REPLACE FUNCTION calculate_and_update_gpa(p_student_id UUID)
RETURNS VOID AS $$
DECLARE
    semester_record RECORD;
    semester_gpa DECIMAL;
    cumulative_gpa DECIMAL;
    total_grade_points DECIMAL := 0;
    total_credit_hours INTEGER := 0;
    semester_grade_points DECIMAL;
    semester_credit_hours INTEGER;
    academic_status TEXT;
BEGIN
    -- Calculate cumulative totals
    SELECT
        COALESCE(SUM(cr.grade_points * c.credit_hours), 0),
        COALESCE(SUM(c.credit_hours), 0)
    INTO total_grade_points, total_credit_hours
    FROM course_results cr
    JOIN courses c ON cr.course_id = c.id
    WHERE cr.student_id = p_student_id
      AND cr.is_passed = true;

    -- Calculate cumulative GPA
    IF total_credit_hours > 0 THEN
        cumulative_gpa := total_grade_points / total_credit_hours;
    ELSE
        cumulative_gpa := 0;
    END IF;

    -- Determine academic status
    IF cumulative_gpa >= 3.5 THEN
        academic_status := 'Dean''s List';
    ELSIF cumulative_gpa >= 3.0 THEN
        academic_status := 'Good Standing';
    ELSIF cumulative_gpa >= 2.0 THEN
        academic_status := 'Satisfactory';
    ELSIF cumulative_gpa >= 1.0 THEN
        academic_status := 'Academic Probation';
    ELSE
        academic_status := 'Academic Suspension';
    END IF;

    -- Update transcript for each semester
    FOR semester_record IN
        SELECT DISTINCT s.id as semester_id, s.semester_type, s.academic_year_id
        FROM course_results cr
        JOIN semesters s ON cr.semester_id = s.id
        WHERE cr.student_id = p_student_id
    LOOP
        -- Calculate semester GPA
        SELECT
            COALESCE(SUM(cr.grade_points * c.credit_hours), 0),
            COALESCE(SUM(c.credit_hours), 0)
        INTO semester_grade_points, semester_credit_hours
        FROM course_results cr
        JOIN courses c ON cr.course_id = c.id
        WHERE cr.student_id = p_student_id
          AND cr.semester_id = semester_record.semester_id;

        IF semester_credit_hours > 0 THEN
            semester_gpa := semester_grade_points / semester_credit_hours;
        ELSE
            semester_gpa := 0;
        END IF;

        -- Insert or update transcript
        INSERT INTO transcripts (
            student_id,
            semester_id,
            total_credit_hours,
            semester_gpa,
            cumulative_gpa,
            cumulative_credit_hours,
            academic_status,
            generated_date,
            created_at
        ) VALUES (
            p_student_id,
            semester_record.semester_id,
            semester_credit_hours,
            ROUND(semester_gpa, 2),
            ROUND(cumulative_gpa, 2),
            total_credit_hours,
            academic_status,
            CURRENT_DATE,
            NOW()
        )
        ON CONFLICT (student_id, semester_id)
        DO UPDATE SET
            total_credit_hours = EXCLUDED.total_credit_hours,
            semester_gpa = EXCLUDED.semester_gpa,
            cumulative_gpa = EXCLUDED.cumulative_gpa,
            cumulative_credit_hours = EXCLUDED.cumulative_credit_hours,
            academic_status = EXCLUDED.academic_status,
            generated_date = EXCLUDED.generated_date;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to send grade release notifications
CREATE OR REPLACE FUNCTION notify_grade_release(p_assessment_id UUID, p_student_ids UUID[])
RETURNS VOID AS $$
DECLARE
    assessment_record RECORD;
    student_record RECORD;
    student_id UUID;
BEGIN
    -- Get assessment details
    SELECT
        ad.name as assessment_name,
        c.name as course_name,
        c.code as course_code
    INTO assessment_record
    FROM assessment_definitions ad
    JOIN courses c ON ad.course_id = c.id
    WHERE ad.id = p_assessment_id;

    -- Create notifications for each student
    FOREACH student_id IN ARRAY p_student_ids
    LOOP
        -- Get student user_id
        SELECT u.id as user_id
        INTO student_record
        FROM students s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = student_id;

        -- Insert notification
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            data,
            is_read,
            created_at
        ) VALUES (
            student_record.user_id,
            'grade_released',
            'New Grade Available',
            'Your grade for "' || assessment_record.assessment_name || '" in ' || assessment_record.course_code || ' has been released.',
            jsonb_build_object(
                'assessment_id', p_assessment_id,
                'assessment_name', assessment_record.assessment_name,
                'course_code', assessment_record.course_code,
                'course_name', assessment_record.course_name
            ),
            false,
            NOW()
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for when student assessment is updated
CREATE OR REPLACE FUNCTION trigger_assessment_update()
RETURNS TRIGGER AS $$
DECLARE
    course_id UUID;
    semester_id UUID;
BEGIN
    -- Get course and semester info
    SELECT ad.course_id, ad.semester_id
    INTO course_id, semester_id
    FROM assessment_definitions ad
    WHERE ad.id = NEW.assessment_definition_id;

    -- Update course result if score was added/changed
    IF NEW.score IS NOT NULL AND (OLD.score IS NULL OR NEW.score != OLD.score) THEN
        -- Update course result
        PERFORM update_course_result(NEW.student_id, course_id, semester_id);

        -- Recalculate GPA
        PERFORM calculate_and_update_gpa(NEW.student_id);

        -- Send notification if grade was just added
        IF OLD.score IS NULL THEN
            PERFORM notify_grade_release(NEW.assessment_definition_id, ARRAY[NEW.student_id]);
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for assessment updates
DROP TRIGGER IF EXISTS trigger_student_assessment_update ON student_assessments;
CREATE TRIGGER trigger_student_assessment_update
    AFTER UPDATE ON student_assessments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_assessment_update();

-- Trigger function for when course result is updated
CREATE OR REPLACE FUNCTION trigger_course_result_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculate GPA when course result changes
    PERFORM calculate_and_update_gpa(NEW.student_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for course result updates
DROP TRIGGER IF EXISTS trigger_course_result_gpa_update ON course_results;
CREATE TRIGGER trigger_course_result_gpa_update
    AFTER INSERT OR UPDATE ON course_results
    FOR EACH ROW
    EXECUTE FUNCTION trigger_course_result_update();

-- Function to create assessment deadline reminders
CREATE OR REPLACE FUNCTION create_deadline_reminders()
RETURNS VOID AS $$
DECLARE
    assessment_record RECORD;
    enrollment_record RECORD;
    tomorrow DATE := CURRENT_DATE + INTERVAL '1 day';
    day_after DATE := CURRENT_DATE + INTERVAL '2 days';
BEGIN
    -- Find assessments due in the next 1-2 days
    FOR assessment_record IN
        SELECT
            ad.id,
            ad.name,
            ad.due_date,
            c.id as course_id,
            c.name as course_name,
            c.code as course_code
        FROM assessment_definitions ad
        JOIN courses c ON ad.course_id = c.id
        WHERE ad.due_date BETWEEN tomorrow AND day_after
          AND ad.is_required = true
    LOOP
        -- Create reminders for all enrolled students
        FOR enrollment_record IN
            SELECT DISTINCT
                s.user_id
            FROM student_enrollments se
            JOIN students s ON se.student_id = s.id
            WHERE se.course_id = assessment_record.course_id
              AND se.status = 'enrolled'
        LOOP
            -- Insert deadline reminder notification
            INSERT INTO notifications (
                user_id,
                type,
                title,
                message,
                data,
                is_read,
                expires_at,
                created_at
            ) VALUES (
                enrollment_record.user_id,
                'deadline_reminder',
                'Assessment Deadline Reminder',
                '"' || assessment_record.name || '" in ' || assessment_record.course_code || ' is due on ' || assessment_record.due_date || '.',
                jsonb_build_object(
                    'assessment_id', assessment_record.id,
                    'assessment_name', assessment_record.name,
                    'course_code', assessment_record.course_code,
                    'due_date', assessment_record.due_date
                ),
                false,
                assessment_record.due_date::timestamp,
                NOW()
            );
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired notifications
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS VOID AS $$
BEGIN
    DELETE FROM notifications
    WHERE expires_at IS NOT NULL
      AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to send deadline reminders (run this manually or set up cron)
-- This would typically be run daily via a cron job or scheduled function
-- SELECT create_deadline_reminders();
-- SELECT cleanup_expired_notifications();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON notifications TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_grade_letter(DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_grade_points(grade_type) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_course_final_score(UUID, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_course_result(UUID, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_and_update_gpa(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION notify_grade_release(UUID, UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION create_deadline_reminders() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_notifications() TO authenticated;
