import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { studentAPI, enrollmentAPI, courseAPI } from '../../services/api.js';
import { toast } from 'react-toastify';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import '../../styles/table.css';


const AdminStudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [studData, setStudData] = useState({})
  const [studDataLoading, setStudDataLoading] = useState(true)

  const [studEnrolls, setStudEnrolls] = useState([])
  const [studEnrollLoading, setStudEnrollLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  useEffect(()=>{
    const fetchStudEnrolls = async () => {
      setStudEnrollLoading(true)
      try {
        const res = await enrollmentAPI.getEnrolledCoursesOfSpecificStudent({ id })
        if(!res.success) {
          toast.error("Server Failed enrolled Courses of spcific student")
          console.log("Server Failed enrolled Courses of spcific student, Error: "+res.message);
          return
        }
        console.log("All enrolls of students fetched successfull")
        setStudEnrolls(res.data || [])
      } catch (error) {
        console.log('Failed to fetch student enrollments, Error: '+error)
        toast.error('Failed to fetch student enrollments');
      } finally {
        setStudEnrollLoading(false)
      }
    }
    const fetchStudData = async ()=> {
      setStudDataLoading(true)
      try {
        const res = await studentAPI.getAnotherStudById({id})
        if(!res.success) {
          toast.error("Server failed to fetch student data")
          console.log("Server failed to fetch student data, Error: "+res.message);
          return
        }
        console.log("All enrolls of students fetched successfull")
        setStudData(res.data || [])
      } catch (error) {
        console.log('Failed to fetch student data, Error: '+error)
        toast.error('Failed to fetch student data');
      } finally {
        setStudDataLoading(false)
      }
    }

    fetchStudData()
    fetchStudEnrolls()
  }, [id])

  const fetchCourses = async () => {
    setCoursesLoading(true);
    try {
      const res = await courseAPI.getAll();
      setCourses(res.data || []);
      console.log('[AdminStudentDetails] Courses loaded:', res.data?.length || 0);
    } catch (error) {
      console.error('[AdminStudentDetails] Failed to fetch courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleEnrollStudent = () => {
    setShowEnrollModal(true);
    fetchCourses();
  };

  const handleSubmitEnrollment = async (e) => {
    e.preventDefault();
    if (!selectedCourse) {
      toast.error('Please select a course');
      return;
    }
    setEnrolling(true);
    try {
      console.log('[AdminStudentDetails] Enrolling student:', id, 'in course:', selectedCourse);
      await enrollmentAPI.enrollOtherInCourse({
        student_id: id,
        course_id: selectedCourse,
      });
      toast.success('Student enrolled successfully!');
      setShowEnrollModal(false);
      setSelectedCourse('');
      // Refresh enrollments
      const res = await enrollmentAPI.getEnrolledCoursesOfSpecificStudent({ id });
      setStudEnrolls(res.data || []);
    } catch (error) {
      console.error('[AdminStudentDetails] Enrollment failed:', error);
      toast.error('Failed to enroll student - ' + (error.message || 'Please try again'));
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async (enrollmentId, courseName) => {
    const cnfrm = confirm(`Are you sure you want to unenroll this student from "${courseName}"?`);
    if (!cnfrm) return;

    try {
      console.log('[AdminStudentDetails] Unenrolling enrollment ID:', enrollmentId);
      await enrollmentAPI.unenrollOther({ enrollId: enrollmentId });
      setStudEnrolls((prev) => prev.filter((e) => e.id !== enrollmentId));
      toast.success('Student unenrolled successfully!');
    } catch (error) {
      console.error('[AdminStudentDetails] Unenrollment failed:', error);
      toast.error('Failed to unenroll student');
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(studEnrolls.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEnrollments = studEnrolls.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (studDataLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className='page-container student-details-page'>
      <div style={{ marginBottom: '1rem', fontWeight: "600" }}>
        <Button variant="secondary" onClick={() => navigate('/admin/students')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Students
        </Button>
      </div>
      <div className="page-header">
        <div>
          <h1 className='page-title'>Student: {studData.name}</h1>
          <div className='page-subtitle-2'>
            <div>
              <svg viewBox="0 0 24 24" fill="none" stroke="#1a73e8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3>{studData.dept_name || 'Not Assigned'}</h3>
            </div>
          </div>
        </div>
        <Button onClick={handleEnrollStudent} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Enroll Student
        </Button>
      </div>

      <Card>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
            All Enrollments of this Student
          </h2>
        </div>
        <div className="table-container">
          <div className="table-wrapper">
            <table className="table">
              <thead className="table-head">
                <tr>
                  <th className="table-header">COURSE ID</th>
                  <th className="table-header">COURSE NAME</th>
                  <th className="table-header">DEPARTMENT</th>
                  <th className="table-header">TEACHER</th>
                  <th className="table-header">ENROLLED DATE</th>
                  <th className="table-header">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {studEnrollLoading ? (
                  <tr>
                    <td colSpan="6" className="table-cell" style={{ textAlign: 'center', padding: '2rem' }}>
                      Loading enrollments...
                    </td>
                  </tr>
                ) : currentEnrollments && currentEnrollments.length > 0 ? (
                  currentEnrollments.map((enrollment) => (
                    <tr 
                      key={enrollment.id} 
                      className="table-row"
                    >
                      <td className="table-cell">{enrollment.id}</td>
                      <td className="table-cell">{enrollment.name}</td>
                      <td className="table-cell">{enrollment.dept_name || 'Not Assigned'}</td>
                      <td className="table-cell">{enrollment.teacher_name || 'Not Assigned'}</td>
                      <td className="table-cell">{new Date(enrollment.enrolled_at).toLocaleDateString()}</td>
                      <td className="table-cell">
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnenroll(enrollment.id, enrollment.name);
                          }}
                          title="Unenroll student"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="table-cell" style={{ textAlign: 'center', padding: '2rem' }}>
                      No enrollments found for this student
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {studEnrolls.length > 0 && (
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

      <Modal
        isOpen={showEnrollModal}
        onClose={() => {
          setShowEnrollModal(false);
          setSelectedCourse('');
        }}
        title="Enroll Student in Course"
      >
        <form onSubmit={handleSubmitEnrollment} className="modal-form">
          <div className="form-group">
            <label className="form-label">Student</label>
            <input
              type="text"
              className="form-input"
              value={studData.name || ''}
              disabled
              style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Course *</label>
            <select
              className="form-input"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              required
              disabled={coursesLoading}
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} {course.dept_name ? `(${course.dept_name})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => {
                setShowEnrollModal(false);
                setSelectedCourse('');
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={enrolling || coursesLoading}>
              {enrolling ? 'Enrolling...' : 'Enroll'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AdminStudentDetails
