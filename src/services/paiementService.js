import api from "../utils/api";

// Récupérer tous les paiements
export const getPaiements = () => {
  return api.get("/paiements");
};

// Récupérer un paiement
export const getPaiementById = (id) => {
  return api.get(`/paiements/${id}`);
};

// Créer un paiement
export const createPaiement = (data) => {
  return api.post("/paiements", data);
};

// Modifier un paiement
export const updatePaiement = (id, data) => {
  return api.put(`/paiements/${id}`, data);
};

// Supprimer un paiement
export const deletePaiement = (id) => {
  return api.delete(`/paiements/${id}`);
};