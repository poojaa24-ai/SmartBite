import React, { useState, useEffect } from 'react';
import { LifeBuoy, CheckCircle2, MessageCircle, Send, Clock, User } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/EmptyState';

const CustomerComplaints = () => {
  const { success, error } = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      let url = '/support/all';
      if (statusFilter) url += `?status=${statusFilter}`;
      const res = await api.get(url);
      if (res.data.success) {
        setTickets(res.data.tickets);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    try {
      const res = await api.post(`/support/${selectedTicket._id}/messages`, {
        message: replyMessage.trim(),
      });
      if (res.data.success) {
        success('Response sent to customer!');
        setReplyMessage('');
        setSelectedTicket(res.data.ticket);
        fetchTickets();
      }
    } catch (err) {
      error(err.message);
    }
  };

  const handleUpdateTicketStatus = async (ticketId, nextStatus) => {
    try {
      const res = await api.put(`/support/${ticketId}/status`, { status: nextStatus });
      if (res.data.success) {
        success(`Ticket marked as ${nextStatus}!`);
        if (selectedTicket?._id === ticketId) {
          setSelectedTicket(res.data.ticket);
        }
        fetchTickets();
      }
    } catch (err) {
      error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
            Customer Complaints & Support
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Resolve customer queries, food safety feedback, and refund inquiries
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-white border border-cream-300 rounded-xl font-bold"
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Tickets Queue */}
        <div className="lg:col-span-5 space-y-3">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 bg-white rounded-2xl border border-cream-200 animate-pulse" />
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <EmptyState
              icon={LifeBuoy}
              title="No Support Tickets"
              description="All customer inquiries and feedback have been resolved!"
            />
          ) : (
            tickets.map((t) => (
              <div
                key={t._id}
                onClick={() => setSelectedTicket(t)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all bg-white ${
                  selectedTicket?._id === t._id
                    ? 'border-forest-900 ring-2 ring-forest-900/10 shadow-md'
                    : 'border-cream-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-slate-900">#{t.ticketId}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    t.status === 'resolved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : t.status === 'open'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {t.status}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{t.subject}</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  User: {t.user?.name} ({t.user?.role})
                </p>
              </div>
            ))
          )}
        </div>

        {/* Selected Ticket Conversation Thread */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft">
          {selectedTicket ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-cream-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-400">
                      #{selectedTicket.ticketId}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cream-100 text-slate-800 uppercase">
                      {selectedTicket.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h3 className="text-base font-bold font-serif text-slate-900 mt-1">
                    {selectedTicket.subject}
                  </h3>
                </div>

                <div className="flex gap-2">
                  {selectedTicket.status !== 'resolved' && (
                    <button
                      onClick={() => handleUpdateTicketStatus(selectedTicket._id, 'resolved')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>

              {/* Message Thread */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {selectedTicket.messages?.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                      msg.senderRole === 'admin'
                        ? 'bg-forest-900 text-white ml-8'
                        : 'bg-cream-50 border border-cream-200 text-slate-800 mr-8'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] opacity-75">
                      <span className="font-bold capitalize">{msg.senderRole}</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="leading-relaxed">{msg.message}</p>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="flex gap-2 pt-2 border-t border-cream-100">
                <input
                  type="text"
                  required
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type official support reply to user..."
                  className="flex-1 px-4 py-2.5 text-xs bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-forest-900 text-white text-xs font-bold hover:bg-forest-800 flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="py-20 text-center text-xs text-slate-400">
              Select a support ticket from the list to view the conversation thread.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerComplaints;
