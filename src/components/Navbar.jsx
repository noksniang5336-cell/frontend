import React from "react";
import { Bell } from "lucide-react";

const Navbar = () => {
  return (
    <header
      className="
        sticky
        top-0
        z-40
        flex
        h-20
        items-center
        justify-between
        border-b
        border-gray-100
        bg-white
        px-6
      "
    >

      {/* GAUCHE */}
      <div>
        <p className="text-sm text-gray-500">
          Couverture Maladie Universelle
        </p>
      </div>

      {/* DROITE */}
      <div className="flex items-center gap-5">

        {/* NOTIFICATION */}
        <div className="relative">
          <Bell
            size={22}
            className="text-[#087443]"
          />

          <span
            className="
              absolute
              -right-2
              -top-2
              flex
              h-5
              w-5
              items-center
              justify-center
              rounded-full
              bg-red-500
              text-[10px]
              font-bold
              text-white
            "
          >
            3
          </span>
        </div>

        <div className="h-8 w-px bg-gray-200"></div>

        {/* PROFIL */}
        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-green-50
              font-bold
              text-[#087443]
            "
          >
            UN
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800">
              Administrateur
            </p>

            <p className="text-xs text-gray-500">
              Administrateur système
            </p>
          </div>

        </div>

      </div>
    </header>
  );
};

export default Navbar;