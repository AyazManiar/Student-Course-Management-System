import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { studentAPI, departmentAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    dept_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, deptsRes] = await Promise.all([
        studentAPI.getAll(),
        departmentAPI.getAll()
      ]);
      setStudents(studentsRes.data || []);
      setDepartments(deptsRes.data || []);
    } catch (error) {
      toast.error('Failed to fetch data');
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        dept_id: formData.dept_id || null
      };
      await studentAPI.create(submitData);
      toast.success('Student created successfully!');
      setShowAddModal(false);
      await fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to create student');
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
      accessorKey: 'dept_name',
      header: 'Department',
      cell: (info) => info.getValue() || 'Not Assigned',
    },
    {
      accessorKey: 'created_at',
      header: 'Registered Date',
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    },
  ];

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Manage Students</h1>
        <p className="page-subtitle">View and manage all students</p>
      </div>

      <Card>
        <Table 
          data={students} 
          columns={columns}
          onRowClick={handleViewStudent}
          onAdd={handleAddStudent}
        />
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
