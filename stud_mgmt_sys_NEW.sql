USE stud_mgmt_sys;

--  dasdasdadasdad

CREATE TABLE auth_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('student','teacher','admin') NOT NULL DEFAULT 'student',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  auth_id INT NOT NULL UNIQUE,
  name VARCHAR(40),
  dept_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  KEY fk_students_dept (dept_id),
  CONSTRAINT fk_students_auth
    FOREIGN KEY (auth_id)
    REFERENCES auth_users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_students_dept
    FOREIGN KEY (dept_id)
    REFERENCES departments (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);
CREATE TABLE teachers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  auth_id INT NOT NULL UNIQUE,
  name VARCHAR(40) NOT NULL,
  dept_id INT DEFAULT NULL,
  created_at TIMESTAMP  DEFAULT CURRENT_TIMESTAMP,
  
  KEY fk_teachers_dept (dept_id),
  CONSTRAINT fk_teachers_auth
    FOREIGN KEY (auth_id)
    REFERENCES auth_users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_teachers_dept
    FOREIGN KEY (dept_id)
    REFERENCES departments (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);
CREATE TABLE admins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  auth_id INT NOT NULL UNIQUE,
  name VARCHAR(40) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_admins_auth
    FOREIGN KEY (auth_id)
    REFERENCES auth_users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
CREATE TABLE courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(30) NOT NULL UNIQUE,
  description TEXT,
  dept_id INT DEFAULT NULL,
  teacher_id INT DEFAULT NULL,
  KEY fk_courses_dept (dept_id),
  KEY fk_courses_teacher (teacher_id),
  CONSTRAINT fk_courses_dept
    FOREIGN KEY (dept_id)
    REFERENCES departments (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT fk_courses_teacher
    FOREIGN KEY (teacher_id)
    REFERENCES teachers (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);
CREATE TABLE enrollments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  enrolled_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_student_course (student_id, course_id),
  KEY fk_enroll_course (course_id),
  CONSTRAINT fk_enroll_student
    FOREIGN KEY (student_id)
    REFERENCES students (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_enroll_course
    FOREIGN KEY (course_id)
    REFERENCES courses (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);


