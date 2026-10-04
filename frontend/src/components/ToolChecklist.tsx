import React, { useMemo, useState } from 'react';
import { Wrench, CheckCircle2, XCircle, Upload, Trash2, FileSpreadsheet, Plus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { ReportSubmissionPayload } from '../types/safety';

interface ChecklistItem {
  id: string;
  title: string;
  category: string;
  passed: boolean;
  notes: string;
}

interface UploadedDocument {
  name: string;
  size: string;
  type: 'PDF' | 'EXCEL' | 'IMAGE';
  dataUrl: string;
}

interface ToolChecklistProps {
  onSubmit: (payload: ReportSubmissionPayload) => Promise<void>;
}

export const ToolChecklist: React.FC<ToolChecklistProps> = ({ onSubmit }) => {
  const { language } = useLanguage();
  const [employeeName, setEmployeeName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [location, setLocation] = useState('');
  const [division, setDivision] = useState('');
  const [subdivision, setSubdivision] = useState('');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const addItem = () => {
    const title = newItemTitle.trim();
    if (!title) return;
    setItems((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title,
        category: newItemCategory.trim() || 'General',
        passed: true,
        notes: '',
      },
    ]);
    setNewItemTitle('');
    setNewItemCategory('');
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleItem = (id: string, passed: boolean) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, passed } : item));
  };

  const updateItemNotes = (id: string, notes: string) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, notes } : item));
  };

  const passedCount = useMemo(() => items.filter((item) => item.passed).length, [items]);
  const failCount = items.length - passedCount;
  const scorePercent = items.length ? Math.round((passedCount / items.length) * 100) : 0;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result !== 'string') return;
        let docType: 'PDF' | 'EXCEL' | 'IMAGE' = 'IMAGE';
        if (file.name.toLowerCase().endsWith('.pdf') || file.type.includes('pdf')) docType = 'PDF';
        else if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls') || file.type.includes('sheet') || file.type.includes('excel')) docType = 'EXCEL';
        setUploadedDocs((prev) => [...prev, { name: file.name, size: formatFileSize(file.size), type: docType, dataUrl: reader.result as string }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleSubmitChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      window.alert(language === 'hi' ? 'कृपया कम से कम एक चेकलिस्ट आइटम जोड़ें।' : 'Please add at least one checklist item.');
      return;
    }
    if (!employeeName.trim() || !employeeId.trim() || !location.trim() || !division.trim() || !subdivision.trim()) {
      window.alert(language === 'hi' ? 'कृपया सभी आवश्यक निरीक्षक विवरण भरें।' : 'Please fill all required inspector details.');
      return;
    }

    setSubmitting(true);
    const summaryText = items.map((item) =>
      `• [${item.passed ? 'PASS' : 'FAIL'}] ${item.title} | Category: ${item.category}${item.notes ? ` | Note: ${item.notes}` : ''}`
    ).join('\n');
    const docNames = uploadedDocs.map((doc) => `${doc.name} (${doc.type}, ${doc.size})`).join(', ');

    const payload: ReportSubmissionPayload = {
      type: 'TOOL',
      employeeName: employeeName.trim(),
      employeeId: employeeId.trim(),
      location: location.trim(),
      division: division.trim(),
      subdivision: subdivision.trim(),
      toolType: 'Manual Tool Safety Checklist',
      problemType: failCount > 0 ? 'Defective Tool Identified' : 'Routine Tool Inspection Passed',
      severity: failCount > 2 ? 'HIGH' : failCount > 0 ? 'MEDIUM' : 'LOW',
      description: `Manual Tool Safety Checklist Score: ${scorePercent}% (${passedCount}/${items.length} Passed).\n\nUploaded Files: ${docNames || 'None'}\n\nChecklist:\n${summaryText}`,
      immediateAction: failCount > 0 ? 'Failed items identified and removed from service.' : 'All listed items passed inspection.',
      evidenceImages: uploadedDocs.map((doc) => doc.dataUrl),
    };

    try {
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
            <Wrench className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">
              {language === 'hi' ? 'मैनुअल टूल सेफ्टी चेकलिस्ट' : 'Manual Tool Safety Checklist'}
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              {language === 'hi' ? 'कोई पूर्व-लिखित आइटम नहीं है। आवश्यक चेकलिस्ट आइटम स्वयं दर्ज करें और जरूरत अनुसार हटाएं।' : 'No predefined checklist items. Add your required items manually and delete them when needed.'}
            </p>
          </div>
        </div>
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-right shrink-0">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Inspection Score</span>
          <span className={`text-2xl font-black ${scorePercent === 100 && items.length > 0 ? 'text-emerald-400' : scorePercent >= 75 ? 'text-amber-400' : 'text-rose-500'}`}>
            {items.length ? `${scorePercent}% (${passedCount}/${items.length})` : '—'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmitChecklist} className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <h2 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-2">1. Inspector Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Worker Name *</label>
              <input required value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} placeholder="e.g. Divyanshu Sharma" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Employee ID *</label>
              <input required value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="e.g. EMP-9081" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Location / Substation *</label>
              <input required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Okhla 220kV Grid Yard" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Division *</label>
              <input required value={division} onChange={(e) => setDivision(e.target.value)} placeholder="e.g. Alaknanda" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Subdivision *</label>
              <input required value={subdivision} onChange={(e) => setSubdivision(e.target.value)} placeholder="e.g. GK-2" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2">
            <div>
              <h2 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider">2. Add Checklist Item</h2>
              <p className="text-[11px] text-slate-400 mt-1">Enter each tool/PPE safety check manually.</p>
            </div>
            <span className="text-[10px] font-bold text-slate-500">{items.length} item(s)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_auto] gap-3">
            <input value={newItemTitle} onChange={(e) => setNewItemTitle(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } }} placeholder="e.g. Discharge rod insulation condition" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white" />
            <input value={newItemCategory} onChange={(e) => setNewItemCategory(e.target.value)} placeholder="Category (optional)" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white" />
            <button type="button" onClick={addItem} className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          {items.length === 0 ? (
            <div className="border border-dashed border-slate-700 rounded-xl p-6 text-center text-sm text-slate-500">No checklist items added yet.</div>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[10px] text-amber-400 font-bold uppercase">Item {index + 1} • {item.category}</div>
                      <div className="text-sm text-white font-bold mt-1">{item.title}</div>
                    </div>
                    <button type="button" onClick={() => deleteItem(item.id)} className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg px-2.5 py-1.5" title="Delete checklist item">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => toggleItem(item.id, true)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${item.passed ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-900 text-slate-400 border-slate-700'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                    </button>
                    <button type="button" onClick={() => toggleItem(item.id, false)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${!item.passed ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-slate-900 text-slate-400 border-slate-700'}`}>
                      <XCircle className="w-3.5 h-3.5" /> FAIL
                    </button>
                  </div>
                  <textarea value={item.notes} onChange={(e) => updateItemNotes(item.id, e.target.value)} placeholder="Notes / observation (optional)" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white min-h-20" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider">3. Optional Checklist File Upload</h2>
            <FileSpreadsheet className="w-5 h-5 text-slate-500" />
          </div>
          <label className="border border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl p-6 text-center block cursor-pointer transition-colors">
            <Upload className="w-8 h-8 mx-auto text-amber-400 mb-2" />
            <span className="text-sm text-slate-300">Click or Drag & Drop PDF / Excel / Image</span>
            <input type="file" multiple accept=".pdf,.xlsx,.xls,image/*" onChange={handleFileUpload} className="hidden" />
          </label>
          {uploadedDocs.length > 0 && (
            <div className="space-y-2">
              {uploadedDocs.map((doc, index) => (
                <div key={`${doc.name}-${index}`} className="flex items-center justify-between gap-3 bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <div className="min-w-0"><p className="text-xs font-bold text-white truncate">{doc.name}</p><p className="text-[10px] text-slate-500">{doc.type} • {doc.size}</p></div>
                  <button type="button" onClick={() => setUploadedDocs((prev) => prev.filter((_, i) => i !== index))} className="text-rose-400 hover:text-rose-300"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={submitting || items.length === 0} className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black py-3.5 rounded-xl shadow-lg">
          {submitting ? 'Submitting Inspection Checklist...' : 'SUBMIT MANUAL TOOL CHECKLIST'}
        </button>
      </form>
    </div>
  );
};
