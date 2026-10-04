import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const BeneficiairesTable = () => {
  // États pour les données de l'API
  const [beneficiaires, setBeneficiaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // États pour les filtres et la pagination
  const [recherche, setRecherche] = useState('');
  const [statut, setStatut] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Fonction de récupération des données
  const fetchBeneficiaires = useCallback(async (searchQuery, currentStatut, currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token_cmu');
      
      // Construction des paramètres d'URL (Query Params)
      const response = await axios.get('http://localhost:5000/api/beneficiaires', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          page: currentPage,
          limite: 10,
          recherche: searchQuery,
          statut: currentStatut
        }
      });

      if (response.data.success) {
        setBeneficiaires(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur de connexion à l'API");
    } finally {
      setLoading(false);
    }
  }, []);

  // Effet pour gérer le "Debounce" sur la recherche textuelle
  // Cela attend 500ms après la fin de la frappe avant de lancer la requête API
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBeneficiaires(recherche, statut, page);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [recherche, statut, page, fetchBeneficiaires]);

  // Réinitialiser la page à 1 si l'utilisateur change un filtre
  const handleSearchChange = (e) => {
    setRecherche(e.target.value);
    setPage(1);
  };

  const handleStatutChange = (e) => {
    setStatut(e.target.value);
    setPage(1);
  };

  // Badge de couleur selon le statut
  const renderStatutBadge = (statutValue) => {
    const baseStyle = "px-3 py-1 rounded-full text-xs font-semibold ";
    switch (statutValue) {
      case 'Actif':
        return <span className={baseStyle + "bg-green-100 text-green-800"}>Actif</span>;
      case 'Suspendu':
        return <span className={baseStyle + "bg-red-100 text-red-800"}>Suspendu</span>;
      default:
        return <span className={baseStyle + "bg-amber-100 text-amber-800"}>En attente</span>;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestion des Bénéficiaires CMU</h2>

        {/* Barre de Filtres */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher par n° CMU, Nom ou Prénom..."
              value={recherche}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={statut}
              onChange={handleStatutChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="">Tous les statuts</option>
              <option value="Actif">Actif</option>
              <option value="En attente">En attente</option>
              <option value="Suspendu">Suspendu</option>
            </select>
          </div>
        </div>

        {/* Gestion des erreurs */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Tableau des données */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Numéro CMU</th>
                <th className="px-6 py-4">Prénom & Nom</th>
                <th className="px-6 py-4">Région</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Date d'inscription</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 border-t border-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-400">
                    Chargement des bénéficiaires...
                  </td>
                </tr>
              ) : beneficiaires.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-400">
                    Aucun bénéficiaire trouvé.
                  </td>
                </tr>
              ) : (
                beneficiaires.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-gray-900">{b.numeroCMU}</td>
                    <td className="px-6 py-4 text-gray-900 font-medium">{b.prenom} {b.nom}</td>
                    <td className="px-6 py-4">{b.adresse?.region || 'N/A'}</td>
                    <td className="px-6 py-4">{renderStatutBadge(b.statutCouverture)}</td>
                    <td className="px-6 py-4">{new Date(b.createdAt).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Section Pagination */}
        {!loading && beneficiaires.length > 0 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Affichage de la page <span className="font-semibold">{pagination.pageActuelle}</span> sur{' '}
              <span className="font-semibold">{pagination.totalPages}</span> ({pagination.totalItems} bénéficiaires au total)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((old) => Math.max(old - 1, 1))}
                disabled={!pagination.hasPrevPage}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Précédent
              </button>
              <button
                onClick={() => setPage((old) => old + 1)}
                disabled={!pagination.hasNextPage}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeneficiairesTable;