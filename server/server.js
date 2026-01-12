const express = require("express")
const dotenv = require("dotenv")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const db = require("./config/db.js")

// Load environment variables
dotenv.config()

const app = express()

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Routes
const authRoutes = require("./routes/authRoutes")
const studentRoutes = require("./routes/studentRoutes")
const teacherRoutes = require("./routes/teacherRoutes")
const adminRoutes = require("./routes/adminRoutes")
const departmentRoutes = require("./routes/departmentRoutes")
const courseRoutes = require("./routes/courseRoutes")
const enrollmentRoutes = require("./routes/enrollmentRoutes")

app.use("/api/auth", authRoutes)
app.use("/api/students", studentRoutes)
app.use("/api/teachers", teacherRoutes)
app.use("/api/admins", adminRoutes)
app.use("/api/departments", departmentRoutes)
app.use("/api/courses", courseRoutes)
app.use("/api/enrollments", enrollmentRoutes)

app.get("/", (req, res) => {
    res.send("Student Course Management System API")
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server is listening on: http://localhost:${PORT}`)
})