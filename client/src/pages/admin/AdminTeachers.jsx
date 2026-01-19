import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { teacherAPI, departmentAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import '../../styles/table.css';

const AdminTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teachersRes, deptsRes] = await Promise.all([
        teacherAPI.getAll(),
        departmentAPI.getAll()
      ]);
      setTeachers(teachersRes.data || []);
      setDepartments(deptsRes.data || []);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;
    
    try {
      await teacherAPI.delete(id);
      
      // Update local state instead of refetching
      setTeachers(prev => prev.filter(t => t.id !== id));
      toast.success('Teacher deleted successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to delete teacher');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Calculate pagination
  const totalPages = Math.ceil(teachers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTeachers = teachers.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Manage Teachers</h1>
        <p className="page-subtitle">View and manage all teachers</p>
      </div>

      <Card>
        <div className="table-container">
          <div className="table-wrapper">
            <table className="table">
              <thead className="table-head">
                <tr>
                  <th className="table-header">ID</th>
                  <th className="table-header">NAME</th>
                  <th className="table-header">EMAIL</th>
                  <th className="table-header">DEPARTMENT</th>
                  <th className="table-header">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {currentTeachers && currentTeachers.length > 0 ? (
                  currentTeachers.map((teacher) => (
                    <tr 
                      key={teacher.id} 
                      className="table-row"
                      onClick={() => handleViewTeacher(teacher)}
                    >
                      <td className="table-cell">{teacher.id}</td>
                      <td className="table-cell">{teacher.name}</td>
                      <td className="table-cell">{teacher.email}</td>
                      <td className="table-cell">{teacher.dept_name || 'Not Assigned'}</td>
                      <td className="table-cell">
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(teacher.id);
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
                      No teachers available
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
        title="Teacher Details"
      >
        {selectedTeacher && (
          <div className="details-grid">
            <div className="detail-item">
              <label>ID:</label>
              <span>{selectedTeacher.id}</span>
            </div>
            <div className="detail-item">
              <label>Name:</label>
              <span>{selectedTeacher.name}</span>
            </div>
            <div className="detail-item">
              <label>Email:</label>
              <span>{selectedTeacher.email}</span>
            </div>
            <div className="detail-item">
              <label>Department:</label>
              <span>{selectedTeacher.dept_name || 'Not Assigned'}</span>
            </div>
            <div className="detail-item">
              <label>Joined:</label>
              <span>{new Date(selectedTeacher.created_at).toLocaleString()}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminTeachers;
