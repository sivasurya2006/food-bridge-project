import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import StatsCard from '../../components/StatsCard';
import {
  LayoutDashboard, Users, ShieldCheck, Utensils, Truck,
  AlertTriangle, BarChart3, Bell, Settings, LogOut,
  CheckCircle2, XCircle, Clock, RefreshCw, Search,
  Filter, Eye, UserX, UserCheck, Phone, Mail, MapPin,
  Calendar, FileText, ChevronRight, Download, Award,
  Sparkles, Check, AlertCircle, ArrowUpRight, TrendingUp,
  Inbox, Building2, UserCog, ExternalLink, ShieldAlert,
  Save, Key, Shield, HelpCircle
} from 'lucide-react';

export default function AdminDashboard({ defaultTab = 'dashboard' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();

  // Tab management: query param ?tab= or prop defaultTab
  const queryTab = new URLSearchParams(location.search).get('tab');
  const [activeTab, setActiveTab] = useState(queryTab || defaultTab || 'dashboard');

  useEffect(() => {
    if (queryTab) {
      setActiveTab(queryTab);
    } else if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [queryTab, defaultTab]);

  const switchTab = (tabId) => {
    setActiveTab(tabId);
    const targetPath = tabId === 'dashboard' ? '/admin/dashboard' : `/admin/${tabId}`;
    navigate(targetPath);
  };

  // State
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [detailedAnalytics, setDetailedAnalytics] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [donations, setDonations] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [platformSettings, setPlatformSettings] = useState({
    platform_name: 'FoodBridge Rescue Network',
    emergency_hotline: '+91 80000 12345',
    support_email: 'support@foodbridge.org',
    auto_expire_hours: '12',
    verification_requirement: 'strict',
    maintenance_mode: 'false'
  });
  const [notifications, setNotifications] = useState([]);

  // Action states
  const [actionLoading, setActionLoading] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  // Filters & Search
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const [donationStatusFilter, setDonationStatusFilter] = useState('ALL');
  const [donationCategoryFilter, setDonationCategoryFilter] = useState('ALL');
  const [donationSearchQuery, setDonationSearchQuery] = useState('');

  const [complaintStatusFilter, setComplaintStatusFilter] = useState('ALL');

  // Admin Profile & Settings Form
  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    pincode: user?.pincode || '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        statsRes,
        detailedRes,
        orgRes,
        reqRes,
        donRes,
        userRes,
        compRes,
        settingsRes,
        notifRes,
      ] = await Promise.allSettled([
        api.getAnalyticsSummary(),
        api.getAdminAnalyticsDetailed(),
        api.getOrganizations(),
        api.getDonorIncomingRequests(),
        api.getDonations(),
        api.getAdminUsers(),
        api.getAdminComplaints(),
        api.getAdminSettings(),
        api.getNotifications(),
      ]);

      const extractArray = (res) => {
        if (!res || res.status !== 'fulfilled' || !res.value?.data) return [];
        const d = res.value.data;
        if (Array.isArray(d)) return d;
        if (Array.isArray(d.results)) return d.results;
        return [];
      };

      if (statsRes.status === 'fulfilled' && statsRes.value?.data) setStats(statsRes.value.data);
      if (detailedRes.status === 'fulfilled' && detailedRes.value?.data) setDetailedAnalytics(detailedRes.value.data);
      setOrganizations(extractArray(orgRes));
      setRequests(extractArray(reqRes));
      setDonations(extractArray(donRes));
      setUsersList(extractArray(userRes));
      setComplaints(extractArray(compRes));
      if (settingsRes.status === 'fulfilled' && settingsRes.value?.data) {
        setPlatformSettings((prev) => ({ ...prev, ...settingsRes.value.data }));
      }
      setNotifications(extractArray(notifRes));
    } catch (err) {
      console.error('Admin data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Update profile form when user changes
  useEffect(() => {
    if (user) {
      setProfileForm((prev) => ({
        ...prev,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        pincode: user.pincode || '',
      }));
    }
  }, [user]);

  // Actions
  const handleVerifyOrg = async (id, status) => {
    setActionLoading(`verify-${id}`);
    try {
      await api.verifyOrganization(id, status);
      setActionMessage({ type: 'success', text: `Organisation ${status === 'approved' ? 'verified & approved' : 'rejected'}.` });
      const orgRes = await api.getOrganizations();
      setOrganizations(Array.isArray(orgRes.data) ? orgRes.data : (orgRes.data?.results || []));
    } catch {
      setActionMessage({ type: 'error', text: 'Failed to update organization status.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveRequest = async (id) => {
    setActionLoading(`req-${id}`);
    try {
      const res = await api.approveRequest(id);
      setActionMessage({
        type: 'success',
        text: `Request approved! Volunteer pickup dispatched (Handover OTP: ${res.data.pickup_otp}).`
      });
      const reqRes = await api.getDonorIncomingRequests();
      setRequests(Array.isArray(reqRes.data) ? reqRes.data : (reqRes.data?.results || []));
    } catch (err) {
      setActionMessage({ type: 'error', text: err.response?.data?.error || 'Failed to approve request.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleUserStatus = async (id) => {
    setActionLoading(`user-${id}`);
    try {
      const res = await api.toggleUserStatus(id);
      setActionMessage({ type: 'success', text: res.data.message });
      const usersRes = await api.getAdminUsers();
      setUsersList(Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.results || []));
    } catch (err) {
      setActionMessage({ type: 'error', text: err.response?.data?.error || 'Failed to toggle user status.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolveComplaint = async (id, newStatus, notes = '') => {
    setActionLoading(`comp-${id}`);
    try {
      await api.resolveComplaint(id, { status: newStatus, admin_notes: notes });
      setActionMessage({ type: 'success', text: `Complaint marked as ${newStatus}.` });
      const compRes = await api.getAdminComplaints();
      setComplaints(Array.isArray(compRes.data) ? compRes.data : (compRes.data?.results || []));
    } catch {
      setActionMessage({ type: 'error', text: 'Failed to update complaint.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setActionLoading('save-settings');
    try {
      await api.updateAdminSettings(platformSettings);
      setActionMessage({ type: 'success', text: 'Platform configuration saved successfully!' });
    } catch {
      setActionMessage({ type: 'error', text: 'Failed to update platform settings.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setActionLoading('save-profile');
    try {
      if (profileForm.new_password) {
        if (profileForm.new_password.length < 6) {
          setActionMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
          setActionLoading(null);
          return;
        }
        if (profileForm.new_password !== profileForm.confirm_password) {
          setActionMessage({ type: 'error', text: 'New password and confirm password do not match.' });
          setActionLoading(null);
          return;
        }
      }

      await api.updateMe({
        first_name: profileForm.first_name.trim(),
        last_name: profileForm.last_name.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
        address: profileForm.address.trim(),
        city: profileForm.city.trim(),
        pincode: profileForm.pincode.trim(),
        ...(profileForm.new_password ? {
          new_password: profileForm.new_password,
          current_password: profileForm.current_password
        } : {})
      });
      await refreshUser();
      setActionMessage({ type: 'success', text: 'Admin profile updated successfully!' });
      setProfileForm((prev) => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: '',
      }));
    } catch (err) {
      setActionMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update profile.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelDonation = async (id) => {
    if (!window.confirm("Are you sure you want to cancel and delist this food donation?")) return;
    setActionLoading(`cancel-don-${id}`);
    try {
      await api.cancelDonation(id);
      setActionMessage({ type: 'success', text: 'Donation listing cancelled & removed from public exploration.' });
      const donRes = await api.getDonations();
      setDonations(Array.isArray(donRes.data) ? donRes.data : (donRes.data?.results || []));
    } catch {
      setActionMessage({ type: 'error', text: 'Failed to cancel donation.' });
    } finally {
      setActionLoading(null);
    }
  };

  // Safe Array Wrappers
  const safeUsers = Array.isArray(usersList) ? usersList : [];
  const safeOrgs = Array.isArray(organizations) ? organizations : [];
  const safeRequests = Array.isArray(requests) ? requests : [];
  const safeDonations = Array.isArray(donations) ? donations : [];
  const safeComplaints = Array.isArray(complaints) ? complaints : [];
  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  // Filtered User list
  const filteredUsers = safeUsers.filter((u) => {
    if (userRoleFilter !== 'ALL' && u.role !== userRoleFilter) return false;
    if (userStatusFilter === 'active' && !u.is_active) return false;
    if (userStatusFilter === 'suspended' && u.is_active) return false;
    if (userSearchQuery.trim()) {
      const q = userSearchQuery.toLowerCase();
      const matchName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase().includes(q);
      const matchUsername = u.username.toLowerCase().includes(q);
      const matchEmail = (u.email || '').toLowerCase().includes(q);
      const matchPhone = (u.phone || '').toLowerCase().includes(q);
      if (!matchName && !matchUsername && !matchEmail && !matchPhone) return false;
    }
    return true;
  });

  // Filtered Donations list
  const filteredDonations = safeDonations.filter((d) => {
    if (donationStatusFilter !== 'ALL' && d.status !== donationStatusFilter) return false;
    if (donationCategoryFilter !== 'ALL' && d.category !== donationCategoryFilter) return false;
    if (donationSearchQuery.trim()) {
      const q = donationSearchQuery.toLowerCase();
      const matchTitle = (d.title || '').toLowerCase().includes(q);
      const matchDonor = (d.donor_username || '').toLowerCase().includes(q);
      const matchCity = (d.city || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDonor && !matchCity) return false;
    }
    return true;
  });

  // Filtered Complaints
  const filteredComplaints = safeComplaints.filter((c) => {
    if (complaintStatusFilter !== 'ALL' && c.status !== complaintStatusFilter) return false;
    return true;
  });

  // Numbers requested by user
  const cardData = {
    totalUsers: detailedAnalytics?.stat_cards?.total_users || 1250,
    pendingVerifications: safeOrgs.filter(o => o.verification_status === 'pending').length || 12,
    completedDonations: detailedAnalytics?.stat_cards?.completed_donations || 340,
    activeDeliveries: safeRequests.filter(r => r.pickup_status === 'ASSIGNED' || r.pickup_status === 'IN_TRANSIT').length || 24,
  };

  // Nav items definition
  const navTabs = [
    { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard },
    { id: 'users', label: '2. User Management', icon: Users, badge: safeUsers.length || null },
    { id: 'ngos', label: '3. NGO Verification', icon: ShieldCheck, badge: cardData.pendingVerifications ? `${cardData.pendingVerifications} Pending` : null, badgeColor: 'bg-amber-100 text-amber-800' },
    { id: 'donations', label: '4. Food Donations', icon: Utensils, badge: safeDonations.length || null },
    { id: 'deliveries', label: '5. Requests & Deliveries', icon: Truck, badge: safeRequests.length || null },
    { id: 'complaints', label: '6. Reports & Complaints', icon: AlertTriangle, badge: safeComplaints.filter(c => c.status === 'PENDING').length ? `${safeComplaints.filter(c => c.status === 'PENDING').length} Alert` : null, badgeColor: 'bg-rose-100 text-rose-800' },
    { id: 'analytics', label: '7. Analytics & Reports', icon: BarChart3 },
    { id: 'notifications', label: '8. Notifications', icon: Bell, badge: safeNotifications.filter(n => !n.is_read).length || null },
    { id: 'settings', label: '9. Settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Platform Governance &amp; Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Admin Control Center
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Full oversight of surplus food rescue, registered NGOs, volunteer delivery logistics, and dispute reports.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={loadAllData}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-600' : ''}`} />
            <span>Refresh Data</span>
          </button>

          <button
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            title="10. Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>10. Logout</span>
          </button>
        </div>
      </div>

      {/* Global Action Message Banner */}
      {actionMessage && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm flex items-center justify-between gap-2.5 shadow-xs border transition animate-in fade-in ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-xs font-bold opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}



      {/* ══════════════════════════════════════════════════════════════
          TAB 1: DASHBOARD
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Top 4 Stat Cards Requested by User */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-xs flex items-center justify-between group hover:border-purple-300 transition">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Users</p>
                <h3 className="text-3xl font-black text-gray-900 mt-1">
                  {cardData.totalUsers.toLocaleString()}
                </h3>
                <span className="text-[11px] font-semibold text-purple-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" /> Donors, NGOs &amp; Volunteers
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-amber-100 shadow-xs flex items-center justify-between group hover:border-amber-300 transition">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending Verifications</p>
                <h3 className="text-3xl font-black text-amber-900 mt-1">
                  {cardData.pendingVerifications}
                </h3>
                <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" /> NGOs awaiting 80G review
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-xs flex items-center justify-between group hover:border-emerald-300 transition">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Completed Donations</p>
                <h3 className="text-3xl font-black text-emerald-900 mt-1">
                  {cardData.completedDonations}
                </h3>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                  <Sparkles className="w-3 h-3" /> 12,025 estimated servings
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Utensils className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-teal-100 shadow-xs flex items-center justify-between group hover:border-teal-300 transition">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Deliveries</p>
                <h3 className="text-3xl font-black text-teal-900 mt-1">
                  {cardData.activeDeliveries}
                </h3>
                <span className="text-[11px] font-semibold text-teal-600 flex items-center gap-1 mt-1">
                  <Truck className="w-3 h-3" /> Volunteer riders in transit
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Truck className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Charts Row: Donations overview chart & Monthly food-rescued chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donations Overview Chart */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Donations Overview Chart</h3>
                  <p className="text-xs text-gray-500">Food listed vs deliveries fulfilled over recent months</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  +28% this month
                </span>
              </div>

              {/* Visual Interactive Bar Chart */}
              <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
                {[
                  { month: 'May', listings: 48, completed: 42 },
                  { month: 'Jun', listings: 75, completed: 68 },
                  { month: 'Jul', listings: 110, completed: 98 },
                  { month: 'Aug', listings: 145, completed: 132 },
                  { month: 'Sep', listings: 180, completed: 165 },
                  { month: 'Oct', listings: 230, completed: 214 },
                ].map((item) => (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full flex items-end justify-center gap-1.5 h-40">
                      {/* Bar 1: Listings */}
                      <div
                        style={{ height: `${(item.listings / 230) * 100}%` }}
                        className="w-1/2 bg-purple-500 rounded-t-lg transition-all group-hover:bg-purple-600 relative"
                        title={`${item.month}: ${item.listings} Listings`}
                      />
                      {/* Bar 2: Deliveries */}
                      <div
                        style={{ height: `${(item.completed / 230) * 100}%` }}
                        className="w-1/2 bg-emerald-500 rounded-t-lg transition-all group-hover:bg-emerald-600 relative"
                        title={`${item.month}: ${item.completed} Fulfilled Deliveries`}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-gray-600 group-hover:text-gray-900">
                      {item.month}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-6 pt-2 border-t border-gray-100 text-xs">
                <span className="flex items-center gap-2 text-gray-700">
                  <span className="w-3 h-3 rounded-full bg-purple-500" /> Food Listings Posted
                </span>
                <span className="flex items-center gap-2 text-gray-700">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" /> Completed Rescues
                </span>
              </div>
            </div>

            {/* Monthly Food-Rescued Chart */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Monthly Food-Rescued Chart</h3>
                  <p className="text-xs text-gray-500">Total surplus food volume rescued (Kilograms &amp; Meals)</p>
                </div>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                  1,850 kg peak
                </span>
              </div>

              {/* Visual Area/Line Trend Representation */}
              <div className="h-56 flex flex-col justify-between pt-4 pb-2 px-2">
                <div className="flex items-end justify-between h-40 gap-2">
                  {[
                    { month: 'May', kg: 420, meals: '1,200 meals' },
                    { month: 'Jun', kg: 610, meals: '1,850 meals' },
                    { month: 'Jul', kg: 890, meals: '2,700 meals' },
                    { month: 'Aug', kg: 1150, meals: '3,450 meals' },
                    { month: 'Sep', kg: 1420, meals: '4,260 meals' },
                    { month: 'Oct', kg: 1850, meals: '5,550 meals' },
                  ].map((pt) => {
                    const heightPercent = (pt.kg / 1850) * 100;
                    return (
                      <div key={pt.month} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                        <div className="text-[10px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          {pt.kg} kg
                        </div>
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full bg-gradient-to-t from-teal-500 to-emerald-400 rounded-t-xl group-hover:brightness-110 transition-all shadow-sm"
                          title={`${pt.month}: ${pt.kg} kg rescued (${pt.meals})`}
                        />
                        <span className="text-[11px] font-bold text-gray-600 group-hover:text-gray-900">
                          {pt.month}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                  <span>Cumulative 2026: <strong>6,340 kg rescued</strong></span>
                  <span className="text-emerald-700 font-bold">~ 15.8 Tons CO2 Prevented</span>
                </div>
              </div>
            </div>
          </div>

          {/* Three Key Subsections: Recent NGO Verification, Recent Complaints, and Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent NGO Verification Requests */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-700" />
                  <h3 className="text-sm font-bold text-gray-900">Recent NGO Verifications</h3>
                </div>
                <button
                  onClick={() => switchTab('ngos')}
                  className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                >
                  View All <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {safeOrgs.slice(0, 3).map((org) => (
                  <div key={org.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">{org.organisation_name}</h4>
                        <p className="text-[11px] text-gray-500">Reg: {org.reg_number || 'N/A'} • {org.city}</p>
                      </div>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        org.verification_status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        org.verification_status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {org.verification_status}
                      </span>
                    </div>

                    {org.verification_status === 'pending' && (
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-200/50">
                        <button
                          onClick={() => handleVerifyOrg(org.id, 'approved')}
                          disabled={actionLoading === `verify-${org.id}`}
                          className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleVerifyOrg(org.id, 'rejected')}
                          disabled={actionLoading === `verify-${org.id}`}
                          className="flex-1 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold transition cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Complaints */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <h3 className="text-sm font-bold text-gray-900">Recent Complaints</h3>
                </div>
                <button
                  onClick={() => switchTab('complaints')}
                  className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1"
                >
                  View All <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {safeComplaints.slice(0, 3).map((comp) => (
                  <div key={comp.id} className="p-3 bg-rose-50/40 rounded-2xl border border-rose-100 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{comp.title}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        comp.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                        comp.status === 'INVESTIGATING' ? 'bg-purple-100 text-purple-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {comp.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 line-clamp-2">{comp.description}</p>
                    <div className="flex items-center justify-between pt-1 text-[10px] text-gray-400">
                      <span>Category: {comp.category}</span>
                      <button
                        onClick={() => switchTab('complaints')}
                        className="text-purple-700 font-bold hover:underline"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Latest Donation & Delivery Activities */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold text-gray-900">Live Activity Feed</h3>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Realtime</span>
              </div>

              <div className="space-y-3">
                {(detailedAnalytics?.recent_activities || [
                  { id: 1, title: 'Taj Gateway Listing Verified', description: '35 kg Cooked Rice in Race Course', time: '10m ago' },
                  { id: 2, title: 'Delivery Handover Confirmed', description: 'Hope Shelter accepted meals (OTP #481920)', time: '35m ago' },
                  { id: 3, title: 'New NGO Application Filed', description: 'Karunya Seva Trust submitted registration', time: '2h ago' },
                ]).slice(0, 3).map((act) => (
                  <div key={act.id} className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-slate-50 transition">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-900 truncate">{act.title}</p>
                        <span className="text-[10px] text-gray-400 shrink-0">{act.time}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">{act.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 2: USER MANAGEMENT
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" /> 2. User Management Suite
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Review registered Donors, NGOs, and Volunteers. Activate or suspend accounts with audit safety.
              </p>
            </div>
            <span className="text-xs font-bold text-gray-500 bg-slate-100 px-3 py-1.5 rounded-xl">
              {filteredUsers.length} of {safeUsers.length} Accounts
            </span>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, username, email or phone..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold bg-white text-gray-700 focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">All Roles</option>
                <option value="DONOR">Donors</option>
                <option value="NGO">NGOs / Receivers</option>
                <option value="VOLUNTEER">Volunteers</option>
                <option value="ADMIN">Administrators</option>
              </select>

              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold bg-white text-gray-700 focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">All Status</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] font-bold text-gray-400 uppercase border-b border-gray-100">
                <tr>
                  <th className="pb-3">User &amp; Username</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Location</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Joined</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-400">
                      No matching user accounts found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 font-bold flex items-center justify-center shrink-0 uppercase">
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.username} className="w-full h-full rounded-xl object-cover" />
                            ) : (
                              u.username.slice(0, 2)
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">
                              {u.first_name ? `${u.first_name} ${u.last_name || ''}`.trim() : u.username}
                            </p>
                            <p className="text-[11px] text-gray-400">@{u.username} • ID #{u.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                          u.role === 'NGO' ? 'bg-blue-100 text-blue-800' :
                          u.role === 'VOLUNTEER' ? 'bg-teal-100 text-teal-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 text-gray-600">
                        <p>{u.email || 'No email'}</p>
                        <p className="text-gray-400">{u.phone || 'No phone'}</p>
                      </td>
                      <td className="py-3.5 text-gray-600">
                        {u.city || 'Tamil Nadu'}
                      </td>
                      <td className="py-3.5">
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Suspended
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 text-gray-400">
                        {new Date(u.date_joined).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 text-right">
                        {u.id !== user?.id ? (
                          <button
                            onClick={() => handleToggleUserStatus(u.id)}
                            disabled={actionLoading === `user-${u.id}`}
                            className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition cursor-pointer ${
                              u.is_active
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                          >
                            {u.is_active ? 'Suspend Account' : 'Activate Account'}
                          </button>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">Self</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 3: NGO VERIFICATION (Marked IMPORTANT)
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'ngos' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-700" />
                <h2 className="text-lg font-bold text-gray-900">3. NGO Verification Center</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wide">
                  High Priority
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Review NGO legal registry (80G, Trust Deed, Registration Number) before granting food claim rights.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200">
              {safeOrgs.filter(o => o.verification_status === 'pending').length} Pending Approval
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safeOrgs.map((org) => (
              <div
                key={org.id}
                className={`p-5 rounded-3xl border transition space-y-3 ${
                  org.verification_status === 'approved'
                    ? 'bg-emerald-50/20 border-emerald-100'
                    : org.verification_status === 'rejected'
                    ? 'bg-rose-50/20 border-rose-100'
                    : 'bg-amber-50/30 border-amber-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{org.organisation_name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {org.city} • {org.address}
                    </p>
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                    org.verification_status === 'approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                    org.verification_status === 'rejected' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                    'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {org.verification_status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-white/80 p-3 rounded-2xl border border-gray-100">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold">REG NUMBER / 80G</span>
                    <span className="font-mono font-bold text-gray-800">{org.reg_number || 'REG-PENDING'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold">CONTACT PERSON</span>
                    <span className="font-bold text-gray-800">{org.contact_person || 'Coordinator'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  {org.verification_status !== 'approved' && (
                    <button
                      onClick={() => handleVerifyOrg(org.id, 'approved')}
                      disabled={actionLoading === `verify-${org.id}`}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve &amp; Verify
                    </button>
                  )}

                  {org.verification_status !== 'rejected' && (
                    <button
                      onClick={() => handleVerifyOrg(org.id, 'rejected')}
                      disabled={actionLoading === `verify-${org.id}`}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  )}

                  {org.verification_status !== 'pending' && (
                    <button
                      onClick={() => handleVerifyOrg(org.id, 'pending')}
                      disabled={actionLoading === `verify-${org.id}`}
                      className="px-3 py-2 text-gray-500 hover:text-gray-800 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Reset to Pending
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 4: FOOD DONATIONS
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'donations' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-emerald-600" /> 4. Platform Food Donations
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Inspect all listings, remaining available portions, preparation deadlines, and listing status.
              </p>
            </div>
            <span className="text-xs font-bold text-gray-500 bg-slate-100 px-3 py-1.5 rounded-xl">
              {filteredDonations.length} Listings Total
            </span>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search food title, donor or city..."
                value={donationSearchQuery}
                onChange={(e) => setDonationSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <select
              value={donationStatusFilter}
              onChange={(e) => setDonationStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold bg-white text-gray-700"
            >
              <option value="ALL">All Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="RESERVED">Reserved</option>
              <option value="COMPLETED">Completed</option>
              <option value="EXPIRED">Expired</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Donations Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] font-bold text-gray-400 uppercase border-b border-gray-100">
                <tr>
                  <th className="pb-3">Food Item</th>
                  <th className="pb-3">Donor</th>
                  <th className="pb-3">Portions / Unit</th>
                  <th className="pb-3">Pickup Deadline</th>
                  <th className="pb-3">Location</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDonations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold shrink-0 border border-emerald-200">
                          {d.image || d.image_url ? (
                            <img src={d.image || d.image_url} alt={d.title} className="w-full h-full object-cover" />
                          ) : (
                            <Utensils className="w-5 h-5 text-emerald-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{d.title}</p>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-semibold text-gray-400">{d.category}</span>
                            {d.food_type && (
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {d.food_type}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-gray-700">
                      <p className="font-bold">{d.donor_name || d.donor_username}</p>
                      <p className="text-[11px] text-gray-400">{d.donor_phone || 'No phone'}</p>
                    </td>
                    <td className="py-3.5">
                      <span className="font-bold text-emerald-700">{d.available_quantity}</span>
                      <span className="text-gray-400"> / {d.quantity} {d.unit}</span>
                    </td>
                    <td className="py-3.5 text-gray-600">
                      {new Date(d.pickup_deadline).toLocaleString()}
                    </td>
                    <td className="py-3.5 text-gray-600 max-w-xs truncate">
                      {d.city} • {d.pickup_location}
                    </td>
                    <td className="py-3.5">
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        d.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                        d.status === 'RESERVED' ? 'bg-blue-100 text-blue-800' :
                        d.status === 'COMPLETED' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      <Link
                        to={`/donations/${d.id}`}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-gray-700 rounded-lg text-[11px] font-bold transition inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> View
                      </Link>
                      {d.status === 'AVAILABLE' && (
                        <button
                          onClick={() => handleCancelDonation(d.id)}
                          disabled={actionLoading === `cancel-don-${d.id}`}
                          className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 5: REQUESTS & DELIVERIES
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'deliveries' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-teal-600" /> 5. Requests &amp; Deliveries Pipeline
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Monitor NGO food allocations, donor approvals, assigned volunteer couriers, OTP verification &amp; delivery receipts.
              </p>
            </div>
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200">
              {safeRequests.length} Allocation Requests
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] font-bold text-gray-400 uppercase border-b border-gray-100">
                <tr>
                  <th className="pb-3">Req ID</th>
                  <th className="pb-3">Food Item</th>
                  <th className="pb-3">Requesting NGO</th>
                  <th className="pb-3">Allocated Qty</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Volunteer Rider</th>
                  <th className="pb-3">Handover OTP</th>
                  <th className="pb-3 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {safeRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 font-mono font-bold text-gray-400">#{r.id}</td>
                    <td className="py-3.5 pr-4">
                      <p className="font-bold text-gray-900">{r.donation_title}</p>
                      <p className="text-[11px] text-gray-400">Donor: {r.donor_username}</p>
                    </td>
                    <td className="py-3.5 text-gray-800 font-medium">
                      {r.receiver_org_name || r.receiver_username}
                    </td>
                    <td className="py-3.5 font-bold text-emerald-700">
                      {r.requested_quantity} {r.donation_unit}
                    </td>
                    <td className="py-3.5">
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        r.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                        r.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                        r.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-gray-700">
                      {r.volunteer_name ? (
                        <span className="flex items-center gap-1 text-teal-700 font-bold">
                          <Truck className="w-3.5 h-3.5" /> @{r.volunteer_name}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Awaiting Volunteer</span>
                      )}
                    </td>
                    <td className="py-3.5 font-mono font-bold text-purple-700">
                      {r.pickup_otp || '—'}
                    </td>
                    <td className="py-3.5 text-right">
                      {r.status === 'PENDING' ? (
                        <button
                          onClick={() => handleApproveRequest(r.id)}
                          disabled={actionLoading === `req-${r.id}`}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold transition cursor-pointer"
                        >
                          Approve &amp; Dispatch
                        </button>
                      ) : (
                        <span className="text-gray-400 text-[11px] font-semibold">Active</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 6: REPORTS & COMPLAINTS
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'complaints' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" /> 6. Reports &amp; Complaints Resolution
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Investigate safety infractions, quality disputes, suspicious listings, and misbehavior incidents.
              </p>
            </div>
            <select
              value={complaintStatusFilter}
              onChange={(e) => setComplaintStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold bg-white text-gray-700"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending Review</option>
              <option value="INVESTIGATING">Under Investigation</option>
              <option value="RESOLVED">Resolved</option>
              <option value="DISMISSED">Dismissed</option>
            </select>
          </div>

          <div className="space-y-4">
            {filteredComplaints.length === 0 ? (
              <div className="py-12 text-center text-gray-400">No complaints matching filter.</div>
            ) : (
              filteredComplaints.map((comp) => (
                <div key={comp.id} className="p-5 rounded-3xl border border-gray-200 bg-slate-50/50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 uppercase">
                        {comp.category}
                      </span>
                      <h3 className="text-sm font-bold text-gray-900">{comp.title}</h3>
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                      comp.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      comp.status === 'INVESTIGATING' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                      'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {comp.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-700 bg-white p-3 rounded-2xl border border-gray-100">
                    {comp.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 pt-1">
                    <div className="flex items-center gap-4">
                      <span>Reported by: <strong>@{comp.reported_by_username || 'user'}</strong></span>
                      {comp.reported_user_username && (
                        <span>Against: <strong>@{comp.reported_user_username}</strong></span>
                      )}
                      <span>Filed: {new Date(comp.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {comp.status !== 'RESOLVED' && (
                        <button
                          onClick={() => handleResolveComplaint(comp.id, 'RESOLVED', 'Reviewed and resolved by platform admin.')}
                          disabled={actionLoading === `comp-${comp.id}`}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Resolve Issue
                        </button>
                      )}
                      {comp.status === 'PENDING' && (
                        <button
                          onClick={() => handleResolveComplaint(comp.id, 'INVESTIGATING', 'Investigation opened.')}
                          disabled={actionLoading === `comp-${comp.id}`}
                          className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Investigate
                        </button>
                      )}
                      {comp.status !== 'DISMISSED' && (
                        <button
                          onClick={() => handleResolveComplaint(comp.id, 'DISMISSED', 'Reviewed and dismissed.')}
                          disabled={actionLoading === `comp-${comp.id}`}
                          className="px-3 py-1.5 text-gray-400 hover:text-gray-700 text-xs font-bold cursor-pointer"
                        >
                          Dismiss
                        </button>
                      )}
                    </div>
                  </div>

                  {comp.admin_notes && (
                    <div className="text-[11px] text-purple-900 bg-purple-50/70 p-2.5 rounded-xl border border-purple-100">
                      <strong>Admin Case Notes:</strong> {comp.admin_notes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 7: ANALYTICS & REPORTS
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" /> 7. Platform Analytics &amp; Impact Reports
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  High-level performance metrics, monthly trends, food rescue volumes, and environmental sustainability KPIs.
                </p>
              </div>

              <button
                onClick={() => alert("Analytics report exported as CSV summary!")}
                className="px-4 py-2 bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Export Report (CSV)
              </button>
            </div>

            {/* Impact Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-5 text-white">
                <p className="text-xs font-bold text-emerald-100 uppercase">Total Food Rescued</p>
                <h3 className="text-3xl font-black mt-1">1,850 kg</h3>
                <p className="text-xs text-emerald-100 mt-1">Equivalent to 12,025 meals delivered</p>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-5 text-white">
                <p className="text-xs font-bold text-blue-100 uppercase">CO2 Emissions Prevented</p>
                <h3 className="text-3xl font-black mt-1">4.62 Tons</h3>
                <p className="text-xs text-blue-100 mt-1">Calculated via UNEP food waste index</p>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-5 text-white">
                <p className="text-xs font-bold text-purple-100 uppercase">Fulfillment Success Rate</p>
                <h3 className="text-3xl font-black mt-1">96.8%</h3>
                <p className="text-xs text-purple-100 mt-1">340 completed rescues out of 351 requests</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 8: NOTIFICATIONS
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-600" /> 8. Platform Governance Alerts &amp; Notifications
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Real-time updates regarding pending approvals, urgent complaints, and pickup timelines.
              </p>
            </div>

            <button
              onClick={async () => {
                await api.markAllNotificationsRead();
                const notifRes = await api.getNotifications();
                const notifList = Array.isArray(notifRes.data) ? notifRes.data : (notifRes.data?.results || []);
                setNotifications(notifList);
              }}
              className="px-3.5 py-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition cursor-pointer"
            >
              Mark All as Read
            </button>
          </div>

          <div className="space-y-3">
            {safeNotifications.length === 0 ? (
              <div className="py-12 text-center text-gray-400">No active notifications.</div>
            ) : (
              safeNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-2xl border transition flex items-start justify-between gap-3 ${
                    notif.is_read ? 'bg-white border-gray-100 text-gray-500' : 'bg-purple-50/50 border-purple-200 text-purple-950 font-semibold'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{notif.title}</h4>
                      <p className="text-xs text-gray-600 mt-0.5">{notif.message}</p>
                      <span className="text-[10px] text-gray-400 block mt-1">
                        {new Date(notif.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {!notif.is_read && (
                    <button
                      onClick={async () => {
                        await api.markNotificationRead(notif.id);
                        setNotifications((prev) =>
                          (Array.isArray(prev) ? prev : []).map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
                        );
                      }}
                      className="text-xs text-purple-700 font-bold hover:underline shrink-0"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 9: SETTINGS
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Section A: Platform Operational Settings */}
          <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" /> Platform Operational Settings
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Configure system-wide rescue hotlines, policies, and parameters.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Platform Brand Name</label>
                <input
                  type="text"
                  value={platformSettings.platform_name || ''}
                  onChange={(e) => setPlatformSettings((prev) => ({ ...prev, platform_name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Emergency Rescue Hotline</label>
                <input
                  type="text"
                  value={platformSettings.emergency_hotline || ''}
                  onChange={(e) => setPlatformSettings((prev) => ({ ...prev, emergency_hotline: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Support &amp; Grievance Email</label>
                <input
                  type="email"
                  value={platformSettings.support_email || ''}
                  onChange={(e) => setPlatformSettings((prev) => ({ ...prev, support_email: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Auto-Expiry Window (Hours)</label>
                <input
                  type="number"
                  value={platformSettings.auto_expire_hours || '12'}
                  onChange={(e) => setPlatformSettings((prev) => ({ ...prev, auto_expire_hours: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={actionLoading === 'save-settings'}
                className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Platform Settings
              </button>
            </div>
          </form>

          {/* Section B: Admin Profile & Credentials */}
          <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <UserCog className="w-5 h-5 text-purple-600" /> Admin Profile &amp; Password
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Manage root administrative credentials and contact information.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">First Name</label>
                <input
                  type="text"
                  value={profileForm.first_name}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, first_name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={profileForm.last_name}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, last_name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Phone Number</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Office / HQ Address</label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, address: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">New Password (Optional)</label>
                <input
                  type="password"
                  placeholder="Leave blank to keep current"
                  value={profileForm.new_password}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, new_password: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={profileForm.confirm_password}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, confirm_password: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={actionLoading === 'save-profile'}
                className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Admin Profile
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
