# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All protected routes require JWT token via **HTTP-only cookie** named `token`.

---

## 🔐 Authentication APIs

### Register
```
POST /auth/register
```
**Takes:** Body (JSON)
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "student|teacher|admin",
  "dept_id": "number (optional)"
}
```
**Sends:** Cookie (`token`) + JSON
```json
{
  "success": true,
  "message": "Account registered successfully",
  "user": { "id": 1, "email": "...", "role": "...", "name": "..." }
}
```
**SQL Logic:**
```sql
-- Check existing user
SELECT id FROM auth_users WHERE email = ?

-- Insert auth record
INSERT INTO auth_users (email, password, role) VALUES (?, ?, ?)

-- Insert role-specific record
INSERT INTO students|teachers|admins (id, name, dept_id) VALUES (?, ?, ?)
```

---

### Login
```
POST /auth/login
```
**Takes:** Body (JSON)
```json
{
  "email": "string",
  "password": "string"
}
```
**Sends:** Cookie (`token`) + JSON
```json
{
  "success": true,
  "message": "Logged in successfully",
  "user": { "id": 1, "email": "...", "role": "...", "name": "..." }
}
```
**SQL Logic:**
```sql
-- Get user credentials
SELECT id, email, password, role FROM auth_users WHERE email = ?

-- Get profile data
SELECT name, dept_id FROM students|teachers|admins WHERE id = ?
```

---

### Logout
```
POST /auth/logout
```
**Takes:** Cookie (`token`)  
**Sends:** Clears cookie + JSON
```json
{ "success": true, "message": "Logged out successfully" }
```

---

### Get Current User
```
GET /auth/me
```
**Takes:** Cookie (`token`)  
**Sends:** JSON
```json
{
  "success": true,
  "user": { "id": 1, "name": "...", "email": "...", "role": "...", "dept_id": 1, "dept_name": "..." }
}
```
**SQL Logic:**
```sql
SELECT s.*, d.name as dept_name, au.email 
FROM students s 
LEFT JOIN departments d ON s.dept_id = d.id 
JOIN auth_users au ON s.id = au.id 
WHERE s.id = ?
```

---

## 👨‍🎓 Student APIs

### Get All Students
```
GET /students
```
**Takes:** Cookie (`token`) + Query (optional)
- `?dept_id=1` - Filter by department
- `?course_id=1` - Filter by enrolled course

**Sends:** JSON
```json
{
  "success": true,
  "data": [{ "id": 1, "name": "...", "dept_id": 1, "dept_name": "..." }]
}
```
**SQL Logic:**
```sql
-- Basic query
SELECT s.id, s.name, s.dept_id, d.name as dept_name 
FROM students s 
LEFT JOIN departments d ON s.dept_id = d.id

-- With course filter
SELECT DISTINCT s.id, s.name, s.dept_id, d.name as dept_name 
FROM students s 
LEFT JOIN departments d ON s.dept_id = d.id 
JOIN enrollments e ON s.id = e.student_id
WHERE e.course_id = ?
```

---

### Get Student by ID
```
GET /students/:id
```
**Takes:** Cookie (`token`) + Params (`id`)  
**Sends:** JSON (single student object)  
**SQL Logic:**
```sql
SELECT s.id, s.name, s.dept_id, d.name as dept_name
FROM students s 
LEFT JOIN departments d ON s.dept_id = d.id 
WHERE s.id = ?
```

---

### Get My Profile (Student)
```
GET /students/me/profile
```
**Takes:** Cookie (`token`)  
**Role:** Student  
**Sends:** JSON (student profile)  
**SQL Logic:**
```sql
SELECT s.id, s.name, s.dept_id, d.name as dept_name, au.email
FROM students s 
LEFT JOIN departments d ON s.dept_id = d.id
JOIN auth_users au ON au.id = s.id
WHERE s.id = ?
```

---

### Update Student Profile
```
PUT /students/me
```
**Takes:** Cookie (`token`) + Body (JSON)
```json
{
  "name": "string (optional)",
  "dept_id": "number (optional)"
}
```
**Role:** Student  
**Sends:** JSON
```json
{ "success": true, "message": "Student updated" }
```
**SQL Logic:**
```sql
UPDATE students SET name = ?, dept_id = ? WHERE id = ?
```

---

### Delete Student Account
```
DELETE /students/me
```
**Takes:** Cookie (`token`)  
**Role:** Student  
**Sends:** JSON  
**SQL Logic:**
```sql
DELETE FROM auth_users WHERE id = ?
-- Cascades to students table
```

---

## 👨‍🏫 Teacher APIs

### Get All Teachers
```
GET /teachers
```
**Takes:** Cookie (`token`) + Query (optional)
- `?dept_id=1` - Filter by department

**Sends:** JSON (array of teachers)  
**SQL Logic:**
```sql
SELECT t.id, t.name, t.dept_id, d.name as dept_name, au.email 
FROM teachers t 
LEFT JOIN departments d ON t.dept_id = d.id 
JOIN auth_users au ON t.id = au.id
```

---

### Get Teacher by ID
```
GET /teachers/:id
```
**Takes:** Cookie (`token`) + Params (`id`)  
**Sends:** JSON (single teacher)  
**SQL Logic:** Same as all teachers with `WHERE t.id = ?`

---

### Get My Profile (Teacher)
```
GET /teachers/me/profile
```
**Takes:** Cookie (`token`)  
**Role:** Teacher  
**Sends:** JSON (teacher profile)

---

### Get My Courses (Teacher)
```
GET /teachers/me/courses
```
**Takes:** Cookie (`token`)  
**Role:** Teacher  
**Sends:** JSON (courses taught)  
**SQL Logic:**
```sql
SELECT c.*, d.name as dept_name 
FROM courses c 
LEFT JOIN departments d ON c.dept_id = d.id 
WHERE c.teacher_id = ?
```

---

### Update Teacher Profile
```
PUT /teachers/me
```
**Takes:** Cookie (`token`) + Body (JSON)
```json
{
  "name": "string (optional)",
  "dept_id": "number (optional)"
}
```
**Role:** Teacher  
**SQL Logic:**
```sql
UPDATE teachers SET name = ?, dept_id = ? WHERE id = ?
```

---

### Delete Teacher
```
DELETE /teachers/:id
```
**Takes:** Cookie (`token`) + Params (`id`)  
**Role:** Admin  
**SQL Logic:**
```sql
DELETE FROM auth_users WHERE id = ?
```

---

## 👨‍💼 Admin APIs

### Get All Admins
```
GET /admins
```
**Takes:** Cookie (`token`)  
**Role:** Admin  
**SQL Logic:**
```sql
SELECT a.id, a.name, au.email, a.created_at 
FROM admins a 
JOIN auth_users au ON a.id = au.id
```

---

### Get Admin by ID
```
GET /admins/:id
```
**Takes:** Cookie (`token`) + Params (`id`)  
**Role:** Admin  
**SQL Logic:** Same as all admins with `WHERE a.id = ?`

---

### Get My Profile (Admin)
```
GET /admins/me/profile
```
**Takes:** Cookie (`token`)  
**Role:** Admin

---

### Get System Statistics
```
GET /admins/stats
```
**Takes:** Cookie (`token`)  
**Role:** Admin  
**Sends:** JSON
```json
{
  "success": true,
  "data": {
    "students": 50,
    "teachers": 10,
    "courses": 25,
    "departments": 5,
    "enrollments": 120
  }
}
```
**SQL Logic:**
```sql
SELECT COUNT(*) as count FROM students
SELECT COUNT(*) as count FROM teachers
SELECT COUNT(*) as count FROM courses
SELECT COUNT(*) as count FROM departments
SELECT COUNT(*) as count FROM enrollments
```

---

### Update Admin Profile
```
PUT /admins/me
```
**Takes:** Cookie (`token`) + Body (JSON)
```json
{ "name": "string" }
```
**Role:** Admin  
**SQL Logic:**
```sql
UPDATE admins SET name = ? WHERE id = ?
```

---

### Delete Admin
```
DELETE /admins/:id
```
**Takes:** Cookie (`token`) + Params (`id`)  
**Role:** Admin  
**SQL Logic:**
```sql
DELETE FROM auth_users WHERE id = ? AND role = 'admin'
```

---

## 🏢 Department APIs

### Get All Departments
```
GET /departments
```
**Takes:** Cookie (`token`)  
**SQL Logic:**
```sql
SELECT * FROM departments
```

---

### Get Department by ID
```
GET /departments/:id
```
**Takes:** Cookie (`token`) + Params (`id`)  
**SQL Logic:**
```sql
SELECT * FROM departments WHERE id = ?
```

---

### Add Department
```
POST /departments
```
**Takes:** Cookie (`token`) + Body (JSON)
```json
{ "name": "string" }
```
**Role:** Admin  
**SQL Logic:**
```sql
INSERT INTO departments (name) VALUES (?)
```

---

### Update Department
```
PUT /departments/:id
```
**Takes:** Cookie (`token`) + Params (`id`) + Body (JSON)
```json
{ "name": "string" }
```
**Role:** Admin  
**SQL Logic:**
```sql
UPDATE departments SET name = ? WHERE id = ?
```

---

### Delete Department
```
DELETE /departments/:id
```
**Takes:** Cookie (`token`) + Params (`id`)  
**Role:** Admin  
**SQL Logic:**
```sql
DELETE FROM departments WHERE id = ?
```

---

## 📚 Course APIs

### Get All Courses
```
GET /courses
```
**Takes:** Cookie (`token`) + Query (optional)
- `?dept_id=1` - Filter by department
- `?teacher_id=1` - Filter by teacher

**SQL Logic:**
```sql
SELECT c.*, d.name as dept_name, t.name as teacher_name 
FROM courses c 
LEFT JOIN departments d ON c.dept_id = d.id 
LEFT JOIN teachers t ON c.teacher_id = t.id
```

---

### Get Course by ID
```
GET /courses/:id
```
**Takes:** Cookie (`token`) + Params (`id`)  
**SQL Logic:** Same as all courses with `WHERE c.id = ?`

---

### Add Course
```
POST /courses
```
**Takes:** Cookie (`token`) + Body (JSON)
```json
{
  "name": "string",
  "description": "string (optional)",
  "dept_id": "number (optional)",
  "teacher_id": "number (optional)"
}
```
**Role:** Admin, Teacher  
**SQL Logic:**
```sql
INSERT INTO courses (name, description, dept_id, teacher_id) 
VALUES (?, ?, ?, ?)
```

---

### Update Course
```
PUT /courses/:id
```
**Takes:** Cookie (`token`) + Params (`id`) + Body (JSON)
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "dept_id": "number (optional)",
  "teacher_id": "number (optional)"
}
```
**Role:** Admin, Teacher  
**SQL Logic:**
```sql
UPDATE courses 
SET name = ?, description = ?, dept_id = ?, teacher_id = ? 
WHERE id = ?
```

---

### Delete Course
```
DELETE /courses/:id
```
**Takes:** Cookie (`token`) + Params (`id`)  
**Role:** Admin  
**SQL Logic:**
```sql
DELETE FROM courses WHERE id = ?
```

---

## 📝 Enrollment APIs

### Get All Enrollments
```
GET /enrollments
```
**Takes:** Cookie (`token`)  
**Role:** Admin  
**SQL Logic:**
```sql
SELECT e.id, e.student_id, s.name as student_name, 
       e.course_id, c.name as course_name, e.enrolled_at
FROM enrollments e
JOIN students s ON e.student_id = s.id
JOIN courses c ON e.course_id = c.id
ORDER BY e.enrolled_at DESC
```

---

### Get My Enrolled Courses
```
GET /enrollments/my-courses
```
**Takes:** Cookie (`token`)  
**Role:** Student  
**SQL Logic:**
```sql
SELECT c.*, d.name as dept_name, t.name as teacher_name, e.enrolled_at 
FROM enrollments e
JOIN courses c ON e.course_id = c.id
LEFT JOIN departments d ON c.dept_id = d.id
LEFT JOIN teachers t ON c.teacher_id = t.id
WHERE e.student_id = ?
```

---

### Enroll in Course
```
POST /enrollments/enroll
```
**Takes:** Cookie (`token`) + Body (JSON)
```json
{ "course_id": "number" }
```
**Role:** Student  
**SQL Logic:**
```sql
-- Check course exists
SELECT id FROM courses WHERE id = ?

-- Check not already enrolled
SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?

-- Enroll
INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)
```

---

### Unenroll from Course
```
DELETE /enrollments/unenroll
```
**Takes:** Cookie (`token`) + Body (JSON)
```json
{ "course_id": "number" }
```
**Role:** Student  
**SQL Logic:**
```sql
DELETE FROM enrollments WHERE student_id = ? AND course_id = ?
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation description",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Common SQL Patterns

### JOIN Pattern
```sql
-- Get related data
LEFT JOIN departments d ON table.dept_id = d.id
```

### Filter Pattern
```sql
-- Optional filters
WHERE column = ? (if query param provided)
```

### Update Pattern
```sql
-- Dynamic updates
UPDATE table SET col1 = ?, col2 = ? WHERE id = ?
```

### Cascade Delete Pattern
```sql
-- Delete from parent (cascades to children)
DELETE FROM auth_users WHERE id = ?
```
