const API_BASE_URL = 'http://localhost:3000/api';

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Auth APIs
export const authAPI = {
  register: (userData) => apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  login: (credentials) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  logout: () => apiCall('/auth/logout', {
    method: 'POST',
  }),
  
  getCurrentUser: () => apiCall('/auth/me'),
};

// Student APIs
export const studentAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/students${query ? `?${query}` : ''}`);
  },
  
  getById: (id) => apiCall(`/students/${id}`),
  
  getMyProfile: () => apiCall('/students/me/profile'),
  
  updateProfile: (data) => apiCall('/students/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  deleteAccount: () => apiCall('/students/me', {
    method: 'DELETE',
  }),
};

// Teacher APIs
export const teacherAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/teachers${query ? `?${query}` : ''}`);
  },
  
  getById: (id) => apiCall(`/teachers/${id}`),
  
  getMyProfile: () => apiCall('/teachers/me/profile'),
  
  getMyCourses: () => apiCall('/teachers/me/courses'),
  
  updateProfile: (data) => apiCall('/teachers/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (id) => apiCall(`/teachers/${id}`, {
    method: 'DELETE',
  }),
};

// Admin APIs
export const adminAPI = {
  getAll: () => apiCall('/admins'),
  
  getById: (id) => apiCall(`/admins/${id}`),
  
  getMyProfile: () => apiCall('/admins/me/profile'),
  
  getStats: () => apiCall('/admins/stats'),
  
  updateProfile: (data) => apiCall('/admins/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (id) => apiCall(`/admins/${id}`, {
    method: 'DELETE',
  }),
};

// Department APIs
export const departmentAPI = {
  getAll: () => apiCall('/departments'),
  
  getById: (id) => apiCall(`/departments/${id}`),
  
  create: (data) => apiCall('/departments', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  update: (id, data) => apiCall(`/departments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (id) => apiCall(`/departments/${id}`, {
    method: 'DELETE',
  }),
};

// Course APIs
export const courseAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/courses${query ? `?${query}` : ''}`);
  },
  
  getById: (id) => apiCall(`/courses/${id}`),
  
  create: (data) => apiCall('/courses', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  update: (id, data) => apiCall(`/courses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (id) => apiCall(`/courses/${id}`, {
    method: 'DELETE',
  }),
};

// Enrollment APIs
export const enrollmentAPI = {
  getAll: () => apiCall('/enrollments'),
  
  getMyEnrolledCourses: () => apiCall('/enrollments/my-courses'),
  
  enroll: (data) => apiCall('/enrollments/enroll', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  unenroll: (data) => apiCall('/enrollments/unenroll', {
    method: 'DELETE',
    body: JSON.stringify(data),
  }),
};

