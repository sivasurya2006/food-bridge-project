import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Token if stored
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('foodbridge_token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const api = {
  // Auth
  register: (data) => apiClient.post('/auth/register/', data),
  login: (credentials) => apiClient.post('/auth/login/', credentials),
  logout: () => apiClient.post('/auth/logout/'),
  getMe: () => apiClient.get('/auth/me/'),
  updateMe: (data) => apiClient.patch('/auth/me/', data),
  demoLogin: (role) => apiClient.post('/auth/demo-login/', { role }),

  // Organizations & Admin
  getOrganizations: () => apiClient.get('/admin/organizations/'),
  verifyOrganization: (id, status) => apiClient.post(`/admin/organizations/${id}/verify/`, { status }),

  // Donations
  getDonations: (params) => apiClient.get('/donations/', { params }),
  getDonationDetail: (id) => apiClient.get(`/donations/${id}/`),
  createDonation: (data) => apiClient.post('/donations/', data),
  updateDonation: (id, data) => apiClient.patch(`/donations/${id}/`, data),
  cancelDonation: (id) => apiClient.post(`/donations/${id}/cancel/`),
  getMyDonations: () => apiClient.get('/donations/mine/'),

  // Requests
  requestDonation: (donationId, data) => apiClient.post(`/donations/${donationId}/requests/`, data),
  getMyRequests: () => apiClient.get('/requests/mine/'),
  getDonorIncomingRequests: () => apiClient.get('/donor/requests/'),
  approveRequest: (requestId) => apiClient.post(`/requests/${requestId}/approve/`),
  rejectRequest: (requestId) => apiClient.post(`/requests/${requestId}/reject/`),

  // Pickups & Delivery
  getVolunteerTasks: () => apiClient.get('/volunteer/tasks/'),
  acceptPickupTask: (pickupId) => apiClient.post(`/pickups/${pickupId}/accept/`),
  getMyVolunteerTasks: () => apiClient.get('/volunteer/my-tasks/'),
  verifyPickupOtp: (pickupId, otpCode) => apiClient.post(`/pickups/${pickupId}/verify-pickup/`, { otp_code: otpCode }),
  getNgoActiveDeliveries: () => apiClient.get('/ngo/active-deliveries/'),
  confirmNgoReceipt: (pickupId) => apiClient.post(`/pickups/${pickupId}/confirm-receipt/`),
  getDonorPickups: () => apiClient.get('/donor/pickups/'),

  // Analytics & Notifications
  getAnalyticsSummary: () => apiClient.get('/analytics/summary/'),
  getNotifications: () => apiClient.get('/notifications/'),
  markNotificationRead: (id) => apiClient.post(`/notifications/${id}/read/`),
  markAllNotificationsRead: () => apiClient.post('/notifications/read-all/'),

  // Admin Management Suite
  getAdminUsers: (params) => apiClient.get('/admin/users/', { params }),
  toggleUserStatus: (id) => apiClient.post(`/admin/users/${id}/toggle-status/`),
  getAdminComplaints: (params) => apiClient.get('/admin/complaints/', { params }),
  resolveComplaint: (id, data) => apiClient.post(`/admin/complaints/${id}/resolve/`, data),
  getAdminSettings: () => apiClient.get('/admin/settings/'),
  updateAdminSettings: (data) => apiClient.post('/admin/settings/', data),
  getAdminAnalyticsDetailed: () => apiClient.get('/admin/analytics/'),
};


export default apiClient;
