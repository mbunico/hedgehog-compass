import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils/index";
// import { gsap } from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Shield, Star, Heart, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import compass from "../assets/compass.png";

// gsap.registerPlugin(ScrollTrigger);

const TESTIMONIALS = [
  { name: "Jessica M.", text: "Hedgehog Compass gave me the confidence to talk to my pediatrician. My son now has early intervention services and is thriving. 🌟", child: "Mom of a 3-year-old" },
  { name: "David & Priya K.", text: "We were so scared and confused. This site explained everything in plain English and helped us find a center 10 minutes away.", child: "Parents of twins, age 4" },
  { name: "Tanya R.", text: "The screening tool felt like talking to a knowledgeable friend. Not scary at all. We got answers within minutes.", child: "Single mom, 2-year-old daughter" },
  { name: "Marcus L.", text: "The Community Garden kept us sane during the 8-month wait for diagnosis. Other parents just GET it.", child: "Dad, son diagnosed at 3.5" },
];

const MILESTONES_PREVIEW = [
  { emoji: "👁️", label: "Eye Contact", age: "6 mo" },
  { emoji: "👂", label: "Responds to Name", age: "12 mo" },
  { emoji: "☝️", label: "Points & Shares", age: "18 mo" },
  { emoji: "💬", label: "Two-Word Phrases", age: "24 mo" },
  { emoji: "👫", label: "Plays with Others", age: "36 mo" },
];

export default function Home() {
  const heroRef = useRef(null);
  const hedgehogRef = useRef(null);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    // const ctx = gsap.context(() => {
    //   // Hero
    //   gsap.from(".hero-tag", { opacity: 0, y: -20, duration: 0.6, delay: 0.2 });
    //   gsap.from(".hero-title", { opacity: 0, y: 50, duration: 0.9, delay: 0.3, ease: "power3.out" });
    //   gsap.from(".hero-sub", { opacity: 0, y: 30, duration: 0.9, delay: 0.6, ease: "power3.out" });
    //   gsap.from(".hero-btn", { opacity: 0, y: 20, duration: 0.7, delay: 0.9, stagger: 0.15 });
    //   gsap.from(".trust-badge", { opacity: 0, y: 10, duration: 0.5, delay: 1.2, stagger: 0.1 });

    //   // Hedgehog wiggle
    //   gsap.to(hedgehogRef.current, { y: -18, duration: 2.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
    //   gsap.from(hedgehogRef.current, { opacity: 0, scale: 0.4, duration: 1, delay: 0.5, ease: "elastic.out(1,0.5)" });

    //   // Spines sparkle
    //   gsap.from(".spine", { opacity: 0, scale: 0, rotation: -45, stagger: 0.1, delay: 1, duration: 0.5, ease: "back.out(2)" });

    //   // Sections
    //   gsap.from(".big-btn", {
    //     scrollTrigger: { trigger: ".big-btns", start: "top 85%" },
    //     opacity: 0, y: 60, stagger: 0.15, duration: 0.7, ease: "power2.out"
    //   });
    //   gsap.from(".milestone-dot", {
    //     scrollTrigger: { trigger: ".milestone-row", start: "top 85%" },
    //     opacity: 0, scale: 0, stagger: 0.12, duration: 0.5, ease: "back.out(2)"
    //   });
    //   gsap.from(".testimonial-section", {
    //     scrollTrigger: { trigger: ".testimonial-section", start: "top 85%" },
    //     opacity: 0, y: 40, duration: 0.7
    //   });
    // });

    // Auto-rotate testimonials
    const t = setInterval(() => setTestimonialIdx((i) => (i + 1) % TESTIMONIALS.length), 5000);
    return () => { clearInterval(t); };
  }, []);

  const spawnConfetti = () => {
    const pieces = Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: ["#6B8F71", "#A8C5A0", "#F4A261", "#B8A9C9", "#FFD700"][Math.floor(Math.random() * 5)],
      size: 6 + Math.random() * 8,
      delay: Math.random() * 0.5,
    }));
    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 2500);
  };

  return (
    <div className="overflow-hidden">
      {/* Confetti */}
      {confetti.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {confetti.map((p) => (
            <div key={p.id} className="absolute animate-bounce" style={{
              left: `${p.x}%`, top: "-20px", width: p.size, height: p.size,
              backgroundColor: p.color, borderRadius: "2px",
              animation: `fall 2s ${p.delay}s ease-in forwards`,
            }} />
          ))}
          <style>{`@keyframes fall { to { transform: translateY(110vh) rotate(720deg); opacity: 0; } }`}</style>
        </div>
      )}

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden" style={{ background: "linear-gradient(135deg, #E8F5E9 0%, #E3F2FD 40%, #FFF8E1 70%, #F3E5F5 100%)" }}>
        {/* Soft blobs */}
        <div className="absolute top-20 left-0 w-80 h-80 rounded-full opacity-30 blur-3xl" style={{ background: "#A8C5A0" }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: "#B8A9C9" }} />
        <div className="absolute top-1/2 left-1/3 w-60 h-60 rounded-full opacity-20 blur-3xl" style={{ background: "#FFD700" }} />

        <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
          <div>
            <div className="hero-tag inline-flex items-center gap-2 bg-white/80 border border-green-200 rounded-full px-4 py-2 text-sm font-bold text-green-700 mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Trusted by 10,000+ families across the USA
            </div>

            <h1 className="hero-title text-5xl lg:text-6xl font-black leading-tight text-[#2D3748] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              Your compass for your child's{" "}
              <span className="relative inline-block text-[#6B8F71]">
                journey
                <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none">
                  <path d="M0 5 Q50 0 100 5 Q150 10 200 5" stroke="#6B8F71" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                </svg>
              </span>{" "}
              ahead.
            </h1>

            <p className="hero-sub text-xl text-gray-600 leading-relaxed mb-8 max-w-lg">
              Feeling worried about your child's development? You're not alone — and you're in the right place. Hedgehog Compass is here to help, one gentle step at a time.
            </p>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              {["HIPAA Compliant", "Free to use", "Not a diagnosis tool", "Expert-reviewed"].map((t) => (
                <div key={t} className="trust-badge flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-green-500" /> {t}
                </div>
              ))}
            </div>
          </div>

          {/* Hedgehog mascot */}
          <div className="flex flex-col items-center">
            <div ref={hedgehogRef} className="relative cursor-pointer select-none" onClick={spawnConfetti} title="Click me! 🦔">
              <div className="w-72 h-72 lg:w-80 lg:h-80 rounded-full flex items-center justify-center shadow-2xl relative"
                style={{ background: "radial-gradient(circle, #fff 60%, #E8F5E9 100%)", border: "4px solid rgba(107,143,113,0.2)" }}>
                <span className="text-[150px] leading-none"><img src={compass} alt="Hedgehog Compass" className="w-56 h-56" /></span>
              </div>
              {/* Spines / badges */}
              {[
                { label: "HIPAA Safe", icon: "🛡️", pos: "-top-4 -right-4", bg: "bg-green-100 border-green-300" },
                { label: "500+ Centers", icon: "📍", pos: "-bottom-4 -left-4", bg: "bg-blue-100 border-blue-300" },
                { label: "Free Screening", icon: "✅", pos: "top-1/2 -right-14", bg: "bg-yellow-100 border-yellow-300" },
                { label: "Expert Reviewed", icon: "⭐", pos: "top-8 -left-10", bg: "bg-purple-100 border-purple-300" },
              ].map((b) => (
                <div key={b.label} className={`spine absolute ${b.pos} ${b.bg} border rounded-2xl px-3 py-2 text-xs font-bold text-gray-700 shadow-md flex items-center gap-1.5 whitespace-nowrap`}>
                  <span>{b.icon}</span> {b.label}
                </div>
              ))}
            </div>
            {/* <p className="mt-6 text-sm text-gray-400 italic">👆 Click Hedge for a surprise!</p> */}
          </div>
        </div>
      </section>

      {/* 3 Big Buttons */}
      <section className="big-btns py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-center text-3xl font-black text-[#2D3748] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Where would you like to start?</h2>
          <p className="text-center text-gray-500 mb-12">Every journey is different — here are the most helpful places to begin.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { emoji: "📋", title: "Check My Child's Milestones", desc: "Take our free M-CHAT-R based screening in ~5 minutes and get instant, personalized guidance.", page: "Screening", color: "from-green-400 to-teal-400", light: "bg-green-50 border-green-200 hover:border-green-400" },
              { emoji: "🌿", title: "Resources", desc: "Explore a wide range of educational resources, including articles, videos, and interactive lessons.", page: "Resources", color: "from-purple-400 to-pink-400", light: "bg-purple-50 border-purple-200 hover:border-purple-400" },
              { emoji: "🗺️", title: "Find Help Near Me", desc: "Interactive map of verified autism centers with reviews, wait times & insurance info.", page: "HelpFinder", color: "from-blue-400 to-cyan-400", light: "bg-blue-50 border-blue-200 hover:border-blue-400" },
            ].map((b) => (
              <Link key={b.title} to={createPageUrl(b.page)} className={`big-btn block rounded-3xl border-2 ${b.light} p-8 text-center transition-all card-hover group`}>
                <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${b.color} flex items-center justify-center text-3xl mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  {b.emoji}
                </div>
                <h3 className="text-xl font-black text-[#2D3748] mb-3">{b.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-5">{b.desc}</p>
                <span className="inline-flex items-center gap-1 text-sm font-bold text-[#6B8F71]">
                  Let's go <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Milestone Preview */}
      <section className="py-16" style={{ background: "linear-gradient(135deg, #E8F5E9, #E3F2FD)" }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="text-4xl mb-4">🦔</div>
          <h2 className="text-3xl font-black text-[#2D3748] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Quick Milestone Peek</h2>
          <p className="text-gray-600 mb-10">Key developmental signs to watch for in your toddler's first 3 years.</p>
          <div className="milestone-row flex flex-wrap justify-center gap-4">
            {MILESTONES_PREVIEW.map((m) => (
              <div key={m.label} className="milestone-dot bg-white rounded-2xl border border-gray-100 shadow-md p-5 text-center w-28 card-hover">
                <div className="text-3xl mb-2">{m.emoji}</div>
                <div className="text-xs font-black text-[#6B8F71] mb-1">{m.age}</div>
                <div className="text-xs text-gray-600 font-medium leading-snug">{m.label}</div>
              </div>
            ))}
          </div>
          <Link to={createPageUrl("Screening")} className="btn-primary inline-flex items-center gap-2 mt-10">
            Take Full Screening <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonial-section py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="text-4xl mb-4">💛</div>
          <h2 className="text-3xl font-black text-[#2D3748] mb-10" style={{ fontFamily: "'Playfair Display', serif" }}>From families like yours</h2>

          <div className="relative bg-linear-to-br from-yellow-50 to-orange-50 rounded-3xl border border-orange-100 p-10 shadow-xl min-h-[200px] flex flex-col items-center justify-center">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}
            </div>
            <p className="text-lg text-gray-700 italic leading-relaxed mb-6">"{TESTIMONIALS[testimonialIdx].text}"</p>
            <div>
              <div className="font-black text-[#2D3748]">{TESTIMONIALS[testimonialIdx].name}</div>
              <div className="text-sm text-gray-500">{TESTIMONIALS[testimonialIdx].child}</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-6">
            <button onClick={() => setTestimonialIdx((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => setTestimonialIdx(i)} className={`w-2.5 h-2.5 rounded-full transition-all ${i === testimonialIdx ? "bg-[#6B8F71] w-6" : "bg-gray-300"}`} />
              ))}
            </div>
            <button onClick={() => setTestimonialIdx((i) => (i + 1) % TESTIMONIALS.length)} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto rounded-3xl p-12 text-center text-white relative overflow-hidden shadow-2xl" style={{ background: "linear-gradient(135deg, #6B8F71, #457B9D)" }}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white blur-3xl" />
          </div>
          <div className="relative z-10">
            <div className="text-6xl mb-4 float">🦔</div>
            <h2 className="text-4xl font-black mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>You've got this. Hedge has your back.</h2>
            <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">Early action makes the biggest difference. Start with a free 5-minute screening — no account needed.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to={createPageUrl("Screening")} className="bg-white text-[#6B8F71] font-black px-8 py-3 rounded-full hover:bg-green-50 transition-all shadow-md">
                Start Free Screening →
              </Link>
              <Link to={createPageUrl("Dashboard")} className="border-2 border-white text-white font-bold px-8 py-3 rounded-full hover:bg-white/10 transition-all">
                My Dashboard
              </Link>
            </div>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm opacity-70">
              <Shield className="w-4 h-4" /> HIPAA compliant · Encrypted · No diagnosis implied
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}