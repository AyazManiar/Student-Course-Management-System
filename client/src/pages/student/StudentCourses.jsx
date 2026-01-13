import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { courseAPI, enrollmentAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';

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
      const [allCourses, enrolled] = await Promise.all([
        courseAPI.getAll(),
        enrollmentAPI.getMyEnrolledCourses()
      ]);
      setCourses(allCourses.data || []);
      setEnrolledCourses(enrolled.data || []);
    } catch (error) {
      toast.error('Failed to fetch courses');
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
    {
      accessorKey: 'teacher_name',
      header: 'Teacher',
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const enrolled = isEnrolled(row.original.id);
        return (
          <span className={`badge ${enrolled ? 'badge-success' : 'badge-blue'}`}>
            {enrolled ? 'Enrolled' : 'Not Enrolled'}
          </span>
        );
      },
    },
  ];

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
        <Table data={courses} columns={columns} onRowClick={handleRowClick} />
      </Card>
    </div>
  );
};

export default StudentCourses;
