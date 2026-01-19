import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { studentAPI, departmentAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import '../../styles/table.css';

const AdminStudents = () => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    dept_id: ''
  });
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const [departments, setDepartments] = useState([]);
  const [fetchDeptLoading, setFetchDeptLoading] = useState(true)
  const fetchDept = async () => {
    console.log("Fetch Dept called")
    if(departments.length != 0) return;
    try {
      const deptRes = await departmentAPI.getAll()
      setDepartments(deptRes.data || [])
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setFetchDeptLoading(false);
    }
  }
  const fetchData = async () => {
    try {
      console.log('[AdminStudents] Fetching students...');
      const studentsRes = await studentAPI.getAll()
      setStudents(studentsRes.data || []);
      console.log('[AdminStudents] Students loaded:', studentsRes.data?.length || 0);
    } catch (error) {
      console.error('[AdminStudents] Failed to fetch students:', error.message);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleAddStudent = () => {
    setFormData({ name: '', email: '', password: '', dept_id: '' });
    setShowAddModal(true);
    fetchDept()
  };

  const handleDeleteStudent = async (stu_id) => {
    const cnfrm = confirm("Are you sure you want to delete this student?")
    if(!cnfrm) return;

    try {
      console.log('[AdminStudents] Deleting student:', stu_id);
      const deleted = await studentAPI.removeStudent(stu_id)
      if(!deleted.success) {
        console.error('[AdminStudents] Delete failed:', deleted.message);
        toast.error('Failed to delete student');
        return;
      }
      // Remove student from client too
      setStudents((prev) => prev.filter((s) => s.id !== stu_id))
      console.log('[AdminStudents] Student deleted successfully');
      toast.success('Student deleted successfully');
    } catch (error) {
      console.error('[AdminStudents] Delete error:', error.message);
      toast.error('Failed to delete student');
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('[AdminStudents] Creating student:', formData.email);
      const submitData = {
        ...formData,
        dept_id: formData.dept_id || null
      };
      const response = await studentAPI.create(submitData);
      toast.success('Student created successfully!');
      console.log('[AdminStudents] Student created:', response.data.id);
      setShowAddModal(false);
      
      // Update local state instead of refetching
      const deptName = departments.find(d => d.id === parseInt(formData.dept_id))?.name || null;
      setStudents(prev => [...prev, {
        id: response.data.id,
        name: formData.name,
        dept_id: formData.dept_id || null,
        dept_name: deptName,
        created_at: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('[AdminStudents] Create error:', error.message);
      toast.error('Failed to create student - ' + (error.message || 'Please try again'));
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Calculate pagination
  const totalPages = Math.ceil(students.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = students.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Students</h1>
          <p className="page-subtitle">View and manage all students</p>
        </div>
        <Button onClick={handleAddStudent}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Student
        </Button>
      </div>

      <Card>
        <div className="table-container">
          <div className="table-wrapper">
            <table className="table">
              <thead className="table-head">
                <tr>
                  <th className="table-header">ID</th>
                  <th className="table-header">NAME</th>
                  <th className="table-header">DEPARTMENT</th>
                  <th className="table-header">REGISTERED DATE</th>
                  <th className="table-header">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {currentStudents && currentStudents.length > 0 ? (
                  currentStudents.map((student) => (
                    <tr 
                      key={student.id} 
                      className="table-row"
                      onClick={() => handleViewStudent(student)}
                    >
                      <td className="table-cell">{student.id}</td>
                      <td className="table-cell">{student.name}</td>
                      <td className="table-cell">{student.dept_name || 'Not Assigned'}</td>
                      <td className="table-cell">{new Date(student.created_at).toLocaleDateString()}</td>
                      <td className="table-cell">
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteStudent(student.id);
                          }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="table-cell" style={{ textAlign: 'center', padding: '2rem' }}>
                      No students available
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
        title="Student Details"
      >
        {selectedStudent && (
          <div className="details-grid">
            <div className="detail-item">
              <label>ID:</label>
              <span>{selectedStudent.id}</span>
            </div>
            <div className="detail-item">
              <label>Name:</label>
              <span>{selectedStudent.name}</span>
            </div>
            <div className="detail-item">
              <label>Department:</label>
              <span>{selectedStudent.dept_name || 'Not Assigned'}</span>
            </div>
            <div className="detail-item">
              <label>Registered:</label>
              <span>{new Date(selectedStudent.created_at).toLocaleString()}</span>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Student"
      >
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Enter student name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email *</label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="Enter email address"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              type="password"
              className="form-input"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="Enter password"
              minLength="6"
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

          <div className="modal-actions">
            <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminStudents;
