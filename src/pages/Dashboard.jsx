import React, { useEffect, useState } from "react";

import {
  Users,
  UserPlus,
  Wallet,
  Bell,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import api from "../utils/api";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // RÉCUPÉRER LES STATISTIQUES
  // =====================================================

  const chargerDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/dashboard/stats"
      );

      console.log(
        "📊 Réponse API Dashboard :",
        response.data
      );

      console.log(
        "📊 Données Dashboard :",
        response.data?.data
      );

      if (!response.data?.data) {
        throw new Error(
          "L'API n'a pas retourné les données du dashboard."
        );
      }

      setData(response.data.data);

    } catch (err) {
      console.error(
        "❌ Erreur Dashboard :",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Impossible de récupérer les statistiques depuis la base de données."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CHARGEMENT INITIAL
  // =====================================================

  useEffect(() => {
    chargerDashboard();
  }, []);

  // =====================================================
  // FORMATAGE
  // =====================================================

  const formatNombre = (valeur) => {
    const nombre = Number(valeur);

    if (Number.isNaN(nombre)) {
      return "0";
    }

    return new Intl.NumberFormat(
      "fr-FR"
    ).format(nombre);
  };

  const formatMontant = (valeur) => {
    const montant = Number(valeur);

    if (Number.isNaN(montant)) {
      return "0";
    }

    return new Intl.NumberFormat(
      "fr-FR"
    ).format(montant);
  };

  // =====================================================
  // DATE
  // =====================================================

  const dateAujourdhui =
    new Date().toLocaleDateString(
      "fr-FR",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );

  // =====================================================
  // UTILISATEUR
  // =====================================================

  const getUserFromStorage = () => {
    try {
      const item =
        localStorage.getItem("user");

      return item
        ? JSON.parse(item)
        : {};

    } catch {
      return {};
    }
  };

  const user =
    getUserFromStorage();

  const userName =
    user.prenom ||
    user.nom ||
    "Utilisateur";

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">

        <div className="relative flex items-center justify-center">

          <div className="w-16 h-16 border-4 border-[#075C37]/20 border-t-[#075C37] rounded-full animate-spin" />

          <Sparkles className="w-6 h-6 text-[#075C37] absolute animate-pulse" />

        </div>

        <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">
          Chargement des statistiques en temps réel...
        </p>

      </div>
    );
  }

  // =====================================================
  // ERREUR
  // =====================================================

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">

        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-100 shadow-xl text-center">

          <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">

            <AlertTriangle size={28} />

          </div>

          <h3 className="text-lg font-bold text-slate-800 mb-2">
            Erreur de connexion BDD
          </h3>

          <p className="text-sm text-slate-500 mb-6">
            {error}
          </p>

          <button
            type="button"
            onClick={chargerDashboard}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#075C37] hover:bg-[#06482d] text-white rounded-xl font-medium transition shadow-lg shadow-[#075C37]/20 active:scale-95"
          >

            <RefreshCw size={18} />

            Réessayer

          </button>

        </div>

      </div>
    );
  }

  if (!data) {
    return null;
  }

  // =====================================================
  // ALERTES
  // =====================================================

  const nombreAlertes =
    Number(data.paiementsRetard || 0) +
    Number(
      data.adhesionsBientotExpirees || 0
    );

  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans">

      {/* HEADER */}

      <header className="bg-white border-b border-slate-200/60 px-6 py-4 sticky top-0 z-10 backdrop-blur-md bg-white/90">

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div>

            <span className="inline-block text-xs font-medium uppercase tracking-widest text-slate-400">
              Bienvenue sur votre espace
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Ravi de vous revoir, {userName} 👋
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Voici un résumé de la couverture santé et des statistiques en temps réel.
            </p>

          </div>

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={chargerDashboard}
              className="p-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition active:scale-95 flex items-center gap-2 text-sm font-medium"
              title="Actualiser les données"
            >

              <RefreshCw size={18} />

              <span className="hidden sm:inline">
                Actualiser
              </span>

            </button>

            <div className="relative">

              <button
                type="button"
                aria-label="Notifications"
                className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition active:scale-95"
              >

                <Bell size={20} />

              </button>

              {nombreAlertes > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {nombreAlertes}
                </span>
              )}

            </div>

          </div>

        </div>

      </header>

      {/* CONTENU */}

      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">

        {/* DATE */}

        <div className="flex items-center gap-2 text-slate-500 text-sm">

          <Calendar
            size={18}
            className="text-[#075C37]"
          />

          <span className="capitalize font-medium">
            {dateAujourdhui}
          </span>

        </div>

        {/* HERO */}

        <div className="relative overflow-hidden bg-gradient-to-r from-[#075C37] via-[#097345] to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-[#075C37]/10">

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div>

              <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-green-200 mb-3">
                Couverture Maladie Universelle
              </span>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Tableau de Bord Exécutif
              </h2>

              <p className="text-green-100/80 text-sm mt-2 max-w-xl leading-relaxed">
                Suivi dynamique en temps réel des bénéficiaires, adhésions et transactions financières enregistrées en base de données.
              </p>

            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center justify-center self-start md:self-auto">

              <Users
                size={48}
                className="text-white"
              />

            </div>

          </div>

        </div>

        {/* KPI */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          {/* BÉNÉFICIAIRES */}

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition">

            <div className="flex justify-between items-start">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Bénéficiaires actifs
                </p>

                <h3 className="text-3xl font-black text-slate-900 mt-2">
                  {formatNombre(
                    data.beneficiairesActifs
                  )}
                </h3>

              </div>

              <div className="bg-emerald-50 text-[#075C37] p-3 rounded-2xl">

                <Users size={22} />

              </div>

            </div>

            <p className="text-xs text-slate-400 mt-4 font-medium">

              Sur{" "}

              <strong className="text-slate-600">
                {formatNombre(
                  data.totalBeneficiaires
                )}
              </strong>{" "}

              inscrits

            </p>

          </div>

          {/* ADHÉSIONS */}

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition">

            <div className="flex justify-between items-start">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Adhésions ce mois
                </p>

                <h3 className="text-3xl font-black text-slate-900 mt-2">
                  {formatNombre(
                    data.adhesionsMois
                  )}
                </h3>

              </div>

              <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl">

                <UserPlus size={22} />

              </div>

            </div>

            <p className="text-xs text-slate-400 mt-4 font-medium">

              <strong className="text-slate-600">
                {formatNombre(
                  data.adhesionsActives
                )}
              </strong>{" "}

              adhésions actives

            </p>

          </div>

          {/* PAIEMENTS */}

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition">

            <div className="flex justify-between items-start">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Encaissé ce mois
                </p>

                <h3 className="text-2xl font-black text-slate-900 mt-2">

                  {formatMontant(
                    data.montantPaiementsMois
                  )}

                  <span className="text-xs font-bold text-slate-400">
                    {" "}FCFA
                  </span>

                </h3>

              </div>

              <div className="bg-amber-50 text-amber-600 p-3 rounded-2xl">

                <Wallet size={22} />

              </div>

            </div>

            <p className="text-xs text-slate-400 mt-4 font-medium">

              <strong className="text-slate-600">
                {formatNombre(
                  data.paiementsMois
                )}
              </strong>{" "}

              paiement(s)

            </p>

          </div>

          {/* RETARDS */}

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition">

            <div className="flex justify-between items-start">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Retards de paiement
                </p>

                <h3 className="text-3xl font-black text-red-600 mt-2">
                  {formatNombre(
                    data.paiementsRetard
                  )}
                </h3>

              </div>

              <div className="bg-red-50 text-red-600 p-3 rounded-2xl">

                <AlertTriangle size={22} />

              </div>

            </div>

            <p className="text-xs text-red-400 mt-4 font-medium">
              Requiert votre attention
            </p>

          </div>

        </div>

      </main>

    </div>
  );
};

export default Dashboard;
