import React, { useEffect, useState } from "react";

import {
  Search,
  Plus,
  MapPin,
  Users,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import {
  getCommunes,
  createCommune,
  updateCommune,
  deleteCommune,
} from "../services/communeService";

const Communes = () => {
  // ==================================================
  // ÉTATS
  // ==================================================

  const [communes, setCommunes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nom: "",
    region: "",
    departement: "",
    code: "",
    statut: "Active",
    description: "",
  });

  // ==================================================
  // CHARGER LES COMMUNES
  // ==================================================

  const chargerCommunes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getCommunes();

      console.log("📋 Réponse API communes :", response);

      /*
       * communeService.js retourne déjà response.data.
       *
       * Donc ici on utilise :
       * response.communes
       *
       * et NON :
       * response.data.communes
       */
      setCommunes(response?.communes || []);
    } catch (error) {
      console.error(
        "❌ Erreur chargement communes :",
        error.response?.data || error.message
      );

      setCommunes([]);

      setError(
        error.response?.data?.message ||
          "Impossible de charger les communes."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // CHARGEMENT INITIAL
  // ==================================================

  useEffect(() => {
    chargerCommunes();
  }, []);

  // ==================================================
  // MODIFIER LE FORMULAIRE
  // ==================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((ancien) => ({
      ...ancien,
      [name]: value,
    }));
  };

  // ==================================================
  // OUVRIR MODAL AJOUT
  // ==================================================

  const ouvrirAjout = () => {
    setEditingId(null);

    setError("");

    setForm({
      nom: "",
      region: "",
      departement: "",
      code: "",
      statut: "Active",
      description: "",
    });

    setShowModal(true);
  };

  // ==================================================
  // OUVRIR MODAL MODIFICATION
  // ==================================================

  const ouvrirModification = (commune) => {
    setEditingId(commune._id);

    setError("");

    setForm({
      nom: commune.nom || "",
      region: commune.region || "",
      departement: commune.departement || "",
      code: commune.code || "",
      statut: commune.statut || "Active",
      description: commune.description || "",
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

      if (!form.nom.trim()) {
        setError("Le nom de la commune est obligatoire.");
        return;
      }

      if (!form.region.trim()) {
        setError("La région est obligatoire.");
        return;
      }

      if (!form.departement.trim()) {
        setError("Le département est obligatoire.");
        return;
      }

      if (editingId) {
        // MODIFICATION
        await updateCommune(editingId, form);

        console.log("✅ Commune modifiée avec succès");
      } else {
        // CRÉATION
        await createCommune(form);

        console.log("✅ Commune créée avec succès");
      }

      // Fermer le formulaire
      setShowModal(false);

      // Réinitialiser
      setEditingId(null);

      setForm({
        nom: "",
        region: "",
        departement: "",
        code: "",
        statut: "Active",
        description: "",
      });

      // Recharger les communes
      await chargerCommunes();
    } catch (error) {
      console.error(
        "❌ Erreur enregistrement commune :",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Une erreur est survenue lors de l'enregistrement."
      );
    }
  };

  // ==================================================
  // SUPPRIMER
  // ==================================================

  const supprimer = async (id) => {
    const confirmation = window.confirm(
      "Voulez-vous supprimer cette commune ?"
    );

    if (!confirmation) {
      return;
    }

    try {
      setError("");

      await deleteCommune(id);

      console.log("✅ Commune supprimée avec succès");

      await chargerCommunes();
    } catch (error) {
      console.error(
        "❌ Erreur suppression commune :",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Impossible de supprimer cette commune."
      );
    }
  };

  // ==================================================
  // FILTRER LES COMMUNES
  // ==================================================

  const communesFiltrees = communes.filter((commune) => {
    const texte = `
      ${commune.nom || ""}
      ${commune.region || ""}
      ${commune.departement || ""}
    `.toLowerCase();

    return texte.includes(search.toLowerCase());
  });

  // ==================================================
  // STATISTIQUES
  // ==================================================

  const totalBeneficiaires = communes.reduce(
    (total, commune) => {
      return total + Number(commune.beneficiaires || 0);
    },
    0
  );

  const communesActives = communes.filter(
    (commune) => commune.statut === "Active"
  ).length;

  // ==================================================
  // AFFICHAGE
  // ==================================================

  return (
    <div className="min-h-full bg-[#FAF8F5] p-6">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Gestion des communes
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Gérez les communes couvertes par la CMU.
          </p>
        </div>

        <button
          onClick={ouvrirAjout}
          className="flex items-center justify-center gap-2 bg-[#075C37] text-white px-5 py-3 rounded-xl hover:bg-[#064b2d] transition"
        >
          <Plus size={18} />
          Ajouter une commune
        </button>
      </div>

      {/* ==================================================
          MESSAGE ERREUR
      ================================================== */}

      {error && (
        <div className="mb-5 bg-red-50 text-red-700 border border-red-200 p-4 rounded-xl">
          {error}
        </div>
      )}

      {/* ==================================================
          STATISTIQUES
      ================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

        {/* TOTAL COMMUNES */}

        <div className="bg-white rounded-2xl p-5 border shadow-sm">
          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <MapPin
                className="text-green-600"
                size={24}
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Total communes
              </p>

              <p className="text-2xl font-bold">
                {communes.length}
              </p>
            </div>

          </div>
        </div>

        {/* BÉNÉFICIAIRES */}

        <div className="bg-white rounded-2xl p-5 border shadow-sm">
          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users
                className="text-blue-600"
                size={24}
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Bénéficiaires
              </p>

              <p className="text-2xl font-bold">
                {totalBeneficiaires}
              </p>
            </div>

          </div>
        </div>

        {/* COMMUNES ACTIVES */}

        <div className="bg-white rounded-2xl p-5 border shadow-sm">
          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <MapPin
                className="text-yellow-600"
                size={24}
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Communes actives
              </p>

              <p className="text-2xl font-bold">
                {communesActives}
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* ==================================================
          TABLEAU
      ================================================== */}

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">

        {/* RECHERCHE */}

        <div className="p-5 border-b">

          <div className="relative w-full md:w-96">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une commune..."
              className="w-full pl-10 pr-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#075C37]"
            />

          </div>

        </div>

        {/* CHARGEMENT */}

        {loading ? (
          <div className="py-16 text-center text-gray-500">
            Chargement des communes...
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">

                <tr>

                  <th className="text-left px-5 py-4">
                    Commune
                  </th>

                  <th className="text-left px-5 py-4">
                    Région
                  </th>

                  <th className="text-left px-5 py-4">
                    Département
                  </th>

                  <th className="text-left px-5 py-4">
                    Bénéficiaires
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

                {communesFiltrees.map((commune) => (

                  <tr
                    key={commune._id}
                    className="border-t hover:bg-gray-50"
                  >

                    {/* COMMUNE */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">

                          <MapPin
                            size={18}
                            className="text-[#075C37]"
                          />

                        </div>

                        <span className="font-semibold">
                          {commune.nom}
                        </span>

                      </div>

                    </td>

                    {/* RÉGION */}

                    <td className="px-5 py-4">
                      {commune.region || "-"}
                    </td>

                    {/* DÉPARTEMENT */}

                    <td className="px-5 py-4">
                      {commune.departement || "-"}
                    </td>

                    {/* BÉNÉFICIAIRES */}

                    <td className="px-5 py-4 font-semibold">
                      {commune.beneficiaires || 0}
                    </td>

                    {/* STATUT */}

                    <td className="px-5 py-4">

                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          commune.statut === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {commune.statut || "Active"}
                      </span>

                    </td>

                    {/* ACTIONS */}

                    <td className="px-5 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() =>
                            ouvrirModification(commune)
                          }
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Modifier"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() =>
                            supprimer(commune._id)
                          }
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Supprimer"
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

            {/* AUCUNE COMMUNE */}

            {communesFiltrees.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                {search
                  ? "Aucune commune ne correspond à votre recherche."
                  : "Aucune commune trouvée."}
              </div>
            )}

          </div>
        )}

      </div>

      {/* ==================================================
          MODAL
      ================================================== */}

      {showModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">

            {/* HEADER MODAL */}

            <div className="flex justify-between items-center p-5 border-b">

              <h2 className="font-bold text-lg">
                {editingId
                  ? "Modifier la commune"
                  : "Ajouter une commune"}
              </h2>

              <button
                onClick={() => {
                  setShowModal(false);
                  setError("");
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>

            </div>

            {/* FORMULAIRE */}

            <form
              onSubmit={handleSubmit}
              className="p-5 space-y-4"
            >

              {/* NOM */}

              <input
                name="nom"
                value={form.nom}
                onChange={handleChange}
                placeholder="Nom de la commune"
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#075C37]"
                required
              />

              {/* RÉGION */}

              <input
                name="region"
                value={form.region}
                onChange={handleChange}
                placeholder="Région"
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#075C37]"
                required
              />

              {/* DÉPARTEMENT */}

              <input
                name="departement"
                value={form.departement}
                onChange={handleChange}
                placeholder="Département"
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#075C37]"
                required
              />

              {/* CODE */}

              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="Code de la commune"
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#075C37]"
              />

              {/* STATUT */}

              <select
                name="statut"
                value={form.statut}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#075C37]"
              >
                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
                </option>
              </select>

              {/* DESCRIPTION */}

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
                rows="3"
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#075C37]"
              />

              {/* BOUTON */}

              <button
                type="submit"
                className="w-full bg-[#075C37] text-white py-3 rounded-xl hover:bg-[#064b2d] transition"
              >
                {editingId
                  ? "Modifier"
                  : "Enregistrer"}
              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default Communes;
