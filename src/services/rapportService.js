import api from "../utils/api";

export const getRapport = async (type, periode) => {
  const response = await api.get("/rapports", {
    params: {
      type,
      periode,
    },
  });

  return response.data;
};