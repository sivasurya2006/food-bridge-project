import React from 'react';
import { Link } from 'react-router-dom';
import {
  Utensils, Building2, Truck, ShieldCheck, KeyRound,
  ArrowRight, CheckCircle2, AlertCircle, HelpCircle, HeartHandshake
} from 'lucide-react';

export default function HowItWorks() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Platform Guide</span>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">How FoodBridge Operates</h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          From donor surplus to community plates: discover how our 4-tier model coordinates food safety, quantity management, and delivery verification.
        </p>
      </div>

      {/* Lifecycle Flowchart */}
      <div className="space-y-8">
        <h2 className="text-xl font-bold text-gray-900 text-left border-l-4 border-emerald-500 pl-3">
          Step-by-Step Donation Lifecycle
        </h2>

        <div className="space-y-6">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-lg flex items-center justify-center shrink-0">
              1
            </div>
            <div className="flex-1 space-y-2 text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-600 uppercase">Donor Action</span>
                <span className="text-xs text-gray-400">• Step 1</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Food Listing & Expiry Setting</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                A registered donor (restaurant, hotel banquet, caterer, or supermarket) lists surplus edible food. The donor specifies quantity, unit, estimated meal servings, preparation time, and a mandatory pickup deadline. Storage directions and allergen disclosures ensure receiver preparedness.
              </p>
              <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-500 border border-gray-200/60">
                <strong>Quantity Rule:</strong> The platform derives remaining available quantity dynamically. Expired or cancelled items are blocked automatically from new requests.
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 font-black text-lg flex items-center justify-center shrink-0">
              2
            </div>
            <div className="flex-1 space-y-2 text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-600 uppercase">NGO Action</span>
                <span className="text-xs text-gray-400">• Step 2</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">NGO Request & Donor Approval</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                A verified NGO discovers the listing and requests the specific quantity needed (e.g. 20 servings out of 50). The donor reviews the request and clicks "Approve". Behind the scenes, a database transaction reserves the 20 servings atomically and creates an active pickup task with a 6-digit OTP.
              </p>
              <div className="p-3 bg-blue-50/60 rounded-xl text-xs text-blue-900 border border-blue-100">
                <strong>Anti-Over-Allocation:</strong> Database row locks prevent multiple simultaneous requests from exceeding available inventory.
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 font-black text-lg flex items-center justify-center shrink-0">
              3
            </div>
            <div className="flex-1 space-y-2 text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-600 uppercase">Volunteer Action</span>
                <span className="text-xs text-gray-400">• Step 3</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Task Acceptance & OTP Verification</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Approved requests appear on the Volunteer Tasks board. An eligible volunteer accepts the task (locking it from other volunteers). Upon arriving at the donor's kitchen, the donor discloses their unique 6-digit OTP. The volunteer enters the OTP to verify pickup, immediately shifting the task to "In Transit".
              </p>
              <div className="p-3 bg-amber-50/60 rounded-xl text-xs text-amber-900 border border-amber-100 flex items-center gap-2">
                <KeyRound className="w-4 h-4 shrink-0 text-amber-600" />
                <span>OTPs expire automatically after their window and have a 5-attempt limit to stop unauthorized collection.</span>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 font-black text-lg flex items-center justify-center shrink-0">
              4
            </div>
            <div className="flex-1 space-y-2 text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-600 uppercase">Dual Confirmation</span>
                <span className="text-xs text-gray-400">• Step 4</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delivery Handover & Receipt Confirmation</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                The volunteer delivers the food to the designated NGO. Only the receiving NGO has permission to click "Confirm Receipt" in their dashboard. Once confirmed, the request completes, driver ratings increment, and the meal rescue count updates the public impact counter.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Role Comparison Table */}
      <div className="space-y-6 text-left">
        <h2 className="text-xl font-bold text-gray-900 border-l-4 border-emerald-500 pl-3">
          Role Responsibilities Matrix
        </h2>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-700 uppercase font-semibold border-b border-gray-100">
                <tr>
                  <th className="p-3.5">User Role</th>
                  <th className="p-3.5">Primary Responsibilities</th>
                  <th className="p-3.5">Key Dashboard Tools</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600">
                <tr>
                  <td className="p-3.5 font-bold text-gray-900">Donor</td>
                  <td className="p-3.5">Lists surplus food, reviews requests, approves quantities, shares pickup OTP.</td>
                  <td className="p-3.5">Listing manager, incoming requests queue, OTP viewer.</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-gray-900">NGO Receiver</td>
                  <td className="p-3.5">Discovers food, requests required portions, monitors delivery, confirms receipt.</td>
                  <td className="p-3.5">Donation catalog, request tracker, active delivery confirmation.</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-gray-900">Volunteer</td>
                  <td className="p-3.5">Accepts available tasks, verifies pickup via OTP, delivers to NGO location.</td>
                  <td className="p-3.5">Open task board, route directions, OTP validator, task history.</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-gray-900">Administrator</td>
                  <td className="p-3.5">Verifies organisation registrations, reviews moderation flags and audit logs.</td>
                  <td className="p-3.5">Verification queue, platform audit trails, listing moderation.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="p-8 rounded-3xl bg-emerald-600 text-white text-center space-y-4">
        <h3 className="text-2xl font-bold">Ready to Start Rescuing Food?</h3>
        <p className="text-xs sm:text-sm text-emerald-100 max-w-md mx-auto">
          Whether you have surplus banquet meals or run a community kitchen, join FoodBridge today.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            to="/register"
            className="px-6 py-2.5 bg-white text-emerald-700 font-bold text-xs rounded-xl shadow-xs hover:bg-emerald-50 transition"
          >
            Create Free Account
          </Link>
          <Link
            to="/donations"
            className="px-6 py-2.5 bg-emerald-700 text-white font-bold text-xs rounded-xl hover:bg-emerald-800 transition"
          >
            Explore Active Feed
          </Link>
        </div>
      </div>
    </div>
  );
}
