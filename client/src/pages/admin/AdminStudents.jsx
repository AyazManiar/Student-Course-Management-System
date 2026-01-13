import { useState, useEffect } from 'react';
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
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
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
    </div>
  );
};

export default AdminStudents;
