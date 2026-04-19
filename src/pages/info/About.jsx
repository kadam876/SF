import { useNavigate } from 'react-router-dom';
import { Award, Truck, Shield, Users, ArrowRight, MapPin, Star } from 'lucide-react';

const STATS = [
  { value: '500+',   label: 'Retail Partners' },
  { value: '10K+',   label: 'Orders Delivered' },
  { value: '14 Yrs', label: 'In Business' },
  { value: '98%',    label: 'Satisfaction Rate' },
];

const VALUES = [
  { icon: Award,  title: 'Quality First',       desc: 'Premium fabrics and rigorous quality control in every piece we ship.' },
  { icon: Truck,  title: 'Fast Dispatch',        desc: 'Quick turnaround and reliable shipping to keep your inventory stocked.' },
  { icon: Shield, title: 'Trust & Reliability',  desc: 'Transparent pricing, consistent quality, and long-term partnerships.' },
  { icon: Users,  title: 'Retailer Focused',     desc: 'Your success is our success — we support every step of your journey.' },
];

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <section className="relative bg-gray-950 text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
          <span className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <Star size={12} fill="currentColor" /> Est. 2010 · Surat, Gujarat
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
            Wholesale Fashion,<br />
            <span className="text-emerald-400">Factory Direct</span>
          </h1>
          <p className="text-lg text-gray-400 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            Sandhya Fashion bridges premium manufacturing and retail businesses — delivering quality apparel at prices that let your business thrive.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/shop')}
              className="flex items-center justify-center gap-2 px-7 py-3.5 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25"
            >
              Browse Catalogue <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all border border-white/10"
            >
              Get in Touch
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-emerald-600">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-black mb-1">{value}</p>
                <p className="text-emerald-100 text-sm font-semibold">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Story ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Our Story</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2 mb-6 leading-tight">
              Built for Retailers,<br />Powered by Quality
            </h2>
            <p className="text-gray-500 leading-relaxed mb-5">
              Founded in 2010 at Surat's Global Textile Market, Sandhya Fashion started with a simple idea — give every retailer access to factory-direct pricing without sacrificing quality or style.
            </p>
            <p className="text-gray-500 leading-relaxed mb-8">
              Today we serve 500+ retail partners across India, offering a curated catalogue of premium ethnic wear, western wear, and fusion collections — all sourced directly from top-tier manufacturers.
            </p>
            <div className="flex items-center gap-3 text-sm font-semibold text-gray-700 bg-gray-50 rounded-2xl px-5 py-4 border border-gray-100">
              <MapPin size={18} className="text-emerald-500 flex-shrink-0" />
              Shop No. B/5083, Upper Ground Floor, Global Textile Market, Surat 395010
            </div>
          </div>

          {/* Visual card stack */}
          <div className="relative h-80 lg:h-96">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl" />
            <div className="absolute top-6 left-6 right-6 bottom-6 bg-white rounded-2xl shadow-xl flex items-center justify-center overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=600"
                alt="Sandhya Fashion"
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 -right-4 bg-emerald-600 text-white rounded-2xl px-5 py-3 shadow-xl shadow-emerald-500/30">
              <p className="text-2xl font-black">14+</p>
              <p className="text-emerald-100 text-xs font-bold">Years of Trust</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Why Choose Us</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={22} className="text-emerald-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gray-950 rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Ready to Partner With Us?</h2>
            <p className="text-gray-400 font-medium mb-8 max-w-md mx-auto">
              Join 500+ retailers who trust Sandhya Fashion for their wholesale needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/shop')}
                className="px-7 py-3.5 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
              >
                View Catalogue <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="px-7 py-3.5 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all border border-white/10"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
