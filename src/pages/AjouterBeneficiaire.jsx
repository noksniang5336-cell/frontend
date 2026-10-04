import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DemandeCMUForm from "../components/DemandeCMUForm";
import api from "../utils/api";

const AjouterBeneficiaire = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (data) => {
    try {
      setLoading(true);
      setErreur("");
      setSuccess("");

      console.log("📤 Données envoyées :", data);

      const response = await api.post(
        "/beneficiaires",
        data
      );

      console.log("✅ Réponse serveur :", response.data);

      setSuccess(
        "Bénéficiaire enregistré avec succès !"
      );

      setTimeout(() => {
        navigate("/beneficiaires");
      }, 1000);
    } catch (error) {
      console.error(
        "❌ Erreur enregistrement :",
        error
      );

      setErreur(
        error.response?.data?.message ||
          "Erreur lors de l'enregistrement du bénéficiaire."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Nouveau bénéficiaire
      </h1>

      {success && (
        <div className="mb-4 rounded-lg bg-green-100 px-4 py-3 text-green-700">
          {success}
        </div>
      )}

      {erreur && (
        <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-red-700">
          {erreur}
        </div>
      )}

      <DemandeCMUForm
        onSubmitStep={handleSubmit}
        loading={loading}
      />
    </div>
  );
};

export default AjouterBeneficiaire;