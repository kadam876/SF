import { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Clock, Send, CheckCircle, ArrowRight } from 'lucide-react';

const CONTACT_INFO = [
  {
    icon: Phone,
    label: 'Phone',
    value: '+91 7574927364',
    sub: 'Mon–Sat, 9 AM – 7 PM',
    href: 'tel:+917574927364',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'Sandhyafashion39@gmail.com',
    sub: 'Reply within 24 hours',
    href: 'mailto:Sandhyafashion39@gmail.com',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: MapPin,
    label: 'Address',
    value: 'Shop B/5083, Global Textile Market',
    sub: 'Surat 395010, Gujarat',
    href: 'https://maps.google.com/?q=Global+Textile+Market+Surat',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    icon: Clock,
    label: 'Business Hours',
    value: 'Mon – Saturday',
    sub: '9:00 AM – 7:00 PM IST',
    href: null,
    color: 'bg-amber-50 text-amber-600',
  },
];

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', businessName: '', message: '' });
  const [loading, setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setSubmitted(true);
    setLoading(false);
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent("Hi! I'm interested in your wholesale collection. Please share more details.");
    window.open(`https://wa.me/917574927364?text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <section className="relative bg-gray-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
          <span className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <MessageCircle size={12} /> We'd love to hear from you
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Get in <span className="text-emerald-400">Touch</span>
          </h1>
          <p className="text-gray-400 font-medium max-w-xl mx-auto text-lg">
            Wholesale inquiries, bulk orders, partnerships — our team is ready to help.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* ── Contact info ── */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-extrabold text-gray-900 mb-6">Contact Details</h2>

            {CONTACT_INFO.map(({ icon: Icon, label, value, sub, href, color }) => (
              <div key={label} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                    {href ? (
                      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                        className="font-bold text-gray-900 text-sm hover:text-emerald-600 transition-colors break-all">
                        {value}
                      </a>
                    ) : (
                      <p className="font-bold text-gray-900 text-sm">{value}</p>
                    )}
                    <p className="text-xs text-gray-400 font-medium mt-0.5">{sub}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* WhatsApp CTA */}
            <button
              onClick={handleWhatsApp}
              className="w-full flex items-center justify-center gap-3 py-3.5 bg-green-500 text-white rounded-2xl font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 mt-2"
            >
              <MessageCircle size={18} />
              Chat on WhatsApp
              <ArrowRight size={16} />
            </button>
          </div>

          {/* ── Form ── */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 bg-gray-50 rounded-3xl border border-gray-100">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-5">
                  <CheckCircle size={32} className="text-emerald-600" />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-gray-500 font-medium mb-8 max-w-xs">
                  Thanks for reaching out. We'll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', businessName: '', message: '' }); }}
                  className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-3xl border border-gray-100 p-8">
                <h2 className="text-xl font-extrabold text-gray-900 mb-6">Send a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                      <input
                        type="text" name="name" value={form.name} onChange={handleChange} required
                        placeholder="Your name"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Business Name</label>
                      <input
                        type="text" name="businessName" value={form.businessName} onChange={handleChange}
                        placeholder="Your shop / business"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email *</label>
                      <input
                        type="email" name="email" value={form.email} onChange={handleChange} required
                        placeholder="you@email.com"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Phone</label>
                      <input
                        type="tel" name="phone" value={form.phone} onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Message *</label>
                    <textarea
                      name="message" value={form.message} onChange={handleChange} required rows={5}
                      placeholder="Tell us about your wholesale needs, quantities, or any questions…"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-gray-900/10"
                  >
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</>
                    ) : (
                      <><Send size={16} /> Send Message</>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
