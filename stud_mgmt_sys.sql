CREATE DATABASE IF NOT EXISTS stud_mgmt_sys;
USE stud_mgmt_sys;

-- Departments 
CREATE TABLE departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Auth users
CREATE TABLE auth_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'teacher', 'admin') NOT NULL DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE students (
  id INT PRIMARY KEY,
  name VARCHAR(40) NOT NULL,
  dept_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_students_user
    FOREIGN KEY (id) REFERENCES auth_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_students_dept
    FOREIGN KEY (dept_id) REFERENCES departments(id) ON DELETE SET NULL
);
CREATE TABLE teachers (
  id INT PRIMARY KEY,
  name VARCHAR(40) NOT NULL,
  dept_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_teachers_user
    FOREIGN KEY (id) REFERENCES auth_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_teachers_dept
    FOREIGN KEY (dept_id) REFERENCES departments(id) ON DELETE SET NULL
);
CREATE TABLE admins (
  id INT PRIMARY KEY,
  name VARCHAR(40) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_admins_user
    FOREIGN KEY (id) REFERENCES auth_users(id) ON DELETE CASCADE
);

-- Courses
CREATE TABLE courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30) NOT NULL UNIQUE,
  description TEXT,
  dept_id INT NULL,
  teacher_id INT NULL,

  CONSTRAINT fk_courses_dept
    FOREIGN KEY (dept_id) REFERENCES departments(id) ON DELETE SET NULL,
  CONSTRAINT fk_courses_teacher
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
);

-- Enrollments: students <-> courses
CREATE TABLE enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_enroll_student
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_enroll_course
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,

  UNIQUE KEY uq_student_course (student_id, course_id)
);
