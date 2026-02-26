-- Digital Attendance Management System - Database Schema
-- This file contains the SQL schema for MySQL

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
    phone VARCHAR(20),
    is_active TINYINT(1) DEFAULT 1,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(50) NOT NULL,
    section VARCHAR(20) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_class (name, section, academic_year)
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    roll_number VARCHAR(50) NOT NULL,
    class_id CHAR(36) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    address TEXT,
    parent_name VARCHAR(200),
    parent_phone VARCHAR(20),
    parent_email VARCHAR(255),
    admission_date DATE DEFAULT (CURRENT_DATE),
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_roll (roll_number, class_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id)
);

-- Teacher Assignments table
CREATE TABLE IF NOT EXISTS teacher_assignments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    teacher_id CHAR(36) NOT NULL,
    class_id CHAR(36) NOT NULL,
    subject_id CHAR(36),
    academic_year VARCHAR(20) NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_assignment (teacher_id, class_id, subject_id, academic_year),
    FOREIGN KEY (teacher_id) REFERENCES users(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id CHAR(36) NOT NULL,
    class_id CHAR(36) NOT NULL,
    subject_id CHAR(36),
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late')),
    marked_by CHAR(36) NOT NULL,
    remarks TEXT,
    is_edited TINYINT(1) DEFAULT 0,
    edited_by CHAR(36),
    edited_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_attendance (student_id, class_id, subject_id, date),
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (marked_by) REFERENCES users(id),
    FOREIGN KEY (edited_by) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_students_user ON students(user_id);
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_class ON attendance(class_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_class_date ON attendance(class_id, date);
CREATE INDEX idx_teacher_assignments_teacher ON teacher_assignments(teacher_id);
CREATE INDEX idx_teacher_assignments_class ON teacher_assignments(class_id);

-- Insert default admin user (password: admin123)
-- Note: In production, use a secure password and bcrypt hash
INSERT IGNORE INTO users (first_name, last_name, email, password, role)
VALUES ('Admin', 'User', 'admin@school.edu', '$2a$10$YourHashedPasswordHere', 'admin');

-- Sample data (optional - uncomment to insert)
/*
-- Insert sample classes
INSERT INTO classes (name, section, academic_year) VALUES
('Class 10', 'A', '2024-2025'),
('Class 10', 'B', '2024-2025'),
('Class 9', 'A', '2024-2025');

-- Insert sample subjects
INSERT INTO subjects (name, code, description) VALUES
('Mathematics', 'MATH101', 'Basic Mathematics'),
('Science', 'SCI101', 'General Science'),
('English', 'ENG101', 'English Language');
*/
