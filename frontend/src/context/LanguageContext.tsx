import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    appTitle: 'ELECTRICAL SAFETY REPORTING',
    appSubtitle: 'Zero-Friction Incident & Hazard Portal',
    hindiToggle: '🇮🇳 हिंदी',
    englishToggle: '🇬🇧 English',
    adminAccess: '🔐 Admin Portal',
    substationDetected: 'Substation QR Detected',

    // Category Selector
    selectReportType: 'Select Report Category',
    selectReportTypeSub: 'Tap any card or use AI Voice Assistant for zero-typing report creation',
    voiceReportCta: '🎙️ REPORT BY VOICE / आवाज़ से रिपोर्ट करें',
    voiceReportSub: 'Step-by-step AI voice interview in English/Hindi',

    toolReportTitle: '🔧 Tool Defect Report',
    toolReportDesc: 'Report damaged, unsafe, or malfunctioning tools (Crimper, Tester, Rods)',
    ppeReportTitle: '🦺 PPE Defect / Lack Report',
    ppeReportDesc: 'Report missing or damaged Personal Protective Equipment',
    nearMissTitle: '⚠️ Near Miss Hazard',
    nearMissDesc: 'Report unsafe condition or event that could have caused injury',
    incidentTitle: '🚨 Electrical Incident',
    incidentDesc: 'Report equipment flashover, trip, cable damage, or minor property damage',
    accidentTitle: '🏥 Injury / Accident',
    accidentDesc: 'Report electrical shock, burn, fall, or physical injury requiring assistance',

    // Form Common
    stepEmployeeInfo: '1. Field Worker ID',
    stepLocationInfo: '2. Location & Substation',
    stepReportDetails: '3. Hazard & Event Details',
    stepEvidenceUpload: '4. ID & Photo Evidence',

    employeeId: 'Employee ID Card / Gate Pass No.',
    employeeName: 'Full Name',
    employeePhone: 'Mobile Number',
    date: 'Date of Incident',
    time: 'Time of Incident',
    division: 'Division / Zone',
    subdivision: 'Sub-Division / Feeder',
    location: 'Substation / Pole / Site Location',
    activity: 'Work Activity Being Performed',
    description: 'Detailed Description of Event',
    severity: 'Severity Level',
    skip: '⏭️ SKIP THIS FIELD',
    submitReport: '✅ SUBMIT REPORT',
    submitting: '⏳ Submitting Report...',

    // Tools & PPE
    selectTool: 'Select Tool Type',
    selectProblem: 'Select Defect / Problem Type',
    selectPpe: 'Select PPE Item',
    selectPpeIssue: 'Select PPE Issue',

    // Incident / Accident specific
    equipmentInvolved: 'Equipment / Line Involved',
    immediateAction: 'Immediate Action Taken On-Site',
    workStopped: 'Was Work Stopped Immediately?',
    injuryOccurred: 'Did Any Injury Occur?',
    bodyPart: 'Affected Body Part',
    injuryType: 'Nature of Injury / Burn',
    firstAid: 'First Aid Applied On-Site?',
    hospitalRequired: 'Hospitalization / Doctor Required?',
    potentialHazard: 'What Could Have Happened? (Potential Hazard)',

    // ID & Photos
    uploadIdCard: '📷 Take / Upload ID Card Photo',
    uploadEvidence: '📸 Add Photo Evidence (Up to 5 Photos)',
    retakePhoto: '🔄 Retake',
    addMorePhotos: '➕ Add Photo',

    // Voice Assistant
    voiceAssistantTitle: '🎙️ AI Voice Safety Reporter',
    voiceAssistantSubtitle: 'Speak naturally in Hindi, English, or Hinglish. AI will structure your report.',
    listening: '🔴 Listening... Speak now',
    speaking: '🔊 AI Speaking question...',
    processing: '⚡ Processing response...',
    repeatQuestion: '🔊 Repeat Question',
    skipQuestion: '⏭️ Skip',
    backQuestion: '🔙 Back',
    cancelVoice: '❌ Cancel',
    voiceSummaryTitle: '📋 Voice Report Summary Review',
    confirmSubmit: '✅ Confirm & Submit Report',
    editManual: '✏️ Edit in Form',
    restartVoice: '🔄 Start Voice Interview Again',

    // Admin
    adminLoginTitle: '🔐 Admin / Safety Supervisor Login',
    enterPin: 'Enter 4-Digit Security PIN',
    pinPlaceholder: 'e.g. 8888',
    loginBtn: 'Unlock Dashboard',
    invalidPin: 'Invalid Security PIN! Please try again.',
    totalReports: 'Total Safety Reports',
    nearMissCount: 'Near Miss Hazards',
    incidentCount: 'Incidents / Trips',
    accidentCount: 'Injuries / Accidents',
    ppeToolCount: 'PPE & Tool Defects',
    openStatus: 'Open Action Items',
    closedStatus: 'Resolved & Closed',
    exportReport: '📥 Export PDF Ticket',
    qrGeneratorTitle: '⚡ Generate Substation Safety QR Code',
    substationName: 'Substation / Grid Name',
    generateQr: '🖨️ Generate Printable QR Badge',

    // Statuses
    statusNew: 'NEW',
    statusReview: 'UNDER REVIEW',
    statusActionReq: 'ACTION REQUIRED',
    statusActionTaken: 'ACTION TAKEN',
    statusClosed: 'CLOSED & RESOLVED',
  },
  hi: {
    // Header
    appTitle: 'बिजली सुरक्षा रिपोर्टिंग',
    appSubtitle: 'फील्ड कर्मचारियों के लिए आसान सुरक्षा रिपोर्टिंग',
    hindiToggle: '🇮🇳 हिंदी',
    englishToggle: '🇬🇧 English',
    adminAccess: '🔐 एडमिन पोर्टल',
    substationDetected: 'सबस्टेशन QR मिला',

    // Category Selector
    selectReportType: 'रिपोर्ट का प्रकार चुनें',
    selectReportTypeSub: 'कोई विकल्प चुनें या बोलकर रिपोर्ट करें',
    voiceReportCta: '🎙️ आवाज़ से रिपोर्ट करें (VOICE REPORT)',
    voiceReportSub: 'हिंदी या इंग्लिश में बोलकर रिपोर्ट करें',

    toolReportTitle: '🔧 टूल खराब होने की रिपोर्ट',
    toolReportDesc: 'टूटे या खराब टूल की जानकारी दें',
    ppeReportTitle: '🦺 PPE खराब या कम होने की रिपोर्ट',
    ppeReportDesc: 'हेलमेट, दस्ताने, जूते या बेल्ट की कमी/खराबी बताएं',
    nearMissTitle: '⚠️ नियर मिस (हादसा होते-होते बचा)',
    nearMissDesc: 'ऐसी घटना जिसमें हादसा हो सकता था, लेकिन नहीं हुआ',
    incidentTitle: '🚨 बिजली की घटना / ट्रिपिंग रिपोर्ट',
    incidentDesc: 'स्पार्किंग, केबल खराबी या उपकरण ट्रिपिंग की जानकारी दें',
    accidentTitle: '🏥 चोट / हादसे की रिपोर्ट',
    accidentDesc: 'करंट लगना, जलना, गिरना या चोट लगने की रिपोर्ट',

    // Form Common
    stepEmployeeInfo: '1. कर्मचारी की जानकारी',
    stepLocationInfo: '2. स्थान और सबस्टेशन',
    stepReportDetails: '3. घटना और खतरे की जानकारी',
    stepEvidenceUpload: '4. ID कार्ड और फोटो',

    employeeId: 'कर्मचारी ID / गेट पास नंबर',
    employeeName: 'पूरा नाम',
    employeePhone: 'मोबाइल नंबर',
    date: 'घटना की तारीख',
    time: 'घटना का समय',
    division: 'डिवीजन / जोन',
    subdivision: 'सब-डिवीजन / फीडर',
    location: 'सबस्टेशन / पोल / काम की जगह',
    activity: 'कौन सा काम हो रहा था',
    description: 'घटना की पूरी जानकारी',
    severity: 'खतरे का स्तर',
    skip: '⏭️ छोड़ें (SKIP)',
    submitReport: '✅ रिपोर्ट जमा करें',
    submitting: '⏳ रिपोर्ट जमा हो रही है...',

    // Tools & PPE
    selectTool: 'टूल चुनें',
    selectProblem: 'खराबी चुनें',
    selectPpe: 'PPE चुनें',
    selectPpeIssue: 'समस्या चुनें',

    // Incident / Accident specific
    equipmentInvolved: 'कौन सा उपकरण / लाइन',
    immediateAction: 'मौके पर क्या कार्रवाई की',
    workStopped: 'क्या काम तुरंत रोक दिया गया था?',
    injuryOccurred: 'क्या किसी को चोट लगी?',
    bodyPart: 'कौन सा अंग प्रभावित हुआ',
    injuryType: 'चोट / जलने का प्रकार',
    firstAid: 'क्या मौके पर First Aid दिया गया?',
    hospitalRequired: 'क्या अस्पताल / डॉक्टर की जरूरत है?',
    potentialHazard: 'क्या बड़ा हादसा हो सकता था?',

    // ID & Photos
    uploadIdCard: '📷 ID कार्ड की फोटो लें / अपलोड करें',
    uploadEvidence: '📸 फोटो जोड़ें (अधिकतम 5)',
    retakePhoto: '🔄 फिर से फोटो लें',
    addMorePhotos: '➕ और फोटो जोड़ें',

    // Voice Assistant
    voiceAssistantTitle: '🎙️ AI वॉइस सुरक्षा रिपोर्टर',
    voiceAssistantSubtitle: 'हिंदी, Hinglish या इंग्लिश में बोलें। AI रिपोर्ट तैयार करेगा।',
    listening: '🔴 सुन रहा हूँ... बोलें',
    speaking: '🔊 AI सवाल पूछ रहा है...',
    processing: '⚡ जानकारी तैयार हो रही है...',
    repeatQuestion: '🔊 सवाल दोहराएं',
    skipQuestion: '⏭️ छोड़ें',
    backQuestion: '🔙 पीछे जाएं',
    cancelVoice: '❌ रद्द करें',
    voiceSummaryTitle: '📋 वॉइस रिपोर्ट देखें',
    confirmSubmit: '✅ पुष्टि करें और रिपोर्ट जमा करें',
    editManual: '✏️ फॉर्म में सुधार करें',
    restartVoice: '🔄 वॉइस रिपोर्ट फिर शुरू करें',

    // Admin
    adminLoginTitle: '🔐 एडमिन / सुरक्षा लॉगिन',
    enterPin: '4 अंकों का PIN डालें',
    pinPlaceholder: 'जैसे 8888',
    loginBtn: 'डैशबोर्ड खोलें',
    invalidPin: 'PIN गलत है। फिर कोशिश करें।',
    totalReports: 'कुल रिपोर्ट',
    nearMissCount: 'नियर मिस',
    incidentCount: 'घटनाएं / ट्रिपिंग',
    accidentCount: 'चोट / हादसे',
    ppeToolCount: 'PPE और टूल खराबी',
    openStatus: 'लंबित काम',
    closedStatus: 'पूरे किए गए मामले',
    exportReport: '📥 पीडीएफ रसीद डाउनलोड करें',
    qrGeneratorTitle: '⚡ सबस्टेशन QR बनाएं',
    substationName: 'सबस्टेशन का नाम',
    generateQr: '🖨️ QR पोस्टर बनाएं',

    // Statuses
    statusNew: 'नया (NEW)',
    statusReview: 'जांच में',
    statusActionReq: 'कार्रवाई जरूरी',
    statusActionTaken: 'कार्रवाई हो गई',
    statusClosed: 'बंद / पूरा',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('hi'); // Default Hindi for Indian electrical field workers

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
