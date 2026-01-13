import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { teacherAPI, departmentAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';

const AdminTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
      await fetchData();
      toast.success('Teacher deleted successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to delete teacher');
    }
  };

  const columns = [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'dept_name',
      header: 'Department',
      cell: (info) => info.getValue() || 'Not Assigned',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
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
      ),
    },
  ];

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Manage Teachers</h1>
        <p className="page-subtitle">View and manage all teachers</p>
      </div>

      <Card>
        <Table 
          data={teachers} 
          columns={columns}
          onRowClick={handleViewTeacher}
        />
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
