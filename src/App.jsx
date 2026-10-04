import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from "./pages/Login";
import Register from './pages/Register';
import Dashboard from "./pages/Dashboard";
import Beneficiaires from "./pages/Beneficiaires";
import AjouterBeneficiaire from "./pages/AjouterBeneficiaire";
import DetailBeneficiaire from "./pages/DetailBeneficiaire";
import Adhesions from "./pages/Adhesions";
import Profil from './pages/Profil';
import Paiements from "./pages/Paiements";
import Communes from "./pages/Communes";
import Rapports from "./pages/Rapports";

const App = () => {
  const router = createBrowserRouter([
    // 1. Routes publiques (Sans la sidebar du MainLayout)
    { path: '/', element: <Login /> },
    { path: '/register', element: <Register /> },

    // 2. Routes protégées/internes (Avec le MainLayout)
    { 
      element: <MainLayout />,
      children: [
        { path: '/dashboard', element: <Dashboard /> },
        { path: '/beneficiaires', element: <Beneficiaires /> },
        { path: '/ajouterBeneficiaire', element: <AjouterBeneficiaire /> },
        { path: '/detailBeneficiaire', element: <DetailBeneficiaire /> },
        { path: '/adhesions', element: <Adhesions /> },
        { path: '/profil', element: <Profil /> },
        { path: '/paiements', element: <Paiements /> },
        { path: '/communes', element: <Communes /> },
        { path: '/rapports', element: <Rapports /> },
      ]
    }
  ]);

  return <RouterProvider router={router} />;
}

export default App;