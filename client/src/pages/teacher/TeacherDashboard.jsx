import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { teacherAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import '../../styles/dashboard.css';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, profileRes] = await Promise.all([
        teacherAPI.getMyCourses(),
        teacherAPI.getMyProfile()
      ]);
      setCourses(coursesRes.data || []);
      setProfile(profileRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'Course Name',
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      accessorKey: 'dept_name',
      header: 'Department',
    },
  ];

  const statsCards = [
    {
      title: 'My Courses',
      value: courses.length,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      title: 'Department',
      value: profile?.dept_name || 'Not Assigned',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
  ];

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Teacher Dashboard</h1>
        <p className="dashboard-subtitle">Welcome back, {user?.name}!</p>
      </div>

      <div className="stats-grid">
        {statsCards.map((stat, index) => (
          <Card key={index} className="stat-card">
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
          title="My Courses" 
          action={
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/teacher/courses')}
            >
              Manage Courses
            </button>
          }
        >
          {courses.length > 0 ? (
            <Table data={courses} columns={columns} />
          ) : (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p>You don't have any assigned courses yet.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;
