import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, LifeBuoy } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ContactUs = () => {
  const { user } = useAuth();
  const { success, error, info } = useToast();

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('order_issue');
  const [priority, setPriority] = useState('medium');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [ticketCreated, setTicketCreated] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !message) {
      error('Please fill in the subject and description.');
      return;
    }

    if (!user) {
      info('Please sign in to submit a trackable support request.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/support', {
        subject,
        category,
        priority,
        message,
      });

      if (res.data.success) {
        setTicketCreated(res.data.ticket);
        success('Support ticket created successfully!');
        setSubject('');
        setMessage('');
      }
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="px-3 py-1 rounded-full bg-forest-900 text-white text-xs font-bold uppercase tracking-wider">
          We're Here to Help
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-serif">
          Contact SmartBite Support
        </h1>
        <p className="text-sm text-slate-600">
          Have an inquiry, feedback about a homemade dish, or need assistance? Reach out to our dedicated support team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Contact Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-cream-200 shadow-soft space-y-6">
            <h3 className="text-xl font-bold font-serif text-slate-900">Headquarters & Details</h3>

            <div className="space-y-4 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center text-forest-800 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Registered Office</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    SmartBite Kitchen Technologies Pvt. Ltd., #284, 80 Feet Road, 5th Block, Koramangala, Bangalore, Karnataka - 560095
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center text-forest-800 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Customer Helpline</h4>
                  <p className="text-xs text-slate-500 mt-0.5">+91 80 4912 3456 (8:00 AM - 10:00 PM)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center text-forest-800 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Email Inquiries</h4>
                  <p className="text-xs text-slate-500 mt-0.5">support@smartbite.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Submit Support Ticket Form */}
        <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-cream-200 shadow-soft">
          <h3 className="text-xl font-bold font-serif text-slate-900 mb-2">Submit a Support Ticket</h3>
          <p className="text-xs text-slate-500 mb-6">
            Our customer grievance officers respond to all tickets within 2 business hours.
          </p>

          {ticketCreated ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="text-lg font-bold text-emerald-950 font-serif">Ticket Submitted Successfully!</h4>
              <p className="text-xs text-emerald-800">
                Ticket Reference: <span className="font-bold">{ticketCreated.ticketId}</span>
              </p>
              <button
                onClick={() => setTicketCreated(null)}
                className="mt-3 px-5 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Issue Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800 font-medium"
                  >
                    <option value="order_issue">Order Issue / Delayed Delivery</option>
                    <option value="food_quality">Food Quality or Packaging</option>
                    <option value="delivery">Delivery Location Query</option>
                    <option value="payment">Payment & Refund</option>
                    <option value="seller_inquiry">Home Chef Application Question</option>
                    <option value="other">General Feedback / Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800 font-medium"
                  >
                    <option value="low">Low (General question)</option>
                    <option value="medium">Medium (Standard request)</option>
                    <option value="high">High (Urgent order issue)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Inquiring about daily lunch tiffin delivery schedule"
                  className="w-full px-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Message</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your inquiry or order details..."
                  className="w-full px-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-2xl bg-forest-900 text-white font-bold text-sm hover:bg-forest-800 transition-colors shadow-md flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Support Ticket</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
