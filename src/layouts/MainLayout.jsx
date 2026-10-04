import React, { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  UserPlus,
  HandHeart,
  Wallet,
  Handshake,
  Building2,
  BarChart3,
  Settings,
  Headset,
  ChevronDown,
  Plus,
  LogOut,
  User,
  Menu,
  X,
} from "lucide-react";

export default function MainLayout() {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileRef = useRef(null);

  // Déconnexion
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Fermer le dropdown profil au clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-700 relative overflow-x-hidden">

      {/* =====================================================
          EN-TÊTE MOBILE (HEADER WITH BURGER)
      ====================================================== */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0E5A36] text-white flex items-center justify-between px-4 z-40 shadow-md">
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl text-[#0E5A36]">
          <div className="w-6 h-6 rounded-full border border-[#0E5A36] flex items-center justify-center font-bold">
            <Plus className="w-4 h-4 text-[#0E5A36]" />
          </div>
          <span className="font-bold text-sm">CMU</span>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-white"
          aria-label="Ouvrir le menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* =====================================================
          OVERLAY MOBILE (FOND OMBRAGÉ AU CLIC)
      ====================================================== */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* =====================================================
          SIDEBAR (DESKTOP ET MOBILE)
      ====================================================== */}
      <aside
        className={`
          fixed z-50
          w-64 bg-[#0E5A36] text-white
          flex flex-col justify-between
          p-4 shadow-2xl lg:shadow-lg
          overflow-y-auto transition-transform duration-300 ease-in-out
          
          /* Mobile layout */
          inset-y-0 left-0 rounded-r-3xl
          
          /* Desktop layout (flottant avec arrondi) */
          lg:top-2 lg:bottom-2 lg:left-2 lg:h-[calc(100vh-16px)] lg:rounded-2xl
          
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* PARTIE SUPÉRIEURE */}
        <div>
          {/* LOGO CMU */}
          <div className="flex items-center gap-3 px-3 py-3 mb-5 bg-white rounded-xl text-[#0E5A36]">
            <div className="w-9 h-9 rounded-full border-2 border-[#0E5A36] flex items-center justify-center font-bold">
              <Plus className="w-5 h-5 text-[#0E5A36]" />
            </div>

            <div>
              <h1 className="font-bold leading-none text-base">CMU</h1>
              <p className="text-[9px] text-slate-500 font-medium">
                Couverture Maladie Universelle
              </p>
            </div>
          </div>

          {/* MENU PRINCIPAL */}
          <nav className="space-y-1.5 text-xs">
            <SidebarLink
              to="/dashboard"
              icon={<LayoutDashboard className="w-4 h-4" />}
              label="Tableau de bord"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <SidebarLink
              to="/beneficiaires"
              icon={<Users className="w-4 h-4" />}
              label="Bénéficiaires"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <SidebarLink
              to="/adhesions"
              icon={<UserPlus className="w-4 h-4" />}
              label="Adhésions"
              onClick={() => setIsMobileMenuOpen(false)}
            />
           
            <SidebarLink
              to="/paiements"
              icon={<Wallet className="w-4 h-4" />}
              label="Paiements"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            <SidebarLink
              to="/communes"
              icon={<Building2 className="w-4 h-4" />}
              label="Communes"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <SidebarLink
              to="/rapports"
              icon={<BarChart3 className="w-4 h-4" />}
              label="Rapports"
              onClick={() => setIsMobileMenuOpen(false)}
            />
           
          </nav>
        </div>

        {/* PARTIE BASSE */}
        <div className="space-y-3 mt-6">
          {/* SUPPORT */}
          <div className="bg-white/10 p-3 rounded-2xl text-center">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Headset className="w-4 h-4" />
            </div>

            <p className="text-[10px] text-slate-200">Besoin d'aide ?</p>
            <p className="text-xs font-semibold mb-2">Contactez le support</p>

            <button
              type="button"
              className="w-full py-1.5 bg-white text-[#0E5A36] font-semibold rounded-xl text-xs hover:bg-slate-100 transition"
            >
              Nous contacter
            </button>
          </div>

          {/* PROFIL ADMINISTRATEUR */}
          <div
            ref={profileRef}
            className="relative flex items-center justify-between pt-3 border-t border-white/10"
          >
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-white text-[#0E5A36] rounded-full flex items-center justify-center font-bold text-xs">
                AN
              </div>

              <div>
                <p className="text-xs font-bold leading-tight">Administrateur</p>
                <p className="text-[9px] text-slate-300">Administrateur système</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="p-1 hover:bg-white/10 rounded-lg transition"
              aria-label="Menu profil"
            >
              <ChevronDown
                className={`w-4 h-4 text-slate-300 transition-transform duration-200 ${
                  isProfileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* MENU PROFIL DROPDOWN */}
            {isProfileOpen && (
              <div className="absolute bottom-12 right-0 w-44 bg-white text-slate-700 rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    setIsMobileMenuOpen(false);
                    navigate("/profil");
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs hover:bg-slate-100 transition"
                >
                  <User className="w-4 h-4" />
                  Mon profil
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* =====================================================
          CONTENU PRINCIPAL
      ====================================================== */}
      <main className="flex-1 w-full lg:ml-[272px] pt-20 lg:pt-6 p-4 lg:p-6 min-h-screen">
        <Outlet />
      </main>

    </div>
  );
}

/* ==========================================================
   COMPOSANT SIDEBAR LINK
========================================================== */

function SidebarLink({ to, icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `
          flex items-center gap-3
          px-4 py-2.5
          rounded-xl
          transition-all
          duration-200
          ${
            isActive
              ? "bg-white/20 text-white font-semibold shadow-sm"
              : "text-emerald-100/80 hover:bg-white/10 hover:text-white"
          }
        `
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}