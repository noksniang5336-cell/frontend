
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { register } from "../services/authService";

import {
  User,
  Mail,
  Lock,
  Phone,
  Building2,
  Hospital,
  LoaderCircle,
  Eye,
  EyeOff,
  BriefcaseBusiness,
  Badge,
  Plus,
} from "lucide-react";

const Register = () => {
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    commune: "",
    structure_sanitaire: "",
    fonction: "",
    matricule: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // =====================================================
  // CHANGEMENT DES CHAMPS
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Effacer les messages lorsqu'on recommence à saisir
    if (errorMsg) {
      setErrorMsg("");
    }

    if (successMsg) {
      setSuccessMsg("");
    }
  };

  // =====================================================
  // INSCRIPTION
  // =====================================================

  const inscription = async (e) => {
    e.preventDefault();

    setErrorMsg("");
    setSuccessMsg("");

    // Vérification des champs obligatoires
    if (
      !form.prenom.trim() ||
      !form.nom.trim() ||
      !form.email.trim() ||
      !form.telephone.trim() ||
      !form.commune.trim() ||
      !form.structure_sanitaire.trim() ||
      !form.fonction.trim() ||
      !form.password
    ) {
      setErrorMsg(
        "Veuillez remplir tous les champs obligatoires."
      );
      return;
    }

    // Vérification du mot de passe
    if (form.password.length < 6) {
      setErrorMsg(
        "Le mot de passe doit contenir au moins 6 caractères."
      );
      return;
    }

    // Vérification simple de l'email
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(form.email.trim())) {
      setErrorMsg("Veuillez saisir une adresse email valide.");
      return;
    }

    setLoading(true);

    try {
      // Nettoyage des données avant envoi
      const donnees = {
        prenom: form.prenom.trim(),
        nom: form.nom.trim(),
        email: form.email.trim().toLowerCase(),
        telephone: form.telephone.trim(),
        commune: form.commune.trim(),
        structure_sanitaire:
          form.structure_sanitaire.trim(),
        fonction: form.fonction.trim(),
        matricule: form.matricule.trim(),
        password: form.password,
      };

      console.log("📤 Données envoyées :", donnees);

      const response = await register(donnees);

      console.log(
        "✅ Inscription réussie :",
        response.data
      );

      setSuccessMsg(
        "Compte créé avec succès ! Redirection..."
      );

      // Redirection après inscription
      // Rechargement complet pour éviter le problème
      // removeChild rencontré avec React Router.
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (err) {
      console.error(
        "❌ Erreur inscription :",
        err
      );

      console.error(
        "Réponse serveur :",
        err.response?.data
      );

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Une erreur est survenue lors de l'inscription.";

      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-8">

      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-2xl border border-slate-100">

        {/* ================================================= */}
        {/* LOGO / TITRE */}
        {/* ================================================= */}

        <div className="flex flex-col items-center mb-7">

          <div className="w-14 h-14 rounded-full bg-[#0E5A36] flex items-center justify-center text-white shadow-lg mb-3">
            <Plus className="w-7 h-7" />
          </div>

          <h1 className="text-2xl font-bold text-[#0E5A36]">
            Créer un compte
          </h1>

          <p className="text-xs text-slate-500 font-medium mt-1">
            Couverture Maladie Universelle
          </p>

        </div>

        {/* ================================================= */}
        {/* MESSAGE ERREUR */}
        {/* ================================================= */}

        {errorMsg && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl text-center font-medium">
            {errorMsg}
          </div>
        )}

        {/* ================================================= */}
        {/* MESSAGE SUCCÈS */}
        {/* ================================================= */}

        {successMsg && (
          <div className="mb-5 p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl text-center font-medium">
            {successMsg}
          </div>
        )}

        {/* ================================================= */}
        {/* FORMULAIRE */}
        {/* ================================================= */}

        <form
          onSubmit={inscription}
          className="space-y-4"
        >

          {/* =============================================== */}
          {/* PRÉNOM / NOM */}
          {/* =============================================== */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* PRÉNOM */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Prénom *
              </label>

              <div className="relative">

                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />

                <input
                  type="text"
                  name="prenom"
                  value={form.prenom}
                  onChange={handleChange}
                  placeholder="Ex : Nogaye"
                  autoComplete="given-name"
                  disabled={loading}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0E5A36] focus:bg-white transition disabled:opacity-60"
                />

              </div>
            </div>

            {/* NOM */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nom *
              </label>

              <input
                type="text"
                name="nom"
                value={form.nom}
                onChange={handleChange}
                placeholder="Ex : Niang"
                autoComplete="family-name"
                disabled={loading}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0E5A36] focus:bg-white transition disabled:opacity-60"
              />
            </div>

          </div>

          {/* =============================================== */}
          {/* EMAIL / TÉLÉPHONE */}
          {/* =============================================== */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* EMAIL */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Adresse Email *
              </label>

              <div className="relative">

                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="exemple@email.com"
                  autoComplete="email"
                  disabled={loading}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0E5A36] focus:bg-white transition disabled:opacity-60"
                />

              </div>
            </div>

            {/* TÉLÉPHONE */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Téléphone *
              </label>

              <div className="relative">

                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />

                <input
                  type="tel"
                  name="telephone"
                  value={form.telephone}
                  onChange={handleChange}
                  placeholder="77 000 00 00"
                  autoComplete="tel"
                  disabled={loading}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0E5A36] focus:bg-white transition disabled:opacity-60"
                />

              </div>
            </div>

          </div>

          {/* =============================================== */}
          {/* COMMUNE / STRUCTURE SANITAIRE */}
          {/* =============================================== */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* COMMUNE */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Commune *
              </label>

              <div className="relative">

                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />

                <input
                  type="text"
                  name="commune"
                  value={form.commune}
                  onChange={handleChange}
                  placeholder="Ex : Thiès"
                  disabled={loading}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0E5A36] focus:bg-white transition disabled:opacity-60"
                />

              </div>
            </div>

            {/* STRUCTURE SANITAIRE */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Structure sanitaire *
              </label>

              <div className="relative">

                <Hospital className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />

                <input
                  type="text"
                  name="structure_sanitaire"
                  value={form.structure_sanitaire}
                  onChange={handleChange}
                  placeholder="Ex : Hôpital régional"
                  disabled={loading}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0E5A36] focus:bg-white transition disabled:opacity-60"
                />

              </div>
            </div>

          </div>

          {/* =============================================== */}
          {/* FONCTION / MATRICULE */}
          {/* =============================================== */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* FONCTION */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Fonction *
              </label>

              <div className="relative">

                <BriefcaseBusiness className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />

                <select
                  name="fonction"
                  value={form.fonction}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0E5A36] focus:bg-white transition appearance-none disabled:opacity-60"
                >

                  <option value="">
                    Sélectionner une fonction
                  </option>

                  <option value="Agent CMU">
                    Agent CMU
                  </option>

                  <option value="Gestionnaire">
                    Gestionnaire
                  </option>

                  <option value="Responsable">
                    Responsable
                  </option>

                </select>

              </div>
            </div>

            {/* MATRICULE */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Matricule
              </label>

              <div className="relative">

                <Badge className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />

                <input
                  type="text"
                  name="matricule"
                  value={form.matricule}
                  onChange={handleChange}
                  placeholder="Ex : CMU-001"
                  disabled={loading}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0E5A36] focus:bg-white transition disabled:opacity-60"
                />

              </div>
            </div>

          </div>

          {/* =============================================== */}
          {/* MOT DE PASSE */}
          {/* =============================================== */}

          <div>

            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mot de passe *
            </label>

            <div className="relative">

              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 6 caractères"
                autoComplete="new-password"
                disabled={loading}
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0E5A36] focus:bg-white transition disabled:opacity-60"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((prev) => !prev)
                }
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-50"
                aria-label={
                  showPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>

            </div>

          </div>

          {/* =============================================== */}
          {/* BOUTON INSCRIPTION */}
          {/* =============================================== */}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-5 bg-[#0E5A36] hover:bg-[#0b482b] text-white font-semibold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition disabled:opacity-70 disabled:cursor-not-allowed"
          >

            {loading ? (
              <>
                <LoaderCircle className="w-4 h-4 animate-spin" />
                Inscription en cours...
              </>
            ) : (
              "Créer mon compte"
            )}

          </button>

        </form>

        {/* ================================================= */}
        {/* LIEN CONNEXION */}
        {/* ================================================= */}

        <p className="mt-6 text-center text-xs text-slate-500">

          Déjà un compte ?

          <Link
            to="/"
            className="text-[#0E5A36] font-bold hover:underline ml-1"
          >
            Se connecter
          </Link>

        </p>

      </div>
    </div>
  );
};

export default Register;

