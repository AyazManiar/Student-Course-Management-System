import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { departmentAPI } from '../../services/api'
import { toast } from 'react-toastify'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import '../../styles/table.css'

const AdminDepartmentDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [deptData, setDeptData] = useState(null)
    const [deptLoading, setDeptLoading] = useState(true)
    
    const [users, setUsers] = useState([])
    const [usersLoading, setUsersLoading] = useState(true)
    const [usersPage, setUsersPage] = useState(1)
    const [usersPerPage] = useState(10)
    
    const [courses, setCourses] = useState([])
    const [coursesLoading, setCoursesLoading] = useState(true)
    const [coursesPage, setCoursesPage] = useState(1)
    const [coursesPerPage] = useState(10)

    useEffect(() => {
        const fetchDeptData = async () => {
            setDeptLoading(true)
            try {
                const res = await departmentAPI.getDeptById(id)
                if (res.success) {
                    setDeptData(res.data)
                    console.log('[AdminDeptDetails] Department data loaded')
                }
            } catch (error) {
                toast.error("Error fetching department")
                console.error('[AdminDeptDetails] Error fetching department:', error)
            } finally {
                setDeptLoading(false)
            }
        }

        const fetchUsers = async () => {
            setUsersLoading(true)
            try {
                const res = await departmentAPI.getUsersInDept(id)
                if (res.success) {
                    setUsers(res.data || [])
                    console.log('[AdminDeptDetails] Users loaded:', res.data?.length || 0)
                }
            } catch (error) {
                toast.error("Error fetching users")
                console.error('[AdminDeptDetails] Error fetching users:', error)
            } finally {
                setUsersLoading(false)
            }
        }

        const fetchCourses = async () => {
            setCoursesLoading(true)
            try {
                const res = await departmentAPI.getCoursesInDept(id)
                if (res.success) {
                    setCourses(res.data || [])
                    console.log('[AdminDeptDetails] Courses loaded:', res.data?.length || 0)
                }
            } catch (error) {
                toast.error("Error fetching courses")
                console.error('[AdminDeptDetails] Error fetching courses:', error)
            } finally {
                setCoursesLoading(false)
            }
        }

        fetchDeptData()
        fetchUsers()
        fetchCourses()
    }, [id])

    // Users pagination
    const usersTotalPages = Math.ceil(users.length / usersPerPage)
    const usersStartIndex = (usersPage - 1) * usersPerPage
    const usersEndIndex = usersStartIndex + usersPerPage
    const currentUsers = users.slice(usersStartIndex, usersEndIndex)

    // Courses pagination
    const coursesTotalPages = Math.ceil(courses.length / coursesPerPage)
    const coursesStartIndex = (coursesPage - 1) * coursesPerPage
    const coursesEndIndex = coursesStartIndex + coursesPerPage
    const currentCourses = courses.slice(coursesStartIndex, coursesEndIndex)

    if (deptLoading) {
        return <div className="loading">Loading...</div>
    }

    if (!deptData) {
        return (
            <div className='page-container'>
                <div className="page-header">
                    <h1 className="page-title">Department Not Found</h1>
                </div>
            </div>
        )
    }

    return (
        <div className='page-container dept-details-page'>
            <div style={{ marginBottom: '1rem' }}>
                <Button variant="secondary" onClick={() => navigate('/admin/departments')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Departments
                </Button>
            </div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Department: {deptData.name}</h1>
                    <p className="page-subtitle">Department ID: {id}</p>
                </div>
            </div>

            {/* Users Table */}
            <Card>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
                        All Users in this Department
                    </h2>
                </div>
                <div className="table-container">
                    <div className="table-wrapper">
                        <table className="table">
                            <thead className="table-head">
                                <tr>
                                    <th className="table-header">ID</th>
                                    <th className="table-header">NAME</th>
                                    <th className="table-header">ROLE</th>
                                    <th className="table-header">REGISTERED DATE</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {usersLoading ? (
                                    <tr>
                                        <td colSpan="5" className="table-cell" style={{ textAlign: 'center', padding: '2rem' }}>
                                            Loading users...
                                        </td>
                                    </tr>
                                ) : currentUsers && currentUsers.length > 0 ? (
                                    currentUsers.map((user) => (
                                        <tr 
                                            key={`${user.role}-${user.id}`} 
                                            className="table-row"
                                            onClick={() => navigate(user.role === 'student' ? `/admin/students/${user.id}` : '#')}
                                        >
                                            <td className="table-cell">{user.id}</td>
                                            <td className="table-cell">{user.name}</td>
                                            <td className="table-cell">
                                                <span 
                                                    style={{
                                                        display: 'inline-block',
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '9999px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600',
                                                        textTransform: 'uppercase',
                                                        backgroundColor: user.role === 'student' ? '#dbeafe' : '#fef3c7',
                                                        color: user.role === 'student' ? '#1e40af' : '#92400e'
                                                    }}
                                                >
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="table-cell">{new Date(user.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="table-cell" style={{ textAlign: 'center', padding: '2rem' }}>
                                            No users found in this department
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {users.length > 0 && (
                        <div className="table-pagination">
                            <div className="pagination-info">
                                Showing page {usersPage} of {usersTotalPages || 1}
                            </div>
                            <div className="pagination-controls">
                                <button
                                    onClick={() => setUsersPage(1)}
                                    disabled={usersPage === 1}
                                    className="pagination-btn"
                                >
                                    {'<<'}
                                </button>
                                <button
                                    onClick={() => setUsersPage(usersPage - 1)}
                                    disabled={usersPage === 1}
                                    className="pagination-btn"
                                >
                                    {'<'}
                                </button>
                                <span className="pagination-page">
                                    Page {usersPage} of {usersTotalPages || 1}
                                </span>
                                <button
                                    onClick={() => setUsersPage(usersPage + 1)}
                                    disabled={usersPage >= usersTotalPages}
                                    className="pagination-btn"
                                >
                                    {'>'}
                                </button>
                                <button
                                    onClick={() => setUsersPage(usersTotalPages)}
                                    disabled={usersPage >= usersTotalPages}
                                    className="pagination-btn"
                                >
                                    {'>>'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Courses Table */}
            <Card style={{ marginTop: '2rem' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
                        All Courses in this Department
                    </h2>
                </div>
                <div className="table-container">
                    <div className="table-wrapper">
                        <table className="table">
                            <thead className="table-head">
                                <tr>
                                    <th className="table-header">COURSE NAME</th>
                                    <th className="table-header">DESCRIPTION</th>
                                    <th className="table-header">TEACHER</th>
                                    <th className="table-header">ENROLLED STUDENTS</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {coursesLoading ? (
                                    <tr>
                                        <td colSpan="4" className="table-cell" style={{ textAlign: 'center', padding: '2rem' }}>
                                            Loading courses...
                                        </td>
                                    </tr>
                                ) : currentCourses && currentCourses.length > 0 ? (
                                    currentCourses.map((course) => (
                                        <tr 
                                            key={course.id} 
                                            className="table-row"
                                            onClick={() => navigate(`/admin/courses/${course.id}`)}
                                        >
                                            <td className="table-cell">{course.name}</td>
                                            <td className="table-cell">{course.description || 'N/A'}</td>
                                            <td className="table-cell">{course.teacher_name || 'Not Assigned'}</td>
                                            <td className="table-cell">{course.student_count || 0}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="table-cell" style={{ textAlign: 'center', padding: '2rem' }}>
                                            No courses found in this department
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {courses.length > 0 && (
                        <div className="table-pagination">
                            <div className="pagination-info">
                                Showing page {coursesPage} of {coursesTotalPages || 1}
                            </div>
                            <div className="pagination-controls">
                                <button
                                    onClick={() => setCoursesPage(1)}
                                    disabled={coursesPage === 1}
                                    className="pagination-btn"
                                >
                                    {'<<'}
                                </button>
                                <button
                                    onClick={() => setCoursesPage(coursesPage - 1)}
                                    disabled={coursesPage === 1}
                                    className="pagination-btn"
                                >
                                    {'<'}
                                </button>
                                <span className="pagination-page">
                                    Page {coursesPage} of {coursesTotalPages || 1}
                                </span>
                                <button
                                    onClick={() => setCoursesPage(coursesPage + 1)}
                                    disabled={coursesPage >= coursesTotalPages}
                                    className="pagination-btn"
                                >
                                    {'>'}
                                </button>
                                <button
                                    onClick={() => setCoursesPage(coursesTotalPages)}
                                    disabled={coursesPage >= coursesTotalPages}
                                    className="pagination-btn"
                                >
                                    {'>>'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}

export default AdminDepartmentDetails
