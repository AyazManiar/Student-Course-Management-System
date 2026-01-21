import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { courseAPI, enrollmentAPI } from '../../services/api.js';
import { toast } from 'react-toastify';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import '../../styles/table.css';

const AdminUnenrollStudents = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const courseData = location.state?.courseData || {};
  
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchEnrolledStudents = async () => {
      setStudentsLoading(true);
      try {
        const studentsRes = await courseAPI.getStudentsInCourse(id);
        if (!studentsRes.success) {
          toast.error("Failed to fetch enrolled students");
          return;
        }
        
        setEnrolledStudents(studentsRes.data || []);
      } catch (error) {
        console.error('Failed to fetch students:', error);
        toast.error('Failed to fetch students');
      } finally {
        setStudentsLoading(false);
      }
    };

    fetchEnrolledStudents();
  }, [id]);

  const handleToggleStudent = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAllCurrentPage = () => {
    const currentPageStudentIds = currentStudents.map(s => s.id);
    const allSelected = currentPageStudentIds.every(id => selectedStudents.includes(id));
    
    if (allSelected) {
      setSelectedStudents(prev => prev.filter(id => !currentPageStudentIds.includes(id)));
    } else {
      setSelectedStudents(prev => {
        const newSelected = [...prev];
        currentPageStudentIds.forEach(id => {
          if (!newSelected.includes(id)) {
            newSelected.push(id);
          }
        });
        return newSelected;
      });
    }
  };

  const handleUnenrollStudents = async () => {
    if (selectedStudents.length === 0) {
      toast.warning("Please select at least one student");
      return;
    }

    setStudentsLoading(true);
    try {
      const unenrollPromises = selectedStudents.map(studentId =>
        enrollmentAPI.unenrollOtherBulk({
          student_id: studentId,
          course_id: id
        })
      );

      await Promise.all(unenrollPromises);
      
      toast.success(`Successfully unenrolled ${selectedStudents.length} student(s)`);
      navigate(`/admin/courses/${id}`);
    } catch (error) {
      console.error('Failed to unenroll students:', error);
      toast.error('Failed to unenroll students');
    } finally {
      setStudentsLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Pagination
  const totalPages = Math.ceil(enrolledStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = enrolledStudents.slice(startIndex, endIndex);

  const isAllCurrentPageSelected = currentStudents.length > 0 && 
    currentStudents.every(s => selectedStudents.includes(s.id));

  return (
    <div className='page-container unenroll-students-page'>
      <div style={{ marginBottom: '1rem' }}>
        <Button variant="secondary" onClick={() => navigate(`/admin/courses/${id}`)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Course Details
        </Button>
      </div>

      <div className="page-header">
        <div>
          <h1 className='page-title'>Unenroll Students from: {courseData.name}</h1>
          <p className='page-subtitle'>Select students to unenroll from this course</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button 
            variant="secondary" 
            onClick={() => navigate(`/admin/courses/${id}`)}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleUnenrollStudents} 
            disabled={studentsLoading || selectedStudents.length === 0}
          >
            Unenroll Selected ({selectedStudents.length})
          </Button>
        </div>
      </div>

      <Card>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
            Enrolled Students
          </h2>
        </div>
        <div className="table-container">
          <div className="table-wrapper">
            <table className="table">
              <thead className="table-head">
                <tr>
                  <th className="table-header" style={{ width: '50px' }}>
                    <input
                      type="checkbox"
                      checked={isAllCurrentPageSelected}
                      onChange={handleSelectAllCurrentPage}
                      disabled={studentsLoading || currentStudents.length === 0}
                      style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                    />
                  </th>
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
                ) : currentStudents.length > 0 ? (
                  currentStudents.map((student) => (
                    <tr 
                      key={student.id} 
                      className="table-row"
                      onClick={() => handleToggleStudent(student.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="table-cell" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => handleToggleStudent(student.id)}
                          style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                        />
                      </td>
                      <td className="table-cell">{student.id}</td>
                      <td className="table-cell">{student.name}</td>
                      <td className="table-cell">{student.dept_name || 'Not Assigned'}</td>
                      <td className="table-cell">{new Date(student.enrolled_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="table-cell" style={{ textAlign: 'center', padding: '2rem' }}>
                      No enrolled students
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

export default AdminUnenrollStudents
