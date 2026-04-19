import { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Clock, Send, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

const CONTACT_CARDS = [
  {
    icon: Phone,
    label: 'Call Us',
    value: '+91 7574927364',
    sub: 'Mon – Sat, 9 AM to 7 PM IST',
    href: 'tel:+917574927364',
    gradient: 'from-blue-500 to-indigo-600',
    glow: 'shadow-blue-500/20',
  },
  {
    icon: Mail,
    label: 'Email Us',
    value: 'Sandhyafashion39@gmail.com',
    sub: 'We reply within 24 hours',
    href: 'mailto:Sandhyafashion39@gmail.com',
    gradient: 'from-purple-500 to-pink-600',
    glow: 'shadow-purple-500/20',
  },
  {
    icon: MapPin,
    label: 'Visit Us',
    value: 'Shop B/5083, Global Textile Market',
    sub: 'Surat 395010, Gujarat, India',
    href: 'https://maps.google.com/?q=Global+Textile+Market+Surat',
    gradient: 'from-rose-500 to-orange-500',
    glow: 'shadow-rose-500/20',
  },
  {
    icon: Clock,
    label: 'Business Hours',
    value: 'Monday – Saturday',
    sub: '9:00 AM – 7:00 PM IST',
    href: null,
    gradient: 'from-amber-500 to-yellow-500',
    glow: 'shadow-amber-500/20',
  },
];

const INPUT_CLS = 'w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all';
const LABEL_CLS = 'block text-xs font-bold text-gray-500 uppercase tracking-[0.1em] mb-2';

const Contact = () => {
  const [form, setForm]         = useState({ name: '', email: '', phone: '', businessName: '', message: '' });
  const [loading, setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setSubmitted(true);
    setLoading(false);
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent("Hi! I'm interested in your wholesale collection. Please share more details.");
    window.open(`https://wa.me/917574927364?text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <section className="relative bg-[#080a0e] overflow-hidden py-28 md:py-36">
        {/* Orbs */}
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-emerald-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-teal-600/10 rounded-full blur-[80px]" />
        {/* Grid */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-[0.15em] px-5 py-2.5 rounded-full mb-8">
            <MessageCircle size={12} />
            We'd love to hear from you
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.05] mb-6">
            Let's Start a
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300 bg-clip-text text-transparent">
              Conversation
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 font-medium max-w-xl mx-auto">
            Wholesale inquiries, bulk orders, or just want to know more — our team is here for you.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CONTACT CARDS
      ══════════════════════════════════════════════════════ */}
      <section className="bg-gray-950 py-14 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CONTACT_CARDS.map(({ icon: Icon, label, value, sub, href, gradient, glow }) => (
              <div
                key={label}
                className={`group relative bg-white/5 border border-white/8 rounded-2xl p-6 hover:bg-white/8 transition-all duration-300 hover:-translate-y-1 ${href ? 'cursor-pointer' : ''}`}
                onClick={() => href && window.open(href, href.startsWith('http') ? '_blank' : '_self')}
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg ${glow} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={22} className="text-white" />
                </div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.12em] mb-1">{label}</p>
                <p className="text-white font-bold text-sm leading-snug mb-1 break-all">{value}</p>
                <p className="text-gray-600 text-xs font-medium">{sub}</p>
                {href && (
                  <ArrowRight size={14} className="absolute top-6 right-6 text-gray-700 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FORM + SIDEBAR
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-start">

            {/* ── Left sidebar ── */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <p className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] mb-3">Reach Out</p>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
                  We're Here<br />to Help
                </h2>
                <p className="text-gray-500 mt-4 leading-relaxed">
                  Whether you're a new retailer looking to start or an existing partner with questions — we respond fast.
                </p>
              </div>

              {/* WhatsApp */}
              <button
                onClick={handleWhatsApp}
                className="group w-full flex items-center gap-4 p-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold hover:from-green-400 hover:to-emerald-500 transition-all shadow-xl shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-0.5"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={22} />
                </div>
                <div className="text-left flex-1">
                  <p className="font-black text-base">Chat on WhatsApp</p>
                  <p className="text-green-100 text-sm font-medium">Fastest response — usually within minutes</p>
                </div>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </button>

              {/* Trust badges */}
              <div className="space-y-3">
                {[
                  { icon: CheckCircle, text: 'Response within 24 hours guaranteed' },
                  { icon: CheckCircle, text: 'Dedicated wholesale support team' },
                  { icon: CheckCircle, text: 'No spam, just helpful answers' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <Icon size={16} className="text-emerald-500 flex-shrink-0" />
                    <span className="text-sm font-semibold text-gray-600">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Form ── */}
            <div className="lg:col-span-3">
              {submitted ? (
                <div className="flex flex-col items-center justify-center text-center py-20 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border border-emerald-100">
                  <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/30">
                    <CheckCircle size={36} className="text-white" />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-3">Message Sent!</h3>
                  <p className="text-gray-500 font-medium mb-8 max-w-xs leading-relaxed">
                    Thank you for reaching out. Our team will get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', businessName: '', message: '' }); }}
                    className="px-7 py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-3xl border border-gray-100 p-8 md:p-10">
                  <div className="mb-8">
                    <h2 className="text-2xl font-black text-gray-900 mb-1">Send a Message</h2>
                    <p className="text-gray-500 text-sm font-medium">Fill in the form and we'll be in touch shortly.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className={LABEL_CLS}>Full Name <span className="text-red-400">*</span></label>
                        <input type="text" name="name" value={form.name} onChange={handleChange} required
                          placeholder="Your full name" className={INPUT_CLS} />
                      </div>
                      <div>
                        <label className={LABEL_CLS}>Business / Shop Name</label>
                        <input type="text" name="businessName" value={form.businessName} onChange={handleChange}
                          placeholder="Your business name" className={INPUT_CLS} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className={LABEL_CLS}>Email Address <span className="text-red-400">*</span></label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} required
                          placeholder="you@email.com" className={INPUT_CLS} />
                      </div>
                      <div>
                        <label className={LABEL_CLS}>Phone Number</label>
                        <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                          placeholder="+91 98765 43210" className={INPUT_CLS} />
                      </div>
                    </div>

                    <div>
                      <label className={LABEL_CLS}>Your Message <span className="text-red-400">*</span></label>
                      <textarea
                        name="message" value={form.message} onChange={handleChange} required rows={5}
                        placeholder="Tell us about your wholesale needs — product types, quantities, delivery location…"
                        className={`${INPUT_CLS} resize-none`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-3 py-4 bg-gray-900 text-white rounded-xl font-black text-sm hover:bg-emerald-600 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-gray-900/10 hover:shadow-emerald-500/25 hover:-translate-y-0.5"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending your message…
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
