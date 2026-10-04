import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Users,
  UserCheck,
  MapPin,
  ShieldCheck,
  AlertCircle,
  Loader2,
  HeartPulse,
  RefreshCw,
} from "lucide-react";

/* =========================================================
   COULEURS
========================================================= */

const C = {
  primary: "#0E5D45",
  primaryDark: "#0A4735",
  primaryLight: "#E7F0EC",

  sand: "#F7F3EA",
  sandDark: "#EDE6D6",

  gold: "#D9A441",
  goldLight: "#FBF0DC",
  goldDark: "#A9761F",

  red: "#BC3A2E",
  redLight: "#FBE8E6",

  ink: "#1E2A26",
  inkSoft: "#5B6B64",

  border: "#DDD5C2",
};

/* =========================================================
   API
========================================================= */

const API_URL = "http://localhost:5000/api";

/* =========================================================
   FORMULAIRE VIDE
========================================================= */

const createEmptyForm = () => ({
  id: null,

  numeroCMU: "",
  prenom: "",
  nom: "",

  sexe: "Femme",

  dateNaissance: "",

  telephone: "",
  adresse: "",

  region: "",
  departement: "",

  commune: "",
});

/* =========================================================
   UTILITAIRES
========================================================= */

function getToken() {
  return localStorage.getItem("token");
}

function getHeaders() {
  const token = getToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

function formatDate(date) {
  if (!date) return "—";

  const dt = new Date(date);

  if (Number.isNaN(dt.getTime())) {
    return "—";
  }

  return dt.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function calculateAge(date) {
  if (!date) return "—";

  const birthDate = new Date(date);

  if (Number.isNaN(birthDate.getTime())) {
    return "—";
  }

  const today = new Date();

  let years =
    today.getFullYear() -
    birthDate.getFullYear();

  const month =
    today.getMonth() -
    birthDate.getMonth();

  if (
    month < 0 ||
    (month === 0 &&
      today.getDate() <
        birthDate.getDate())
  ) {
    years--;
  }

  return Math.max(0, years);
}

function getInitials(nom, prenom) {
  const first = (prenom || "?")[0] || "";
  const last = (nom || "?")[0] || "";

  return `${first}${last}`.toUpperCase();
}

function getCommuneName(commune) {
  if (!commune) return "—";

  if (typeof commune === "string") {
    return commune;
  }

  return (
    commune.nom ||
    commune.name ||
    commune.libelle ||
    commune.libelleCommune ||
    "—"
  );
}

function getErrorMessage(error) {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  if (error?.message) {
    return error.message;
  }

  return "Une erreur est survenue.";
}

/* =========================================================
   STYLE SEXE
========================================================= */

function statutStyle(sexe) {
  if (sexe === "Homme") {
    return {
      bg: C.primaryLight,
      fg: C.primaryDark,
      dot: C.primary,
    };
  }

  return {
    bg: C.goldLight,
    fg: C.goldDark,
    dot: C.gold,
  };
}

/* =========================================================
   COMPOSANT PRINCIPAL
========================================================= */

export default function Beneficiaires() {
  const [items, setItems] = useState([]);
  const [communes, setCommunes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingCommunes, setLoadingCommunes] =
    useState(true);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [query, setQuery] = useState("");
  const [filterSexe, setFilterSexe] =
    useState("Tous");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [form, setForm] =
    useState(createEmptyForm());

  const [confirmDelete, setConfirmDelete] =
    useState(null);

  const [toast, setToast] = useState(null);

  /* =======================================================
     CHARGER LES BÉNÉFICIAIRES
  ======================================================= */

  const loadBeneficiaires = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/beneficiaires`,
        {
          headers: getHeaders(),
        }
      );

      const data =
        response.data?.beneficiaires ??
        response.data;

      setItems(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Erreur chargement bénéficiaires :",
        error
      );

      setToast({
        kind: "error",
        msg: getErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     CHARGER LES COMMUNES
  ======================================================= */

  const loadCommunes = async () => {
    try {
      setLoadingCommunes(true);

      const response = await axios.get(
        `${API_URL}/communes`,
        {
          headers: getHeaders(),
        }
      );

      const data =
        response.data?.communes ??
        response.data;

      setCommunes(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Erreur chargement communes :",
        error
      );

      setCommunes([]);

      setToast({
        kind: "error",
        msg:
          "Impossible de charger les communes.",
      });
    } finally {
      setLoadingCommunes(false);
    }
  };

  /* =======================================================
     CHARGEMENT INITIAL
  ======================================================= */

  useEffect(() => {
    loadBeneficiaires();
    loadCommunes();
  }, []);

  /* =======================================================
     TOAST
  ======================================================= */

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toast]);

  /* =======================================================
     STATISTIQUES
  ======================================================= */

  const stats = useMemo(() => {
    const total = items.length;

    const hommes = items.filter(
      (item) => item.sexe === "Homme"
    ).length;

    const femmes = items.filter(
      (item) => item.sexe === "Femme"
    ).length;

    const avecCommune = items.filter(
      (item) => item.commune
    ).length;

    return {
      total,
      hommes,
      femmes,
      avecCommune,
    };
  }, [items]);

  /* =======================================================
     RECHERCHE + FILTRE
  ======================================================= */

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return [...items]
      .filter((item) => {
        if (filterSexe === "Tous") {
          return true;
        }

        return item.sexe === filterSexe;
      })
      .filter((item) => {
        if (!q) return true;

        const commune =
          getCommuneName(item.commune);

        return (
          (item.nom || "")
            .toLowerCase()
            .includes(q) ||
          (item.prenom || "")
            .toLowerCase()
            .includes(q) ||
          (item.numeroCMU || "")
            .toLowerCase()
            .includes(q) ||
          (item.telephone || "")
            .toLowerCase()
            .includes(q) ||
          commune
            .toLowerCase()
            .includes(q)
        );
      })
      .sort((a, b) =>
        (a.nom || "").localeCompare(
          b.nom || ""
        )
      );
  }, [items, query, filterSexe]);

  /* =======================================================
     NOUVEAU
  ======================================================= */

  function openNew() {
    setForm(createEmptyForm());
    setModalOpen(true);
  }

  /* =======================================================
     MODIFIER
  ======================================================= */

  function openEdit(item) {
    setForm({
      id: item._id,

      numeroCMU:
        item.numeroCMU || "",

      prenom:
        item.prenom || "",

      nom:
        item.nom || "",

      sexe:
        item.sexe || "Femme",

      dateNaissance:
        item.dateNaissance
          ? new Date(
              item.dateNaissance
            )
              .toISOString()
              .slice(0, 10)
          : "",

      telephone:
        item.telephone || "",

      adresse:
        item.adresse || "",

      region:
        item.region || "",

      departement:
        item.departement || "",

      commune:
        typeof item.commune === "object"
          ? item.commune?._id || ""
          : item.commune || "",
    });

    setModalOpen(true);
  }

  /* =======================================================
     FERMER MODAL
  ======================================================= */

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setForm(createEmptyForm());
  }

  /* =======================================================
     ENREGISTRER
  ======================================================= */

  async function save(event) {
    event.preventDefault();

    if (saving) return;

    const numeroCMU =
      form.numeroCMU.trim();

    const prenom =
      form.prenom.trim();

    const nom =
      form.nom.trim();

    if (!numeroCMU || !prenom || !nom) {
      setToast({
        kind: "error",
        msg:
          "Le numéro CMU, le prénom et le nom sont obligatoires.",
      });

      return;
    }

    try {
      setSaving(true);

      const data = {
        numeroCMU,
        prenom,
        nom,

        sexe: form.sexe,

        dateNaissance:
          form.dateNaissance || null,

        telephone:
          form.telephone.trim(),

        adresse:
          form.adresse.trim(),

        region:
          form.region.trim(),

        departement:
          form.departement.trim(),

        commune:
          form.commune || null,
      };

      /* =====================================================
         MODIFICATION
      ===================================================== */

      if (form.id) {
        const response =
          await axios.put(
            `${API_URL}/beneficiaires/${form.id}`,
            data,
            {
              headers: getHeaders(),
            }
          );

        const updated =
          response.data?.beneficiaire ??
          response.data;

        setItems((previous) =>
          previous.map((item) =>
            item._id === form.id
              ? updated
              : item
          )
        );

        setToast({
          kind: "success",
          msg:
            "Bénéficiaire modifié avec succès.",
        });

        setModalOpen(false);
        setForm(createEmptyForm());

        return;
      }

      /* =====================================================
         CRÉATION
      ===================================================== */

      const response =
        await axios.post(
          `${API_URL}/beneficiaires`,
          data,
          {
            headers: getHeaders(),
          }
        );

      const created =
        response.data?.beneficiaire ??
        response.data;

      setItems((previous) => [
        created,
        ...previous,
      ]);

      setToast({
        kind: "success",
        msg:
          "Bénéficiaire enregistré avec succès.",
      });

      setModalOpen(false);
      setForm(createEmptyForm());

    } catch (error) {
      console.error(
        "Erreur enregistrement :",
        error
      );

      setToast({
        kind: "error",
        msg: getErrorMessage(error),
      });
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     SUPPRIMER
  ======================================================= */

  async function doDelete(id) {
    if (deleting) return;

    try {
      setDeleting(true);

      await axios.delete(
        `${API_URL}/beneficiaires/${id}`,
        {
          headers: getHeaders(),
        }
      );

      setItems((previous) =>
        previous.filter(
          (item) => item._id !== id
        )
      );

      setConfirmDelete(null);

      setToast({
        kind: "success",
        msg:
          "Bénéficiaire supprimé avec succès.",
      });
    } catch (error) {
      console.error(
        "Erreur suppression :",
        error
      );

      setToast({
        kind: "error",
        msg: getErrorMessage(error),
      });
    } finally {
      setDeleting(false);
    }
  }

  /* =======================================================
     POLICES
  ======================================================= */

  const fontStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600;6..72,700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

    .font-display {
      font-family: 'Newsreader', serif;
    }

    .font-body {
      font-family: 'IBM Plex Sans', sans-serif;
    }

    .font-mono {
      font-family: 'IBM Plex Mono', monospace;
    }

    .perforated {
      background-image:
        radial-gradient(
          circle at 16px 0,
          transparent 5px,
          ${C.sand} 5.5px
        );

      background-size: 32px 100%;
      background-repeat: repeat-x;
      background-position: left top;
    }
  `;

  /* =======================================================
     RENDU
  ======================================================= */

  return (
    <div
      className="font-body min-h-screen w-full"
      style={{
        background: C.sand,
        color: C.ink,
      }}
    >
      <style>{fontStyles}</style>

      {/* HEADER */}

      <header
        className="border-b backdrop-blur-md"
        style={{
          borderColor: C.border,
          background: C.primary,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">

              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white/10"
                style={{
                  background: C.gold,
                }}
              >
                <HeartPulse
                  size={22}
                  color={C.primaryDark}
                />
              </div>

              <div>
                <div className="flex items-center gap-2">

                  <span
                    className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-bold"
                    style={{
                      color: C.goldLight,
                    }}
                  >
                    Couverture Maladie
                    Universelle
                  </span>

                  <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded-full bg-white/10 text-white/80">
                    Portail Officiel
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Registre des bénéficiaires
                </h1>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3 text-xs text-white/70">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Système actif
            </div>
          </div>
        </div>
      </header>

      {/* CONTENU */}

      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-7">

        {/* STATS */}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">

          <StatCard
            icon={Users}
            label="Total bénéficiaires"
            value={stats.total}
          />

          <StatCard
            icon={ShieldCheck}
            label="Hommes"
            value={stats.hommes}
            accent={C.primary}
          />

          <StatCard
            icon={UserCheck}
            label="Femmes"
            value={stats.femmes}
          />

          <StatCard
            icon={MapPin}
            label="Avec commune"
            value={stats.avecCommune}
          />

        </div>

        {/* TOOLBAR */}

        <div className="flex flex-col sm:flex-row gap-3 mb-5">

          <div className="relative flex-1">

            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{
                color: C.inkSoft,
              }}
            />

            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Rechercher par nom, numéro CMU, téléphone, commune…"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none border bg-white"
              style={{
                borderColor: C.border,
              }}
            />

          </div>

          <select
            value={filterSexe}
            onChange={(event) =>
              setFilterSexe(event.target.value)
            }
            className="px-3 py-2.5 rounded-lg text-sm border outline-none bg-white"
            style={{
              borderColor: C.border,
            }}
          >
            <option value="Tous">
              Tous les sexes
            </option>

            <option value="Homme">
              Homme
            </option>

            <option value="Femme">
              Femme
            </option>
          </select>

          <button
            type="button"
            onClick={loadBeneficiaires}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border bg-white"
            style={{
              borderColor: C.border,
              color: C.ink,
            }}
          >
            <RefreshCw
              size={15}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Actualiser
          </button>

          <button
            type="button"
            onClick={openNew}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white shrink-0"
            style={{
              background: C.primary,
            }}
          >
            <Plus size={16} />
            Nouveau bénéficiaire
          </button>

        </div>

        {/* LISTE */}

        {loading ? (
          <div
            className="flex items-center justify-center py-24"
            style={{
              color: C.inkSoft,
            }}
          >
            <Loader2
              size={20}
              className="animate-spin mr-2"
            />

            Chargement des bénéficiaires…
          </div>

        ) : filtered.length === 0 ? (

          <EmptyState
            hasItems={items.length > 0}
            onNew={openNew}
          />

        ) : (

          <ul className="flex flex-col gap-3">

            {filtered.map((item) => (
              <BeneficiaryRow
                key={item._id}
                item={item}
                onEdit={() =>
                  openEdit(item)
                }
                onDelete={() =>
                  setConfirmDelete(item)
                }
              />
            ))}

          </ul>
        )}

        {/* FOOTER */}

        <p
          className="text-[11px] mt-6 text-center"
          style={{
            color: C.inkSoft,
          }}
        >
          {filtered.length} bénéficiaire
          {filtered.length > 1
            ? "s"
            : ""}{" "}
          affiché
          {filtered.length > 1
            ? "s"
            : ""}{" "}
          sur {items.length}
        </p>

      </main>

      {/* FORMULAIRE */}

      {modalOpen && (
        <FormModal
          form={form}
          communes={communes}
          loadingCommunes={loadingCommunes}
          saving={saving}
          setForm={setForm}
          onClose={closeModal}
          onSubmit={save}
        />
      )}

      {/* CONFIRMATION */}

      {confirmDelete && (
        <ConfirmModal
          item={confirmDelete}
          deleting={deleting}
          onCancel={() =>
            setConfirmDelete(null)
          }
          onConfirm={() =>
            doDelete(
              confirmDelete._id
            )
          }
        />
      )}

      {/* TOAST */}

      {toast && (
        <div
          className="fixed bottom-5 left-1/2 -translate-x-1/2 px-5 py-3 rounded-lg text-sm font-medium text-white shadow-lg z-[100]"
          style={{
            background:
              toast.kind === "error"
                ? C.red
                : C.primaryDark,
          }}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}) {
  return (
    <div
      className="rounded-xl px-4 py-3.5 border bg-white flex items-center gap-3"
      style={{
        borderColor: C.border,
      }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{
          background: accent
            ? C.primaryLight
            : C.sandDark,
        }}
      >
        <Icon
          size={16}
          style={{
            color:
              accent || C.inkSoft,
          }}
        />
      </div>

      <div className="min-w-0">
        <p
          className="font-display text-xl font-semibold leading-none"
          style={{
            color: C.ink,
          }}
        >
          {value}
        </p>

        <p
          className="text-[11px] mt-1 truncate"
          style={{
            color: C.inkSoft,
          }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  hasItems,
  onNew,
}) {
  return (
    <div
      className="rounded-xl border border-dashed py-16 flex flex-col items-center text-center px-6"
      style={{
        borderColor: C.border,
      }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
        style={{
          background:
            C.primaryLight,
        }}
      >
        <Users
          size={20}
          style={{
            color: C.primary,
          }}
        />
      </div>

      <p className="font-display text-lg font-semibold mb-1">
        {hasItems
          ? "Aucun résultat"
          : "Aucun bénéficiaire enregistré"}
      </p>

      <p
        className="text-sm mb-5"
        style={{
          color: C.inkSoft,
        }}
      >
        {hasItems
          ? "Ajustez la recherche ou les filtres."
          : "Commencez par enregistrer le premier bénéficiaire."}
      </p>

      <button
        type="button"
        onClick={onNew}
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
        style={{
          background: C.primary,
        }}
      >
        <Plus size={16} />
        Ajouter un bénéficiaire
      </button>
    </div>
  );
}

/* =========================================================
   LIGNE BÉNÉFICIAIRE
========================================================= */

function BeneficiaryRow({
  item,
  onEdit,
  onDelete,
}) {
  const status =
    statutStyle(item.sexe);

  const commune =
    getCommuneName(item.commune);

  return (
    <li
      className="perforated rounded-xl border bg-white overflow-hidden"
      style={{
        borderColor: C.border,
      }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 pl-6 pr-4 py-4">

        {/* IDENTITÉ */}

        <div className="flex items-center gap-3 lg:w-64 shrink-0">

          <div className="relative shrink-0">

            <div
              className="w-11 h-11 rounded-full flex items-center justify-center font-display font-semibold text-sm"
              style={{
                background:
                  C.primaryLight,
                color:
                  C.primaryDark,
              }}
            >
              {getInitials(
                item.nom,
                item.prenom
              )}
            </div>

            <span
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white"
              style={{
                background:
                  status.dot,
              }}
            />

          </div>

          <div className="min-w-0">

            <p
              className="font-semibold text-sm truncate"
              style={{
                color: C.ink,
              }}
            >
              {item.prenom}{" "}
              {item.nom}
            </p>

            <p
              className="font-mono text-[11px] truncate"
              style={{
                color: C.inkSoft,
              }}
            >
              {item.numeroCMU}
            </p>

          </div>
        </div>

        {/* DETAILS */}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 flex-1 text-xs">

          <Detail
            label="Sexe"
            value={item.sexe}
          />

          <Detail
            label="Naissance"
            value={`${formatDate(
              item.dateNaissance
            )} (${calculateAge(
              item.dateNaissance
            )} ans)`}
          />

          <Detail
            label="Téléphone"
            value={
              item.telephone || "—"
            }
          />

          <Detail
            label="Commune"
            value={commune}
          />

        </div>

        {/* ACTIONS */}

        <div className="flex items-center gap-2 lg:w-24 justify-end shrink-0">

          <button
            type="button"
            onClick={onEdit}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-70 transition"
            style={{
              background:
                C.sandDark,
            }}
            aria-label="Modifier"
          >
            <Pencil
              size={14}
              style={{
                color: C.ink,
              }}
            />
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-70 transition"
            style={{
              background:
                C.redLight,
            }}
            aria-label="Supprimer"
          >
            <Trash2
              size={14}
              style={{
                color: C.red,
              }}
            />
          </button>

        </div>
      </div>
    </li>
  );
}

/* =========================================================
   DETAIL
========================================================= */

function Detail({
  label,
  value,
}) {
  return (
    <div className="min-w-0">

      <p
        className="text-[10px] uppercase tracking-wide"
        style={{
          color: C.inkSoft,
        }}
      >
        {label}
      </p>

      <p
        className="truncate font-medium"
        style={{
          color: C.ink,
        }}
      >
        {value || "—"}
      </p>

    </div>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  children,
  span,
}) {
  return (
    <label
      className={`flex flex-col gap-1 text-xs ${
        span
          ? "sm:col-span-2"
          : ""
      }`}
    >
      <span
        className="font-semibold uppercase tracking-wide text-[10px]"
        style={{
          color: C.inkSoft,
        }}
      >
        {label}
      </span>

      {children}
    </label>
  );
}

const inputCls =
  "px-3 py-2.5 rounded-lg border text-sm outline-none bg-white";

/* =========================================================
   MODAL FORMULAIRE
========================================================= */

function FormModal({
  form,
  communes,
  loadingCommunes,
  saving,
  setForm,
  onClose,
  onSubmit,
}) {
  const updateField =
    (field) => (event) => {
      setForm((previous) => ({
        ...previous,
        [field]:
          event.target.value,
      }));
    };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5">

      {/* OVERLAY */}

      <div
        className="absolute inset-0 bg-black/40"
        onClick={
          saving ? undefined : onClose
        }
      />

      {/* FORMULAIRE */}

      <form
        onSubmit={onSubmit}
        className="relative bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto"
      >

        {/* HEADER */}

        <div
          className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10"
          style={{
            borderColor: C.border,
          }}
        >

          <h2 className="font-display text-lg font-semibold">
            {form.id
              ? "Modifier le bénéficiaire"
              : "Nouveau bénéficiaire"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>

        </div>

        {/* CHAMPS */}

        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* NUMÉRO CMU */}

          <Field label="N° CMU">

            <input
              required
              value={form.numeroCMU}
              onChange={updateField(
                "numeroCMU"
              )}
              placeholder="CMU-2026-00001"
              className={`${inputCls} font-mono`}
              style={{
                borderColor: C.border,
              }}
            />

          </Field>

          {/* PRÉNOM */}

          <Field label="Prénom">

            <input
              required
              value={form.prenom}
              onChange={updateField(
                "prenom"
              )}
              placeholder="Prénom"
              className={inputCls}
              style={{
                borderColor: C.border,
              }}
            />

          </Field>

          {/* NOM */}

          <Field label="Nom">

            <input
              required
              value={form.nom}
              onChange={updateField(
                "nom"
              )}
              placeholder="Nom"
              className={inputCls}
              style={{
                borderColor: C.border,
              }}
            />

          </Field>

          {/* SEXE */}

          <Field label="Sexe">

            <select
              value={form.sexe}
              onChange={updateField(
                "sexe"
              )}
              className={inputCls}
              style={{
                borderColor: C.border,
              }}
            >

              <option value="Femme">
                Femme
              </option>

              <option value="Homme">
                Homme
              </option>

            </select>

          </Field>

          {/* DATE NAISSANCE */}

          <Field label="Date de naissance">

            <input
              type="date"
              value={
                form.dateNaissance
              }
              onChange={updateField(
                "dateNaissance"
              )}
              className={inputCls}
              style={{
                borderColor: C.border,
              }}
            />

          </Field>

          {/* TÉLÉPHONE */}

          <Field label="Téléphone">

            <input
              type="tel"
              value={
                form.telephone
              }
              onChange={updateField(
                "telephone"
              )}
              placeholder="77 000 00 00"
              className={inputCls}
              style={{
                borderColor: C.border,
              }}
            />

          </Field>

          {/* RÉGION */}

          <Field label="Région">

            <input
              value={form.region}
              onChange={updateField(
                "region"
              )}
              placeholder="Thiès"
              className={inputCls}
              style={{
                borderColor: C.border,
              }}
            />

          </Field>

          {/* DÉPARTEMENT */}

          <Field label="Département">

            <input
              value={
                form.departement
              }
              onChange={updateField(
                "departement"
              )}
              placeholder="Thiès"
              className={inputCls}
              style={{
                borderColor: C.border,
              }}
            />

          </Field>

          {/* COMMUNE */}

          <Field
            label="Commune"
            span
          >

            <select
              value={form.commune}
              onChange={updateField(
                "commune"
              )}
              disabled={
                loadingCommunes
              }
              className={inputCls}
              style={{
                borderColor: C.border,
              }}
            >

              <option value="">
                {loadingCommunes
                  ? "Chargement des communes..."
                  : "Sélectionner une commune"}
              </option>

              {communes.map(
                (commune) => (
                  <option
                    key={
                      commune._id
                    }
                    value={
                      commune._id
                    }
                  >
                    {getCommuneName(
                      commune
                    )}
                  </option>
                )
              )}

            </select>

          </Field>

          {/* ADRESSE */}

          <Field
            label="Adresse"
            span
          >

            <textarea
              value={form.adresse}
              onChange={updateField(
                "adresse"
              )}
              placeholder="Adresse complète du bénéficiaire"
              rows={3}
              className={`${inputCls} resize-none`}
              style={{
                borderColor: C.border,
              }}
            />

          </Field>

        </div>

        {/* FOOTER */}

        <div
          className="flex items-center justify-end gap-2 px-6 py-4 border-t sticky bottom-0 bg-white"
          style={{
            borderColor: C.border,
          }}
        >

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
            style={{
              background:
                C.sandDark,
              color: C.ink,
            }}
          >
            Annuler
          </button>

          {/* 
             IMPORTANT :
             Pas de Loader2 ici.
             Cela évite le problème insertBefore
             observé dans la console.
          */}

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
            style={{
              background:
                C.primary,
            }}
          >
            {saving
              ? "Enregistrement..."
              : form.id
              ? "Enregistrer les modifications"
              : "Ajouter le bénéficiaire"}
          </button>

        </div>
      </form>
    </div>
  );
}

/* =========================================================
   MODAL CONFIRMATION
========================================================= */

function ConfirmModal({
  item,
  deleting,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-5">

      <div
        className="absolute inset-0 bg-black/40"
        onClick={
          deleting
            ? undefined
            : onCancel
        }
      />

      <div className="relative bg-white w-full max-w-sm rounded-2xl p-6">

        <div
          className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
          style={{
            background:
              C.redLight,
          }}
        >
          <AlertCircle
            size={18}
            style={{
              color: C.red,
            }}
          />
        </div>

        <h3 className="font-display text-lg font-semibold mb-1">
          Supprimer ce bénéficiaire ?
        </h3>

        <p
          className="text-sm mb-5"
          style={{
            color: C.inkSoft,
          }}
        >
          <strong>
            {item.prenom}{" "}
            {item.nom}
          </strong>{" "}
          ({item.numeroCMU})
          sera définitivement
          retiré de la base de
          données.
        </p>

        <div className="flex justify-end gap-2">

          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
            style={{
              background:
                C.sandDark,
              color: C.ink,
            }}
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
            style={{
              background: C.red,
            }}
          >

            {deleting && (
              <Loader2
                size={14}
                className="animate-spin"
              />
            )}

            {deleting
              ? "Suppression..."
              : "Supprimer"}

          </button>

        </div>
      </div>
    </div>
  );
}