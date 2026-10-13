import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import {
  Truck, ArrowLeft, MapPin, Building2, Clock, Utensils,
  CheckCircle2, AlertCircle
} from 'lucide-react';

export default function AvailableTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);

  const fetchTasks = async () => {
    try {
      const res = await api.getVolunteerTasks();
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAccept = async (id) => {
    setAcceptingId(id);
    try {
      await api.acceptPickupTask(id);
      alert("Pickup task accepted! Please proceed to the donor's location.");
      navigate('/volunteer/dashboard');
    } catch (err) {
      alert(err.response?.data?.error || "Failed to accept task. It may have already been accepted by another volunteer.");
      fetchTasks();
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      <Link
        to="/volunteer/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Volunteer Hub
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 mb-1">
            <Truck className="w-4 h-4" />
            <span>Open Delivery Dispatch</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Available Pickup Tasks
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Accept open food rescue tasks approved by donors and requested by local NGOs.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-gray-400">Loading open tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-gray-100 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="font-bold text-gray-900 text-base">All Pickups Assigned</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            There are currently no unassigned pickup tasks waiting in your service area. Thank you for checking!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Pickup Task #{task.id}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    Awaiting Volunteer
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-gray-900">{task.donation_title}</h3>
                  <p className="text-xs text-emerald-700 font-bold mt-0.5">
                    Quantity: {task.quantity} {task.unit} ({task.donation_category})
                  </p>
                </div>

                {/* Waypoints */}
                <div className="space-y-2 text-xs bg-gray-50 p-3.5 rounded-2xl border border-gray-100 text-gray-600">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-gray-900 block">Pickup (Donor):</strong>
                      <span>{task.donor_username}</span>
                      <p className="text-gray-500 text-[11px]">{task.pickup_location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-2 border-t border-gray-200/60">
                    <Building2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-gray-900 block">Delivery (NGO):</strong>
                      <span>{task.receiver_org_name || task.receiver_username}</span>
                      <p className="text-gray-500 text-[11px]">{task.receiver_address || 'NGO Shelter Facility'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Pickup Deadline: {new Date(task.pickup_deadline).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                </div>
              </div>

              <button
                onClick={() => handleAccept(task.id)}
                disabled={acceptingId === task.id}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Truck className="w-4 h-4" />
                {acceptingId === task.id ? 'Accepting Task...' : 'Accept This Task'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
