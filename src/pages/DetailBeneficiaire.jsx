import MainLayout from "../layouts/MainLayout";
import { useParams } from "react-router-dom";

const DetailBeneficiaire = () => {
  const { id } = useParams();

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">
        Détails du bénéficiaire
      </h1>

      <div className="bg-white p-8 rounded-lg shadow">
        <p>
          <strong>ID :</strong> {id}
        </p>

        <p>
          <strong>Nom :</strong> Niang
        </p>

        <p>
          <strong>Prénom :</strong> Nogaye
        </p>

        <p>
          <strong>Téléphone :</strong> 771234567
        </p>

        <p>
          <strong>Statut :</strong> Actif
        </p>
      </div>
    </MainLayout>
  );
};

export default DetailBeneficiaire;