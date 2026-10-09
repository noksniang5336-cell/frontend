import React, { useEffect, useState } from "react";
import {
  FileText,
  Download,
  Printer,
  Users,
  CreditCard,
  Activity,
  Wallet,
  BarChart3,
} from "lucide-react";

import { getRapport } from "../services/rapportService";

const Rapports = () => {
  const [typeRapport, setTypeRapport] = useState("beneficiaires");
  const [periode, setPeriode] = useState("mois");

  const [data, setData] = useState({
    titre: "Rapport des bénéficiaires",
    total: 0,
    actif: 0,
    expire: 0,
    suspendu: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    chargerRapport();
  }, [typeRapport, periode]);

  const chargerRapport = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getRapport(
  typeRapport,
  periode
);

setData(response.data);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Impossible de charger le rapport."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatMontant = (montant) => {
    return new Intl.NumberFormat("fr-FR").format(
      montant || 0
    );
  };

  const imprimerRapport = () => {
    window.print();
  };

  const exporterRapport = () => {
    const contenu = `
RAPPORT CMU SÉNÉGAL

Type : ${data.titre}
Période : ${periode}

Total : ${formatMontant(data.total)}
Actifs : ${formatMontant(data.actif)}
Expirés : ${formatMontant(data.expire)}
Suspendus : ${formatMontant(data.suspendu)}
`;

    const blob = new Blob([contenu], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const lien = document.createElement("a");

    lien.href = url;
    lien.download = `rapport-cmu-${typeRapport}.txt`;

    document.body.appendChild(lien);
    lien.click();

    document.body.removeChild(lien);

    URL.revokeObjectURL(url);
  };

  const pourcentage = (valeur) => {
    if (!data.total) return 0;

    return Math.min(
      (valeur / data.total) * 100,
      100
    );
  };

  return (
    <div className="min-h-full bg-[#FAF8F5] p-6">

      {/* EN-TÊTE */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Rapports
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Consultez et générez les rapports de gestion de la CMU.
          </p>
        </div>

        <div className="flex gap-3">

          <button
            onClick={imprimerRapport}
            className="flex items-center gap-2 px-4 py-3 border border-gray-200 bg-white rounded-xl hover:bg-gray-50"
          >
            <Printer size={18} />
            Imprimer
          </button>

          <button
            onClick={exporterRapport}
            className="flex items-center gap-2 px-4 py-3 bg-[#075C37] text-white rounded-xl hover:bg-[#06482c]"
          >
            <Download size={18} />
            Exporter
          </button>

        </div>
      </div>

      {/* ERREUR */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          {error}
        </div>
      )}

      {/* FILTRES */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">

        <h2 className="font-semibold text-gray-800 mb-4">
          Paramètres du rapport
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Type de rapport
            </label>

            <select
              value={typeRapport}
              onChange={(e) =>
                setTypeRapport(e.target.value)
              }
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#075C37]"
            >
              <option value="beneficiaires">
                Rapport des bénéficiaires
              </option>

              <option value="adhesions">
                Rapport des adhésions
              </option>

              <option value="paiements">
                Rapport des paiements
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Période
            </label>

            <select
              value={periode}
              onChange={(e) =>
                setPeriode(e.target.value)
              }
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#075C37]"
            >
              <option value="jour">
                Aujourd'hui
              </option>

              <option value="semaine">
                Cette semaine
              </option>

              <option value="mois">
                Ce mois
              </option>

              <option value="annee">
                Cette année
              </option>
            </select>
          </div>

        </div>
      </div>

      {/* CHARGEMENT */}
      {loading ? (
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
          <p className="text-gray-500">
            Chargement du rapport...
          </p>
        </div>
      ) : (
        <>
          {/* TITRE */}
          <div className="bg-[#075C37] rounded-2xl p-6 text-white mb-6">

            <div className="flex items-center gap-4">

              <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
                <FileText size={28} />
              </div>

              <div>

                <p className="text-sm opacity-80">
                  Rapport CMU Sénégal
                </p>

                <h2 className="text-2xl font-bold">
                  {data.titre}
                </h2>

                <p className="text-sm opacity-80 mt-1">
                  Période : {periode}
                </p>

              </div>

            </div>
          </div>

          {/* STATISTIQUES */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">

            <CarteStat
              titre="Total"
              valeur={data.total}
              icon={<Users size={22} />}
              couleur="green"
            />

            <CarteStat
              titre="Actifs"
              valeur={data.actif}
              icon={<Activity size={22} />}
              couleur="blue"
            />

            <CarteStat
              titre="Expirés"
              valeur={data.expire}
              icon={<BarChart3 size={22} />}
              couleur="yellow"
            />

            <CarteStat
              titre="Suspendus"
              valeur={data.suspendu}
              icon={<CreditCard size={22} />}
              couleur="red"
            />

          </div>

          {/* RÉSUMÉ */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">

            <div className="p-5 border-b border-gray-100">

              <h2 className="text-lg font-bold text-gray-800">
                Résumé du rapport
              </h2>

            </div>

            <div className="p-6 space-y-5">

              <Progression
                label="Actifs"
                valeur={data.actif}
                pourcentage={pourcentage(data.actif)}
                couleur="bg-[#075C37]"
              />

              <Progression
                label="Expirés"
                valeur={data.expire}
                pourcentage={pourcentage(data.expire)}
                couleur="bg-yellow-500"
              />

              <Progression
                label="Suspendus"
                valeur={data.suspendu}
                pourcentage={pourcentage(data.suspendu)}
                couleur="bg-red-500"
              />

            </div>
          </div>

          {/* INFORMATIONS */}
          <div className="mt-6 bg-white rounded-2xl p-5 border border-gray-100">

            <div className="flex items-center gap-3">

              <Wallet
                className="text-[#075C37]"
                size={22}
              />

              <div>

                <p className="font-semibold text-gray-800">
                  Rapport généré par le système CMU
                </p>

                <p className="text-sm text-gray-500">
                  Les statistiques sont basées sur les données
                  enregistrées dans l'application.
                </p>

              </div>

            </div>

          </div>
        </>
      )}

    </div>
  );
};

const CarteStat = ({
  titre,
  valeur,
  icon,
  couleur,
}) => {

  const couleurs = {
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    yellow: "bg-yellow-100 text-yellow-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">

      <div className="flex justify-between items-start">

        <div>

          <p className="text-sm text-gray-500">
            {titre}
          </p>

          <p className="text-2xl font-bold text-gray-800 mt-2">
            {new Intl.NumberFormat("fr-FR").format(
              valeur || 0
            )}
          </p>

        </div>

        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${couleurs[couleur]}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
};

const Progression = ({
  label,
  valeur,
  pourcentage,
  couleur,
}) => {

  return (
    <div>

      <div className="flex justify-between mb-2">

        <span className="text-sm text-gray-600">
          {label}
        </span>

        <span className="font-semibold text-gray-800">
          {valeur}
        </span>

      </div>

      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">

        <div
          className={`h-full rounded-full ${couleur}`}
          style={{
            width: `${pourcentage}%`,
          }}
        />

      </div>

    </div>
  );
};

export default Rapports;