import React, { useState } from 'react';
import { 
  Stethoscope, Search, Filter, Plus, Calendar, 
  CheckCircle2, Clock, XCircle, ArrowUpRight, Download 
} from 'lucide-react';

export default function Prestations() {
  const [searchTerm, setSearchTerm] = useState('');

  // Données factices des prestations
  const prestations = [
    {
      id: "PREST-2025-001",
      beneficiaire: "Mamadou Diallo",
      matricule: "CMU-8842-A",
      structure: "CHNO de Thiès",
      acte: "Consultation Généraliste + Bilan",
      montantTotal: "15 000 FCFA",
      partCMU: "12 000 FCFA",
      date: "01/09/2025",
      statut: "Validé"
    },
    {
      id: "PREST-2025-002",
      beneficiaire: "Aïssatou Sow",
      matricule: "CMU-5921-B",
      structure: "Pharmacie du Nord",
      acte: "Achat Médicaments (Ordonnance)",
      montantTotal: "8 500 FCFA",
      partCMU: "6 800 FCFA",
      date: "01/09/2025",
      statut: "En attente"
    },
    {
      id: "PREST-2025-003",
      beneficiaire: "Ibrahima Ndiaye",
      matricule: "CMU-3104-C",
      structure: "Centre de Santé Dixième",
      acte: "Soins Dentaires",
      montantTotal: "25 000 FCFA",
      partCMU: "20 000 FCFA",
      date: "31/08/2025",
      statut: "Validé"
    },
    {
      id: "PREST-2025-004",
      beneficiaire: "Fatou Bintou Fall",
      matricule: "CMU-7412-D",
      structure: "Clinique Parcelles",
      acte: "Analyse Laboratoire",
      montantTotal: "18 000 FCFA",
      partCMU: "0 FCFA",
      date: "30/08/2025",
      statut: "Rejeté"
    }
  ];

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            Gestion des Prestations 🩺
          </h1>
          <p className="text-xs text-slate-500">
            Suivi des prises en charge médicales et remboursables de la CMU
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-50 transition shadow-sm">
            <Download size={16} /> Exporter
          </button>
          <button className="flex items-center gap-2 bg-[#0d5c3a] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow hover:bg-emerald-900 transition">
            <Plus size={16} /> Nouvelle prestation
          </button>
        </div>
      </div>

      {/* CARTES RÉSUMÉES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          icon={<Stethoscope className="text-emerald-600" size={18} />} 
          label="Total Prestations" 
          value="148" 
          trend="+12% ce mois" 
        />
        <StatCard 
          icon={<CheckCircle2 className="text-emerald-600" size={18} />} 
          label="Prises en charge validées" 
          value="124" 
          trend="83.7% du total" 
        />
        <StatCard 
          icon={<Clock className="text-amber-600" size={18} />} 
          label="En cours de validation" 
          value="18" 
          trend="À traiter" 
        />
        <StatCard 
          icon={<XCircle className="text-rose-600" size={18} />} 
          label="Dossiers rejetés" 
          value="6" 
          trend="Dossiers non conformes" 
        />
      </div>

      {/* SECTION TABLEAU & FILTRES */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
        
        {/* Barre de recherche et filtres */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Rechercher par bénéficiaire, matricule, structure..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">
              <Filter size={14} /> Filtres
            </button>
            <select className="bg-slate-50 border border-slate-200 text-xs text-slate-600 rounded-xl px-3 py-2 outline-none">
              <option>Tous les statuts</option>
              <option>Validé</option>
              <option>En attente</option>
              <option>Rejeté</option>
            </select>
          </div>
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Réf / Date</th>
                <th className="py-3 px-4">Bénéficiaire</th>
                <th className="py-3 px-4">Structure de santé</th>
                <th className="py-3 px-4">Acte médical</th>
                <th className="py-3 px-4">Montant CMU</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs">
              {prestations.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-800">{item.id}</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar size={10} /> {item.date}
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-slate-700">{item.beneficiaire}</p>
                    <p className="text-[10px] text-slate-400">{item.matricule}</p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {item.structure}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {item.acte}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-800">{item.partCMU}</p>
                    <p className="text-[10px] text-slate-400">sur {item.montantTotal}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={item.statut} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="p-1.5 hover:bg-emerald-50 text-emerald-700 rounded-lg transition">
                      <ArrowUpRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

/* HELPER COMPONENTS */

function StatCard({ icon, label, value, trend }) {
  return (
    <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
      <div className="p-2 bg-emerald-50 w-fit rounded-xl mb-2">{icon}</div>
      <p className="text-[11px] text-slate-500 font-medium">{label}</p>
      <p className="text-xl font-bold text-slate-800 my-1">{value}</p>
      <p className="text-[10px] font-semibold text-emerald-600">{trend}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    "Validé": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "En attente": "bg-amber-50 text-amber-700 border-amber-200",
    "Rejeté": "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <span className={`px-2.5 py-1 rounded-full border text-[10px] font-semibold inline-block ${styles[status] || 'bg-slate-50 text-slate-600'}`}>
      {status}
    </span>
  );
}

