import api from "../utils/api";

// =====================================================
// CONNEXION
// =====================================================
export const login = async ({ email, password }) => {
  const response = await api.post("/auth/login", {
    email: email.trim().toLowerCase(),
    password,
  });

  return response.data;
};

// =====================================================
// INSCRIPTION
// =====================================================
export const register = async (data) => {
  const response = await api.post("/auth/register", data);

  return response.data;
};

// =====================================================
// PROFIL
// =====================================================
export const getProfil = async () => {
  const response = await api.get("/auth/profil");

  return response.data;
};

// =====================================================
// MODIFICATION PROFIL
// =====================================================
export const updateProfil = async (data) => {
  const response = await api.put("/auth/profil", data);

  return response.data;
};