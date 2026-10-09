
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  X,
  RefreshCw,
} from "lucide-react";
const API_URL = "http://localhost:5000/api";

// ======================================================
// CONFIGURATION AXIOS
// ======================================================

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ======================================================
// ÉTAT INITIAL DU FORMULAIRE
// ======================================================

const initialForm = {
  beneficiaire: "",
  numeroAdhesion: "",
  dateDebut: "",
  dateFin: "",
  typeAdhesion: "Nouvelle",
  statut: "Actif",
  montant: "",
  observation: "",
};

// ======================================================
// SPINNER CSS
// ======================================================

const Spinner = ({ size = "20px", color = "#075C37" }) => {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        border: `3px solid #e5e7eb`,
        borderTopColor: color,
        borderRadius: "50%",
        animation: "cmu-spin 0.8s linear infinite",
      }}
    />
  );
};

// ======================================================
// PAGE ADHÉSIONS
// ======================================================

const Adhesions = () => {
  const [adhesions, setAdhesions] = useState([]);
  const [beneficiaires, setBeneficiaires] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingBeneficiaires, setLoadingBeneficiaires] = useState(true);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [selectedAdhesion, setSelectedAdhesion] = useState(null);

  const [form, setForm] = useState(initialForm);

  // ====================================================
  // CHARGER LES ADHÉSIONS
  // ====================================================

  const chargerAdhesions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/adhesions");

      setAdhesions(response.data?.adhesions || []);
    } catch (err) {
      console.error("Erreur chargement adhésions :", err);

      if (err.response?.status === 401) {
        setError(
          "Session expirée ou token absent. Veuillez vous reconnecter."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Impossible de charger les adhésions."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // CHARGER LES BÉNÉFICIAIRES
  // ====================================================

  const chargerBeneficiaires = async () => {
    try {
      setLoadingBeneficiaires(true);

      const response = await api.get("/beneficiaires");

      const liste =
        response.data?.beneficiaires ||
        response.data?.data ||
        (Array.isArray(response.data) ? response.data : []);

      setBeneficiaires(liste);
    } catch (err) {
      console.error("Erreur chargement bénéficiaires :", err);

      setError(
        err.response?.data?.message ||
          "Impossible de charger les bénéficiaires."
      );
    } finally {
      setLoadingBeneficiaires(false);
    }
  };

  // ====================================================
  // CHARGEMENT INITIAL
  // ====================================================

  useEffect(() => {
    chargerAdhesions();
    chargerBeneficiaires();
  }, []);

  // ====================================================
  // MESSAGES TEMPORAIRES
  // ====================================================

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [success]);

  // ====================================================
  // MODIFICATION DU FORMULAIRE
  // ====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ====================================================
  // OUVRIR MODAL CRÉATION
  // ====================================================

  const ouvrirCreation = () => {
    setSelectedAdhesion(null);
    setForm(initialForm);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // ====================================================
  // OUVRIR MODAL MODIFICATION
  // ====================================================

  const ouvrirModification = (adhesion) => {
    setSelectedAdhesion(adhesion);

    setForm({
      beneficiaire: adhesion.beneficiaire?._id || "",
      numeroAdhesion: adhesion.numeroAdhesion || "",
      dateDebut: formatDateInput(adhesion.dateDebut),
      dateFin: formatDateInput(adhesion.dateFin),
      typeAdhesion: adhesion.typeAdhesion || "Nouvelle",
      statut: adhesion.statut || "Actif",
      montant:
        adhesion.montant !== undefined && adhesion.montant !== null
          ? adhesion.montant
          : "",
      observation: adhesion.observation || "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // ====================================================
  // FERMER MODAL
  // ====================================================

  const fermerModal = () => {
    if (saving) return;

    setShowModal(false);
    setSelectedAdhesion(null);
    setForm(initialForm);
  };

  // ====================================================
  // CRÉER / MODIFIER
  // ====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Vérifications frontend
    if (!form.beneficiaire) {
      setError("Veuillez sélectionner un bénéficiaire.");
      return;
    }

    if (!form.numeroAdhesion.trim()) {
      setError("Le numéro d'adhésion est obligatoire.");
      return;
    }

    if (!form.dateDebut) {
      setError("La date de début est obligatoire.");
      return;
    }

    if (!form.dateFin) {
      setError("La date de fin est obligatoire.");
      return;
    }

    if (new Date(form.dateFin) < new Date(form.dateDebut)) {
      setError(
        "La date de fin doit être postérieure ou égale à la date de début."
      );
      return;
    }

    const payload = {
      beneficiaire: form.beneficiaire,
      numeroAdhesion: form.numeroAdhesion.trim(),
      dateDebut: form.dateDebut,
      dateFin: form.dateFin,
      typeAdhesion: form.typeAdhesion,
      statut: form.statut,
      montant: Number(form.montant) || 0,
      observation: form.observation.trim(),
    };

    try {
      setSaving(true);

      if (selectedAdhesion) {
        const response = await api.put(
          `/adhesions/${selectedAdhesion._id}`,
          payload
        );

        const adhesionModifiee = response.data?.adhesion;

        setAdhesions((prev) =>
          prev.map((item) =>
            item._id === selectedAdhesion._id
              ? adhesionModifiee || item
              : item
          )
        );

        setSuccess("Adhésion modifiée avec succès.");
      } else {
        const response = await api.post("/adhesions", payload);

        const nouvelleAdhesion = response.data?.adhesion;

        if (nouvelleAdhesion) {
          setAdhesions((prev) => [
            nouvelleAdhesion,
            ...prev,
          ]);
        } else {
          await chargerAdhesions();
        }

        setSuccess("Adhésion créée avec succès.");
      }

      setShowModal(false);
      setSelectedAdhesion(null);
      setForm(initialForm);
    } catch (err) {
      console.error("Erreur enregistrement adhésion :", err);

      if (err.response?.status === 401) {
        setError(
          "Vous n'êtes pas autorisé. Veuillez vous reconnecter."
        );
      } else if (err.response?.status === 409) {
        setError(
          err.response?.data?.message ||
            "Ce numéro d'adhésion existe déjà."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Une erreur est survenue lors de l'enregistrement."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // ====================================================
  // SUPPRIMER
  // ====================================================

  const handleDelete = async (adhesion) => {
    const confirmation = window.confirm(
      `Voulez-vous vraiment supprimer l'adhésion "${adhesion.numeroAdhesion}" ?`
    );

    if (!confirmation) return;

    try {
      setDeletingId(adhesion._id);
      setError("");
      setSuccess("");

      await api.delete(`/adhesions/${adhesion._id}`);

      setAdhesions((prev) =>
        prev.filter((item) => item._id !== adhesion._id)
      );

      setSuccess("Adhésion supprimée avec succès.");
    } catch (err) {
      console.error("Erreur suppression adhésion :", err);

      setError(
        err.response?.data?.message ||
          "Impossible de supprimer cette adhésion."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ====================================================
  // AFFICHER DÉTAILS
  // ====================================================

  const afficherDetails = (adhesion) => {
    setSelectedAdhesion(adhesion);
    setShowDetails(true);
  };

  // ====================================================
  // RECHERCHE
  // ====================================================

  const adhesionsFiltrees = useMemo(() => {
    const terme = search.trim().toLowerCase();

    if (!terme) {
      return adhesions;
    }

    return adhesions.filter((adhesion) => {
      const beneficiaire = adhesion.beneficiaire;

      const nomComplet = `${beneficiaire?.prenom || ""} ${
        beneficiaire?.nom || ""
      }`.toLowerCase();

      const numeroCMU = (
        beneficiaire?.numeroCMU || ""
      ).toLowerCase();

      const numeroAdhesion = (
        adhesion.numeroAdhesion || ""
      ).toLowerCase();

      const type = (
        adhesion.typeAdhesion || ""
      ).toLowerCase();

      const statut = (
        adhesion.statut || ""
      ).toLowerCase();

      return (
        nomComplet.includes(terme) ||
        numeroCMU.includes(terme) ||
        numeroAdhesion.includes(terme) ||
        type.includes(terme) ||
        statut.includes(terme)
      );
    });
  }, [adhesions, search]);

  // ====================================================
  // STATISTIQUES
  // ====================================================

  const total = adhesions.length;

  const actifs = adhesions.filter(
    (item) => item.statut === "Actif"
  ).length;

  const expirees = adhesions.filter(
    (item) => item.statut === "Expiré"
  ).length;

  const suspendues = adhesions.filter(
    (item) => item.statut === "Suspendu"
  ).length;

  // ====================================================
  // FORMATAGE DATE
  // ====================================================

  function formatDate(date) {
    if (!date) return "-";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
      return "-";
    }

    return d.toLocaleDateString("fr-FR");
  }

  function formatDateInput(date) {
    if (!date) return "";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
      return "";
    }

    return d.toISOString().split("T")[0];
  }

  // ====================================================
  // NOM BÉNÉFICIAIRE
  // ====================================================

  const getBeneficiaireName = (beneficiaire) => {
    if (!beneficiaire) {
      return "Bénéficiaire inconnu";
    }

    return `${beneficiaire.prenom || ""} ${
      beneficiaire.nom || ""
    }`.trim();
  };

  // ====================================================
  // RENDU
  // ====================================================

  return (
    <>
      <style>
        {`
          @keyframes cmu-spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>

      <div className="min-h-screen bg-[#FAF8F5] p-4 md:p-6 lg:p-8">
        {/* ================================================
            EN-TÊTE
        ================================================= */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
              Gestion des adhésions
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Gérez les adhésions des bénéficiaires de la CMU.
            </p>
          </div>

          <button
            type="button"
            onClick={ouvrirCreation}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#075C37] px-5 py-3 font-medium text-white shadow-sm transition hover:bg-[#06482c]"
          >
            <Plus size={20} />
            Nouvelle adhésion
          </button>
        </div>

        {/* ================================================
            MESSAGES
        ================================================= */}

        {error && (
          <div className="mb-5 flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-red-500 hover:text-red-700"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start justify-between gap-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <span>{success}</span>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="text-green-500 hover:text-green-700"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* ================================================
            STATISTIQUES
        ================================================= */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total"
            value={total}
            description="Toutes les adhésions"
          />

          <StatCard
            title="Actives"
            value={actifs}
            description="Adhésions actives"
          />

          <StatCard
            title="Expirées"
            value={expirees}
            description="Adhésions expirées"
          />

          <StatCard
            title="Suspendues"
            value={suspendues}
            description="Adhésions suspendues"
          />
        </div>

        {/* ================================================
            BARRE DE RECHERCHE
        ================================================= */}

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par bénéficiaire, numéro CMU, adhésion..."
                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#075C37] focus:ring-2 focus:ring-[#075C37]/10"
              />
            </div>

            <button
              type="button"
              onClick={chargerAdhesions}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              {loading ? (
                <Spinner size="18px" />
              ) : (
                <RefreshCw size={18} />
              )}

              Actualiser
            </button>
          </div>
        </div>

        {/* ================================================
            TABLEAU
        ================================================= */}

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
              <Spinner size="35px" />
              <p className="text-sm text-gray-500">
                Chargement des adhésions...
              </p>
            </div>
          ) : adhesionsFiltrees.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-3 rounded-full bg-gray-100 p-4">
                <Search size={28} className="text-gray-400" />
              </div>

              <h3 className="font-semibold text-gray-700">
                Aucune adhésion trouvée
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {search
                  ? "Aucune adhésion ne correspond à votre recherche."
                  : "Aucune adhésion n'a encore été enregistrée."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-[#075C37] text-white">
                  <tr>
                    <th className="px-4 py-4 text-left text-sm font-semibold">
                      Bénéficiaire
                    </th>

                    <th className="px-4 py-4 text-left text-sm font-semibold">
                      N° adhésion
                    </th>

                    <th className="px-4 py-4 text-left text-sm font-semibold">
                      Début
                    </th>

                    <th className="px-4 py-4 text-left text-sm font-semibold">
                      Fin
                    </th>

                    <th className="px-4 py-4 text-left text-sm font-semibold">
                      Type
                    </th>

                    <th className="px-4 py-4 text-left text-sm font-semibold">
                      Statut
                    </th>

                    <th className="px-4 py-4 text-right text-sm font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {adhesionsFiltrees.map((adhesion) => (
                    <tr
                      key={adhesion._id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-800">
                            {getBeneficiaireName(
                              adhesion.beneficiaire
                            )}
                          </p>

                          <p className="text-xs text-gray-500">
                            CMU :{" "}
                            {adhesion.beneficiaire?.numeroCMU ||
                              "-"}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-sm font-medium text-gray-700">
                        {adhesion.numeroAdhesion || "-"}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-600">
                        {formatDate(adhesion.dateDebut)}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-600">
                        {formatDate(adhesion.dateFin)}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-600">
                        {adhesion.typeAdhesion || "-"}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge
                          statut={adhesion.statut}
                        />
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              afficherDetails(adhesion)
                            }
                            title="Voir"
                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          >
                            <Eye size={18} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              ouvrirModification(adhesion)
                            }
                            title="Modifier"
                            className="rounded-lg p-2 text-orange-600 transition hover:bg-orange-50"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(adhesion)
                            }
                            disabled={
                              deletingId === adhesion._id
                            }
                            title="Supprimer"
                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingId === adhesion._id ? (
                              <Spinner
                                size="18px"
                                color="#dc2626"
                              />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ================================================
            MODAL CRÉATION / MODIFICATION
        ================================================= */}

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
              <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {selectedAdhesion
                      ? "Modifier l'adhésion"
                      : "Nouvelle adhésion"}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Renseignez les informations de l'adhésion.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={fermerModal}
                  disabled={saving}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                >
                  <X size={22} />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5 p-6"
              >
                {/* BÉNÉFICIAIRE */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Bénéficiaire <span className="text-red-500">*</span>
                  </label>

                  <select
                    name="beneficiaire"
                    value={form.beneficiaire}
                    onChange={handleChange}
                    disabled={
                      saving || loadingBeneficiaires
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#075C37] focus:ring-2 focus:ring-[#075C37]/10"
                  >
                    <option value="">
                      {loadingBeneficiaires
                        ? "Chargement des bénéficiaires..."
                        : "Sélectionner un bénéficiaire"}
                    </option>

                    {beneficiaires.map((beneficiaire) => (
                      <option
                        key={beneficiaire._id}
                        value={beneficiaire._id}
                      >
                        {getBeneficiaireName(
                          beneficiaire
                        )}{" "}
                        — {beneficiaire.numeroCMU || "Sans numéro CMU"}
                      </option>
                    ))}
                  </select>

                  {!loadingBeneficiaires &&
                    beneficiaires.length === 0 && (
                      <p className="mt-2 text-xs text-red-500">
                        Aucun bénéficiaire disponible. Créez
                        d'abord un bénéficiaire.
                      </p>
                    )}
                </div>

                {/* NUMÉRO ADHÉSION */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Numéro d'adhésion{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="numeroAdhesion"
                    value={form.numeroAdhesion}
                    onChange={handleChange}
                    placeholder="Ex : ADH-2026-0001"
                    disabled={saving}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#075C37] focus:ring-2 focus:ring-[#075C37]/10"
                  />
                </div>

                {/* DATES */}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Date de début{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="date"
                      name="dateDebut"
                      value={form.dateDebut}
                      onChange={handleChange}
                      disabled={saving}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#075C37] focus:ring-2 focus:ring-[#075C37]/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Date de fin{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="date"
                      name="dateFin"
                      value={form.dateFin}
                      onChange={handleChange}
                      disabled={saving}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#075C37] focus:ring-2 focus:ring-[#075C37]/10"
                    />
                  </div>
                </div>

                {/* TYPE + STATUT */}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Type d'adhésion
                    </label>

                    <select
                      name="typeAdhesion"
                      value={form.typeAdhesion}
                      onChange={handleChange}
                      disabled={saving}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#075C37] focus:ring-2 focus:ring-[#075C37]/10"
                    >
                      <option value="Nouvelle">
                        Nouvelle
                      </option>

                      <option value="Renouvellement">
                        Renouvellement
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Statut
                    </label>

                    <select
                      name="statut"
                      value={form.statut}
                      onChange={handleChange}
                      disabled={saving}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#075C37] focus:ring-2 focus:ring-[#075C37]/10"
                    >
                      <option value="Actif">
                        Actif
                      </option>

                      <option value="Expiré">
                        Expiré
                      </option>

                      <option value="Suspendu">
                        Suspendu
                      </option>
                    </select>
                  </div>
                </div>

                {/* MONTANT */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Montant
                  </label>

                  <input
                    type="number"
                    name="montant"
                    value={form.montant}
                    onChange={handleChange}
                    min="0"
                    step="1"
                    placeholder="0"
                    disabled={saving}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#075C37] focus:ring-2 focus:ring-[#075C37]/10"
                  />
                </div>

                {/* OBSERVATION */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Observation
                  </label>

                  <textarea
                    name="observation"
                    value={form.observation}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Ajouter une observation..."
                    disabled={saving}
                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#075C37] focus:ring-2 focus:ring-[#075C37]/10"
                  />
                </div>

                {/* BOUTONS */}

                <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={fermerModal}
                    disabled={saving}
                    className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    disabled={saving || loadingBeneficiaires}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[#075C37] px-5 py-3 text-sm font-medium text-white hover:bg-[#06482c] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Spinner
                          size="18px"
                          color="#ffffff"
                        />
                        Enregistrement...
                      </>
                    ) : selectedAdhesion ? (
                      <>
                        <Pencil size={18} />
                        Modifier
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        Enregistrer
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================================================
            MODAL DÉTAILS
        ================================================= */}

        {showDetails && selectedAdhesion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Détails de l'adhésion
                  </h2>

                  <p className="text-sm text-gray-500">
                    Informations complètes
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowDetails(false);
                    setSelectedAdhesion(null);
                  }}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="space-y-5 p-6">
                <DetailRow
                  label="Bénéficiaire"
                  value={getBeneficiaireName(
                    selectedAdhesion.beneficiaire
                  )}
                />

                <DetailRow
                  label="Numéro CMU"
                  value={
                    selectedAdhesion.beneficiaire
                      ?.numeroCMU || "-"
                  }
                />

                <DetailRow
                  label="Numéro d'adhésion"
                  value={
                    selectedAdhesion.numeroAdhesion || "-"
                  }
                />

                <DetailRow
                  label="Date de début"
                  value={formatDate(
                    selectedAdhesion.dateDebut
                  )}
                />

                <DetailRow
                  label="Date de fin"
                  value={formatDate(
                    selectedAdhesion.dateFin
                  )}
                />

                <DetailRow
                  label="Type d'adhésion"
                  value={
                    selectedAdhesion.typeAdhesion || "-"
                  }
                />

                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <span className="text-sm text-gray-500">
                    Statut
                  </span>

                  <StatusBadge
                    statut={selectedAdhesion.statut}
                  />
                </div>

                <DetailRow
                  label="Montant"
                  value={`${Number(
                    selectedAdhesion.montant || 0
                  ).toLocaleString("fr-FR")} FCFA`}
                />

                <DetailRow
                  label="Observation"
                  value={
                    selectedAdhesion.observation || "-"
                  }
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// ======================================================
// COMPOSANT STAT CARD
// ======================================================

const StatCard = ({ title, value, description }) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold text-[#075C37]">
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-400">
        {description}
      </p>
    </div>
  );
};

// ======================================================
// COMPOSANT STATUS BADGE
// ======================================================

const StatusBadge = ({ statut }) => {
  let classes =
    "bg-gray-100 text-gray-700";

  if (statut === "Actif") {
    classes = "bg-green-100 text-green-700";
  }

  if (statut === "Expiré") {
    classes = "bg-red-100 text-red-700";
  }

  if (statut === "Suspendu") {
    classes = "bg-orange-100 text-orange-700";
  }

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {statut || "Inconnu"}
    </span>
  );
};

// ======================================================
// COMPOSANT DETAIL ROW
// ======================================================

const DetailRow = ({ label, value }) => {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-gray-100 pb-4">
      <span className="text-sm text-gray-500">
        {label}
      </span>

      <span className="text-right text-sm font-medium text-gray-800">
        {value}
      </span>
    </div>
  );
};

export default Adhesions;
