# Database Structure

## Overview
MySQL relational database with role-based user management and course enrollment system.

---

## Tables

### 1. `auth_users`
**Purpose:** Central authentication table for all users

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique user ID |
| `email` | VARCHAR(50) | NOT NULL, UNIQUE | User email (login) |
| `password` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `role` | ENUM('student', 'teacher', 'admin') | NOT NULL, DEFAULT 'student' | User role |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Registration date |

**Indexes:** 
- Primary: `id`
- Unique: `email`

---

### 2. `students`
**Purpose:** Student-specific profile data

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, FK → auth_users(id) | User ID reference |
| `name` | VARCHAR(40) | NOT NULL | Student full name |
| `dept_id` | INT | NULL, FK → departments(id) | Department assignment |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Profile creation date |

**Relationships:**
- `id` → `auth_users.id` (CASCADE DELETE)
- `dept_id` → `departments.id` (SET NULL on delete)

---

### 3. `teachers`
**Purpose:** Teacher-specific profile data

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, FK → auth_users(id) | User ID reference |
| `name` | VARCHAR(40) | NOT NULL | Teacher full name |
| `dept_id` | INT | NULL, FK → departments(id) | Department assignment |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Profile creation date |

**Relationships:**
- `id` → `auth_users.id` (CASCADE DELETE)
- `dept_id` → `departments.id` (SET NULL on delete)

---

### 4. `admins`
**Purpose:** Admin-specific profile data

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, FK → auth_users(id) | User ID reference |
| `name` | VARCHAR(40) | NOT NULL | Admin full name |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Profile creation date |

**Relationships:**
- `id` → `auth_users.id` (CASCADE DELETE)

---

### 5. `departments`
**Purpose:** Academic departments

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique department ID |
| `name` | VARCHAR(50) | NOT NULL, UNIQUE | Department name |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation date |

**Indexes:**
- Primary: `id`
- Unique: `name`

---

### 6. `courses`
**Purpose:** Available courses

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique course ID |
| `name` | VARCHAR(30) | NOT NULL, UNIQUE | Course name |
| `description` | TEXT | NULL | Course description |
| `dept_id` | INT | NULL, FK → departments(id) | Department offering course |
| `teacher_id` | INT | NULL, FK → teachers(id) | Assigned teacher |

**Relationships:**
- `dept_id` → `departments.id` (SET NULL on delete)
- `teacher_id` → `teachers.id` (SET NULL on delete)

**Indexes:**
- Primary: `id`
- Unique: `name`

---

### 7. `enrollments`
**Purpose:** Student-Course enrollment mapping (many-to-many)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique enrollment ID |
| `student_id` | INT | NOT NULL, FK → students(id) | Enrolled student |
| `course_id` | INT | NOT NULL, FK → courses(id) | Enrolled course |
| `enrolled_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Enrollment date |

**Relationships:**
- `student_id` → `students.id` (CASCADE DELETE)
- `course_id` → `courses.id` (CASCADE DELETE)

**Indexes:**
- Primary: `id`
- Unique: `(student_id, course_id)` - Prevents duplicate enrollments

---

## Entity Relationships

```
auth_users (1) ──── (1) students
auth_users (1) ──── (1) teachers
auth_users (1) ──── (1) admins

departments (1) ──── (N) students
departments (1) ──── (N) teachers
departments (1) ──── (N) courses

teachers (1) ──── (N) courses

students (N) ──── (N) courses  [via enrollments]
```

---

## Cascade Rules

| Parent Table | Child Table | On Delete Action |
|-------------|-------------|------------------|
| `auth_users` | `students` / `teachers` / `admins` | CASCADE |
| `departments` | `students` / `teachers` / `courses` | SET NULL |
| `teachers` | `courses` | SET NULL |
| `students` | `enrollments` | CASCADE |
| `courses` | `enrollments` | CASCADE |

---

## Key Constraints

1. **Email uniqueness:** No duplicate emails across all roles
2. **Department name uniqueness:** No duplicate department names
3. **Course name uniqueness:** No duplicate course names
4. **Enrollment uniqueness:** Student can enroll in same course only once
5. **Role inheritance:** User role in `auth_users` determines which profile table they belong to

---

## Design Patterns

### Role-Based User Model
- **Single Sign-On (SSO):** One `auth_users` entry per user
- **Profile Separation:** Role-specific data in separate tables (`students`, `teachers`, `admins`)
- **ID Reuse:** Profile tables use same ID as `auth_users` (no separate ID generation)

### Many-to-Many Relationship
- **Junction Table:** `enrollments` connects `students` and `courses`
- **Prevents Duplicates:** Unique constraint on `(student_id, course_id)`
- **Automatic Cleanup:** Cascade delete removes enrollments when student/course deleted

---

## Initialization Script

```sql
CREATE DATABASE IF NOT EXISTS stud_mgmt_sys;
USE stud_mgmt_sys;

-- See stud_mgmt_sys.sql for complete table creation
```

---

## Performance Considerations

- **Indexed Columns:** `email`, department/course names for fast lookups
- **Foreign Keys:** Ensure referential integrity
- **Connection Pooling:** Up to 10 concurrent connections configured
- **Normalized Design:** Reduces data redundancy
