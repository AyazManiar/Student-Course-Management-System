import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { courseAPI, enrollmentAPI } from '../../services/api';
import Card from '../../components/common/Card';
import '../../styles/table.css';

const StudentCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('[StudentCourses] Fetching courses...');
      const [allCourses, enrolled] = await Promise.all([
        courseAPI.getAll(),
        enrollmentAPI.getMyEnrolledCourses()
      ]);
      setCourses(allCourses.data || []);
      setEnrolledCourses(enrolled.data || []);
      console.log('[StudentCourses] Courses loaded:', allCourses.data?.length || 0, 'Enrolled:', enrolled.data?.length || 0);
    } catch (error) {
      console.error('[StudentCourses] Failed to fetch courses:', error.message);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const isEnrolled = (courseId) => {
    return enrolledCourses.some(course => course.id === courseId);
  };

  const handleRowClick = (course) => {
    navigate(`/student/courses/${course.id}`);
  };
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Available Courses</h1>
        <p className="page-subtitle">Browse and enroll in courses</p>
      </div>

      <Card>
        <div className="table-container">
          <div className="table-wrapper">
            <table className="table">
              <thead className="table-head">
                <tr>
                  <th className="table-header">COURSE NAME</th>
                  <th className="table-header">DESCRIPTION</th>
                  <th className="table-header">DEPARTMENT</th>
                  <th className="table-header">TEACHER</th>
                  <th className="table-header">STATUS</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {courses && courses.length > 0 ? (
                  courses.map((course) => (
                    <tr 
                      key={course.id} 
                      className="table-row"
                      onClick={() => handleRowClick(course)}
                    >
                      <td className="table-cell">{course.name}</td>
                      <td className="table-cell">{course.description}</td>
                      <td className="table-cell">{course.dept_name}</td>
                      <td className="table-cell">{course.teacher_name}</td>
                      <td className="table-cell">
                        <span className={`badge ${isEnrolled(course.id) ? 'badge-success' : 'badge-blue'}`}>
                          {isEnrolled(course.id) ? 'Enrolled' : 'Not Enrolled'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="table-cell" style={{ textAlign: 'center', padding: '2rem' }}>
                      No courses available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StudentCourses;
