# Student Course Management System - Backend

RESTful API for managing students, teachers, courses, departments, and enrollments.

---

## 📚 Documentation

- **[Database Structure](Database.md)** - Complete database schema and relationships
- **[API Reference](APIs.md)** - All endpoints with request/response details

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env` file:
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=stud_mgmt_sys

JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:5173
```

### 3. Setup Database
```bash
mysql -u root -p < ../stud_mgmt_sys.sql
```

### 4. Start Server
```bash
node server.js
```

Server runs at: `http://localhost:3000`

---

## 📦 Dependencies

```json
{
  "express": "^5.x",
  "mysql2": "^3.x",
  "bcrypt": "^5.x",
  "jsonwebtoken": "^9.x",
  "cookie-parser": "^1.x",
  "dotenv": "^17.x",
  "cors": "^2.x"
}
```

---

## 🗂️ Project Structure

```
server/
├── config/
│   └── db.js                 # Database connection
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── studentController.js  # Student operations
│   ├── teacherController.js  # Teacher operations
│   ├── adminController.js    # Admin operations
│   ├── courseController.js   # Course operations
│   ├── deptController.js     # Department operations
│   └── stu_courseController.js # Enrollment operations
├── middleware/
│   └── authMiddleware.js     # JWT & role authorization
├── routes/
│   ├── authRoutes.js         # /api/auth
│   ├── studentRoutes.js      # /api/students
│   ├── teacherRoutes.js      # /api/teachers
│   ├── adminRoutes.js        # /api/admins
│   ├── courseRoutes.js       # /api/courses
│   ├── departmentRoutes.js   # /api/departments
│   └── enrollmentRoutes.js   # /api/enrollments
├── server.js                 # Express app entry point
├── .env                      # Environment variables
└── package.json
```

---

## 🔐 Authentication

- **JWT tokens** stored in HTTP-only cookies
- **Role-based access control:** Student, Teacher, Admin
- **Token expiry:** 24 hours

---

## 🎯 Core Features

### Students
- Register account, login, logout
- View/update profile
- Enroll/unenroll in courses
- View enrolled courses

### Teachers
- Manage profile
- View assigned courses
- Create/update courses

### Admins
- Manage users (students, teachers, admins)
- Manage departments and courses
- View system statistics
- View all enrollments

---

## 🗄️ Database Overview

**Tables:** 7  
**Relationships:** Role-based user model with many-to-many enrollments

Key tables:
- `auth_users` - Authentication
- `students`, `teachers`, `admins` - User profiles
- `departments` - Academic departments
- `courses` - Available courses
- `enrollments` - Student-course mapping

See [Database.md](Database.md) for complete schema.

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Resources
- `/api/students` - Student CRUD
- `/api/teachers` - Teacher CRUD
- `/api/admins` - Admin CRUD
- `/api/departments` - Department CRUD
- `/api/courses` - Course CRUD
- `/api/enrollments` - Enrollment operations

See [APIs.md](APIs.md) for complete endpoint documentation.

---

## 🔒 Security Features

- Password hashing with bcrypt
- HTTP-only cookies for JWT
- Role-based authorization middleware
- SQL injection prevention (parameterized queries)
- CORS configuration

---

## 🧪 Testing

Test with **Postman**, **Thunder Client**, or **cURL**:

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"pass123","role":"student"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"john@test.com","password":"pass123"}'

# Get profile
curl http://localhost:3000/api/auth/me -b cookies.txt
```

---

## 📋 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `DB_HOST` | Database host | `localhost` |
| `DB_USER` | Database user | `root` |
| `DB_PASSWORD` | Database password | `password` |
| `DB_NAME` | Database name | `stud_mgmt_sys` |
| `JWT_SECRET` | JWT signing key | `secret_key` |
| `CLIENT_URL` | Frontend URL | `http://localhost:5173` |

---

## 🐛 Error Handling

All errors return:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common status codes: `400`, `401`, `403`, `404`, `500`

---

## 📝 License

MIT

---

**Version:** 1.0.0  
**Created:** January 2026
