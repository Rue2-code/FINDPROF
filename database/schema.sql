CREATE DATABASE IF NOT EXISTS prof_consult CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE prof_consult;

-- ============================================================
-- USER TABLE
-- ============================================================
CREATE TABLE users (
  User_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  Username VARCHAR(50) NOT NULL UNIQUE,
  Password VARCHAR(255) NOT NULL,
  Full_name VARCHAR(150) NOT NULL,
  Email VARCHAR(190) NOT NULL UNIQUE,
  Role ENUM('student','faculty') NOT NULL,
  Account_status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- STUDENT TABLE
-- ============================================================
CREATE TABLE students (
  Student_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  Full_name VARCHAR(150) NOT NULL,
  Course_program VARCHAR(120) NOT NULL,
  Year_level VARCHAR(20) NOT NULL,
  Email_address VARCHAR(190) NOT NULL UNIQUE,
  Contact_no VARCHAR(20) NOT NULL,
  Password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- FACULTY TABLE
-- ============================================================
CREATE TABLE faculty (
  Faculty_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  Full_name VARCHAR(150) NOT NULL,
  Department VARCHAR(120) NOT NULL,
  Contact_no VARCHAR(20) NOT NULL,
  Password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- AVAILABILITY TABLE
-- ============================================================
CREATE TABLE availability (
  Availability_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  Faculty_id INT UNSIGNED NOT NULL,
  Status ENUM('available','in class','meeting','on leave','consultation','offline') NOT NULL,
  Date DATE NOT NULL,
  Time TIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_availability_faculty 
    FOREIGN KEY (Faculty_id) REFERENCES faculty(Faculty_id) ON DELETE CASCADE,
  INDEX idx_availability_faculty_date (Faculty_id, Date)
) ENGINE=InnoDB;

-- ============================================================
-- CONSULTATION TABLE
-- ============================================================
CREATE TABLE consultations (
  Request_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  Student_id INT UNSIGNED NOT NULL,
  Faculty_id INT UNSIGNED NOT NULL,
  Purpose TEXT NOT NULL,
  Request_date DATE NOT NULL,
  Preferred_time TIME NOT NULL,
  Status ENUM('pending','approve','declined','reschedule','complete') NOT NULL DEFAULT 'pending',
  Response TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_consultation_student 
    FOREIGN KEY (Student_id) REFERENCES students(Student_id) ON DELETE CASCADE,
  CONSTRAINT fk_consultation_faculty 
    FOREIGN KEY (Faculty_id) REFERENCES faculty(Faculty_id) ON DELETE CASCADE,
  INDEX idx_consultations_student (Student_id, Status),
  INDEX idx_consultations_faculty (Faculty_id, Status)
) ENGINE=InnoDB;

-- ============================================================
-- NOTIFICATION TABLE
-- ============================================================
CREATE TABLE notifications (
  Notif_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  User_id INT UNSIGNED NOT NULL,
  Message TEXT NOT NULL,
  Date_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Read_status ENUM('read','unread') NOT NULL DEFAULT 'unread',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notification_user 
    FOREIGN KEY (User_id) REFERENCES users(User_id) ON DELETE CASCADE,
  INDEX idx_notifications_user_read (User_id, Read_status)
) ENGINE=InnoDB;

-- ============================================================
-- ATTENDANCE LOG TABLE
-- ============================================================
CREATE TABLE attendance_logs (
  Log_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  Faculty_id INT UNSIGNED NOT NULL,
  Date DATE NOT NULL,
  Check_in TIME DEFAULT NULL,
  Check_out TIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_attendance_faculty 
    FOREIGN KEY (Faculty_id) REFERENCES faculty(Faculty_id) ON DELETE CASCADE,
  INDEX idx_attendance_faculty_date (Faculty_id, Date)
) ENGINE=InnoDB;

-- ============================================================
-- PASSWORD RESETS TABLE
-- ============================================================
CREATE TABLE password_resets (
  Reset_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  User_type ENUM('faculty','student') NOT NULL,
  Identifier VARCHAR(255) NOT NULL,
  Reset_code VARCHAR(6) NOT NULL,
  Reset_token VARCHAR(64) NOT NULL,
  Expires_at DATETIME NOT NULL,
  Used TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_password_resets_identifier (Identifier),
  INDEX idx_password_resets_token (Reset_token)
) ENGINE=InnoDB;