import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { courseAPI, departmentAPI, teacherAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dept_id: '',
    teacher_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, deptsRes, teachersRes] = await Promise.all([
        courseAPI.getAll(),
        departmentAPI.getAll(),
        teacherAPI.getAll()
      ]);
      setCourses(coursesRes.data || []);
      setDepartments(deptsRes.data || []);
      setTeachers(teachersRes.data || []);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({ name: '', description: '', dept_id: '', teacher_id: '' });
    setEditMode(false);
    setSelectedCourse(null);
    setShowModal(true);
  };

  const handleEdit = (course) => {
    setFormData({
      name: course.name,
      description: course.description || '',
      dept_id: course.dept_id || '',
      teacher_id: course.teacher_id || ''
    });
    setEditMode(true);
    setSelectedCourse(course);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        dept_id: formData.dept_id || null,
        teacher_id: formData.teacher_id || null
      };

      if (editMode) {
        await courseAPI.update(selectedCourse.id, submitData);
        toast.success('Course updated successfully!');
      } else {
        await courseAPI.create(submitData);
        toast.success('Course created successfully!');
      }
      setShowModal(false);
      await fetchData();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    try {
      await courseAPI.delete(id);
      await fetchData();
      toast.success('Course deleted successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to delete course');
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
      cell: (info) => info.getValue() || 'Not Assigned',
    },
    {
      accessorKey: 'teacher_name',
      header: 'Teacher',
      cell: (info) => info.getValue() || 'Not Assigned',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="action-buttons">
          <button
            className="btn btn-primary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row.original);
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.original.id);
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
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
          <h1 className="page-title">Manage Courses</h1>
          <p className="page-subtitle">Create and manage courses</p>
        </div>
        <Button onClick={handleAdd}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Course
        </Button>
      </div>

      <Card>
        <Table data={courses} columns={columns} />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editMode ? 'Edit Course' : 'Add New Course'}
      >
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Course Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Department</label>
            <select
              className="form-input"
              value={formData.dept_id}
              onChange={(e) => setFormData({ ...formData, dept_id: e.target.value })}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Assign Teacher</label>
            <select
              className="form-input"
              value={formData.teacher_id}
              onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
            >
              <option value="">Select Teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editMode ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCourses;
