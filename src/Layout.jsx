import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils/index";
// import { base44 } from "./api/client";
import { Menu, X, Shield, User } from "lucide-react";
// import HedgeChat from "./components/HedgeChat";
import compass from "./assets/compass.png";

export default function Layout({ children, currentPageName }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, _setUser] = useState(null);

  useEffect(() => {
    // base44?.auth?.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { name: "Home", page: "Home" },
    { name: "Screening", page: "Screening" },
    // { name: "Learn", page: "Learn" },
    { name: "Find Help", page: "HelpFinder" },
    // { name: "Community", page: "Community" },
    { name: "Resources", page: "Resources" },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF7] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700;800;900&family=Playfair+Display:wght@700;800&display=swap');

        * { font-family: 'Nunito', sans-serif; }
        h1, h2, .serif { font-family: 'Playfair Display', serif; }

        :root {
          --sage: #6B8F71;
          --sage-light: #A8C5A0;
          --warm-cream: #FDF6E3;
          --soft-peach: #F4A261;
          --muted-teal: #457B9D;
          --lavender: #B8A9C9;
          --charcoal: #2D3748;
          --hedgehog-blue: #243956;
          --serif: 'Playfair Display', serif;
        }

        .nav-link {
          position: relative;
          transition: color 0.3s;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--sage);
          transition: width 0.3s ease;
        }
        .nav-link:hover::after { width: 100%; }

        .gradient-hero {
          background: linear-gradient(135deg, #E8F5E9 0%, #E3F2FD 50%, #F3E5F5 100%);
        }

        .card-hover {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }

        .hipaa-badge {
          background: linear-gradient(135deg, #1a472a, #2d6a4f);
          color: white;
        }

        .btn-primary {
          background: linear-gradient(135deg, #6B8F71, #457B9D);
          color: white;
          padding: 0.75rem 2rem;
          border-radius: 50px;
          font-weight: 700;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(107,143,113,0.4);
        }

        .btn-secondary {
          background: white;
          color: #6B8F71;
          border: 2px solid #6B8F71;
          padding: 0.75rem 2rem;
          border-radius: 50px;
          font-weight: 700;
          transition: all 0.3s;
        }
        .btn-secondary:hover {
          background: #6B8F71;
          color: white;
          transform: translateY(-2px);
        }

        .section-wave {
          clip-path: ellipse(100% 60% at 50% 40%);
        }

        /* Hedgehog spinner */
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-slow { animation: spin-slow 8s linear infinite; }

        /* Floating animation */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        .float { animation: float 4s ease-in-out infinite; }

        /* Pulse glow */
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(107,143,113,0.4); }
          50% { box-shadow: 0 0 0 12px rgba(107,143,113,0); }
        }
        .pulse-glow { animation: pulse-glow 2.5s ease-in-out infinite; }

        .text-sage { color: var(--sage); }
        .bg-sage { background-color: var(--sage); }
        .text-teal { color: var(--muted-teal); }
        .bg-warm-cream { background-color: var(--warm-cream); }
      `}</style>

      {/* HIPAA Compliance Banner */}
      <div className="hipaa-badge text-center py-1.5 text-xs font-semibold tracking-wide flex items-center justify-center gap-2">
        <Shield className="w-3 h-3" />
        HIPAA Compliant Platform — Your child's information is encrypted and protected
        <Shield className="w-3 h-3" />
      </div>

      {/* Navbar */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-md" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-2 group">
              <span className="text-3xl group-hover:animate-bounce"><img src={compass} alt="Hedgehog Compass" className="w-10 h-10" /></span>
              <div>
                <span className="text-xl serif font-black" style={{ color: "var(--hedgehog-blue)" }}>Hedgehog</span>
                <span className="text-xl ml-1" style={{ color: "var(--hedgehog-blue)" }}>Compass</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((l) => (
                <Link
                  key={l.page}
                  to={createPageUrl(l.page)}
                  className={`nav-link text-sm font-semibold ${currentPageName === l.page ? "text-sage" : "text-gray-600 hover:text-sage"}`}
                >
                  {l.name}
                </Link>
              ))}
              {/* {user ? (
                <div className="flex items-center gap-2">
                  <Link to={createPageUrl("Dashboard")} className="flex items-center gap-1.5 text-sm font-semibold text-sage hover:text-green-700 transition-colors">
                    <User className="w-4 h-4" /> {user.full_name?.split(" ")[0] || "Dashboard"}
                  </Link>
                  <button onClick={() => base44.auth.logout()} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Sign out</button>
                </div>
              ) : (
                <button onClick={() => base44.auth.redirectToLogin()} className="btn-primary text-sm">
                  Sign In / Register
                </button>
              )} */}
            </div>

            {/* Mobile toggle */}
            <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
            {navLinks.map((l) => (
              <Link
                key={l.page}
                to={createPageUrl(l.page)}
                className="block text-sm font-semibold text-gray-700 py-2"
                onClick={() => setMenuOpen(false)}
              >
                {l.name}
              </Link>
            ))}
            <Link to={createPageUrl("Screening")} className="btn-primary text-sm block text-center">
              Start Free Screening
            </Link>
          </div>
        )}
      </nav>

      <main>{children}</main>
      {/* <HedgeChat /> */}

      {/* Footer */}
      <footer className="bg-[#2D3748] text-gray-300 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl"></span>
              <span className="text-xl font-black text-white">Hedgehog Compass</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 mb-4">
              Helping families navigate their child's developmental journey with compassion, clarity, and trusted resources.
            </p>
            <div className="flex items-center gap-2 bg-green-900/40 border border-green-700 rounded-lg px-4 py-3 text-sm text-green-300">
              <Shield className="w-4 h-4 shrink-0" />
              <span>HIPAA Compliant — All data is encrypted and never shared without your consent.</span>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Navigate</h4>
            <ul className="space-y-2 text-sm">
              {navLinks.map((l) => (
                <li key={l.page}>
                  <Link to={createPageUrl(l.page)} className="hover:text-white transition-colors">{l.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">HIPAA Notice</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 text-center py-6 text-xs text-gray-500">
          <p>⚠️ Hedgehog Compass is an informational tool and does not provide medical diagnoses. Always consult a licensed healthcare provider.</p>
          <p className="mt-1">© 2026 Hedgehog Compass. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}