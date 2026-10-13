import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, Thermometer, Box, FileText } from 'lucide-react';

export default function SafetyGuidelines() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-left">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Hygiene & Standards</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Food Safety & Quality Guidelines</h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          The safety and health of beneficiaries is our highest priority. All participating donors, volunteers, and NGOs must adhere strictly to these handling standards.
        </p>
      </div>

      {/* Official Legal Disclaimer Box */}
      <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 space-y-2">
        <div className="flex items-center gap-2 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>Statutory Food Safety Disclaimer</span>
        </div>
        <p className="text-xs leading-relaxed text-amber-800">
          FoodBridge provides a digital platform to connect food donors, receiving organisations, and volunteers. <strong>FoodBridge does not inspect, test, or certify the safety or nutritional quality of donated food.</strong> Participating donors and receiving organisations remain strictly responsible for complying with applicable public health regulations, hygiene practices, safe storage, and transportation protocols.
        </p>
      </div>

      {/* 4 Pillars of Safe Food Rescue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Thermometer className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 text-base">Temperature Control (2-Hour / 4-Hour Rule)</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Hot cooked foods must be maintained above 60°C (140°F) or rapidly cooled to below 5°C (41°F). Cold foods, dairy, and desserts must remain refrigerated during storage and transport.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Box className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 text-base">Packaging & Container Integrity</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Food must be packaged in food-grade, leak-proof, clean containers. Casseroles or buffets must be packed using thermal or sealed disposable meal boxes before handover.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 text-base">Mandatory Allergen Disclosures</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Donors must declare any common allergens present in the food (nuts, dairy, eggs, gluten, shellfish, soy). Clear disclosures allow NGOs to safely distribute meals to vulnerable populations.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 text-base">Prohibited Items</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Strictly prohibited: partially eaten diner plate leftovers, unpasteurized milk, raw meats nearing spoilage, dented or swollen canned foods, or items exposed to unsanitary conditions.
          </p>
        </div>
      </div>

      {/* Checklist for Receiving NGOs */}
      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200/80 space-y-4">
        <h3 className="font-bold text-gray-900 text-base">Checklist for Receiving NGOs & Kitchens</h3>
        <ul className="space-y-2 text-xs text-gray-700">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Inspect visual appearance and smell immediately upon volunteer delivery.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Ensure food packages are sealed and intact without signs of tampering or contamination.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Reheat cooked food to at least 74°C (165°F) before serving to beneficiaries if not kept continuously hot.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Confirm delivery promptly in the FoodBridge dashboard to finalize the traceability trail.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
