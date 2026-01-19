import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { enrollmentAPI, studentAPI } from '../../services/api';
import Card from '../../components/common/Card';
import '../../styles/table.css';
import '../../styles/dashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, profileRes] = await Promise.all([
        enrollmentAPI.getMyEnrolledCourses(),
        studentAPI.getMyProfile()
      ]);
      setEnrolledCourses(coursesRes.data || []);
      setProfile(profileRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Enrolled Courses',
      value: enrolledCourses.length,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      action: ()=> {
        navigate("/student/courses")
      }
    },
    {
      title: 'Department',
      value: profile?.dept_name || 'Not Assigned',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      action: ()=> {
        // nothing
      }
    },
  ];

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Student Dashboard</h1>
        <p className="dashboard-subtitle">Welcome back, {user?.name}!</p>
      </div>

      <div className="stats-grid">
        {statsCards.map((stat, index) => (
          <Card key={index} className="stat-card"
            onClick={()=> stat.action()}
          >
            <div className="stat-content">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-details">
                <p className="stat-label">{stat.title}</p>
                <p className="stat-value">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="dashboard-content">
        <Card 
          title="My Enrolled Courses" 
          action={
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/student/courses')}
            >
              Browse Courses
            </button>
          }
        >
          {enrolledCourses.length > 0 ? (
            <div className="table-container">
              <div className="table-wrapper">
                <table className="table">
                  <thead className="table-head">
                    <tr>
                      <th className="table-header">COURSE NAME</th>
                      <th className="table-header">DESCRIPTION</th>
                      <th className="table-header">DEPARTMENT</th>
                      <th className="table-header">TEACHER</th>
                      <th className="table-header">ENROLLED DATE</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {enrolledCourses.map((course) => (
                      <tr key={course.id} className="table-row">
                        <td className="table-cell">{course.name}</td>
                        <td className="table-cell">{course.description}</td>
                        <td className="table-cell">{course.dept_name}</td>
                        <td className="table-cell">{course.teacher_name}</td>
                        <td className="table-cell">{new Date(course.enrolled_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p>You haven't enrolled in any courses yet.</p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/student/courses')}
              >
                Browse Available Courses
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
