import { useNavigate } from 'react-router-dom';
import { Award, Truck, Shield, Users, ArrowRight, MapPin, CheckCircle, Sparkles } from 'lucide-react';

const STATS = [
  { value: '500+',   label: 'Retail Partners',    desc: 'Across India' },
  { value: '10K+',   label: 'Orders Delivered',   desc: 'And counting' },
  { value: '14',     label: 'Years in Business',  desc: 'Est. 2010' },
  { value: '98%',    label: 'Satisfaction Rate',  desc: 'Customer rated' },
];

const VALUES = [
  {
    icon: Award,
    title: 'Uncompromising Quality',
    desc: 'Every piece goes through strict quality checks. Premium fabrics, expert stitching, and consistent sizing — always.',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    text: 'text-amber-600',
  },
  {
    icon: Truck,
    title: 'Fast & Reliable Dispatch',
    desc: 'Orders processed within 24 hours. Pan-India shipping with real-time tracking so your inventory never runs dry.',
    color: 'from-blue-500 to-indigo-500',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
  },
  {
    icon: Shield,
    title: 'Transparent Pricing',
    desc: 'No hidden charges. Factory-direct rates with clear breakdowns — what you see is exactly what you pay.',
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
  },
  {
    icon: Users,
    title: 'Retailer-First Approach',
    desc: 'Dedicated support, flexible MOQs, and a team that understands the retail business inside out.',
    color: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-50',
    text: 'text-purple-600',
  },
];

const TIMELINE = [
  { year: '2010', title: 'Founded in Surat', desc: 'Started as a small wholesale unit at Global Textile Market.' },
  { year: '2014', title: 'Expanded Catalogue', desc: 'Grew to 500+ SKUs across ethnic, western, and fusion wear.' },
  { year: '2018', title: '200+ Partners', desc: 'Crossed 200 retail partners across Gujarat and Maharashtra.' },
  { year: '2024', title: 'Digital Platform', desc: 'Launched online ordering for retailers across India.' },
];

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">

      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center bg-[#080a0e] overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] bg-teal-600/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-[150px]" />

        {/* Grid pattern */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-[0.15em] px-5 py-2.5 rounded-full mb-8">
            <Sparkles size={12} className="fill-current" />
            Est. 2010 · Surat, Gujarat · Global Textile Market
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.05] mb-8">
            Where Fashion Meets
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300 bg-clip-text text-transparent">
              Factory Pricing
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
            Sandhya Fashion has been empowering retailers with premium wholesale apparel since 2010 — direct from Surat's largest textile hub to your store.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/shop')}
              className="group flex items-center justify-center gap-2.5 px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold text-base hover:bg-emerald-400 transition-all duration-200 shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5"
            >
              Browse Catalogue
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="flex items-center justify-center gap-2.5 px-8 py-4 bg-white/8 text-white rounded-2xl font-bold text-base hover:bg-white/15 transition-all duration-200 border border-white/15 backdrop-blur-sm"
            >
              Talk to Us
            </button>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600">
            <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
            <div className="w-px h-10 bg-gradient-to-b from-gray-600 to-transparent" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          STATS
      ══════════════════════════════════════════════════════ */}
      <section className="bg-gray-950 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, label, desc }) => (
              <div key={label} className="text-center">
                <p className="text-4xl md:text-5xl font-black text-white mb-1 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  {value}
                </p>
                <p className="text-white font-bold text-sm mb-0.5">{label}</p>
                <p className="text-gray-600 text-xs font-medium">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          STORY
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

            {/* Text */}
            <div>
              <p className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">Our Story</p>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-8">
                Built for Retailers,<br />
                <span className="text-emerald-600">Powered by Trust</span>
              </h2>
              <div className="space-y-5 text-gray-500 leading-relaxed">
                <p>
                  Founded in 2010 at Surat's Global Textile Market, Sandhya Fashion was born from a single conviction — every retailer deserves access to factory-direct quality without the factory-minimum headaches.
                </p>
                <p>
                  Over 14 years, we've grown from a single stall to a full-scale wholesale operation serving 500+ retail partners across India. Our catalogue spans premium ethnic wear, contemporary western styles, and fusion collections — all sourced directly from top-tier manufacturers.
                </p>
              </div>

              {/* Checklist */}
              <div className="mt-8 space-y-3">
                {['Factory-direct pricing, no middlemen', 'Flexible minimum order quantities', 'Pan-India shipping with tracking', 'Dedicated account support'].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle size={12} className="text-emerald-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{item}</span>
                  </div>
                ))}
              </div>

              {/* Address pill */}
              <div className="mt-8 inline-flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5">
                <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin size={15} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Our Location</p>
                  <p className="text-sm font-semibold text-gray-800">Shop B/5083, Global Textile Market, Surat 395010</p>
                </div>
              </div>
            </div>

            {/* Visual */}
            <div className="relative">
              {/* Main image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-gray-200 aspect-[4/5]">
                <img
                  src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=700"
                  alt="Sandhya Fashion"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.parentElement.style.background = 'linear-gradient(135deg, #ecfdf5, #d1fae5)';
                    e.target.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>

              {/* Floating stat card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl shadow-gray-200 p-5 border border-gray-100">
                <p className="text-3xl font-black text-gray-900">14+</p>
                <p className="text-sm font-bold text-gray-500">Years of Excellence</p>
                <div className="flex gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  ))}
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-emerald-600 text-white rounded-2xl px-4 py-3 shadow-xl shadow-emerald-500/30 text-center">
                <p className="text-xl font-black">500+</p>
                <p className="text-emerald-100 text-xs font-bold">Partners</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          VALUES
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] mb-3">Why Choose Us</p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900">What Sets Us Apart</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALUES.map(({ icon: Icon, title, desc, bg, text }) => (
              <div
                key={title}
                className="group bg-white rounded-3xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100 hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={26} className={text} />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          TIMELINE
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] mb-3">Our Journey</p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900">14 Years of Growth</h2>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500 via-emerald-300 to-transparent" />

            <div className="space-y-10">
              {TIMELINE.map(({ year, title, desc }, i) => (
                <div key={year} className="flex gap-8 items-start">
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 z-10 relative">
                      <span className="text-white font-black text-sm">{year}</span>
                    </div>
                  </div>
                  <div className="pt-3 pb-2">
                    <h3 className="text-xl font-black text-gray-900 mb-1">{title}</h3>
                    <p className="text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-gray-950 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-teal-600/10 rounded-full blur-[80px]" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em] mb-4">Start Today</p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            Ready to Grow Your<br />Fashion Business?
          </h2>
          <p className="text-gray-400 text-lg font-medium mb-10 max-w-xl mx-auto">
            Join 500+ retailers who trust Sandhya Fashion for premium wholesale apparel at factory-direct prices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/shop')}
              className="group flex items-center justify-center gap-2.5 px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold text-base hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/25 hover:-translate-y-0.5"
            >
              View Full Catalogue
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="flex items-center justify-center gap-2.5 px-8 py-4 bg-white/8 text-white rounded-2xl font-bold text-base hover:bg-white/15 transition-all border border-white/15"
            >
              Contact Our Team
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
