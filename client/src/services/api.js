import { toast } from "react-toastify";
const API_BASE_URL = 'http://localhost:3000/api';

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  try {
    console.log(`[API] ${options.method || 'GET'} ${endpoint}`);
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
      console.error(`[API Error] ${endpoint}:`, data.message || 'Request failed');
      throw new Error(data.message || 'Something went wrong');
    }

    console.log(`[API Success] ${endpoint}`);
    return data;
  } catch (error) {
    // Network or parsing error
    if (!error.message.includes('Something went wrong')) {
      console.error(`[API Network Error] ${endpoint}:`, error.message);
    }
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
  getAll: () => {
    return apiCall(`/students`);
  },
  
  getById: () => apiCall(`/students`),

  getAnotherStudById: ({id}) => apiCall(`/students/${id}`),
  
  getMyProfile: () => apiCall('/students/me/profile'),
  
  create: (data) => apiCall('/students', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  updateProfile: (data) => apiCall('/students/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  deleteAccount: () => apiCall('/students/me', {
    method: 'DELETE',
  }),

  removeStudent: (stu_id) => apiCall("/students/remove", {
    method: "DELETE",
    body: JSON.stringify({stu_id})
  })
};

// Teacher APIs
export const teacherAPI = {
  getAll: () => {
    return apiCall(`/teachers`);
  },
  
  getById: (id) => apiCall(`/teachers/${id}`),
  
  getMyProfile: () => apiCall('/teachers/me/profile'),
  
  getMyCourses: () => apiCall('/teachers/me/courses'),
  
  create: (data) => apiCall('/teachers', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
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
  
  getDeptById: (id) => apiCall(`/departments/${id}`),

  getUsersInDept: (id) => apiCall(`/departments/${id}/users`),

  getCoursesInDept: (id) => apiCall(`/departments/${id}/courses`),
  
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
  getAll: () => {
    return apiCall(`/courses`);
  },
  getAllWithStudCount: () => {
    return apiCall(`/courses/withStudCount`);
  },
  
  getById: (id) => apiCall(`/courses/${id}`),

  getStudentsInCourse: (courseid) => apiCall(`/courses/${courseid}/students`),

  getUnenrolledStudents: (courseid) => apiCall(`/courses/${courseid}/unenrolled-students`),
  
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

  getEnrolledCoursesOfSpecificStudent: ({id}) => apiCall(`/enrollments/student/${id}`),
  
  enroll: (data) => apiCall('/enrollments/enroll', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  enrollOtherInCourse: (data) => apiCall("/enrollments/enrollOther", {
    method: "POST",
    body: JSON.stringify(data)
  }),

  unenroll: (data) => apiCall('/enrollments/unenroll', {
    method: 'DELETE',
    body: JSON.stringify(data),
  }),
  
  unenrollOther: (data) => apiCall('/enrollments/unenrollOther', {
    method: 'DELETE',
    body: JSON.stringify(data),
  }),
  
  unenrollOtherBulk: (data) => apiCall('/enrollments/unenrollOtherBulk', {
    method: 'DELETE',
    body: JSON.stringify(data),
  }),
};

