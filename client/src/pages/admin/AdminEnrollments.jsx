import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { courseAPI, enrollmentAPI, studentAPI } from "../../services/api";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";

const AdminEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [studEnrLoading, setStudEnrLoading] = useState(false)
  const [formData, setformData] = useState({})
  const [formLoading, setFormLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchEnrollments();
  }, []);
  useEffect(()=>{
    if(showAddModal) {
      fetchStudCourses()
    }
  }, [showAddModal])
  const fetchStudCourses = async () => {
    setStudEnrLoading(true)
    try {
      console.log('[AdminEnrollments] Loading students and courses...');
      const [studentsRes, coursesRes] = await Promise.all([
        studentAPI.getAll(),
        courseAPI.getAll()
      ]) 
      setStudents(studentsRes.data || [])
      setCourses(coursesRes.data || [])
      console.log('[AdminEnrollments] Students:', studentsRes.data?.length, 'Courses:', coursesRes.data?.length);
    } catch (error) {
      console.error('[AdminEnrollments] Failed to load dropdown data:', error.message);
      toast.error('Failed to load students/courses');
    } finally {
      setStudEnrLoading(false)
    }
  }

  const fetchEnrollments = async () => {
    try {
      console.log('[AdminEnrollments] Fetching enrollments...');
      const response = await enrollmentAPI.getAll();
      setEnrollments(response.data || []);
      console.log('[AdminEnrollments] Enrollments loaded:', response.data?.length || 0);
    } catch (error) {
      console.error('[AdminEnrollments] Failed to fetch enrollments:', error.message);
      toast.error('Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  const submitEnroll = async (student_id, course_id) => {
    if (!student_id || !course_id) {
      console.log('[AdminEnrollments] Validation failed: Missing student or course ID');
      toast.error("Student and Course must be selected");
      return;
    }
    setFormLoading(true)
    try {
      console.log('[AdminEnrollments] Enrolling student:', student_id, 'in course:', course_id);
      const response = await enrollmentAPI.enrollOtherInCourse({
        student_id,
        course_id,
      });
      setEnrollments((prev) => [...prev, response.data]);
      console.log('[AdminEnrollments] Student enrolled successfully');
      toast.success('Student enrolled successfully!');
      setShowAddModal(false);
    } catch (error) {
      console.error('[AdminEnrollments] Enrollment failed:', error.message);
      toast.error('Failed to enroll student - ' + (error.message || 'Please try again'));
    } finally {
      setFormLoading(false);
    }
  };
  const unEnrollStudent = async (enrollId) => {
    const cnfrm = confirm("Are you sure to unenroll this person?");
    if (!cnfrm) return;
    try {
      console.log('[AdminEnrollments] Unenrolling enrollment ID:', enrollId);
      const response = await enrollmentAPI.unenrollOther({ enrollId });
      setEnrollments((prev) => prev.filter((u) => u.id != enrollId));
      console.log('[AdminEnrollments] Student unenrolled successfully');
      toast.success('Student unenrolled successfully!');
    } catch (error) {
      console.error('[AdminEnrollments] Unenrollment failed:', error.message);
      toast.error('Failed to unenroll student');
    }
  };

  const columns = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "student_name",
      header: "Student Name",
    },
    {
      accessorKey: "course_name",
      header: "Course Name",
    },
    {
      accessorKey: "enrolled_at",
      header: "Enrollment Date",
      cell: (info) => new Date(info.getValue()).toLocaleString(),
    },
    {
      id: "unenroll",
      header: "Unenroll",
      cell: ({ row }) => (
        <button
          className="btn btn-danger btn-sm"
          onClick={(e) => {
            e.stopPropagation();
            unEnrollStudent(row.original.id);
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            width="16"
            height="16"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      ),
    },
  ];

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">All Enrollments</h1>
          <p className="page-subtitle">View all student enrollments</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Enrollment
        </Button>
      </div>

      <Card>
        <Table
          data={enrollments}
          columns={columns}
        />
      </Card>

      <Modal
        isOpen={showAddModal}
        title="Enroll a Student"
        onClose={() => setShowAddModal(false)}
      >
        {studEnrLoading ? (
          <div>Loading</div>
        ): (
          <form onSubmit={submitEnroll} className="submit-other-enroll-form">
            <div className="form-group">
              <label htmlFor="student" className="student">
                Student
              </label>
            </div>
            <div className="form-group">
              <label htmlFor="courses" className="Courses">
                Courses
              </label>
            </div>
            <div className="modal-actions">
              <Button type="button" variant="secondary" 
                onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Enroll
            </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default AdminEnrollments;
