import { useState, useEffect } from 'react';
import { courseAPI, enrollmentAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

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
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const isEnrolled = (courseId) => {
    return enrolledCourses.some(course => course.id === courseId);
  };

  const handleEnroll = async (courseId) => {
    setActionLoading(courseId);
    try {
      await enrollmentAPI.enroll({ course_id: courseId });
      await fetchData();
      alert('Successfully enrolled in the course!');
    } catch (error) {
      alert(error.message || 'Failed to enroll');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnenroll = async (courseId) => {
    if (!confirm('Are you sure you want to unenroll from this course?')) return;
    
    setActionLoading(courseId);
    try {
      await enrollmentAPI.unenroll({ course_id: courseId });
      await fetchData();
      alert('Successfully unenrolled from the course!');
    } catch (error) {
      alert(error.message || 'Failed to unenroll');
    } finally {
      setActionLoading(null);
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
    {
      accessorKey: 'teacher_name',
      header: 'Teacher',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const enrolled = isEnrolled(row.original.id);
        return (
          <Button
            variant={enrolled ? 'danger' : 'primary'}
            onClick={(e) => {
              e.stopPropagation();
              enrolled ? handleUnenroll(row.original.id) : handleEnroll(row.original.id);
            }}
            disabled={actionLoading === row.original.id}
          >
            {actionLoading === row.original.id 
              ? 'Processing...' 
              : enrolled ? 'Unenroll' : 'Enroll'
            }
          </Button>
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
        <Table data={courses} columns={columns} />
      </Card>
    </div>
  );
};

export default StudentCourses;
