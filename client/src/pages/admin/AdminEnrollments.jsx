import { useState, useEffect } from 'react';
import { enrollmentAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';

const AdminEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await enrollmentAPI.getAll();
      setEnrollments(response.data || []);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'student_name',
      header: 'Student Name',
    },
    {
      accessorKey: 'course_name',
      header: 'Course Name',
    },
    {
      accessorKey: 'enrolled_at',
      header: 'Enrollment Date',
      cell: (info) => new Date(info.getValue()).toLocaleString(),
    },
  ];

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">All Enrollments</h1>
        <p className="page-subtitle">View all student enrollments</p>
      </div>

      <Card>
        <Table data={enrollments} columns={columns} />
      </Card>
    </div>
  );
};

export default AdminEnrollments;
