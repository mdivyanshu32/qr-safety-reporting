import { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { ReportCardSelector } from './components/ReportCardSelector';
import { ToolReportForm } from './components/forms/ToolReportForm';
import { PpeReportForm } from './components/forms/PpeReportForm';
import { NearMissReportForm } from './components/forms/NearMissReportForm';
import { IncidentReportForm } from './components/forms/IncidentReportForm';
import { AccidentReportForm } from './components/forms/AccidentReportForm';
import { VoiceAssistant } from './components/voice/VoiceAssistant';
import { EmergencyDirectory } from './components/EmergencyDirectory';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SuccessTicket } from './components/SuccessTicket';
import type { ReportType, ReportSubmissionPayload, ReportDetailsResponse } from './types/safety';

type ActiveView = 
  | 'HOME'
  | 'VOICE'
  | 'EMERGENCY'
  | 'FORM_TOOL'
  | 'FORM_PPE'
  | 'FORM_NEAR_MISS'
  | 'FORM_INCIDENT'
  | 'FORM_ACCIDENT'
  | 'ADMIN'
  | 'SUCCESS';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export function AppContent() {
  const [currentView, setCurrentView] = useState<ActiveView>('HOME');
  const [qrLocation, setQrLocation] = useState<string>('');
  const [qrDivision, setQrDivision] = useState<string>('');
  
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  const [submittedResponse, setSubmittedResponse] = useState<ReportDetailsResponse | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const loc = params.get('location');
    const div = params.get('division');
    if (loc) setQrLocation(decodeURIComponent(loc));
    if (div) setQrDivision(decodeURIComponent(div));
  }, []);

  const handleSelectType = (type: ReportType) => {
    switch (type) {
      case 'TOOL': setCurrentView('FORM_TOOL'); break;
      case 'PPE': setCurrentView('FORM_PPE'); break;
      case 'NEAR_MISS': setCurrentView('FORM_NEAR_MISS'); break;
      case 'INCIDENT': setCurrentView('FORM_INCIDENT'); break;
      case 'ACCIDENT': setCurrentView('FORM_ACCIDENT'); break;
    }
  };

  const handleSubmitReport = async (payload: ReportSubmissionPayload) => {
    try {
      const res = await fetch(`${API_BASE}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let message = `Report submission failed (HTTP ${res.status})`;
        try {
          const body = await res.json();
          if (body?.message) message = body.message;
        } catch {
          // Response was not JSON; keep the HTTP error message.
        }
        throw new Error(message);
      }

      const responseData: ReportDetailsResponse = await res.json();
      setSubmittedResponse(responseData);
      setCurrentView('SUCCESS');
    } catch (err) {
      console.error('Report submission failed:', err);
      const message = err instanceof Error ? err.message : 'Unable to connect to the safety backend.';
      window.alert(`Report could not be submitted.\n\n${message}\n\nPlease check the backend URL and try again.`);
    }
  };

  const handleAdminClick = () => {
    if (adminToken) {
      setCurrentView('ADMIN');
    } else {
      setShowAdminLogin(true);
    }
  };

  const handleAdminLoginSuccess = (token: string) => {
    setAdminToken(token);
    setShowAdminLogin(false);
    setCurrentView('ADMIN');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar
        currentLocation={qrLocation}
        currentDivision={qrDivision}
        onAdminClick={handleAdminClick}
        onHomeClick={() => setCurrentView('HOME')}
        onEmergencyClick={() => setCurrentView('EMERGENCY')}
      />

      <main className="flex-1 relative">
        {currentView === 'HOME' && (
          <ReportCardSelector
            onSelectType={handleSelectType}
            onVoiceStart={() => setCurrentView('VOICE')}
            onEmergencyClick={() => setCurrentView('EMERGENCY')}
          />
        )}

        {currentView === 'EMERGENCY' && <EmergencyDirectory adminToken={adminToken} />}

        {currentView === 'VOICE' && (
          <VoiceAssistant
            initialLocation={qrLocation}
            initialDivision={qrDivision}
            onSubmit={handleSubmitReport}
            onCancel={() => setCurrentView('HOME')}
            onEditInForm={(partial) => {
              if (partial.type === 'TOOL') setCurrentView('FORM_TOOL');
              else if (partial.type === 'PPE') setCurrentView('FORM_PPE');
              else if (partial.type === 'ACCIDENT') setCurrentView('FORM_ACCIDENT');
              else setCurrentView('FORM_NEAR_MISS');
            }}
          />
        )}

        {currentView === 'FORM_TOOL' && (
          <ToolReportForm
            initialLocation={qrLocation}
            initialDivision={qrDivision}
            onSubmit={handleSubmitReport}
            onCancel={() => setCurrentView('HOME')}
          />
        )}

        {currentView === 'FORM_PPE' && (
          <PpeReportForm
            initialLocation={qrLocation}
            initialDivision={qrDivision}
            onSubmit={handleSubmitReport}
            onCancel={() => setCurrentView('HOME')}
          />
        )}

        {currentView === 'FORM_NEAR_MISS' && (
          <NearMissReportForm
            initialLocation={qrLocation}
            initialDivision={qrDivision}
            onSubmit={handleSubmitReport}
            onCancel={() => setCurrentView('HOME')}
          />
        )}

        {currentView === 'FORM_INCIDENT' && (
          <IncidentReportForm
            initialLocation={qrLocation}
            initialDivision={qrDivision}
            onSubmit={handleSubmitReport}
            onCancel={() => setCurrentView('HOME')}
          />
        )}

        {currentView === 'FORM_ACCIDENT' && (
          <AccidentReportForm
            initialLocation={qrLocation}
            initialDivision={qrDivision}
            onSubmit={handleSubmitReport}
            onCancel={() => setCurrentView('HOME')}
          />
        )}

        {currentView === 'ADMIN' && (
          <AdminDashboard
            adminToken={adminToken || ''}
            onLogout={() => {
              setAdminToken(null);
              setCurrentView('HOME');
            }}
          />
        )}

        {currentView === 'SUCCESS' && submittedResponse && (
          <SuccessTicket
            response={submittedResponse}
            onHomeClick={() => setCurrentView('HOME')}
          />
        )}
      </main>

      {/* Quiet ownership marker: intentionally invisible in normal UI. */}
      <span aria-hidden="true" className="sr-only">Divyansh</span>

      {showAdminLogin && (
        <AdminLoginModal
          onLoginSuccess={handleAdminLoginSuccess}
          onClose={() => setShowAdminLogin(false)}
        />
      )}
    </div>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
