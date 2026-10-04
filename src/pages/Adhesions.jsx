import React, { useState, useEffect, useMemo } from "react";
import {
  Search, Plus, Pencil, Trash2, X, Wallet, CheckCircle2, Clock,
  AlertTriangle, FileText, Loader2, HeartPulse, CalendarDays
} from "lucide-react";

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

const TYPES_COTIS = ["Individuelle", "Familiale"];
const PERIODICITES = ["Mensuelle", "Trimestrielle", "Annuelle"];
const STATUTS_PAIEMENT = ["Payée", "En attente", "En retard"];
const STATUTS_ADHESION = ["Active", "En cours de validation", "Résiliée"];
const MUTUELLES = [
  "Mutuelle Jappoo Thiès", "Mutuelle Santé Rufisque", "Mutuelle Kaolack Solidarité",
  "Mutuelle Yeksi Dakar", "Mutuelle Ziguinchor Santé",
];

const STORAGE_KEY = "cmu:adhesions";

function uid() {
  return "a" + Math.random().toString(36).slice(2, 10);
}

function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d + "T00:00:00");
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtMontant(n) {
  const v = Number(n) || 0;
  return v.toLocaleString("fr-FR") + " FCFA";
}

function daysUntil(d) {
  if (!d) return null;
  const dt = new Date(d + "T00:00:00");
  if (isNaN(dt)) return null;
  return Math.ceil((dt.getTime() - Date.now()) / (24 * 3600 * 1000));
}

function paiementStyle(s) {
  if (s === "Payée") return { bg: C.primaryLight, fg: C.primaryDark, dot: C.primary, Icon: CheckCircle2 };
  if (s === "En attente") return { bg: C.goldLight, fg: C.goldDark, dot: C.gold, Icon: Clock };
  return { bg: C.redLight, fg: C.red, dot: C.red, Icon: AlertTriangle };
}

function adhesionStyle(s) {
  if (s === "Active") return { bg: C.primaryLight, fg: C.primaryDark };
  if (s === "En cours de validation") return { bg: C.goldLight, fg: C.goldDark };
  return { bg: C.redLight, fg: C.red };
}

function addPeriod(dateStr, periodicite) {
  const dt = new Date(dateStr + "T00:00:00");
  if (isNaN(dt)) return "";
  if (periodicite === "Mensuelle") dt.setMonth(dt.getMonth() + 1);
  else if (periodicite === "Trimestrielle") dt.setMonth(dt.getMonth() + 3);
  else dt.setFullYear(dt.getFullYear() + 1);
  return dt.toISOString().slice(0, 10);
}

const today = new Date().toISOString().slice(0, 10);

// Tableau initial vide : aucun nom pré-rempli par défaut
const seed = () => [];

const emptyForm = {
  id: null, numeroAdhesion: "", beneficiaire: "", numeroCarte: "",
  mutuelle: MUTUELLES[0], typeCotisation: "Individuelle", montant: "",
  periodicite: "Mensuelle", dateAdhesion: today, dateExpiration: "",
  statutPaiement: "En attente", statutAdhesion: "En cours de validation",
};

export default function App() {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [filterPaiement, setFilterPaiement] = useState("Tous");
  const [filterAdhesion, setFilterAdhesion] = useState("Tous");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = window.storage ? await window.storage.get(STORAGE_KEY, false) : null;
        const val = res && res.value ? JSON.parse(res.value) : seed();
        setItems(val);
      } catch {
        setItems(seed());
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        setSaving(true);
        if (window.storage) {
          await window.storage.set(STORAGE_KEY, JSON.stringify(items), false);
        }
      } catch {
        // ignore
      } finally {
        setSaving(false);
      }
    })();
  }, [items, loaded]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const stats = useMemo(() => {
    const total = items.length;
    const actives = items.filter((i) => i.statutAdhesion === "Active").length;
    const montantTotal = items
      .filter((i) => i.statutPaiement === "Payée")
      .reduce((sum, i) => sum + (Number(i.montant) || 0), 0);
    const enAttente = items.filter((i) => i.statutPaiement !== "Payée").length;
    return { total, actives, montantTotal, enAttente };
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((i) => (filterPaiement === "Tous" ? true : i.statutPaiement === filterPaiement))
      .filter((i) => (filterAdhesion === "Tous" ? true : i.statutAdhesion === filterAdhesion))
      .filter((i) => {
        if (!q) return true;
        return (
          i.beneficiaire.toLowerCase().includes(q) ||
          i.numeroAdhesion.toLowerCase().includes(q) ||
          i.numeroCarte.toLowerCase().includes(q) ||
          i.mutuelle.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (a.dateAdhesion < b.dateAdhesion ? 1 : -1));
  }, [items, query, filterPaiement, filterAdhesion]);

  function openNew() {
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(item) {
    setForm({ ...item });
    setModalOpen(true);
  }

  function save(e) {
    e.preventDefault();
    if (!form.beneficiaire.trim() || !form.numeroAdhesion.trim() || !form.montant) return;
    const payload = { ...form, dateExpiration: form.dateExpiration || addPeriod(form.dateAdhesion, form.periodicite) };
    if (form.id) {
      setItems((prev) => prev.map((i) => (i.id === form.id ? payload : i)));
      setToast({ kind: "ok", msg: "Adhésion mise à jour." });
    } else {
      setItems((prev) => [...prev, { ...payload, id: uid() }]);
      setToast({ kind: "ok", msg: "Adhésion enregistrée." });
    }
    setModalOpen(false);
  }

  function doDelete(id) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setConfirmDelete(null);
    setToast({ kind: "warn", msg: "Adhésion supprimée." });
  }

  const fontStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600;6..72,700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
    .font-display { font-family: 'Newsreader', serif; }
    .font-body { font-family: 'IBM Plex Sans', sans-serif; }
    .font-mono { font-family: 'IBM Plex Mono', monospace; }
    .stub {
      background-image: radial-gradient(circle at 0 16px, transparent 5px, ${C.sand} 5.5px);
      background-size: 100% 32px;
      background-repeat: repeat-y;
      background-position: left top;
    }
  `;

  return (
    <div className="font-body min-h-screen w-full" style={{ background: C.sand, color: C.ink }}>
      <style>{fontStyles}</style>

      {/* Header */}
      <header className="border-b" style={{ borderColor: C.border, background: C.primary }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: C.gold }}
            >
              <HeartPulse size={20} color={C.primaryDark} strokeWidth={2.4} />
            </div>
            <div>
              <p
                className="text-[11px] uppercase tracking-[0.22em] font-semibold"
                style={{ color: C.goldLight }}
              >
                Couverture Maladie Universelle
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-white leading-tight">
                Adhésions & cotisations
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-7">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
          <StatCard icon={FileText} label="Total adhésions" value={stats.total} />
          <StatCard icon={CheckCircle2} label="Adhésions actives" value={stats.actives} accent={C.primary} />
          <StatCard icon={Wallet} label="Cotisations perçues" value={fmtMontant(stats.montantTotal)} small />
          <StatCard icon={Clock} label="Paiements à régulariser" value={stats.enAttente} accent={C.gold} />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: C.inkSoft }}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par bénéficiaire, n° d'adhésion, mutuelle…"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none border"
              style={{ borderColor: C.border, background: "white" }}
            />
          </div>
          <select
            value={filterPaiement}
            onChange={(e) => setFilterPaiement(e.target.value)}
            className="px-3 py-2.5 rounded-lg text-sm border outline-none bg-white"
            style={{ borderColor: C.border }}
          >
            <option>Tous</option>
            {STATUTS_PAIEMENT.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            value={filterAdhesion}
            onChange={(e) => setFilterAdhesion(e.target.value)}
            className="px-3 py-2.5 rounded-lg text-sm border outline-none bg-white"
            style={{ borderColor: C.border }}
          >
            <option>Tous</option>
            {STATUTS_ADHESION.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={openNew}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white shrink-0 hover:opacity-90"
            style={{ background: C.primary }}
          >
            <Plus size={16} /> Nouvelle adhésion
          </button>
        </div>

        {!loaded ? (
          <div className="flex items-center justify-center py-24" style={{ color: C.inkSoft }}>
            <Loader2 size={18} className="animate-spin mr-2" /> Chargement des adhésions…
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState hasItems={items.length > 0} onNew={openNew} />
        ) : (
          <ul className="flex flex-col gap-3">
            {filtered.map((item) => (
              <AdhesionRow
                key={item.id}
                item={item}
                onEdit={() => openEdit(item)}
                onDelete={() => setConfirmDelete(item)}
              />
            ))}
          </ul>
        )}

        <p className="text-[11px] mt-6 text-center" style={{ color: C.inkSoft }}>
          {filtered.length} adhésion{filtered.length > 1 ? "s" : ""} affichée
          {filtered.length > 1 ? "s" : ""} sur {items.length}
          {saving ? " · enregistrement…" : ""}
        </p>
      </main>

      {modalOpen && (
        <FormModal form={form} setForm={setForm} onClose={() => setModalOpen(false)} onSubmit={save} />
      )}

      {confirmDelete && (
        <ConfirmModal
          item={confirmDelete}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => doDelete(confirmDelete.id)}
        />
      )}

      {toast && (
        <div
          className="fixed bottom-5 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-lg text-sm font-medium text-white shadow-lg z-50"
          style={{ background: toast.kind === "warn" ? C.red : C.primaryDark }}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent, small }) {
  return (
    <div className="rounded-xl px-4 py-3.5 border bg-white flex items-center gap-3" style={{ borderColor: C.border }}>
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: accent ? C.primaryLight : C.sandDark }}
      >
        <Icon size={16} style={{ color: accent || C.inkSoft }} />
      </div>
      <div className="min-w-0">
        <p
          className={`font-display font-semibold leading-none truncate ${small ? "text-base" : "text-xl"}`}
          style={{ color: C.ink }}
        >
          {value}
        </p>
        <p className="text-[11px] mt-1 truncate" style={{ color: C.inkSoft }}>
          {label}
        </p>
      </div>
    </div>
  );
}

function EmptyState({ hasItems, onNew }) {
  return (
    <div className="rounded-xl border border-dashed py-16 flex flex-col items-center text-center px-6" style={{ borderColor: C.border }}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: C.primaryLight }}>
        <FileText size={20} style={{ color: C.primary }} />
      </div>
      <p className="font-display text-lg font-semibold mb-1">
        {hasItems ? "Aucun résultat" : "Aucune adhésion enregistrée"}
      </p>
      <p className="text-sm mb-5" style={{ color: C.inkSoft }}>
        {hasItems
          ? "Ajustez la recherche ou les filtres pour voir d'autres adhésions."
          : "Enregistrez la première adhésion pour suivre les cotisations."}
      </p>
      <button onClick={onNew} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: C.primary }}>
        <Plus size={16} /> Ajouter une adhésion
      </button>
    </div>
  );
}

function AdhesionRow({ item, onEdit, onDelete }) {
  const p = paiementStyle(item.statutPaiement);
  const a = adhesionStyle(item.statutAdhesion);
  const dLeft = daysUntil(item.dateExpiration);
  const expSoon = dLeft !== null && dLeft <= 30 && dLeft >= 0;
  const expired = dLeft !== null && dLeft < 0;

  return (
    <li className="stub rounded-xl border bg-white overflow-hidden pl-5" style={{ borderColor: C.border }}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pl-1 pr-4 py-4">
        {/* left: identity */}
        <div className="sm:w-56 shrink-0">
          <p className="font-semibold text-sm truncate" style={{ color: C.ink }}>
            {item.beneficiaire}
          </p>
          <p className="font-mono text-[11px] truncate" style={{ color: C.inkSoft }}>
            {item.numeroAdhesion}
          </p>
          <p className="text-[11px] truncate mt-0.5" style={{ color: C.inkSoft }}>
            Carte {item.numeroCarte || "—"}
          </p>
        </div>

        {/* middle: details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 flex-1 text-xs">
          <Detail label="Mutuelle" value={item.mutuelle} />
          <Detail label="Cotisation" value={`${item.typeCotisation} · ${item.periodicite}`} />
          <Detail label="Montant" value={fmtMontant(item.montant)} />
          <Detail
            label="Échéance"
            value={fmtDate(item.dateExpiration)}
            warn={expired ? C.red : expSoon ? C.gold : null}
          />
        </div>

        {/* right: statuses + actions */}
        <div className="flex flex-col items-end gap-1.5 sm:w-48 shrink-0">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: p.bg, color: p.fg }}>
            <p.Icon size={11} /> {item.statutPaiement}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: a.bg, color: a.fg }}>
            {item.statutAdhesion}
          </span>
          <div className="flex items-center gap-1 mt-1">
            <button onClick={onEdit} className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-70" style={{ background: C.sandDark }} aria-label="Modifier">
              <Pencil size={14} style={{ color: C.ink }} />
            </button>
            <button onClick={onDelete} className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-70" style={{ background: C.redLight }} aria-label="Supprimer">
              <Trash2 size={14} style={{ color: C.red }} />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

function Detail({ label, value, warn }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wide" style={{ color: C.inkSoft }}>
        {label}
      </p>
      <p className="truncate font-medium flex items-center gap-1" style={{ color: warn || C.ink }}>
        {warn && <CalendarDays size={11} />} {value}
      </p>
    </div>
  );
}

function Field({ label, children, span }) {
  return (
    <label className={`flex flex-col gap-1 text-xs ${span ? "sm:col-span-2" : ""}`}>
      <span className="font-semibold uppercase tracking-wide text-[10px]" style={{ color: C.inkSoft }}>
        {label}
      </span>
      {children}
    </label>
  );
}

const inputCls = "px-3 py-2 rounded-lg border text-sm outline-none bg-white";

function FormModal({ form, setForm, onClose, onSubmit }) {
  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Fermer le modal avec la touche Échap
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form onSubmit={onSubmit} className="relative bg-white w-full sm:max-w-xl sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10" style={{ borderColor: C.border }}>
          <h2 className="font-display text-lg font-semibold">
            {form.id ? "Modifier l'adhésion" : "Nouvelle adhésion"}
          </h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Bénéficiaire">
            <input required value={form.beneficiaire} onChange={upd("beneficiaire")} placeholder="Nom et prénom" className={inputCls} style={{ borderColor: C.border }} />
          </Field>
          <Field label="N° de carte CMU">
            <input value={form.numeroCarte} onChange={upd("numeroCarte")} placeholder="CMU-2026-00000" className={inputCls + " font-mono"} style={{ borderColor: C.border }} />
          </Field>
          <Field label="N° d'adhésion">
            <input required value={form.numeroAdhesion} onChange={upd("numeroAdhesion")} placeholder="ADH-2026-00000" className={inputCls + " font-mono"} style={{ borderColor: C.border }} />
          </Field>
          <Field label="Mutuelle de santé">
            <select value={form.mutuelle} onChange={upd("mutuelle")} className={inputCls} style={{ borderColor: C.border }}>
              {MUTUELLES.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </Field>
          <Field label="Type de cotisation">
            <select value={form.typeCotisation} onChange={upd("typeCotisation")} className={inputCls} style={{ borderColor: C.border }}>
              {TYPES_COTIS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Périodicité">
            <select value={form.periodicite} onChange={upd("periodicite")} className={inputCls} style={{ borderColor: C.border }}>
              {PERIODICITES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>
          <Field label="Montant (FCFA)">
            <input required type="number" min="0" value={form.montant} onChange={upd("montant")} placeholder="3500" className={inputCls} style={{ borderColor: C.border }} />
          </Field>
          <Field label="Statut de paiement">
            <select value={form.statutPaiement} onChange={upd("statutPaiement")} className={inputCls} style={{ borderColor: C.border }}>
              {STATUTS_PAIEMENT.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Date d'adhésion">
            <input type="date" value={form.dateAdhesion} onChange={upd("dateAdhesion")} className={inputCls} style={{ borderColor: C.border }} />
          </Field>
          <Field label="Date d'échéance">
            <input type="date" value={form.dateExpiration} onChange={upd("dateExpiration")} placeholder="Calculée automatiquement si vide" className={inputCls} style={{ borderColor: C.border }} />
          </Field>
          <Field label="Statut de l'adhésion" span>
            <select value={form.statutAdhesion} onChange={upd("statutAdhesion")} className={inputCls} style={{ borderColor: C.border }}>
              {STATUTS_ADHESION.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t sticky bottom-0 bg-white" style={{ borderColor: C.border }}>
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: C.sandDark, color: C.ink }}>
            Annuler
          </button>
          <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: C.primary }}>
            {form.id ? "Enregistrer les modifications" : "Enregistrer l'adhésion"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ConfirmModal({ item, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white w-full max-w-sm rounded-2xl p-6">
        <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ background: C.redLight }}>
          <AlertTriangle size={18} style={{ color: C.red }} />
        </div>
        <h3 className="font-display text-lg font-semibold mb-1">Supprimer cette adhésion ?</h3>
        <p className="text-sm mb-5" style={{ color: C.inkSoft }}>
          L'adhésion {item.numeroAdhesion} de {item.beneficiaire} sera définitivement retirée. Cette action est irréversible.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: C.sandDark, color: C.ink }}>
            Annuler
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: C.red }}>
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}