import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { courseAPI, departmentAPI, teacherAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import '../../styles/table.css';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
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
      console.log('[AdminCourses] Fetching courses data...');
      const [coursesRes, deptsRes, teachersRes] = await Promise.all([
        courseAPI.getAll(),
        departmentAPI.getAll(),
        teacherAPI.getAll()
      ]);
      setCourses(coursesRes.data || []);
      setDepartments(deptsRes.data || []);
      setTeachers(teachersRes.data || []);
      console.log('[AdminCourses] Data loaded - Courses:', coursesRes.data?.length || 0);
    } catch (error) {
      console.error('[AdminCourses] Failed to fetch data:', error.message);
      toast.error('Failed to load courses data');
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
        console.log('[AdminCourses] Updating course:', selectedCourse.id);
        await courseAPI.update(selectedCourse.id, submitData);
        
        // Update local state for edit
        const deptName = departments.find(d => d.id === parseInt(submitData.dept_id))?.name || null;
        const teacherName = teachers.find(t => t.id === parseInt(submitData.teacher_id))?.name || null;
        setCourses(prev => prev.map(c => 
          c.id === selectedCourse.id 
            ? { ...c, ...submitData, dept_name: deptName, teacher_name: teacherName }
            : c
        ));
        console.log('[AdminCourses] Course updated successfully');
        toast.success('Course updated successfully!');
      } else {
        console.log('[AdminCourses] Creating course:', submitData.name);
        const response = await courseAPI.create(submitData);
        
        // Update local state for create
        const deptName = departments.find(d => d.id === parseInt(submitData.dept_id))?.name || null;
        const teacherName = teachers.find(t => t.id === parseInt(submitData.teacher_id))?.name || null;
        setCourses(prev => [...prev, {
          id: response.courseId,
          ...submitData,
          dept_name: deptName,
          teacher_name: teacherName
        }]);
        console.log('[AdminCourses] Course created:', response.courseId);
        toast.success('Course created successfully!');
      }
      setShowModal(false);
    } catch (error) {
      console.error('[AdminCourses] Save error:', error.message);
      toast.error(editMode ? 'Failed to update course' : 'Failed to create course');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    try {
      console.log('[AdminCourses] Deleting course:', id);
      await courseAPI.delete(id);
      
      // Update local state instead of refetching
      setCourses(prev => prev.filter(c => c.id !== id));
      console.log('[AdminCourses] Course deleted successfully');
      toast.success('Course deleted successfully!');
    } catch (error) {
      console.error('[AdminCourses] Delete error:', error.message);
      toast.error('Failed to delete course');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Calculate pagination
  const totalPages = Math.ceil(courses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCourses = courses.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

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
        <div className="table-container">
          <div className="table-wrapper">
            <table className="table">
              <thead className="table-head">
                <tr>
                  <th className="table-header">COURSE NAME</th>
                  <th className="table-header">DESCRIPTION</th>
                  <th className="table-header">DEPARTMENT</th>
                  <th className="table-header">TEACHER</th>
                  <th className="table-header">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {currentCourses && currentCourses.length > 0 ? (
                  currentCourses.map((course) => (
                    <tr key={course.id} className="table-row">
                      <td className="table-cell">{course.name}</td>
                      <td className="table-cell">{course.description}</td>
                      <td className="table-cell">{course.dept_name || 'Not Assigned'}</td>
                      <td className="table-cell">{course.teacher_name || 'Not Assigned'}</td>
                      <td className="table-cell">
                        <div className="action-buttons">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(course);
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
                              handleDelete(course.id);
                            }}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
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

          <div className="table-pagination">
            <div className="pagination-info">
              Showing page {currentPage} of {totalPages || 1}
            </div>
            <div className="pagination-controls">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                {'<<'}
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                {'<'}
              </button>
              <span className="pagination-page">
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="pagination-btn"
              >
                {'>'}
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage >= totalPages}
                className="pagination-btn"
              >
                {'>>'}
              </button>
            </div>
          </div>
        </div>
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
