import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import VerifyOtpModal from '../../components/VerifyOtpModal';
import {
  Truck, ArrowLeft, KeyRound, CheckCircle2, Clock, MapPin, Building2
} from 'lucide-react';

export default function MyVolunteerTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPickup, setSelectedPickup] = useState(null);

  const fetchTasks = async () => {
    try {
      const res = await api.getMyVolunteerTasks();
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
            <span>Driver Task Log</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            My Delivery Tasks
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            History of your accepted pickups, collections, and completed handovers.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-gray-400">Loading your tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-gray-100 text-center space-y-3">
          <Truck className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="font-bold text-gray-900 text-base">No tasks accepted yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Explore available tasks to help transport surplus food from donors to receiving organisations.
          </p>
          <Link
            to="/volunteer/tasks"
            className="inline-block px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
          >
            Find Open Tasks
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col md:flex-row justify-between gap-4 items-start md:items-center"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Pickup #{task.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    task.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                    task.status === 'IN_TRANSIT' ? 'bg-amber-100 text-amber-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {task.status === 'DELIVERED' ? '✓ Delivered & Confirmed' :
                     task.status === 'IN_TRANSIT' ? '🚚 In Transit' : '📍 Awaiting Collection'}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(task.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900">{task.donation_title}</h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                  <span className="font-bold text-emerald-700">
                    Quantity: {task.quantity} {task.unit}
                  </span>
                  <span>From: {task.donor_username}</span>
                  <span>To: {task.receiver_org_name || task.receiver_username}</span>
                </div>
              </div>

              <div className="self-end md:self-center shrink-0">
                {task.status === 'ASSIGNED' && (
                  <button
                    onClick={() => setSelectedPickup(task)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                  >
                    <KeyRound className="w-4 h-4" /> Enter Donor OTP
                  </button>
                )}

                {task.status === 'IN_TRANSIT' && (
                  <div className="p-2.5 bg-amber-50 text-amber-900 rounded-xl border border-amber-200 text-xs font-semibold">
                    Food In Transit → Deliver to NGO
                  </div>
                )}

                {task.status === 'DELIVERED' && (
                  <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Completed & Logged
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPickup && (
        <VerifyOtpModal
          pickup={selectedPickup}
          onClose={() => setSelectedPickup(null)}
          onSuccess={fetchTasks}
        />
      )}
    </div>
  );
}
