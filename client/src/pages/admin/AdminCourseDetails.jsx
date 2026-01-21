import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { courseAPI } from '../../services/api.js';
import { toast } from 'react-toastify';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import '../../styles/table.css';

const AdminCourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState({})
  const [courseDataLoading, setCourseDataLoading] = useState(true)

  const [enrolledStudents, setEnrolledStudents] = useState([])
  const [studentsLoading, setStudentsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchCourseData = async () => {
      setCourseDataLoading(true)
      try {
        const res = await courseAPI.getById(id)
        if (!res.success) {
          toast.error("Failed to fetch course data")
          console.log("Failed to fetch course data, Error: " + res.message);
          return
        }
        console.log("Course data fetched successfully")
        setCourseData(res.data || {})
      } catch (error) {
        console.log('Failed to fetch course data, Error: ' + error)
        toast.error('Failed to fetch course data');
      } finally {
        setCourseDataLoading(false)
      }
    }

    const fetchEnrolledStudents = async () => {
      setStudentsLoading(true)
      try {
        const res = await courseAPI.getStudentsInCourse(id)
        if (!res.success) {
          toast.error("Failed to fetch enrolled students")
          console.log("Failed to fetch enrolled students, Error: " + res.message);
          return
        }
        console.log("Enrolled students fetched successfully")
        setEnrolledStudents(res.data || [])
      } catch (error) {
        console.log('Failed to fetch enrolled students, Error: ' + error)
        toast.error('Failed to fetch enrolled students');
      } finally {
        setStudentsLoading(false)
      }
    }

    fetchCourseData()
    fetchEnrolledStudents()
  }, [id])

  // Calculate pagination
  const totalPages = Math.ceil(enrolledStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = enrolledStudents.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (courseDataLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className='page-container course-details-page'>
      <div style={{ marginBottom: '1rem' }}>
        <Button variant="secondary" onClick={() => navigate('/admin/courses')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Courses
        </Button>
      </div>
      <div className="page-header">
        <div>
          <h1 className='page-title'>Course: {courseData.name}</h1>
          <div className='page-subtitle-2'>
            <div>
              <svg viewBox="0 0 24 24" fill="none" stroke="#1a73e8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h3>Teacher: {courseData.teacher_name || 'Not Assigned'}</h3>
            </div>
          </div>
        </div>
        <div className="enroll-students">
          <Button variant="secondary" onClick={() => navigate(`/admin/courses/${id}/unenroll`, { state: { courseData } })}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Unenroll Students
          </Button>
          <Button variant="primary" onClick={() => navigate(`/admin/courses/${id}/enroll`, { state: { courseData } })}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Enroll Student
          </Button>
        </div>
      </div>

      <Card>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
            All Students Enrolled in this Course
          </h2>
        </div>
        <div className="table-container">
          <div className="table-wrapper">
            <table className="table">
              <thead className="table-head">
                <tr>
                  <th className="table-header">STUDENT ID</th>
                  <th className="table-header">STUDENT NAME</th>
                  <th className="table-header">DEPARTMENT</th>
                  <th className="table-header">ENROLLED DATE</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {studentsLoading ? (
                  <tr>
                    <td colSpan="5" className="table-cell" style={{ textAlign: 'center', padding: '2rem' }}>
                      Loading students...
                    </td>
                  </tr>
                ) : currentStudents && currentStudents.length > 0 ? (
                  currentStudents.map((student) => (
                    <tr 
                      key={student.id} 
                      className="table-row"
                      onClick={() => navigate(`/admin/students/${student.id}`)}
                    >
                      <td className="table-cell">{student.id}</td>
                      <td className="table-cell">{student.name}</td>
                      <td className="table-cell">{student.dept_name || 'Not Assigned'}</td>
                      <td className="table-cell">{new Date(student.enrolled_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="table-cell" style={{ textAlign: 'center', padding: '2rem' }}>
                      No students enrolled in this course
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {enrolledStudents.length > 0 && (
            <div className="table-pagination">
              <div className="pagination-info">
                Showing page {currentPage} of {totalPages || 1}
              </div>
              <div className="pagination-controls">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  {'<<'}
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  {'<'}
                </button>
                <span className="pagination-page">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="pagination-btn"
                >
                  {'>'}
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage >= totalPages}
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

export default AdminCourseDetails
