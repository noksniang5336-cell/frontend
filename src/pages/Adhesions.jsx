import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  X,
  Loader2,
  RefreshCw,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
  Ban,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

const emptyForm = {
  _id: null,
  beneficiaire: "",
  numeroAdhesion: "",
  dateDebut: "",
  dateFin: "",
  typeAdhesion: "Nouvelle",
  statut: "Actif",
  montant: "",
  observation: "",
};

const getToday = () => {
  const date = new Date();
  return date.toISOString().split("T")[0];
};

const formatDateForInput = (date) => {
  if (!date) return "";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) return "";

  return d.toISOString().split("T")[0];
};

const formatDate = (date) => {
  if (!date) return "-";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("fr-FR");
};

const getBeneficiaireName = (beneficiaire) => {
  if (!beneficiaire) return "Bénéficiaire inconnu";

  if (typeof beneficiaire === "string") {
    return beneficiaire;
  }

  return `${beneficiaire.prenom || ""} ${beneficiaire.nom || ""}`.trim();
};

const getBeneficiaireNumero = (beneficiaire) => {
  if (!beneficiaire || typeof beneficiaire === "string") {
    return "";
  }

  return beneficiaire.numeroCMU || "";
};

const getToken = () => {
  return localStorage.getItem("token");
};

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

const getErrorMessage = (error, defaultMessage) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.response?.data?.errors?.length) {
    return error.response.data.errors.join(", ");
  }

  if (error.response?.status === 401) {
    return "Votre session a expiré. Veuillez vous reconnecter.";
  }

  return defaultMessage;
};

const Adhesions = () => {
  const [adhesions, setAdhesions] = useState([]);
  const [beneficiaires, setBeneficiaires] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingBeneficiaires, setLoadingBeneficiaires] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [selectedAdhesion, setSelectedAdhesion] = useState(null);

  const [form, setForm] = useState({
    ...emptyForm,
    dateDebut: getToday(),
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ======================================================
  // CHARGER LES ADHÉSIONS
  // ======================================================
  const fetchAdhesions = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Vous devez être connecté pour consulter les adhésions.");
        return;
      }

      const response = await api.get("/adhesions");

      setAdhesions(response.data?.adhesions || []);
    } catch (err) {
      console.error("Erreur chargement adhésions :", err);

      setError(
        getErrorMessage(
          err,
          "Impossible de récupérer les adhésions."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // CHARGER LES BÉNÉFICIAIRES
  // ======================================================
  const fetchBeneficiaires = async () => {
    try {
      setLoadingBeneficiaires(true);

      const token = getToken();

      if (!token) {
        return;
      }

      const response = await api.get("/beneficiaires");

      /*
       * Selon ton contrôleur bénéficiaires, la réponse peut être :
       * { beneficiaires: [...] }
       * ou directement [...]
       */
      const liste =
        response.data?.beneficiaires ||
        response.data?.data ||
        (Array.isArray(response.data) ? response.data : []);

      setBeneficiaires(liste);
    } catch (err) {
      console.error("Erreur chargement bénéficiaires :", err);

      setError(
        getErrorMessage(
          err,
          "Impossible de récupérer les bénéficiaires."
        )
      );
    } finally {
      setLoadingBeneficiaires(false);
    }
  };

  // ======================================================
  // CHARGEMENT INITIAL
  // ======================================================
  useEffect(() => {
    fetchAdhesions();
    fetchBeneficiaires();
  }, []);

  // ======================================================
  // OUVRIR MODAL AJOUT
  // ======================================================
  const handleOpenAdd = () => {
    setForm({
      ...emptyForm,
      dateDebut: getToday(),
    });

    setSelectedAdhesion(null);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // ======================================================
  // OUVRIR MODAL MODIFICATION
  // ======================================================
  const handleOpenEdit = (adhesion) => {
    setSelectedAdhesion(adhesion);

    setForm({
      _id: adhesion._id,

      beneficiaire:
        typeof adhesion.beneficiaire === "object"
          ? adhesion.beneficiaire?._id || ""
          : adhesion.beneficiaire || "",

      numeroAdhesion: adhesion.numeroAdhesion || "",

      dateDebut: formatDateForInput(adhesion.dateDebut),

      dateFin: formatDateForInput(adhesion.dateFin),

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

  // ======================================================
  // FERMER MODAL
  // ======================================================
  const handleCloseModal = () => {
    if (saving) return;

    setShowModal(false);
    setSelectedAdhesion(null);

    setForm({
      ...emptyForm,
      dateDebut: getToday(),
    });

    setError("");
  };

  // ======================================================
  // MODIFIER LE FORMULAIRE
  // ======================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ======================================================
  // ENREGISTRER
  // ======================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Vérification frontend
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
        "La date de fin doit être supérieure ou égale à la date de début."
      );
      return;
    }

    try {
      setSaving(true);

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

      let response;

      if (selectedAdhesion?._id) {
        response = await api.put(
          `/adhesions/${selectedAdhesion._id}`,
          payload
        );

        setSuccess("Adhésion modifiée avec succès.");
      } else {
        response = await api.post("/adhesions", payload);

        setSuccess("Adhésion créée avec succès.");
      }

      const adhesionModifiee =
        response.data?.adhesion || response.data?.data;

      if (selectedAdhesion?._id && adhesionModifiee) {
        setAdhesions((previous) =>
          previous.map((item) =>
            item._id === adhesionModifiee._id
              ? adhesionModifiee
              : item
          )
        );
      } else if (adhesionModifiee) {
        setAdhesions((previous) => [
          adhesionModifiee,
          ...previous,
        ]);
      } else {
        await fetchAdhesions();
      }

      setTimeout(() => {
        setShowModal(false);
        setSelectedAdhesion(null);

        setForm({
          ...emptyForm,
          dateDebut: getToday(),
        });

        setSuccess("");
      }, 700);
    } catch (err) {
      console.error("Erreur enregistrement adhésion :", err);

      setError(
        getErrorMessage(
          err,
          "Impossible d'enregistrer l'adhésion."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // SUPPRIMER
  // ======================================================
  const handleDelete = async (adhesion) => {
    const confirmation = window.confirm(
      `Voulez-vous vraiment supprimer l'adhésion "${adhesion.numeroAdhesion}" ?`
    );

    if (!confirmation) return;

    try {
      setDeleting(true);
      setError("");

      await api.delete(`/adhesions/${adhesion._id}`);

      setAdhesions((previous) =>
        previous.filter((item) => item._id !== adhesion._id)
      );

      setSuccess("Adhésion supprimée avec succès.");

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error("Erreur suppression adhésion :", err);

      setError(
        getErrorMessage(
          err,
          "Impossible de supprimer l'adhésion."
        )
      );
    } finally {
      setDeleting(false);
    }
  };

  // ======================================================
  // AFFICHER DÉTAILS
  // ======================================================
  const handleView = (adhesion) => {
    setSelectedAdhesion(adhesion);
    setShowDetails(true);
  };

  // ======================================================
  // FERMER DÉTAILS
  // ======================================================
  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedAdhesion(null);
  };

  // ======================================================
  // RECHERCHE
  // ======================================================
  const filteredAdhesions = useMemo(() => {
    const terme = search.toLowerCase().trim();

    if (!terme) {
      return adhesions;
    }

    return adhesions.filter((adhesion) => {
      const beneficiaireNom = getBeneficiaireName(
        adhesion.beneficiaire
      ).toLowerCase();

      const beneficiaireNumero = getBeneficiaireNumero(
        adhesion.beneficiaire
      ).toLowerCase();

      const numeroAdhesion = (
        adhesion.numeroAdhesion || ""
      ).toLowerCase();

      const typeAdhesion = (
        adhesion.typeAdhesion || ""
      ).toLowerCase();

      const statut = (
        adhesion.statut || ""
      ).toLowerCase();

      return (
        beneficiaireNom.includes(terme) ||
        beneficiaireNumero.includes(terme) ||
        numeroAdhesion.includes(terme) ||
        typeAdhesion.includes(terme) ||
        statut.includes(terme)
      );
    });
  }, [adhesions, search]);

  // ======================================================
  // STATISTIQUES
  // ======================================================
  const stats = useMemo(() => {
    const total = adhesions.length;

    const actifs = adhesions.filter(
      (adhesion) => adhesion.statut === "Actif"
    ).length;

    const expires = adhesions.filter(
      (adhesion) => adhesion.statut === "Expiré"
    ).length;

    const suspendus = adhesions.filter(
      (adhesion) => adhesion.statut === "Suspendu"
    ).length;

    return {
      total,
      actifs,
      expires,
      suspendus,
    };
  }, [adhesions]);

  // ======================================================
  // COULEUR STATUT
  // ======================================================
  const getStatutClass = (statut) => {
    switch (statut) {
      case "Actif":
        return "bg-green-100 text-green-700";

      case "Expiré":
        return "bg-red-100 text-red-700";

      case "Suspendu":
        return "bg-orange-100 text-orange-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // ======================================================
  // ICÔNE STATUT
  // ======================================================
  const getStatutIcon = (statut) => {
    switch (statut) {
      case "Actif":
        return <CheckCircle size={15} />;

      case "Expiré":
        return <Clock size={15} />;

      case "Suspendu":
        return <Ban size={15} />;

      default:
        return <AlertCircle size={15} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] p-4 md:p-6">
      {/* ==================================================
          EN-TÊTE
      ================================================== */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0E5D45]">
            Gestion des adhésions
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Gérez les adhésions des bénéficiaires de la CMU.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              fetchAdhesions();
              fetchBeneficiaires();
            }}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />

            Actualiser
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#0E5D45] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#0A4936]"
          >
            <Plus size={18} />

            Nouvelle adhésion
          </button>
        </div>
      </div>

      {/* ==================================================
          MESSAGES
      ================================================== */}
      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle className="mt-0.5 shrink-0" size={20} />

          <div className="flex-1 text-sm">
            <p className="font-semibold">Erreur</p>
            <p>{error}</p>
          </div>

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
        <div className="mb-5 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
          <CheckCircle size={20} />

          <p className="text-sm font-medium">
            {success}
          </p>
        </div>
      )}

      {/* ==================================================
          STATISTIQUES
      ================================================== */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total adhésions
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-800">
                {stats.total}
              </p>
            </div>

            <div className="rounded-lg bg-green-100 p-3 text-[#0E5D45]">
              <CreditCard size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Actives
              </p>

              <p className="mt-1 text-2xl font-bold text-green-600">
                {stats.actifs}
              </p>
            </div>

            <div className="rounded-lg bg-green-100 p-3 text-green-600">
              <CheckCircle size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Expirées
              </p>

              <p className="mt-1 text-2xl font-bold text-red-600">
                {stats.expires}
              </p>
            </div>

            <div className="rounded-lg bg-red-100 p-3 text-red-600">
              <Clock size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Suspendues
              </p>

              <p className="mt-1 text-2xl font-bold text-orange-600">
                {stats.suspendus}
              </p>
            </div>

            <div className="rounded-lg bg-orange-100 p-3 text-orange-600">
              <Ban size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          TABLEAU
      ================================================== */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {/* Recherche */}
        <div className="border-b border-gray-100 p-4">
          <div className="relative max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une adhésion..."
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#0E5D45] focus:ring-2 focus:ring-[#0E5D45]/10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-gray-500">
              <Loader2
                size={30}
                className="animate-spin text-[#0E5D45]"
              />

              <p className="text-sm">
                Chargement des adhésions...
              </p>
            </div>
          </div>
        ) : filteredAdhesions.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-4 text-center">
            <CreditCard
              size={45}
              className="mb-3 text-gray-300"
            />

            <h3 className="font-semibold text-gray-700">
              Aucune adhésion trouvée
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {search
                ? "Aucune adhésion ne correspond à votre recherche."
                : "Aucune adhésion n'a encore été enregistrée."}
            </p>

            {!search && (
              <button
                type="button"
                onClick={handleOpenAdd}
                className="mt-4 flex items-center gap-2 rounded-lg bg-[#0E5D45] px-4 py-2 text-sm font-medium text-white hover:bg-[#0A4936]"
              >
                <Plus size={17} />
                Ajouter une adhésion
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    N° adhésion
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Bénéficiaire
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Début
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Fin
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Type
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Montant
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Statut
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredAdhesions.map((adhesion) => (
                  <tr
                    key={adhesion._id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <span className="font-semibold text-[#0E5D45]">
                        {adhesion.numeroAdhesion}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-gray-800">
                          {getBeneficiaireName(
                            adhesion.beneficiaire
                          )}
                        </p>

                        {getBeneficiaireNumero(
                          adhesion.beneficiaire
                        ) && (
                          <p className="mt-0.5 text-xs text-gray-500">
                            {getBeneficiaireNumero(
                              adhesion.beneficiaire
                            )}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDate(adhesion.dateDebut)}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDate(adhesion.dateFin)}
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-700">
                        {adhesion.typeAdhesion}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-gray-700">
                      {Number(adhesion.montant || 0).toLocaleString(
                        "fr-FR"
                      )}{" "}
                      FCFA
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getStatutClass(
                          adhesion.statut
                        )}`}
                      >
                        {getStatutIcon(adhesion.statut)}
                        {adhesion.statut}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleView(adhesion)
                          }
                          title="Voir"
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleOpenEdit(adhesion)
                          }
                          title="Modifier"
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-green-50 hover:text-[#0E5D45]"
                        >
                          <Edit size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(adhesion)
                          }
                          disabled={deleting}
                          title="Supprimer"
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          {deleting ? (
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={17} />
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

      {/* ==================================================
          MODAL AJOUT / MODIFICATION
      ================================================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-[#0E5D45]">
                  {selectedAdhesion
                    ? "Modifier l'adhésion"
                    : "Nouvelle adhésion"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Remplissez les informations de l'adhésion.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={saving}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Formulaire */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              {error && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <span>{error}</span>
                </div>
              )}

              {/* Bénéficiaire */}
              <div>
                <label
                  htmlFor="beneficiaire"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Bénéficiaire <span className="text-red-500">*</span>
                </label>

                <select
                  id="beneficiaire"
                  name="beneficiaire"
                  value={form.beneficiaire}
                  onChange={handleChange}
                  disabled={
                    loadingBeneficiaires || saving
                  }
                  required
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#0E5D45] focus:ring-2 focus:ring-[#0E5D45]/10 disabled:bg-gray-100"
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
                      )}
                      {beneficiaire.numeroCMU
                        ? ` — ${beneficiaire.numeroCMU}`
                        : ""}
                    </option>
                  ))}
                </select>

                {!loadingBeneficiaires &&
                  beneficiaires.length === 0 && (
                    <p className="mt-1.5 text-xs text-orange-600">
                      Aucun bénéficiaire disponible.
                      Créez d'abord un bénéficiaire.
                    </p>
                  )}
              </div>

              {/* Numéro + type */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="numeroAdhesion"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Numéro d'adhésion{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="numeroAdhesion"
                    name="numeroAdhesion"
                    type="text"
                    value={form.numeroAdhesion}
                    onChange={handleChange}
                    placeholder="Ex : ADH-2026-0001"
                    disabled={saving}
                    required
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#0E5D45] focus:ring-2 focus:ring-[#0E5D45]/10 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="typeAdhesion"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Type d'adhésion
                  </label>

                  <select
                    id="typeAdhesion"
                    name="typeAdhesion"
                    value={form.typeAdhesion}
                    onChange={handleChange}
                    disabled={saving}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#0E5D45] focus:ring-2 focus:ring-[#0E5D45]/10 disabled:bg-gray-100"
                  >
                    <option value="Nouvelle">
                      Nouvelle
                    </option>

                    <option value="Renouvellement">
                      Renouvellement
                    </option>
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="dateDebut"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Date de début{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="dateDebut"
                    name="dateDebut"
                    type="date"
                    value={form.dateDebut}
                    onChange={handleChange}
                    disabled={saving}
                    required
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#0E5D45] focus:ring-2 focus:ring-[#0E5D45]/10 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="dateFin"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Date de fin{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="dateFin"
                    name="dateFin"
                    type="date"
                    value={form.dateFin}
                    onChange={handleChange}
                    disabled={saving}
                    required
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#0E5D45] focus:ring-2 focus:ring-[#0E5D45]/10 disabled:bg-gray-100"
                  />
                </div>
              </div>

              {/* Statut + montant */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="statut"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Statut
                  </label>

                  <select
                    id="statut"
                    name="statut"
                    value={form.statut}
                    onChange={handleChange}
                    disabled={saving}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#0E5D45] focus:ring-2 focus:ring-[#0E5D45]/10 disabled:bg-gray-100"
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

                <div>
                  <label
                    htmlFor="montant"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Montant
                  </label>

                  <div className="relative">
                    <input
                      id="montant"
                      name="montant"
                      type="number"
                      min="0"
                      step="1"
                      value={form.montant}
                      onChange={handleChange}
                      placeholder="0"
                      disabled={saving}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 pr-16 text-sm outline-none transition focus:border-[#0E5D45] focus:ring-2 focus:ring-[#0E5D45]/10 disabled:bg-gray-100"
                    />

                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      FCFA
                    </span>
                  </div>
                </div>
              </div>

              {/* Observation */}
              <div>
                <label
                  htmlFor="observation"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Observation
                </label>

                <textarea
                  id="observation"
                  name="observation"
                  value={form.observation}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Ajouter une observation..."
                  disabled={saving}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#0E5D45] focus:ring-2 focus:ring-[#0E5D45]/10 disabled:bg-gray-100"
                />
              </div>

              {/* Boutons */}
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={saving || loadingBeneficiaires}
                  className="flex items-center gap-2 rounded-lg bg-[#0E5D45] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#0A4936] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  {saving
                    ? "Enregistrement..."
                    : selectedAdhesion
                    ? "Modifier"
                    : "Créer l'adhésion"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================
          MODAL DÉTAILS
      ================================================== */}
      {showDetails && selectedAdhesion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-[#0E5D45]">
                  Détails de l'adhésion
                </h2>

                <p className="text-sm text-gray-500">
                  {selectedAdhesion.numeroAdhesion}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseDetails}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              {/* Bénéficiaire */}
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
                  Bénéficiaire
                </p>

                <p className="font-semibold text-gray-800">
                  {getBeneficiaireName(
                    selectedAdhesion.beneficiaire
                  )}
                </p>

                {getBeneficiaireNumero(
                  selectedAdhesion.beneficiaire
                ) && (
                  <p className="mt-1 text-sm text-gray-500">
                    N° CMU :{" "}
                    {getBeneficiaireNumero(
                      selectedAdhesion.beneficiaire
                    )}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">
                    Numéro d'adhésion
                  </p>

                  <p className="mt-1 font-medium text-gray-800">
                    {selectedAdhesion.numeroAdhesion}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">
                    Type
                  </p>

                  <p className="mt-1 text-gray-800">
                    {selectedAdhesion.typeAdhesion}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">
                    Date de début
                  </p>

                  <p className="mt-1 text-gray-800">
                    {formatDate(
                      selectedAdhesion.dateDebut
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">
                    Date de fin
                  </p>

                  <p className="mt-1 text-gray-800">
                    {formatDate(
                      selectedAdhesion.dateFin
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">
                    Montant
                  </p>

                  <p className="mt-1 font-medium text-gray-800">
                    {Number(
                      selectedAdhesion.montant || 0
                    ).toLocaleString("fr-FR")}{" "}
                    FCFA
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">
                    Statut
                  </p>

                  <span
                    className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getStatutClass(
                      selectedAdhesion.statut
                    )}`}
                  >
                    {getStatutIcon(
                      selectedAdhesion.statut
                    )}

                    {selectedAdhesion.statut}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Observation
                </p>

                <p className="mt-1 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                  {selectedAdhesion.observation ||
                    "Aucune observation."}
                </p>
              </div>

              <div className="flex justify-end border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={handleCloseDetails}
                  className="rounded-lg bg-[#0E5D45] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#0A4936]"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Adhesions;