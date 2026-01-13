import { useState, useEffect } from 'react';
import { teacherAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';

const TeacherCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await teacherAPI.getMyCourses();
      setCourses(response.data || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
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
      cell: (info) => info.getValue() || 'Not Assigned',
    },
  ];

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">My Courses</h1>
        <p className="page-subtitle">Courses you are teaching</p>
      </div>

      <Card>
        {courses.length > 0 ? (
          <Table 
            data={courses} 
            columns={columns}
            onRowClick={handleViewCourse}
          />
        ) : (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p>You don't have any assigned courses yet.</p>
          </div>
        )}
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Course Details"
      >
        {selectedCourse && (
          <div className="details-grid">
            <div className="detail-item">
              <label>Course Name:</label>
              <span>{selectedCourse.name}</span>
            </div>
            <div className="detail-item">
              <label>Description:</label>
              <span>{selectedCourse.description || 'No description'}</span>
            </div>
            <div className="detail-item">
              <label>Department:</label>
              <span>{selectedCourse.dept_name || 'Not Assigned'}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TeacherCourses;
