import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { departmentAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';

const AdminDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      console.log('[AdminDepartments] Fetching departments...');
      const response = await departmentAPI.getAll();
      setDepartments(response.data || []);
      console.log('[AdminDepartments] Departments loaded:', response.data?.length || 0);
    } catch (error) {
      console.error('[AdminDepartments] Failed to fetch departments:', error.message);
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({ name: '' });
    setEditMode(false);
    setSelectedDept(null);
    setShowModal(true);
  };

  const handleEdit = (dept) => {
    setFormData({ name: dept.name });
    setEditMode(true);
    setSelectedDept(dept);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        console.log('[AdminDepartments] Updating department:', selectedDept.id);
        await departmentAPI.update(selectedDept.id, formData);
        // Update local state for edit
        setDepartments((prev)=>
          prev.map(dept =>
            dept.id === selectedDept.id ? { ...dept, name: formData.name } : dept)
        )
        console.log('[AdminDepartments] Department updated successfully');
        toast.success('Department updated successfully!');
      } else {
        console.log('[AdminDepartments] Creating department:', formData.name);
        const response = await departmentAPI.create(formData);
        // Update local state for create
        setDepartments(prev => [...prev, {
          id: response.departmentId,
          name: formData.name,
          created_at: new Date().toISOString()
        }]);
        console.log('[AdminDepartments] Department created:', response.departmentId);
        toast.success('Department created successfully!');
      }
      setShowModal(false);
    } catch (error) {
      console.error('[AdminDepartments] Save error:', error.message);
      toast.error(editMode ? 'Failed to update department' : 'Failed to create department');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    
    try {
      console.log('[AdminDepartments] Deleting department:', id);
      await departmentAPI.delete(id);
      
      // Update local state instead of refetching
      setDepartments(prev => prev.filter(d => d.id !== id));
      console.log('[AdminDepartments] Department deleted successfully');
      toast.success('Department deleted successfully!');
    } catch (error) {
      console.error('[AdminDepartments] Delete error:', error.message);
      toast.error('Failed to delete department');
    }
  };

  const columns = [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'name',
      header: 'Department Name',
    },
    {
      accessorKey: 'created_at',
      header: 'Created Date',
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
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
          <h1 className="page-title">Manage Departments</h1>
          <p className="page-subtitle">Create and manage departments</p>
        </div>
        <Button onClick={handleAdd}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Department
        </Button>
      </div>

      <Card>
        <Table data={departments} columns={columns} />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editMode ? 'Edit Department' : 'Add New Department'}
        size="small"
      >
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Department Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
              required
              placeholder="Enter department name"
            />
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

export default AdminDepartments;
