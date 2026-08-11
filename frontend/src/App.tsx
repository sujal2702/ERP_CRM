import React from 'react';
import { Package, Shield, Users, FileText, CheckCircle2 } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl space-y-6">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-lg">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Mini ERP + CRM Operations Portal</h1>
            <p className="text-sm text-slate-400">Phase 1 & Phase 2 Complete - Project Structure & Database Schema Ready</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/80 flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-slate-200">Express & TypeScript Backend</h3>
              <p className="text-xs text-slate-400 mt-1">REST API framework configured with central error handling and health route.</p>
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/80 flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-slate-200">Prisma PostgreSQL Schema</h3>
              <p className="text-xs text-slate-400 mt-1">User, Customer, Product, StockMovement, Challan, and ChallanItem models created.</p>
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/80 flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-slate-200">Vite + React + Tailwind Frontend</h3>
              <p className="text-xs text-slate-400 mt-1">Typescript, Axios, React Hook Form, and Zod dependencies initialized.</p>
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/80 flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-slate-200">Database Seeding Script</h3>
              <p className="text-xs text-slate-400 mt-1">Configured to seed 4 User Roles (Admin, Sales, Warehouse, Accounts) & test data.</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-950/30 border border-blue-800/40 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-blue-200 font-medium">Ready to proceed to Phase 3 (Authentication & Roles)</span>
          </div>
          <span className="px-2.5 py-1 text-xs font-semibold bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">Phase 1 & 2 Completed</span>
        </div>
      </div>
    </div>
  );
}
