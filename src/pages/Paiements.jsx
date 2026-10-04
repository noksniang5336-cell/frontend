
import React, { useEffect, useState } from "react";

import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  X,
} from "lucide-react";

import {
  getPaiements,
  createPaiement,
  updatePaiement,
  deletePaiement,
} from "../services/paiementService";

import api from "../utils/api";

const Paiements = () => {
  const [paiements, setPaiements] = useState([]);
  const [beneficiaires, setBeneficiaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("Tous");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  // ==================================================
  // FORMULAIRE
  // ==================================================

  const [form, setForm] = useState({
    beneficiaire: "",
    montant: "",
    datePaiement: "",
    moyen: "Espèces",
    statut: "En attente",
    observation: "",
  });

  // ==================================================
  // CHARGER LES PAIEMENTS
  // ==================================================

  const chargerPaiements = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getPaiements();

      setPaiements(response.data.paiements || []);
    } catch (error) {
      console.error("Erreur chargement paiements :", error);

      setError(
        error.response?.data?.message ||
          "Impossible de charger les paiements."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // CHARGER LES BENEFICIAIRES
  // ==================================================

  const chargerBeneficiaires = async () => {
    try {
      const response = await api.get("/beneficiaires");

      setBeneficiaires(
        response.data.beneficiaires || []
      );
    } catch (error) {
      console.error(
        "Erreur bénéficiaires :",
        error
      );
    }
  };

  useEffect(() => {
    chargerPaiements();
    chargerBeneficiaires();
  }, []);

  // ==================================================
  // MODIFICATION DU FORMULAIRE
  // ==================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((ancien) => ({
      ...ancien,
      [name]: value,
    }));
  };

  // ==================================================
  // OUVRIR AJOUT
  // ==================================================

  const ouvrirAjout = () => {
    setEditingId(null);
    setError("");

    setForm({
      beneficiaire: "",
      montant: "",
      datePaiement: "",
      moyen: "Espèces",
      statut: "En attente",
      observation: "",
    });

    setShowModal(true);
  };

  // ==================================================
  // OUVRIR MODIFICATION
  // ==================================================

  const ouvrirModification = (paiement) => {
    setEditingId(paiement._id);
    setError("");

    setForm({
      beneficiaire:
        paiement.beneficiaire?._id || "",

      montant:
        paiement.montant || "",

      datePaiement: paiement.datePaiement
        ? paiement.datePaiement.substring(0, 10)
        : "",

      moyen:
        paiement.moyen || "Espèces",

      statut:
        paiement.statut || "En attente",

      observation:
        paiement.observation || "",
    });

    setShowModal(true);
  };

  // ==================================================
  // ENREGISTRER / MODIFIER
  // ==================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      if (!form.beneficiaire) {
        setError(
          "Veuillez sélectionner un bénéficiaire."
        );
        return;
      }

      if (!form.montant) {
        setError(
          "Veuillez saisir le montant."
        );
        return;
      }

      if (!form.moyen) {
        setError(
          "Veuillez sélectionner un moyen de paiement."
        );
        return;
      }

      // Données exactement conformes au modèle MongoDB
      const donneesPaiement = {
        beneficiaire: form.beneficiaire,
        montant: Number(form.montant),
        datePaiement:
          form.datePaiement || undefined,
        moyen: form.moyen,
        statut: form.statut,
        observation: form.observation,
      };

      console.log(
        "📤 Paiement envoyé :",
        donneesPaiement
      );

      if (editingId) {
        await updatePaiement(
          editingId,
          donneesPaiement
        );
      } else {
        await createPaiement(
          donneesPaiement
        );
      }

      setShowModal(false);

      await chargerPaiements();
    } catch (error) {
      console.error(
        "Erreur création/modification paiement :",
        error
      );

      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Une erreur est survenue."
      );
    }
  };

  // ==================================================
  // SUPPRIMER
  // ==================================================

  const supprimer = async (id) => {
    const confirmation = window.confirm(
      "Voulez-vous vraiment supprimer ce paiement ?"
    );

    if (!confirmation) {
      return;
    }

    try {
      setError("");

      await deletePaiement(id);

      await chargerPaiements();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Impossible de supprimer le paiement."
      );
    }
  };

  // ==================================================
  // FILTRAGE
  // ==================================================

  const paiementsFiltres =
    paiements.filter((paiement) => {
      const nomBeneficiaire =
        paiement.beneficiaire
          ? `${paiement.beneficiaire.prenom || ""} ${
              paiement.beneficiaire.nom || ""
            }`
          : "";

      const correspondRecherche =
        nomBeneficiaire
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        paiement.numeroPaiement
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const correspondStatut =
        filtreStatut === "Tous" ||
        paiement.statut === filtreStatut;

      return (
        correspondRecherche &&
        correspondStatut
      );
    });

  // ==================================================
  // STATISTIQUES
  // ==================================================

  const totalPaye = paiements
    .filter((p) => p.statut === "Payé")
    .reduce(
      (total, p) =>
        total + Number(p.montant || 0),
      0
    );

  const totalAttente = paiements
    .filter(
      (p) => p.statut === "En attente"
    )
    .reduce(
      (total, p) =>
        total + Number(p.montant || 0),
      0
    );

  const totalRetard = paiements
    .filter(
      (p) => p.statut === "En retard"
    )
    .reduce(
      (total, p) =>
        total + Number(p.montant || 0),
      0
    );

  const formatMontant = (montant) => {
    return (
      new Intl.NumberFormat("fr-FR").format(
        montant
      ) + " FCFA"
    );
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "fr-FR"
    );
  };

  // ==================================================
  // EXPORT CSV
  // ==================================================

  const exporter = () => {
    const lignes = [
      [
        "Bénéficiaire",
        "Montant",
        "Date",
        "Moyen",
        "Statut",
        "Observation",
      ],

      ...paiementsFiltres.map((p) => [
        `${p.beneficiaire?.prenom || ""} ${
          p.beneficiaire?.nom || ""
        }`,
        p.montant,
        formatDate(p.datePaiement),
        p.moyen || "",
        p.statut || "",
        p.observation || "",
      ]),
    ];

    const contenu = lignes
      .map((ligne) => ligne.join(";"))
      .join("\n");

    const blob = new Blob([contenu], {
      type: "text/csv;charset=utf-8;",
    });

    const url =
      URL.createObjectURL(blob);

    const lien =
      document.createElement("a");

    lien.href = url;
    lien.download =
      "paiements-cmu.csv";

    lien.click();

    URL.revokeObjectURL(url);
  };

  // ==================================================
  // AFFICHAGE
  // ==================================================

  return (
    <div className="min-h-full bg-[#FAF8F5] p-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Gestion des paiements
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Suivez les paiements des bénéficiaires.
          </p>
        </div>

        <button
          onClick={ouvrirAjout}
          className="flex items-center justify-center gap-2 bg-[#075C37] hover:bg-[#06482c] text-white px-5 py-3 rounded-xl"
        >
          <Plus size={18} />
          Nouveau paiement
        </button>
      </div>

      {/* ERREUR */}
      {error && (
        <div className="mb-5 bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* STATISTIQUES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Paiements effectués
              </p>

              <h2 className="text-2xl font-bold mt-2">
                {formatMontant(totalPaye)}
              </h2>
            </div>

            <CheckCircle
              className="text-green-600"
              size={28}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">
                En attente
              </p>

              <h2 className="text-2xl font-bold mt-2">
                {formatMontant(totalAttente)}
              </h2>
            </div>

            <Clock
              className="text-yellow-600"
              size={28}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">
                En retard
              </p>

              <h2 className="text-2xl font-bold mt-2">
                {formatMontant(totalRetard)}
              </h2>
            </div>

            <XCircle
              className="text-red-600"
              size={28}
            />
          </div>
        </div>

      </div>

      {/* TABLEAU */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

        <div className="p-5 border-b flex flex-col md:flex-row gap-4 justify-between">

          <div className="relative w-full md:w-96">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#075C37]"
            />

          </div>

          <div className="flex gap-3">

            <select
              value={filtreStatut}
              onChange={(e) =>
                setFiltreStatut(e.target.value)
              }
              className="border rounded-xl px-4 py-3"
            >
              <option>Tous</option>
              <option>Payé</option>
              <option>En attente</option>
              <option>En retard</option>
              <option>Annulé</option>
            </select>

            <button
              onClick={exporter}
              className="flex items-center gap-2 border px-4 py-3 rounded-xl hover:bg-gray-50"
            >
              <Download size={17} />
              Exporter
            </button>

          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-500">
            Chargement des paiements...
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">

                <tr>

                  <th className="text-left px-5 py-4">
                    Bénéficiaire
                  </th>

                  <th className="text-left px-5 py-4">
                    Montant
                  </th>

                  <th className="text-left px-5 py-4">
                    Date
                  </th>

                  <th className="text-left px-5 py-4">
                    Moyen
                  </th>

                  <th className="text-left px-5 py-4">
                    Statut
                  </th>

                  <th className="text-right px-5 py-4">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {paiementsFiltres.map(
                  (paiement) => (

                    <tr
                      key={paiement._id}
                      className="border-t hover:bg-gray-50"
                    >

                      <td className="px-5 py-4">

                        {paiement.beneficiaire
                          ? `${paiement.beneficiaire.prenom || ""} ${
                              paiement.beneficiaire.nom || ""
                            }`
                          : "Inconnu"}

                      </td>

                      <td className="px-5 py-4 font-semibold">

                        {formatMontant(
                          paiement.montant
                        )}

                      </td>

                      <td className="px-5 py-4">

                        {formatDate(
                          paiement.datePaiement
                        )}

                      </td>

                      <td className="px-5 py-4">

                        {paiement.moyen || "-"}

                      </td>

                      <td className="px-5 py-4">

                        <span className="px-3 py-1 rounded-full text-xs bg-gray-100">
                          {paiement.statut}
                        </span>

                      </td>

                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            className="p-2 hover:bg-gray-100 rounded-lg"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            onClick={() =>
                              ouvrirModification(
                                paiement
                              )
                            }
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            onClick={() =>
                              supprimer(
                                paiement._id
                              )
                            }
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={17} />
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

            {paiementsFiltres.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                Aucun paiement trouvé.
              </div>
            )}

          </div>
        )}

      </div>

      {/* MODAL */}
      {showModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">

            <div className="flex justify-between items-center p-5 border-b">

              <h2 className="text-lg font-bold">
                {editingId
                  ? "Modifier le paiement"
                  : "Nouveau paiement"}
              </h2>

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="p-5 space-y-4"
            >

              {/* BENEFICIAIRE */}
              <div>

                <label className="block text-sm font-medium mb-2">
                  Bénéficiaire
                </label>

                <select
                  name="beneficiaire"
                  value={form.beneficiaire}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3"
                  required
                >

                  <option value="">
                    Sélectionner un bénéficiaire
                  </option>

                  {beneficiaires.map(
                    (beneficiaire) => (

                      <option
                        key={beneficiaire._id}
                        value={beneficiaire._id}
                      >
                        {beneficiaire.prenom}{" "}
                        {beneficiaire.nom}
                      </option>

                    )
                  )}

                </select>

              </div>

              {/* MONTANT */}
              <div>

                <label className="block text-sm font-medium mb-2">
                  Montant
                </label>

                <input
                  type="number"
                  name="montant"
                  value={form.montant}
                  onChange={handleChange}
                  placeholder="Ex : 15000"
                  className="w-full border rounded-xl px-4 py-3"
                  min="0"
                  required
                />

              </div>

              {/* DATE */}
              <div>

                <label className="block text-sm font-medium mb-2">
                  Date du paiement
                </label>

                <input
                  type="date"
                  name="datePaiement"
                  value={form.datePaiement}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3"
                />

              </div>

              {/* MOYEN */}
              <div>

                <label className="block text-sm font-medium mb-2">
                  Moyen de paiement
                </label>

                <select
                  name="moyen"
                  value={form.moyen}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3"
                  required
                >

                  <option value="">
                    Sélectionner un moyen
                  </option>

                  <option value="Espèces">
                    Espèces
                  </option>

                  <option value="Wave">
                    Wave
                  </option>

                  <option value="Orange Money">
                    Orange Money
                  </option>

                  <option value="Free Money">
                    Free Money
                  </option>

                  <option value="Virement">
                    Virement
                  </option>

                  <option value="Chèque">
                    Chèque
                  </option>

                </select>

              </div>

              {/* STATUT */}
              <div>

                <label className="block text-sm font-medium mb-2">
                  Statut
                </label>

                <select
                  name="statut"
                  value={form.statut}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3"
                >

                  <option value="Payé">
                    Payé
                  </option>

                  <option value="En attente">
                    En attente
                  </option>

                  <option value="En retard">
                    En retard
                  </option>

                  <option value="Annulé">
                    Annulé
                  </option>

                </select>

              </div>

              {/* OBSERVATION */}
              <div>

                <label className="block text-sm font-medium mb-2">
                  Observation
                </label>

                <textarea
                  name="observation"
                  value={form.observation}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border rounded-xl px-4 py-3"
                  placeholder="Observation..."
                />

              </div>

              {/* BOUTON */}
              <button
                type="submit"
                className="w-full bg-[#075C37] hover:bg-[#06482c] text-white py-3 rounded-xl font-medium"
              >

                {editingId
                  ? "Modifier le paiement"
                  : "Enregistrer le paiement"}

              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default Paiements;
