const db = require("./config/db.js");
const bcrypt = require("bcrypt");

// Sample data with hashed passwords
const seedData = async () => {
    try {
        console.log("Starting to seed data...");

        // Clear existing data (in reverse order due to foreign keys)
        console.log("Clearing existing data...");
        await db.query("DELETE FROM enrollments");
        await db.query("DELETE FROM courses");
        await db.query("DELETE FROM students");
        await db.query("DELETE FROM teachers");
        await db.query("DELETE FROM admins");
        await db.query("DELETE FROM auth_users");
        await db.query("DELETE FROM departments");
        
        // Reset auto-increment
        await db.query("ALTER TABLE departments AUTO_INCREMENT = 1");
        await db.query("ALTER TABLE auth_users AUTO_INCREMENT = 1");
        await db.query("ALTER TABLE courses AUTO_INCREMENT = 1");
        await db.query("ALTER TABLE enrollments AUTO_INCREMENT = 1");

        // 1. Insert Departments
        console.log("Inserting departments...");
        const departments = [
            ['Computer Science'],
            ['Mathematics'],
            ['Physics'],
            ['Chemistry'],
            ['Biology']
        ];
        
        for (const dept of departments) {
            await db.query("INSERT INTO departments (name) VALUES (?)", dept);
        }
        console.log(`✓ Inserted ${departments.length} departments`);

        // 2. Hash a common password for all sample users
        const commonPassword = await bcrypt.hash("password123", 10);
        
        // 3. Insert Admin Users
        console.log("Inserting admin users...");
        const admins = [
            { email: 'admin@college.edu', password: commonPassword, name: 'John Admin' },
            { email: 'admin2@college.edu', password: commonPassword, name: 'Sarah Admin' }
        ];

        for (const admin of admins) {
            const [authResult] = await db.query(
                "INSERT INTO auth_users (email, password, role) VALUES (?, ?, 'admin')",
                [admin.email, admin.password]
            );
            await db.query(
                "INSERT INTO admins (id, name) VALUES (?, ?)",
                [authResult.insertId, admin.name]
            );
        }
        console.log(`✓ Inserted ${admins.length} admins`);

        // 4. Insert Teachers
        console.log("Inserting teachers...");
        const teachers = [
            { email: 'teacher.cs1@college.edu', password: commonPassword, name: 'Dr. Robert Smith', dept_id: 1 },
            { email: 'teacher.cs2@college.edu', password: commonPassword, name: 'Dr. Emily Johnson', dept_id: 1 },
            { email: 'teacher.math@college.edu', password: commonPassword, name: 'Prof. Michael Brown', dept_id: 2 },
            { email: 'teacher.physics@college.edu', password: commonPassword, name: 'Dr. Lisa Anderson', dept_id: 3 },
            { email: 'teacher.chem@college.edu', password: commonPassword, name: 'Prof. David Wilson', dept_id: 4 },
            { email: 'teacher.bio@college.edu', password: commonPassword, name: 'Dr. Maria Garcia', dept_id: 5 }
        ];

        for (const teacher of teachers) {
            const [authResult] = await db.query(
                "INSERT INTO auth_users (email, password, role) VALUES (?, ?, 'teacher')",
                [teacher.email, teacher.password]
            );
            await db.query(
                "INSERT INTO teachers (id, name, dept_id) VALUES (?, ?, ?)",
                [authResult.insertId, teacher.name, teacher.dept_id]
            );
        }
        console.log(`✓ Inserted ${teachers.length} teachers`);

        // 5. Insert Students
        console.log("Inserting students...");
        const students = [
            // Computer Science students
            { email: 'alice.jones@student.edu', password: commonPassword, name: 'Alice Jones', dept_id: 1 },
            { email: 'bob.miller@student.edu', password: commonPassword, name: 'Bob Miller', dept_id: 1 },
            { email: 'carol.davis@student.edu', password: commonPassword, name: 'Carol Davis', dept_id: 1 },
            { email: 'david.moore@student.edu', password: commonPassword, name: 'David Moore', dept_id: 1 },
            // Mathematics students
            { email: 'emma.taylor@student.edu', password: commonPassword, name: 'Emma Taylor', dept_id: 2 },
            { email: 'frank.thomas@student.edu', password: commonPassword, name: 'Frank Thomas', dept_id: 2 },
            { email: 'grace.white@student.edu', password: commonPassword, name: 'Grace White', dept_id: 2 },
            // Physics students
            { email: 'henry.martin@student.edu', password: commonPassword, name: 'Henry Martin', dept_id: 3 },
            { email: 'iris.lee@student.edu', password: commonPassword, name: 'Iris Lee', dept_id: 3 },
            // Chemistry students
            { email: 'jack.harris@student.edu', password: commonPassword, name: 'Jack Harris', dept_id: 4 },
            { email: 'kate.clark@student.edu', password: commonPassword, name: 'Kate Clark', dept_id: 4 },
            // Biology students
            { email: 'liam.lewis@student.edu', password: commonPassword, name: 'Liam Lewis', dept_id: 5 },
            { email: 'mia.walker@student.edu', password: commonPassword, name: 'Mia Walker', dept_id: 5 },
            // Students without department
            { email: 'noah.hall@student.edu', password: commonPassword, name: 'Noah Hall', dept_id: null },
            { email: 'olivia.allen@student.edu', password: commonPassword, name: 'Olivia Allen', dept_id: null }
        ];

        for (const student of students) {
            const [authResult] = await db.query(
                "INSERT INTO auth_users (email, password, role) VALUES (?, ?, 'student')",
                [student.email, student.password]
            );
            await db.query(
                "INSERT INTO students (id, name, dept_id) VALUES (?, ?, ?)",
                [authResult.insertId, student.name, student.dept_id]
            );
        }
        console.log(`✓ Inserted ${students.length} students`);

        // 6. Get teacher IDs for course assignment
        const [teacherIds] = await db.query("SELECT id FROM teachers ORDER BY id");

        // 7. Insert Courses
        console.log("Inserting courses...");
        const courses = [
            // Computer Science courses
            { name: 'Introduction to Programming', description: 'Learn the basics of programming using Python', dept_id: 1, teacher_id: teacherIds[0].id },
            { name: 'Data Structures', description: 'Study of data organization and manipulation', dept_id: 1, teacher_id: teacherIds[0].id },
            { name: 'Database Systems', description: 'Design and implementation of database systems', dept_id: 1, teacher_id: teacherIds[1].id },
            { name: 'Web Development', description: 'Full-stack web development with modern frameworks', dept_id: 1, teacher_id: teacherIds[1].id },
            
            // Mathematics courses
            { name: 'Calculus I', description: 'Differential and integral calculus', dept_id: 2, teacher_id: teacherIds[2].id },
            { name: 'Linear Algebra', description: 'Vector spaces, matrices, and linear transformations', dept_id: 2, teacher_id: teacherIds[2].id },
            { name: 'Discrete Mathematics', description: 'Logic, sets, functions, and graph theory', dept_id: 2, teacher_id: teacherIds[2].id },
            
            // Physics courses
            { name: 'Classical Mechanics', description: 'Newton\'s laws and motion', dept_id: 3, teacher_id: teacherIds[3].id },
            { name: 'Electromagnetism', description: 'Electric and magnetic fields and waves', dept_id: 3, teacher_id: teacherIds[3].id },
            
            // Chemistry courses
            { name: 'Organic Chemistry', description: 'Study of carbon-based compounds', dept_id: 4, teacher_id: teacherIds[4].id },
            { name: 'Inorganic Chemistry', description: 'Study of inorganic compounds and reactions', dept_id: 4, teacher_id: teacherIds[4].id },
            
            // Biology courses
            { name: 'Cell Biology', description: 'Structure and function of cells', dept_id: 5, teacher_id: teacherIds[5].id },
            { name: 'Genetics', description: 'Heredity and variation in organisms', dept_id: 5, teacher_id: teacherIds[5].id }
        ];

        for (const course of courses) {
            await db.query(
                "INSERT INTO courses (name, description, dept_id, teacher_id) VALUES (?, ?, ?, ?)",
                [course.name, course.description, course.dept_id, course.teacher_id]
            );
        }
        console.log(`✓ Inserted ${courses.length} courses`);

        // 8. Get student and course IDs for enrollments
        const [studentIds] = await db.query("SELECT id FROM students ORDER BY id");
        const [courseIds] = await db.query("SELECT id FROM courses ORDER BY id");

        // 9. Insert Enrollments
        console.log("Inserting enrollments...");
        const enrollments = [
            // CS students enrolled in CS and Math courses
            { student_id: studentIds[0].id, course_id: courseIds[0].id }, // Alice - Intro to Programming
            { student_id: studentIds[0].id, course_id: courseIds[1].id }, // Alice - Data Structures
            { student_id: studentIds[0].id, course_id: courseIds[4].id }, // Alice - Calculus I
            
            { student_id: studentIds[1].id, course_id: courseIds[0].id }, // Bob - Intro to Programming
            { student_id: studentIds[1].id, course_id: courseIds[2].id }, // Bob - Database Systems
            { student_id: studentIds[1].id, course_id: courseIds[5].id }, // Bob - Linear Algebra
            
            { student_id: studentIds[2].id, course_id: courseIds[1].id }, // Carol - Data Structures
            { student_id: studentIds[2].id, course_id: courseIds[3].id }, // Carol - Web Development
            
            { student_id: studentIds[3].id, course_id: courseIds[0].id }, // David - Intro to Programming
            { student_id: studentIds[3].id, course_id: courseIds[3].id }, // David - Web Development
            
            // Math students enrolled in Math courses
            { student_id: studentIds[4].id, course_id: courseIds[4].id }, // Emma - Calculus I
            { student_id: studentIds[4].id, course_id: courseIds[5].id }, // Emma - Linear Algebra
            { student_id: studentIds[4].id, course_id: courseIds[6].id }, // Emma - Discrete Math
            
            { student_id: studentIds[5].id, course_id: courseIds[4].id }, // Frank - Calculus I
            { student_id: studentIds[5].id, course_id: courseIds[6].id }, // Frank - Discrete Math
            
            { student_id: studentIds[6].id, course_id: courseIds[5].id }, // Grace - Linear Algebra
            { student_id: studentIds[6].id, course_id: courseIds[6].id }, // Grace - Discrete Math
            
            // Physics students
            { student_id: studentIds[7].id, course_id: courseIds[7].id }, // Henry - Classical Mechanics
            { student_id: studentIds[7].id, course_id: courseIds[8].id }, // Henry - Electromagnetism
            { student_id: studentIds[7].id, course_id: courseIds[4].id }, // Henry - Calculus I
            
            { student_id: studentIds[8].id, course_id: courseIds[7].id }, // Iris - Classical Mechanics
            { student_id: studentIds[8].id, course_id: courseIds[4].id }, // Iris - Calculus I
            
            // Chemistry students
            { student_id: studentIds[9].id, course_id: courseIds[9].id },  // Jack - Organic Chemistry
            { student_id: studentIds[9].id, course_id: courseIds[10].id }, // Jack - Inorganic Chemistry
            
            { student_id: studentIds[10].id, course_id: courseIds[9].id }, // Kate - Organic Chemistry
            
            // Biology students
            { student_id: studentIds[11].id, course_id: courseIds[11].id }, // Liam - Cell Biology
            { student_id: studentIds[11].id, course_id: courseIds[12].id }, // Liam - Genetics
            
            { student_id: studentIds[12].id, course_id: courseIds[11].id }, // Mia - Cell Biology
        ];

        for (const enrollment of enrollments) {
            await db.query(
                "INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)",
                [enrollment.student_id, enrollment.course_id]
            );
        }
        console.log(`✓ Inserted ${enrollments.length} enrollments`);

        console.log("\n✅ Database seeded successfully!");
        console.log("\n📋 Sample Login Credentials:");
        console.log("━".repeat(50));
        console.log("\n👨‍💼 Admin:");
        console.log("   Email: admin@college.edu");
        console.log("   Password: password123\n");
        console.log("👨‍🏫 Teacher:");
        console.log("   Email: teacher.cs1@college.edu");
        console.log("   Password: password123\n");
        console.log("👨‍🎓 Student:");
        console.log("   Email: alice.jones@student.edu");
        console.log("   Password: password123\n");
        console.log("━".repeat(50));
        console.log("\nNote: All passwords are hashed using bcrypt with 10 salt rounds");

        process.exit(0);
    } catch (error) {
        console.error("Error seeding data:", error);
        process.exit(1);
    }
};

// Run the seed function
seedData();
