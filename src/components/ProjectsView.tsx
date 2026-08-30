import React, { useState } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Droplet, 
  Route, 
  HeartPulse, 
  Lightbulb, 
  GraduationCap, 
  Search, 
  Filter, 
  Wallet, 
  Users, 
  ArrowUpRight, 
  Sparkles,
  Calendar,
  Building
} from 'lucide-react';
import { District, InfrastructureCategory } from '../types';
import { COMPLETED_IMPACT_PROJECTS } from '../data/initialRequests';

interface ProjectsViewProps {
  districts: District[];
  onNavigateToImpact: (districtId: string, category: InfrastructureCategory) => void;
}

export interface CivicProject {
  id: string;
  title: string;
  district: string;
  state: string;
  category: InfrastructureCategory;
  budget_inr: number;
  status: 'Completed' | 'In Construction' | 'Planning & Budgeting';
  progress: number;
  startDate: string;
  targetDate: string;
  beneficiaries: number;
  beforeAccess: number;
  afterAccess: number;
  description: string;
}

const EXTENDED_PROJECTS: CivicProject[] = [
  {
    id: 'proj-01',
    title: 'Guntur Rural Piped Drinking Water & RO Hub Network',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    category: 'Water',
    budget_inr: 45000000,
    status: 'Completed',
    progress: 100,
    startDate: 'Q1 2024',
    targetDate: 'Q4 2024',
    beneficiaries: 184000,
    beforeAccess: 38,
    afterAccess: 88,
    description: 'Commissioned 14 solar-powered deep filtration RO hubs and 42km distribution feeder main lines across high-fluoride rural panchayats.'
  },
  {
    id: 'proj-02',
    title: 'Nanded Eastern Arterial All-Weather Road Surfacing',
    district: 'Nanded',
    state: 'Maharashtra',
    category: 'Roads',
    budget_inr: 82000000,
    status: 'Completed',
    progress: 100,
    startDate: 'Q2 2024',
    targetDate: 'Q1 2025',
    beneficiaries: 240000,
    beforeAccess: 42,
    afterAccess: 91,
    description: 'Reconstructed 68km of flood-prone black cotton soil agricultural corridors with reinforced bituminous paving and culvert drainage.'
  },
  {
    id: 'proj-03',
    title: 'Kurnool District Primary Health Sub-Center Electrification & Solar Backup',
    district: 'Kurnool',
    state: 'Andhra Pradesh',
    category: 'Health',
    budget_inr: 32000000,
    status: 'Completed',
    progress: 100,
    startDate: 'Q3 2024',
    targetDate: 'Q2 2025',
    beneficiaries: 145000,
    beforeAccess: 45,
    afterAccess: 84,
    description: 'Installed 5kVA rooftop micro-solar systems with battery storage across 28 remote maternal clinics and cold-chain vaccine depots.'
  },
  {
    id: 'proj-04',
    title: 'Nagpur Rural Smart LED Street Lighting & Safety Corridors',
    district: 'Nagpur',
    state: 'Maharashtra',
    category: 'Roads',
    budget_inr: 28000000,
    status: 'In Construction',
    progress: 68,
    startDate: 'Q4 2024',
    targetDate: 'Q3 2025',
    beneficiaries: 310000,
    beforeAccess: 52,
    afterAccess: 94,
    description: 'Installing 4,200 connected smart LED poles along rural transit highways, village entry roads, and bus stop junctions.'
  },
  {
    id: 'proj-05',
    title: 'Kadapa Groundwater Recharging & Check Dam Reconstruction',
    district: 'Kadapa',
    state: 'Andhra Pradesh',
    category: 'Water',
    budget_inr: 54000000,
    status: 'In Construction',
    progress: 45,
    startDate: 'Q1 2025',
    targetDate: 'Q4 2025',
    beneficiaries: 215000,
    beforeAccess: 35,
    afterAccess: 82,
    description: 'Building 18 series check dams and desilting 34 traditional percolation tanks in rain-shadow taluks.'
  },
  {
    id: 'proj-06',
    title: 'Solapur Comprehensive Tele-Health & Diagnostic Units',
    district: 'Solapur',
    state: 'Maharashtra',
    category: 'Health',
    budget_inr: 39000000,
    status: 'Planning & Budgeting',
    progress: 15,
    startDate: 'Q2 2025',
    targetDate: 'Q1 2026',
    beneficiaries: 190000,
    beforeAccess: 48,
    afterAccess: 86,
    description: 'Deploying 12 mobile tele-medicine vans equipped with AI diagnostic screening and remote specialist consultation links.'
  }
];

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  districts,
  onNavigateToImpact,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredProjects = EXTENDED_PROJECTS.filter((p) => {
    if (filterCategory !== 'All' && p.category !== filterCategory) return false;
    if (filterStatus !== 'All' && p.status !== filterStatus) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.district.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    }
    return true;
  });

  const totalCapex = EXTENDED_PROJECTS.reduce((acc, p) => acc + p.budget_inr, 0);
  const totalBeneficiaries = EXTENDED_PROJECTS.reduce((acc, p) => acc + p.beneficiaries, 0);
  const completedCount = EXTENDED_PROJECTS.filter(p => p.status === 'Completed').length;
  const inProgressCount = EXTENDED_PROJECTS.filter(p => p.status === 'In Construction').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded bg-blue-50 text-blue-700 border border-blue-200">
                PORTFOLIO MANAGEMENT
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Civic Infrastructure Projects
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Track capital projects directly triggered by citizen demand intelligence and deterministic deficit prioritization.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              {completedCount} Completed
            </span>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              {inProgressCount} In Construction
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500">Total Capital Outlay</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 mt-2">
            ₹{(totalCapex / 10000000).toFixed(1)} Cr
          </div>
          <p className="text-xs text-slate-500 mt-1">Direct budget allocated to prioritized hotspots</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500">Citizen Beneficiaries</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 mt-2">
            {(totalBeneficiaries / 100000).toFixed(1)} Lakh
          </div>
          <p className="text-xs text-slate-500 mt-1">Residents with improved daily access</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500">Avg. Access Surge</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 mt-2">
            +48.3%
          </div>
          <p className="text-xs text-slate-500 mt-1">Verified post-commissioning uplift</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by district, title, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {['All', 'Water', 'Roads', 'Health'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="In Construction">In Construction</option>
            <option value="Planning & Budgeting">Planning & Budgeting</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((proj) => (
          <div
            key={proj.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 flex flex-col justify-between hover:border-blue-300 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  {proj.category === 'Water' && <Droplet className="w-4 h-4 text-blue-600" />}
                  {proj.category === 'Roads' && <Route className="w-4 h-4 text-amber-600" />}
                  {proj.category === 'Health' && <HeartPulse className="w-4 h-4 text-rose-600" />}
                  {proj.district}, {proj.state}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  proj.status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : proj.status === 'In Construction'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {proj.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {proj.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                {proj.description}
              </p>

              {/* Progress Bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>Execution Progress</span>
                  <span>{proj.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      proj.progress === 100 ? 'bg-emerald-500' : proj.progress > 40 ? 'bg-blue-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${proj.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Metrics Footer */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-50 p-2.5 rounded-lg">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Capex:</span>
                  <span className="font-bold text-emerald-700">₹{(proj.budget_inr / 10000000).toFixed(1)} Cr</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Beneficiaries:</span>
                  <span className="font-bold text-slate-900">{(proj.beneficiaries / 1000).toFixed(0)}k people</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Timeline:</span>
                  <span className="font-medium text-slate-700">{proj.startDate} – {proj.targetDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Access Uplift:</span>
                  <span className="font-bold text-blue-700">{proj.beforeAccess}% → {proj.afterAccess}%</span>
                </div>
              </div>

              <button
                onClick={() => {
                  const dist = districts.find(d => d.name.toLowerCase() === proj.district.toLowerCase()) || districts[0];
                  onNavigateToImpact(dist.id, proj.category);
                }}
                className="w-full py-2 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Simulate ROI & Verify</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
