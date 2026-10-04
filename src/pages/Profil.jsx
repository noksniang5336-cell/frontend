import React, { useEffect, useState } from "react";
import api from "../utils/api";

const Profil = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    commune: "",
    fonction: "",
    matricule: "",
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const getProfil = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Veuillez vous connecter pour voir votre profil.");
          setLoading(false);
          return;
        }

        const response = await api.get("/auth/profil");
        const userData = response.data.user;
        
        setUser(userData);
        setFormData({
          prenom: userData.prenom || "",
          nom: userData.nom || "",
          email: userData.email || "",
          telephone: userData.telephone || "",
          commune: userData.commune || "",
          fonction: userData.fonction || "",
          matricule: userData.matricule || "",
        });
      } catch (err) {
        console.error("Erreur profil :", err.response?.data || err.message);
        setError(
          err.response?.data?.message ||
            "Erreur lors de la récupération du profil."
        );
      } finally {
        setLoading(false);
      }
    };

    getProfil();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.put("/auth/profil", formData);
      setUser(response.data.user);
      setSuccess("Profil mis à jour avec succès !");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Erreur lors de la mise à jour du profil."
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    setSaving(true);

    try {
      await api.put("/auth/change-password", {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });

      setSuccess("Mot de passe modifié avec succès !");
      setIsChangingPassword(false);
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Erreur lors de la modification du mot de passe."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-full bg-white px-6 py-3 shadow-md">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          <span className="text-sm font-medium text-emerald-900">Chargement du profil...</span>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="mx-auto max-w-lg p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-200 text-red-700">⚠️</span>
            <h2 className="font-semibold">Erreur d'accès</h2>
          </div>
          <p className="mt-2 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50/40 p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* Header avec Bannière Verte */}
        <div className="relative overflow-hidden rounded-3xl bg-emerald-800 p-8 text-white shadow-xl shadow-emerald-900/10">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-600/30 blur-3xl" />
          <div className="relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200">Espace Compte</span>
              <h1 className="text-3xl font-extrabold tracking-tight">Paramètres du profil</h1>
            </div>
            <span className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-emerald-100 backdrop-blur-md border border-white/20">
              {user?.role || "Membre"}
            </span>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-700 border border-red-100">
            <span>❌</span> {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-100 p-4 text-sm text-emerald-800 border border-emerald-200">
            <span>✅</span> {success}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* Carte Profil (Sidebar) */}
          <div className="lg:col-span-4">
            <div className="sticky top-6 rounded-3xl border border-emerald-100 bg-white p-6 shadow-lg shadow-emerald-900/5">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-600 text-3xl font-black text-white shadow-md shadow-emerald-600/30">
                  {user?.prenom?.[0]}
                  {user?.nom?.[0]}
                </div>
                <h2 className="text-xl font-bold text-emerald-950">
                  {user?.prenom} {user?.nom}
                </h2>
                <p className="text-sm font-medium text-emerald-600">{user?.email}</p>
              </div>

              <div className="mt-8 space-y-4 border-t border-emerald-100 pt-6 text-sm">
                <div className="flex items-center justify-between py-1">
                  <span className="text-emerald-700/70">Matricule</span>
                  <span className="font-semibold text-emerald-950">{user?.matricule || "—"}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-emerald-700/70">Fonction</span>
                  <span className="font-semibold text-emerald-950">{user?.fonction || "—"}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-emerald-700/70">Commune</span>
                  <span className="font-semibold text-emerald-950">{user?.commune || "—"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaires Principaux */}
          <div className="space-y-8 lg:col-span-8">
            
            {/* Formulaire Profil */}
            <div className="rounded-3xl border border-emerald-100 bg-white p-6 md:p-8 shadow-lg shadow-emerald-900/5">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-emerald-950">Informations personnelles</h2>
                <p className="text-xs text-emerald-700/70">Mettez à jour vos informations de compte et coordonnées.</p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-emerald-800">Prénom</label>
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-emerald-200 bg-emerald-50/30 px-4 py-2.5 text-sm font-medium text-emerald-950 transition-all focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-600/10"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-emerald-800">Nom</label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-emerald-200 bg-emerald-50/30 px-4 py-2.5 text-sm font-medium text-emerald-950 transition-all focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-600/10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-emerald-800">Adresse Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-emerald-200 bg-emerald-50/30 px-4 py-2.5 text-sm font-medium text-emerald-950 transition-all focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-600/10"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-emerald-800">Téléphone</label>
                    <input
                      type="text"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-emerald-200 bg-emerald-50/30 px-4 py-2.5 text-sm font-medium text-emerald-950 transition-all focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-600/10"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-emerald-800">Commune</label>
                    <input
                      type="text"
                      name="commune"
                      value={formData.commune}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-emerald-200 bg-emerald-50/30 px-4 py-2.5 text-sm font-medium text-emerald-950 transition-all focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-600/10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-emerald-800">Fonction</label>
                    <input
                      type="text"
                      name="fonction"
                      value={formData.fonction}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-emerald-200 bg-emerald-50/30 px-4 py-2.5 text-sm font-medium text-emerald-950 transition-all focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-600/10"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-emerald-800">Matricule</label>
                    <input
                      type="text"
                      name="matricule"
                      value={formData.matricule}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-emerald-200 bg-emerald-50/30 px-4 py-2.5 text-sm font-medium text-emerald-950 transition-all focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-600/10"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50"
                  >
                    {saving ? "Enregistrement..." : "Sauvegarder"}
                  </button>
                </div>
              </form>
            </div>

            {/* Section Sécurité */}
            <div className="rounded-3xl border border-emerald-100 bg-white p-6 md:p-8 shadow-lg shadow-emerald-900/5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-emerald-950">Sécurité</h2>
                  <p className="text-xs text-emerald-700/70">Gérez le mot de passe de votre compte.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800 transition-all hover:bg-emerald-100 active:scale-95"
                >
                  {isChangingPassword ? "Masquer" : "Modifier"}
                </button>
              </div>

              {isChangingPassword && (
                <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-5 border-t border-emerald-100 pt-6">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-emerald-800">Ancien mot de passe</label>
                    <input
                      type="password"
                      name="oldPassword"
                      value={passwordData.oldPassword}
                      onChange={handlePasswordChange}
                      className="w-full rounded-xl border border-emerald-200 bg-emerald-50/30 px-4 py-2.5 text-sm font-medium text-emerald-950 transition-all focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-600/10"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-emerald-800">Nouveau mot de passe</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full rounded-xl border border-emerald-200 bg-emerald-50/30 px-4 py-2.5 text-sm font-medium text-emerald-950 transition-all focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-600/10"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-emerald-800">Confirmer le mot de passe</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full rounded-xl border border-emerald-200 bg-emerald-50/30 px-4 py-2.5 text-sm font-medium text-emerald-950 transition-all focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-600/10"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-xl bg-emerald-800 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-emerald-900 active:scale-[0.98] disabled:opacity-50"
                    >
                      {saving ? "Mise à jour..." : "Mettre à jour le mot de passe"}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profil;