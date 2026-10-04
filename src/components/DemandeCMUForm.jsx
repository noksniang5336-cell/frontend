import React, { useState } from "react";
import { User, Users, ChevronRight, Plus } from "lucide-react";

const STEPS = [
  { id: 1, label: "Assuré(e)" },
  { id: 2, label: "Situation" },
  { id: 3, label: "Foyer" },
  { id: 4, label: "Adresse" },
  { id: 5, label: "Ressources" },
];

function Stepper({ currentStep }) {
  return (
    <div className="mb-10 flex items-center border-b border-slate-200 pb-4">
      {STEPS.map((step, i) => {
        const isActive = step.id === currentStep;
        const isDone = step.id < currentStep;

        return (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  isActive || isDone
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-300 text-white"
                }`}
              >
                {step.id}
              </span>

              <span
                className={`text-sm font-semibold ${
                  isActive
                    ? "text-slate-900"
                    : isDone
                    ? "text-slate-700"
                    : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <ChevronRight className="mx-3 h-4 w-4 shrink-0 text-slate-300" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function SelectCard({ selected, icons, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border px-4 py-6 text-center transition-colors ${
        selected
          ? "border-sky-400 bg-sky-50"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <span className="flex items-center gap-1 text-slate-800">
        {icons}
      </span>

      <span className="text-base font-bold text-slate-900">
        {label}
      </span>
    </button>
  );
}

function RadioOption({
  name,
  value,
  label,
  checked,
  onChange,
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm ${
        checked
          ? "border-sky-400 bg-sky-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-sky-500"
      />

      <span className="text-slate-700">{label}</span>
    </label>
  );
}

const ORDINALS = [
  "Premier",
  "Deuxième",
  "Troisième",
  "Quatrième",
  "Cinquième",
  "Sixième",
];

export default function DemandeCMUForm({
  onSubmitStep = () => {},
  loading = false,
}) {
  const [situation, setSituation] = useState("vous");

  // Informations bénéficiaire
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [numeroCMU, setNumeroCMU] = useState("");
  const [sexe, setSexe] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [region, setRegion] = useState("");
  const [departement, setDepartement] = useState("");

  // Enfants
  const [nbEnfants, setNbEnfants] = useState(0);
  const [enfants, setEnfants] = useState([]);

  function updateNbEnfants(n) {
    setNbEnfants(n);

    setEnfants((prev) => {
      const next = [...prev];

      if (n > next.length) {
        while (next.length < n) {
          next.push({
            prenom: "",
            lien: "",
          });
        }
      } else {
        next.length = n;
      }

      return next;
    });
  }

  function addPersonne() {
    updateNbEnfants(nbEnfants + 1);
  }

  function updateEnfant(index, field, value) {
    setEnfants((prev) => {
      const next = [...prev];

      next[index] = {
        ...next[index],
        [field]: value,
      };

      return next;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    const data = {
      numeroCMU: numeroCMU.trim() || undefined,
      prenom: prenom.trim(),
      nom: nom.trim(),
      sexe: sexe || undefined,
      dateNaissance: dateNaissance || undefined,
      telephone: telephone.trim(),
      adresse: adresse.trim(),
      region: region.trim(),
      departement: departement.trim(),

      situation,

      enfants,
    };

    console.log("📤 Données du formulaire :", data);

    onSubmitStep(data);
  }

  const isFormValid =
    prenom.trim() !== "" &&
    nom.trim() !== "";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Stepper currentStep={1} />

      <div className="mb-8 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          DOSSIER DE DEMANDE DE CMU-C EN LIGNE
        </h1>

        <p className="mt-2 text-lg text-slate-500">
          Complémentaire santé solidaire
        </p>

        <p className="mx-auto mt-4 max-w-xl text-slate-600">
          Complétez les informations du bénéficiaire afin de créer son
          dossier CMU.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ============================= */}
        {/* ASSURÉ */}
        {/* ============================= */}

        <fieldset>
          <legend className="mb-4 text-base font-bold text-slate-900">
            Pour qui demandez-vous la CMU ?
          </legend>

          <div className="flex gap-4">
            <SelectCard
              selected={situation === "vous"}
              onClick={() => setSituation("vous")}
              icons={
                <User
                  className="h-9 w-9"
                  strokeWidth={1.5}
                />
              }
              label="Vous"
            />

            <SelectCard
              selected={situation === "couple"}
              onClick={() => setSituation("couple")}
              icons={
                <span className="flex">
                  <User
                    className="h-9 w-9"
                    strokeWidth={1.5}
                  />
                  <User
                    className="-ml-2 h-9 w-9"
                    strokeWidth={1.5}
                  />
                </span>
              }
              label="Vous et votre conjoint(e)"
            />
          </div>
        </fieldset>

        {/* ============================= */}
        {/* IDENTITÉ */}
        {/* ============================= */}

        <fieldset className="rounded-xl border border-slate-200 bg-white p-6">
          <legend className="mb-5 text-lg font-bold text-slate-900">
            Informations personnelles
          </legend>

          <div className="grid gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Prénom *
              </label>

              <input
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder="Prénom"
                required
                className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Nom *
              </label>

              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Nom"
                required
                className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Numéro CMU
              </label>

              <input
                type="text"
                value={numeroCMU}
                onChange={(e) => setNumeroCMU(e.target.value)}
                placeholder="Ex : CMU-00001"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Sexe
              </label>

              <select
                value={sexe}
                onChange={(e) => setSexe(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-sky-400"
              >
                <option value="">Sélectionner</option>
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Date de naissance
              </label>

              <input
                type="date"
                value={dateNaissance}
                onChange={(e) =>
                  setDateNaissance(e.target.value)
                }
                className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Téléphone
              </label>

              <input
                type="tel"
                value={telephone}
                onChange={(e) =>
                  setTelephone(e.target.value)
                }
                placeholder="77 123 45 67"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-sky-400"
              />
            </div>
          </div>
        </fieldset>

        {/* ============================= */}
        {/* ADRESSE */}
        {/* ============================= */}

        <fieldset className="rounded-xl border border-slate-200 bg-white p-6">
          <legend className="mb-5 text-lg font-bold text-slate-900">
            Adresse
          </legend>

          <div className="space-y-5">

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Adresse
              </label>

              <input
                type="text"
                value={adresse}
                onChange={(e) =>
                  setAdresse(e.target.value)
                }
                placeholder="Adresse du bénéficiaire"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-sky-400"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Région
                </label>

                <input
                  type="text"
                  value={region}
                  onChange={(e) =>
                    setRegion(e.target.value)
                  }
                  placeholder="Ex : Thiès"
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Département
                </label>

                <input
                  type="text"
                  value={departement}
                  onChange={(e) =>
                    setDepartement(e.target.value)
                  }
                  placeholder="Ex : Thiès"
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-sky-400"
                />
              </div>

            </div>
          </div>
        </fieldset>

        {/* ============================= */}
        {/* ENFANTS */}
        {/* ============================= */}

        <fieldset>
          <legend className="mb-3 text-base font-bold text-slate-900">
            Enfant(s) ou personne(s) à charge
          </legend>

          <div className="flex gap-4">
            <SelectCard
              selected={nbEnfants === 0}
              onClick={() => updateNbEnfants(0)}
              icons={<span className="h-9" />}
              label="Aucun(e)"
            />

            <SelectCard
              selected={nbEnfants === 1}
              onClick={() => updateNbEnfants(1)}
              icons={
                <User
                  className="h-9 w-9"
                  strokeWidth={1.5}
                />
              }
              label="1"
            />

            <SelectCard
              selected={nbEnfants === 2}
              onClick={() => updateNbEnfants(2)}
              icons={
                <span className="flex">
                  <User
                    className="h-9 w-9"
                    strokeWidth={1.5}
                  />

                  <User
                    className="-ml-2 h-9 w-9"
                    strokeWidth={1.5}
                  />
                </span>
              }
              label="2"
            />
          </div>

          {nbEnfants > 0 && (
            <button
              type="button"
              onClick={addPersonne}
              className="mt-3 flex items-center gap-1 text-sm font-semibold text-sky-600 hover:text-sky-700"
            >
              <Plus className="h-4 w-4" />
              Ajouter une personne
            </button>
          )}

          {enfants.length > 0 && (
            <div className="mt-5 space-y-6 border-l-2 border-slate-200 pl-5">
              {enfants.map((enfant, index) => (
                <div
                  key={index}
                  className="space-y-3"
                >
                  <p className="font-bold text-slate-900">
                    {ORDINALS[index] ||
                      `${index + 1}e`}{" "}
                    enfant ou personne à charge
                  </p>

                  <input
                    type="text"
                    value={enfant.prenom}
                    onChange={(e) =>
                      updateEnfant(
                        index,
                        "prenom",
                        e.target.value
                      )
                    }
                    placeholder="Son prénom"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-400"
                  />

                  <div className="space-y-2">
                    <RadioOption
                      name={`lien-${index}`}
                      value="Enfant"
                      label="Enfant"
                      checked={
                        enfant.lien === "Enfant"
                      }
                      onChange={() =>
                        updateEnfant(
                          index,
                          "lien",
                          "Enfant"
                        )
                      }
                    />

                    <RadioOption
                      name={`lien-${index}`}
                      value="Autre"
                      label="Autre"
                      checked={
                        enfant.lien === "Autre"
                      }
                      onChange={() =>
                        updateEnfant(
                          index,
                          "lien",
                          "Autre"
                        )
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </fieldset>

        {/* ============================= */}
        {/* BOUTON */}
        {/* ============================= */}

        <button
          type="submit"
          disabled={!isFormValid || loading}
          className="w-full rounded-lg bg-emerald-700 py-4 text-base font-bold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-700/40"
        >
          {loading
            ? "Enregistrement en cours..."
            : "Enregistrer le bénéficiaire"}
        </button>
      </form>
    </div>
  );
}