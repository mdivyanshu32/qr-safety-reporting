import React, { useState, useEffect } from 'react';
import type { ReportDetailsResponse, DashboardStats, ReportStatus, ReportSubmissionPayload } from '../../types/safety';
import { SubstationQrGenerator } from './SubstationQrGenerator';
import { ToolChecklist } from '../ToolChecklist';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ShieldAlert, Search, Eye, X, ClipboardCheck, Mail, CheckCircle } from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
  adminToken: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, adminToken }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'checklist' | 'settings' | 'qr'>('overview');
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [reports, setReports] = useState<ReportDetailsResponse[]>([]);
  const adminHeaders = { 'X-Admin-Token': adminToken };
  const [defaultEmail, setDefaultEmail] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailSavedSuccess, setEmailSavedSuccess] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Selected Detail Modal
  const [selectedReportItem, setSelectedReportItem] = useState<ReportDetailsResponse | null>(null);
  
  // Action Form State
  const [actionStatus, setActionStatus] = useState<ReportStatus>('NEW');
  const [rootCause, setRootCause] = useState<string>('');
  const [correctiveAction, setCorrectiveAction] = useState<string>('');
  const [preventiveAction, setPreventiveAction] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [savingAction, setSavingAction] = useState<boolean>(false);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, reportsRes, emailRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/stats`, { headers: adminHeaders }),
        fetch(`${API_BASE}/api/admin/reports`, { headers: adminHeaders }),
        fetch(`${API_BASE}/api/admin/settings/email`, { headers: adminHeaders }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData);
      }
      if (emailRes.ok) {
        const emailData = await emailRes.text();
        setDefaultEmail(emailData.trim());
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSaveDefaultEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEmail(true);
    setEmailSavedSuccess(false);
    try {
      const res = await fetch(`${API_BASE}/api/admin/settings/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain', ...adminHeaders },
        body: defaultEmail,
      });
      if (!res.ok) throw new Error(`Failed to save notification emails (HTTP ${res.status})`);
      setDefaultEmail((await res.text()).trim());
      setEmailSavedSuccess(true);
      window.setTimeout(() => setEmailSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save default email:', err);
      window.alert(err instanceof Error ? err.message : 'Unable to save notification emails.');
    } finally {
      setSavingEmail(false);
    }
  };

  const handleOpenReportModal = (item: ReportDetailsResponse) => {
    setSelectedReportItem(item);
    setActionStatus(item.report.status || 'NEW');
    setRootCause(item.correctiveAction?.rootCause || '');
    setCorrectiveAction(item.correctiveAction?.correctiveAction || '');
    setPreventiveAction(item.correctiveAction?.preventiveAction || '');
    setRemarks(item.correctiveAction?.remarks || '');
  };

  const handleSaveAction = async () => {
    if (!selectedReportItem?.report.id) return;
    setSavingAction(true);

    try {
      const res = await fetch(`${API_BASE}/api/admin/reports/${selectedReportItem.report.id}/action`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...adminHeaders },
        body: JSON.stringify({
          status: actionStatus,
          rootCause,
          correctiveAction,
          preventiveAction,
          remarks,
          updatedBy: 'Admin Supervisor',
        }),
      });

      if (res.ok) {
        await fetchDashboardData();
        setSelectedReportItem(null);
      }
    } catch (err) {
      console.error('Failed to update corrective action:', err);
    } finally {
      setSavingAction(false);
    }
  };

  const handleChecklistSubmit = async (payload: ReportSubmissionPayload) => {
    try {
      const res = await fetch(`${API_BASE}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let message = `Checklist submission failed (HTTP ${res.status})`;
        try {
          const body = await res.json();
          if (body?.message) message = body.message;
        } catch {
          // Keep the HTTP error message when the response is not JSON.
        }
        throw new Error(message);
      }

      await fetchDashboardData();
      setActiveTab('overview');
      window.alert('Tool safety checklist submitted successfully.');
    } catch (err) {
      console.error('Checklist submission failed:', err);
      window.alert(err instanceof Error ? err.message : 'Unable to submit checklist.');
    }
  };

  // Filter Reports
  const filteredReports = reports.filter((item) => {
    const r = item.report;
    const matchesSearch =
      !searchQuery ||
      r.reportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.employeeName && r.employeeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.employeeId && r.employeeId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.location && r.location.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = !selectedType || r.type === selectedType;
    const matchesStatus = !selectedStatus || r.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const COLORS = ['#F59E0B', '#F97316', '#EF4444', '#06B6D4', '#10B981'];

  const categoryChartData = [
    { name: 'Near Miss', count: stats?.nearMissCount || 0 },
    { name: 'Incident', count: stats?.incidentCount || 0 },
    { name: 'Accident', count: stats?.accidentCount || 0 },
    { name: 'PPE Defect', count: stats?.ppeCount || 0 },
    { name: 'Tool Defect', count: stats?.toolCount || 0 },
  ];

  const divisionChartData = Object.entries(stats?.reportsByDivision || {}).map(([name, count]) => ({
    name,
    count,
  }));

  const subdivisionMap: Record<string, {
    division: string;
    subdivision: string;
    total: number;
    nearMiss: number;
    incident: number;
    accident: number;
    toolPpe: number;
    open: number;
    closed: number;
    penalty: number;
  }> = {};

  const riskWeight: Record<string, number> = {
    ACCIDENT: 25,
    INCIDENT: 12,
    NEAR_MISS: 6,
    TOOL: 4,
    PPE: 4,
  };
  const severityWeight: Record<string, number> = {
    CRITICAL: 1.5,
    HIGH: 1.25,
    MEDIUM: 1,
    LOW: 0.75,
  };
  const statusWeight: Record<string, number> = {
    CLOSED: 0.4,
    ACTION_TAKEN: 0.55,
    UNDER_REVIEW: 0.8,
    ACTION_REQUIRED: 1,
    NEW: 1,
  };

  reports.forEach(({ report: r }) => {
    const subdivision = (r.subdivision || 'Not Specified').trim() || 'Not Specified';
    const division = (r.division || 'Not Specified').trim() || 'Not Specified';
    const key = `${division}|||${subdivision}`;
    if (!subdivisionMap[key]) {
      subdivisionMap[key] = { division, subdivision, total: 0, nearMiss: 0, incident: 0, accident: 0, toolPpe: 0, open: 0, closed: 0, penalty: 0 };
    }
    const row = subdivisionMap[key];
    row.total += 1;
    if (r.type === 'NEAR_MISS') row.nearMiss += 1;
    else if (r.type === 'INCIDENT') row.incident += 1;
    else if (r.type === 'ACCIDENT') row.accident += 1;
    else if (r.type === 'TOOL' || r.type === 'PPE') row.toolPpe += 1;

    const status = r.status || 'NEW';
    if (status === 'CLOSED') row.closed += 1;
    else row.open += 1;

    const base = riskWeight[r.type] || 4;
    const severity = severityWeight[r.severity || 'MEDIUM'] || 1;
    const statusFactor = statusWeight[status] || 1;
    row.penalty += base * severity * statusFactor;
  });

  const subdivisionScorecards = Object.values(subdivisionMap)
    .map((row) => ({ ...row, score: Math.max(0, Math.round(100 - Math.min(100, row.penalty))) }))
    .sort((a, b) => a.score - b.score);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Admin Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">SAFETY ADMIN PORTAL (PASSWORD PROTECTED)</h1>
            <p className="text-xs text-slate-400">Live Safety Monitoring & Subdivision Scorecard</p>
          </div>
        </div>

        {/* Tab Buttons & Logout */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'overview' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'reports' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Reports ({filteredReports.length})
            </button>
            <button
              onClick={() => setActiveTab('checklist')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${
                activeTab === 'checklist' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              Tool Checklist
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${
                activeTab === 'settings' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              Email Setup
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'qr' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Substation QR
            </button>
          </div>

          <button
            onClick={onLogout}
            className="bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Total Reports</p>
          <p className="text-2xl font-black text-white mt-1">{stats?.totalReports || 0}</p>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-4 shadow-lg">
          <p className="text-[11px] font-bold text-amber-400 uppercase">Near Misses</p>
          <p className="text-2xl font-black text-amber-400 mt-1">{stats?.nearMissCount || 0}</p>
        </div>

        <div className="bg-slate-900 border border-orange-500/30 rounded-xl p-4 shadow-lg">
          <p className="text-[11px] font-bold text-orange-400 uppercase">Incidents</p>
          <p className="text-2xl font-black text-orange-400 mt-1">{stats?.incidentCount || 0}</p>
        </div>

        <div className="bg-slate-900 border border-rose-500/30 rounded-xl p-4 shadow-lg">
          <p className="text-[11px] font-bold text-rose-400 uppercase">Accidents / Injuries</p>
          <p className="text-2xl font-black text-rose-500 mt-1">{stats?.accidentCount || 0}</p>
        </div>

        <div className="bg-slate-900 border border-cyan-500/30 rounded-xl p-4 shadow-lg">
          <p className="text-[11px] font-bold text-cyan-400 uppercase">PPE & Tools</p>
          <p className="text-2xl font-black text-cyan-400 mt-1">{(stats?.ppeCount || 0) + (stats?.toolCount || 0)}</p>
        </div>

        <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-4 shadow-lg">
          <p className="text-[11px] font-bold text-emerald-400 uppercase">Closed / Resolved</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{stats?.closedReports || 0}</p>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'overview' && (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-extrabold text-white mb-4 uppercase tracking-wider">
              Safety Reports by Category
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {categoryChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-extrabold text-white mb-4 uppercase tracking-wider">
              Incidents & Hazards by Division
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={divisionChartData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                  <Bar dataKey="count" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Subdivision Safety Scorecard</h3>
              <p className="text-[11px] text-slate-400 mt-1">Indicative score based on reported event type, severity and closure status. Higher score is better.</p>
            </div>
            <span className="text-[10px] font-bold text-amber-400 border border-amber-500/30 bg-amber-500/10 px-2 py-1 rounded-lg">SUBDIVISION-WISE</span>
          </div>

          {subdivisionScorecards.length === 0 ? (
            <div className="text-sm text-slate-400 py-8 text-center border border-dashed border-slate-700 rounded-xl">No subdivision reports available yet.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-bold">
                  <tr>
                    <th className="p-3">Division</th>
                    <th className="p-3">Subdivision</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Near Miss</th>
                    <th className="p-3">Incident</th>
                    <th className="p-3">Accident</th>
                    <th className="p-3">Tool/PPE</th>
                    <th className="p-3">Open</th>
                    <th className="p-3">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {subdivisionScorecards.map((row) => (
                    <tr key={`${row.division}-${row.subdivision}`} className="hover:bg-slate-950/70">
                      <td className="p-3 text-slate-300">{row.division}</td>
                      <td className="p-3 font-bold text-white">{row.subdivision}</td>
                      <td className="p-3 font-bold text-white">{row.total}</td>
                      <td className="p-3 text-amber-300">{row.nearMiss}</td>
                      <td className="p-3 text-orange-300">{row.incident}</td>
                      <td className="p-3 text-rose-300">{row.accident}</td>
                      <td className="p-3 text-cyan-300">{row.toolPpe}</td>
                      <td className="p-3 text-amber-300">{row.open}</td>
                      <td className="p-3">
                        <span className={`inline-flex min-w-12 justify-center px-2 py-1 rounded-lg font-black ${
                          row.score >= 80 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          row.score >= 60 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {row.score}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </>
      )}

      {activeTab === 'settings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-3xl mx-auto space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Email Setup</h2>
              <p className="text-xs text-slate-400 mt-1">Configure the safety notification recipients used for new reports. This setting is available only to Admin.</p>
            </div>
          </div>
          <form onSubmit={handleSaveDefaultEmail} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-amber-400 mb-2">Notification Emails (comma / semicolon separated)</label>
              <textarea
                value={defaultEmail}
                onChange={(e) => setDefaultEmail(e.target.value)}
                placeholder="email1@company.com, email2@company.com"
                rows={4}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-2">Multiple recipients can be separated by commas, semicolons, or new lines. Public report forms do not show an email field.</p>
            </div>
            {emailSavedSuccess && (
              <div className="flex items-center gap-2 text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs font-bold">
                <CheckCircle className="w-4 h-4" /> Notification email settings saved successfully.
              </div>
            )}
            <button type="submit" disabled={savingEmail} className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black px-5 py-2.5 rounded-xl">
              <Mail className="w-4 h-4" />
              {savingEmail ? 'Saving...' : 'Save Notification Emails'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'checklist' && (
        <ToolChecklist onSubmit={handleChecklistSubmit} />
      )}

      {(activeTab === 'reports' || activeTab === 'overview') && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search ticket #, name, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:border-amber-500 focus:outline-none"
              >
                <option value="">All Categories</option>
                <option value="NEAR_MISS">Near Miss</option>
                <option value="INCIDENT">Incident</option>
                <option value="ACCIDENT">Accident</option>
                <option value="TOOL">Tool Defect</option>
                <option value="PPE">PPE Defect</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:border-amber-500 focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="NEW">NEW</option>
                <option value="UNDER_REVIEW">UNDER REVIEW</option>
                <option value="ACTION_REQUIRED">ACTION REQUIRED</option>
                <option value="ACTION_TAKEN">ACTION TAKEN</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3">Ticket ID</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Worker ID / Name</th>
                  <th className="p-3">Substation / Location</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {filteredReports.map((item) => {
                  const r = item.report;
                  return (
                    <tr key={r.id || r.reportNumber} className="hover:bg-slate-850 transition-colors">
                      <td className="p-3 font-mono font-bold text-amber-400">{r.reportNumber}</td>
                      <td className="p-3 font-semibold">{r.type}</td>
                      <td className="p-3">
                        <div className="font-bold text-white">{r.employeeName || 'Field Lineman'}</div>
                        <div className="text-[10px] text-slate-400">{r.employeeId || 'N/A'}</div>
                      </td>
                      <td className="p-3 max-w-xs truncate">
                        <div className="font-semibold text-white">{r.location}</div>
                        <div className="text-[10px] text-slate-400">{r.division}</div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          r.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          r.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {r.severity}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.status === 'CLOSED' ? 'bg-emerald-500/20 text-emerald-300' :
                          r.status === 'ACTION_TAKEN' ? 'bg-cyan-500/20 text-cyan-300' :
                          'bg-amber-500/20 text-amber-300'
                        }`}>
                          {r.status || 'NEW'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleOpenReportModal(item)}
                          className="bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold px-2.5 py-1 rounded-lg border border-amber-500/40 transition-all flex items-center gap-1 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'qr' && <SubstationQrGenerator />}

      {selectedReportItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 w-full max-w-3xl shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-amber-400 font-extrabold">{selectedReportItem.report.reportNumber}</span>
                <h3 className="text-xl font-black text-white">{selectedReportItem.report.type} Report Review</h3>
              </div>
              <button onClick={() => setSelectedReportItem(null)} className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-semibold block">Worker Information:</span>
                  <p className="text-white font-bold">{selectedReportItem.report.employeeName} ({selectedReportItem.report.employeeId})</p>
                  <p className="text-slate-300">Phone: {selectedReportItem.report.employeePhone || 'N/A'}</p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-semibold block">Substation Location & Date:</span>
                  <p className="text-white font-bold">{selectedReportItem.report.location} ({selectedReportItem.report.division})</p>
                  <p className="text-slate-300">{selectedReportItem.report.date} at {selectedReportItem.report.time}</p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-semibold block">Description:</span>
                  <p className="text-slate-200 leading-relaxed">{selectedReportItem.report.description}</p>
                </div>

                {selectedReportItem.idCardImage && (
                  <div>
                    <span className="text-slate-400 font-semibold block mb-1">ID Card Attachment:</span>
                    <img src={selectedReportItem.idCardImage} alt="ID Card" className="w-32 h-20 object-cover rounded-lg border border-slate-700" />
                  </div>
                )}

                {selectedReportItem.evidenceImages && selectedReportItem.evidenceImages.length > 0 && (
                  <div>
                    <span className="text-slate-400 font-semibold block mb-1">Evidence Gallery / Attachments ({selectedReportItem.evidenceImages.length}):</span>
                    <div className="flex gap-2 flex-wrap">
                      {selectedReportItem.evidenceImages.map((img, i) => (
                        <img key={i} src={img} alt={`Evidence ${i}`} className="w-20 h-20 object-cover rounded-lg border border-slate-700" />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Workflow Status & Action Taken
                </h4>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Lifecycle Status</label>
                  <select
                    value={actionStatus}
                    onChange={(e) => setActionStatus(e.target.value as ReportStatus)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
                  >
                    <option value="NEW">NEW</option>
                    <option value="UNDER_REVIEW">UNDER REVIEW</option>
                    <option value="ACTION_REQUIRED">ACTION REQUIRED</option>
                    <option value="ACTION_TAKEN">ACTION TAKEN</option>
                    <option value="CLOSED">CLOSED & RESOLVED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Root Cause Analysis</label>
                  <textarea
                    rows={2}
                    placeholder="Enter root cause..."
                    value={rootCause}
                    onChange={(e) => setRootCause(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Corrective Action Implemented</label>
                  <textarea
                    rows={2}
                    placeholder="Action taken to fix defect..."
                    value={correctiveAction}
                    onChange={(e) => setCorrectiveAction(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Preventive Action Plan</label>
                  <input
                    type="text"
                    placeholder="Long term preventive measure..."
                    value={preventiveAction}
                    onChange={(e) => setPreventiveAction(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <button
                  onClick={handleSaveAction}
                  disabled={savingAction}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl shadow mt-2"
                >
                  {savingAction ? 'Saving...' : 'Save & Update Ticket'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
