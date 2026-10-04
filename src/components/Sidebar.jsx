import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  UserCircle,
  LogOut,
} from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      name: "Tableau de bord",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Bénéficiaires",
      path: "/beneficiaires",
      icon: Users,
    },
    {
      name: "Adhésions",
      path: "/adhesions",
      icon: CreditCard,
    },
    {
      name: "Profil",
      path: "/profil",
      icon: UserCircle,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <aside
      className="
        flex
        h-screen
        w-56
        shrink-0
        flex-col
        bg-[#087443]
        text-white
        shadow-xl
      "
    >
      {/* LOGO */}
      <div className="flex items-center justify-center px-4 py-6">
        <div className="flex h-28 w-full items-center justify-center rounded-2xl bg-white p-3 shadow-sm">
          <img
            src="/cmu-logo.png"
            alt="CMU"
            className="max-h-full max-w-full object-contain"
          />
        </div>
      </div>

      {/* MENU */}
      <nav className="mt-4 flex-1 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `
                mb-2
                flex
                items-center
                gap-4
                rounded-xl
                px-4
                py-3
                text-sm
                font-semibold
                transition-all
                duration-200
                ${
                  isActive
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                }
                `
              }
            >
              <Icon size={20} strokeWidth={2} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* DECONNEXION */}
      <div className="border-t border-white/10 p-3">
        <button
          onClick={handleLogout}
          className="
            flex
            w-full
            items-center
            gap-4
            rounded-xl
            px-4
            py-3
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-red-500/20
          "
        >
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;