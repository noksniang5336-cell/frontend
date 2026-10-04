import api from "../utils/api";

// Récupérer toutes les adhésions
export const getAdhesions = async () => {
  const response = await api.get("/adhesions");
  return response.data;
};

// Récupérer une adhésion
export const getAdhesionById = async (id) => {
  const response = await api.get(`/adhesions/${id}`);
  return response.data;
};

// Créer une adhésion
export const createAdhesion = async (data) => {
  const response = await api.post("/adhesions", data);
  return response.data;
};

// Modifier une adhésion
export const updateAdhesion = async (id, data) => {
  const response = await api.put(`/adhesions/${id}`, data);
  return response.data;
};

// Supprimer une adhésion
export const deleteAdhesion = async (id) => {
  const response = await api.delete(`/adhesions/${id}`);
  return response.data;
};