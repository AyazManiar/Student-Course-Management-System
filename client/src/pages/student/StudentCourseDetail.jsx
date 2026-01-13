import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { courseAPI, enrollmentAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const StudentCourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [courseRes, enrolledRes] = await Promise.all([
        courseAPI.getById(id),
        enrollmentAPI.getMyEnrolledCourses()
      ]);
      setCourse(courseRes.data);
      setEnrolledCourses(enrolledRes.data || []);
    } catch (error) {
      toast.error('Failed to fetch course details');
    } finally {
      setLoading(false);
    }
  };

  const isEnrolled = () => {
    return enrolledCourses.some(c => c.id === parseInt(id));
  };

  const handleEnroll = async () => {
    if (!confirm('Are you sure you want to enroll in this course?')) return;
    
    setActionLoading(true);
    try {
      await enrollmentAPI.enroll({ course_id: parseInt(id) });
      await fetchData();
      toast.success('Successfully enrolled in the course!');
    } catch (error) {
      toast.error(error.message || 'Failed to enroll');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnenroll = async () => {
    if (!confirm('Are you sure you want to unenroll from this course?')) return;
    
    setActionLoading(true);
    try {
      await enrollmentAPI.unenroll({ course_id: parseInt(id) });
      await fetchData();
      toast.success('Successfully unenrolled from the course!');
    } catch (error) {
      toast.error(error.message || 'Failed to unenroll');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!course) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <p>Course not found</p>
          <Button onClick={() => navigate('/student/courses')}>
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  const enrolled = isEnrolled();

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <Button variant="secondary" onClick={() => navigate('/student/courses')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Courses
          </Button>
          <h1 className="page-title" style={{ marginTop: '1rem' }}>{course.name}</h1>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        <Card>
          <div className="details-grid">
            <div className="detail-item">
              <label>Description:</label>
              <span>{course.description || 'No description available'}</span>
            </div>
            <div className="detail-item">
              <label>Department:</label>
              <span>{course.dept_name || 'Not Assigned'}</span>
            </div>
            <div className="detail-item">
              <label>Teacher:</label>
              <span>{course.teacher_name || 'Not Assigned'}</span>
            </div>
            <div className="detail-item">
              <label>Created:</label>
              <span>{new Date(course.created_at).toLocaleString()}</span>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>Enrollment Status</h3>
              <span className={`badge ${enrolled ? 'badge-success' : 'badge-blue'}`}>
                {enrolled ? 'Enrolled' : 'Not Enrolled'}
              </span>
            </div>
            <Button
              variant={enrolled ? 'danger' : 'primary'}
              onClick={enrolled ? handleUnenroll : handleEnroll}
              disabled={actionLoading}
            >
              {actionLoading 
                ? 'Processing...' 
                : enrolled ? 'Unenroll from Course' : 'Enroll in Course'
              }
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentCourseDetail;
