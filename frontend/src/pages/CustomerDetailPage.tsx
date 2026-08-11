import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { customerService } from '../services/customer.service';
import { Customer, CustomerNote } from '../types/customer';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import {
  Users,
  ArrowLeft,
  Edit,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  PlusCircle,
  FileText,
  UserCheck,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [newNote, setNewNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noteError, setNoteError] = useState<string | null>(null);

  const isWritableRole = user?.role === 'ADMIN' || user?.role === 'SALES';

  const fetchCustomerDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await customerService.getCustomerById(id);
      if (response.success && response.data?.customer) {
        setCustomer(response.data.customer);
      } else {
        setError(response.message || 'Failed to load customer details');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Customer not found');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newNote.trim()) return;

    setNoteError(null);
    setIsSubmittingNote(true);

    try {
      const response = await customerService.addCustomerNote(id, newNote);
      if (response.success) {
        setNewNote('');
        fetchCustomerDetails(); // Refresh details & notes
      } else {
        setNoteError(response.message || 'Failed to add note');
      }
    } catch (err: any) {
      setNoteError(err.response?.data?.message || err.message || 'Failed to add follow-up note');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">ACTIVE</span>;
      case 'LEAD':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">LEAD</span>;
      case 'INACTIVE':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/20 text-slate-400 border border-slate-500/30">INACTIVE</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300">{status}</span>;
    }
  };

  const getTypeBadge = (type?: string) => {
    switch (type) {
      case 'WHOLESALE':
        return <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">WHOLESALE</span>;
      case 'DISTRIBUTOR':
        return <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">DISTRIBUTOR</span>;
      case 'RETAIL':
        return <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">RETAIL</span>;
      default:
        return <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-500/20 text-blue-300">{type}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-medium">Loading customer profile...</p>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Header />
        <main className="flex-1 max-w-3xl w-full mx-auto p-8">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-8 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
            <h2 className="text-xl font-bold text-red-300">Customer Not Found</h2>
            <p className="text-sm text-slate-400">{error || 'The requested customer record does not exist.'}</p>
            <Link
              to="/customers"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Customers</span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-4">
            <Link
              to="/customers"
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-white tracking-tight">{customer.name}</h1>
                {getStatusBadge(customer.status)}
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center space-x-2">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>{customer.businessName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {getTypeBadge(customer.customerType)}

            {isWritableRole && (
              <Link
                to={`/customers/${customer.id}/edit`}
                className="flex items-center space-x-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold transition"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </Link>
            )}
          </div>
        </div>

        {/* Info Grid & Follow-Up Notes Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Details Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>Business Profile</span>
              </h2>

              <div className="space-y-4 text-xs">
                <div>
                  <p className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Mobile Number</p>
                  <p className="text-slate-100 font-semibold mt-0.5 flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{customer.mobile}</span>
                  </p>
                </div>

                <div>
                  <p className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Email Address</p>
                  <p className="text-slate-100 font-semibold mt-0.5 flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    <span>{customer.email || 'N/A'}</span>
                  </p>
                </div>

                <div>
                  <p className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">GST Number</p>
                  <p className="text-slate-100 font-mono font-semibold mt-0.5 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 inline-block">
                    {customer.gstNumber || 'Not Registered'}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Next Follow-up Date</p>
                  <p className="text-slate-100 font-semibold mt-0.5 flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {customer.followUpDate
                        ? new Date(customer.followUpDate).toLocaleDateString(undefined, {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'No follow-up scheduled'}
                    </span>
                  </p>
                </div>

                <div>
                  <p className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Business Address</p>
                  <p className="text-slate-200 mt-1 bg-slate-950 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                    {customer.address}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 space-y-1">
                  <p>Account Manager: <span className="text-slate-300 font-medium">{customer.createdBy?.name || 'System'}</span></p>
                  <p>Created: <span className="text-slate-300 font-medium">{new Date(customer.createdAt).toLocaleDateString()}</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Follow-Up Notes Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Note Form */}
            {isWritableRole && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                  <PlusCircle className="w-4 h-4 text-blue-400" />
                  <span>Add Follow-up Note</span>
                </h2>

                {noteError && (
                  <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>{noteError}</span>
                  </div>
                )}

                <form onSubmit={handleAddNote} className="space-y-3">
                  <textarea
                    rows={3}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Enter discussion summary, follow-up outcome, or next action steps..."
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingNote || !newNote.trim()}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition disabled:opacity-40"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{isSubmittingNote ? 'Saving...' : 'Post Follow-up Note'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Notes Timeline List */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>Follow-Up Notes History</span>
                </div>
                <span className="text-xs font-medium bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full">
                  {customer.notes?.length || 0} Notes
                </span>
              </h2>

              {!customer.notes || customer.notes.length === 0 ? (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <MessageSquare className="w-8 h-8 text-slate-700 mx-auto" />
                  <p className="text-xs font-medium">No follow-up notes recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {customer.notes.map((note) => (
                    <div key={note.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
                      <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{note.note}</p>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/50">
                        <div className="flex items-center space-x-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                          <span className="font-semibold text-slate-300">{note.createdBy?.name || 'Staff Member'}</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{new Date(note.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
