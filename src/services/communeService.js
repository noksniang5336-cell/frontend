import api from "../utils/api";

// Récupérer les communes
export const getCommunes = async () => {
  const response = await api.get("/communes");
  return response.data;
};

// Créer une commune
export const createCommune = async (data) => {
  const response = await api.post("/communes", data);
  return response.data;
};

// Modifier une commune
export const updateCommune = async (id, data) => {
  const response = await api.put(`/communes/${id}`, data);
  return response.data;
};

// Supprimer une commune
export const deleteCommune = async (id) => {
  const response = await api.delete(`/communes/${id}`);
  return response.data;
};

// Récupérer une commune
export const getCommuneById = async (id) => {
  const response = await api.get(`/communes/${id}`);
  return response.data;
};