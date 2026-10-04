
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authService";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const connexion = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await login({
        email,
        password,
      });

      console.log("✅ Réponse login :", res);

      const { token, user } = res;

      if (!token) {
        console.error("❌ Aucun token reçu :", res);
        alert("Erreur : aucun jeton d'authentification reçu.");
        return;
      }

      // Stocker les informations de connexion
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      console.log("✅ Token enregistré");
      console.log("✅ Utilisateur enregistré :", user);

      // Redirection
      navigate("/dashboard");
    } catch (err) {
      console.error(
        "❌ Erreur de connexion :",
        err.response?.data || err
      );

      alert(
        err.response?.data?.message ||
          "Email ou mot de passe incorrect."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-green-100">
      <form
        onSubmit={connexion}
        className="bg-white p-8 rounded-xl shadow-lg w-96"
      >
        <h2 className="text-3xl text-center text-green-700 font-bold mb-6">
          Connexion
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Mot de passe"
          className="w-full border p-3 rounded mb-6"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-700 text-white p-3 rounded hover:bg-green-800 transition disabled:opacity-50"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        <p className="mt-4 text-center">
          Pas de compte ?
          <Link
            to="/register"
            className="text-green-700 ml-2 font-semibold"
          >
            S'inscrire
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;

