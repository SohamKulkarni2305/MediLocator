import React, { useState, useRef, useEffect } from 'react';

export interface UploadedRxData {
  id: string;
  fileName: string;
  fileSize: string;
  source: 'camera' | 'file' | 'sample';
  previewUrl?: string;
  doctorName: string;
  doctorReg: string;
  clinicName: string;
  date: string;
  confidence: number;
  medicines: {
    id: string;
    brandedName: string;
    brandedManufacturer: string;
    brandedPriceUSD: number;
    brandedPriceINR: number;
    genericName: string;
    genericManufacturer: string;
    genericPriceUSD: number;
    genericPriceINR: number;
    dosageInstructions: string;
    bioequivalentCode: string;
  }[];
}

export const SAMPLE_PRESCRIPTIONS: Record<string, UploadedRxData> = {
  cardio: {
    id: 'rx-cardio-1',
    fileName: 'rx_cardio_arvind_mehta.pdf',
    fileSize: '1.4 MB',
    source: 'sample',
    doctorName: 'Dr. Arvind Mehta, MD, DM',
    doctorReg: 'MED-LIC-88219 (NABH)',
    clinicName: 'Metro Heart & Diabetes Care Clinic',
    date: '05 Sep 2026',
    confidence: 99.4,
    medicines: [
      {
        id: 'med-1',
        brandedName: 'Lipitor 10mg',
        brandedManufacturer: 'Pfizer Healthcare Inc.',
        brandedPriceUSD: 42.00,
        brandedPriceINR: 420.00,
        genericName: 'Atorvastatin 10mg Tablet',
        genericManufacturer: 'Cipla Ltd / WHO-GMP Certified',
        genericPriceUSD: 11.50,
        genericPriceINR: 115.00,
        dosageInstructions: '1 tab OD at bedtime (hs) x 30 days',
        bioequivalentCode: 'US-FDA AB Rated',
      },
      {
        id: 'med-2',
        brandedName: 'Glucophage 500mg ER',
        brandedManufacturer: 'Merck S.A.',
        brandedPriceUSD: 28.00,
        brandedPriceINR: 280.00,
        genericName: 'Metformin HCl 500mg ER',
        genericManufacturer: 'Sun Pharma / ISO-9001 Certified',
        genericPriceUSD: 7.20,
        genericPriceINR: 72.00,
        dosageInstructions: '1 tab twice daily after meals x 60 tabs',
        bioequivalentCode: '100% Active Match',
      },
    ],
  },
  gastro: {
    id: 'rx-gastro-2',
    fileName: 'rx_gastro_shalini_verma.jpg',
    fileSize: '2.8 MB',
    source: 'sample',
    doctorName: 'Dr. Shalini Verma, MD',
    doctorReg: 'MCI-REG-44912',
    clinicName: 'City Digestive Health Center',
    date: '04 Sep 2026',
    confidence: 98.7,
    medicines: [
      {
        id: 'med-3',
        brandedName: 'Nexium 40mg',
        brandedManufacturer: 'AstraZeneca',
        brandedPriceUSD: 36.00,
        brandedPriceINR: 360.00,
        genericName: 'Esomeprazole Magnesium 40mg DR',
        genericManufacturer: 'Torrent Pharmaceuticals',
        genericPriceUSD: 9.80,
        genericPriceINR: 98.00,
        dosageInstructions: '1 capsule empty stomach morning x 14 days',
        bioequivalentCode: 'Bioequivalent AA Code',
      },
      {
        id: 'med-4',
        brandedName: 'Augmentin 625mg Duo',
        brandedManufacturer: 'GSK Pharmaceuticals',
        brandedPriceUSD: 24.50,
        brandedPriceINR: 245.00,
        genericName: 'Amoxicillin + Potassium Clavulanate (500/125mg)',
        genericManufacturer: 'Alkem Laboratories',
        genericPriceUSD: 8.50,
        genericPriceINR: 85.00,
        dosageInstructions: '1 tab after food twice daily x 6 days',
        bioequivalentCode: 'Pharmacopeial Grade',
      },
    ],
  },
  respiratory: {
    id: 'rx-resp-3',
    fileName: 'rx_pulmo_rajeshwar_rao.png',
    fileSize: '1.9 MB',
    source: 'sample',
    doctorName: 'Dr. Rajeshwar Rao, MD (Chest & Allergy)',
    doctorReg: 'MCI-REG-77103',
    clinicName: 'Apex Pulmonary & Allergy Clinic',
    date: '02 Sep 2026',
    confidence: 99.1,
    medicines: [
      {
        id: 'med-5',
        brandedName: 'Singulair 10mg',
        brandedManufacturer: 'Organon / Merck',
        brandedPriceUSD: 38.00,
        brandedPriceINR: 380.00,
        genericName: 'Montelukast Sodium 10mg Tablet',
        genericManufacturer: 'Mankind Pharma',
        genericPriceUSD: 8.90,
        genericPriceINR: 89.00,
        dosageInstructions: '1 tab at evening x 30 days',
        bioequivalentCode: 'AB Bioequivalent',
      },
      {
        id: 'med-6',
        brandedName: 'Zyrtec 10mg',
        brandedManufacturer: 'Johnson & Johnson',
        brandedPriceUSD: 18.00,
        brandedPriceINR: 180.00,
        genericName: 'Cetirizine Hydrochloride 10mg',
        genericManufacturer: 'Dr. Reddy\'s Laboratories',
        genericPriceUSD: 4.50,
        genericPriceINR: 45.00,
        dosageInstructions: '1 tab SOS for allergic symptoms',
        bioequivalentCode: 'Therapeutic Equivalent',
      },
    ],
  },
};

interface PrescriptionUploadSimulatorProps {
  onPrescriptionSelected: (rxData: UploadedRxData) => void;
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
  currentRx: UploadedRxData | null;
  onReset: () => void;
}

export const PrescriptionUploadSimulator: React.FC<PrescriptionUploadSimulatorProps> = ({
  onPrescriptionSelected,
  isScanning,
  setIsScanning,
  currentRx,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'camera' | 'sample'>('file');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'back' | 'front'>('back');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStage, setScanStage] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger scanning simulation with progress updates
  const startScanningProcess = (selectedData: UploadedRxData) => {
    setIsScanning(true);
    setScanProgress(10);
    setScanStage('Locating document edges & rectifying perspective...');

    const timer1 = setTimeout(() => {
      setScanProgress(45);
      setScanStage('Extracting prescriber license (MCI/NABH) & handwritten notations...');
    }, 400);

    const timer2 = setTimeout(() => {
      setScanProgress(80);
      setScanStage('Cross-referencing FDA Orange Book & CDSCO for bioequivalent salts...');
    }, 850);

    const timer3 = setTimeout(() => {
      setScanProgress(100);
      setScanStage('Verification complete! Bioequivalent matches found.');
      setTimeout(() => {
        setIsScanning(false);
        onPrescriptionSelected(selectedData);
      }, 300);
    }, 1300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  // Real device file picker handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const preview = URL.createObjectURL(file);
      const isPdf = file.name.endsWith('.pdf');
      
      const newRx: UploadedRxData = {
        id: `rx-custom-${Date.now()}`,
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        source: 'file',
        previewUrl: isPdf ? undefined : preview,
        doctorName: 'Dr. Arvind Mehta, MD, DM',
        doctorReg: 'MED-LIC-88219 (NABH)',
        clinicName: 'Metro Heart & Diabetes Care Clinic',
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        confidence: 99.2,
        medicines: SAMPLE_PRESCRIPTIONS.cardio.medicines,
      };

      startScanningProcess(newRx);
    }
  };

  // Drag and drop handler
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const preview = URL.createObjectURL(file);
      const isPdf = file.name.endsWith('.pdf');

      const newRx: UploadedRxData = {
        id: `rx-drop-${Date.now()}`,
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        source: 'file',
        previewUrl: isPdf ? undefined : preview,
        doctorName: 'Dr. Arvind Mehta, MD, DM',
        doctorReg: 'MED-LIC-88219 (NABH)',
        clinicName: 'Metro Heart & Diabetes Care Clinic',
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        confidence: 99.2,
        medicines: SAMPLE_PRESCRIPTIONS.cardio.medicines,
      };

      startScanningProcess(newRx);
    }
  };

  // Camera capture simulation
  const handleShutterClick = () => {
    // Flash effect trigger
    const flashEl = document.getElementById('camera-flash-overlay');
    if (flashEl) {
      flashEl.classList.remove('hidden');
      flashEl.classList.add('opacity-90');
      setTimeout(() => {
        flashEl.classList.remove('opacity-90');
        flashEl.classList.add('hidden');
      }, 150);
    }

    // Set captured simulation state
    setCapturedImage('captured-rx-cardio');
  };

  // Confirm photo capture from camera
  const handleConfirmCapturedPhoto = () => {
    setIsCameraActive(false);
    setCapturedImage(null);

    const cameraRx: UploadedRxData = {
      id: `rx-cam-${Date.now()}`,
      fileName: `camera_scan_${new Date().toISOString().slice(0, 10)}.jpg`,
      fileSize: '3.2 MB',
      source: 'camera',
      doctorName: 'Dr. Arvind Mehta, MD, DM',
      doctorReg: 'MED-LIC-88219 (NABH Verified)',
      clinicName: 'Metro Heart & Diabetes Care Clinic',
      date: 'Today (Live Optical Capture)',
      confidence: 99.5,
      medicines: SAMPLE_PRESCRIPTIONS.cardio.medicines,
    };

    startScanningProcess(cameraRx);
  };

  const handleSelectSample = (key: string) => {
    const selected = SAMPLE_PRESCRIPTIONS[key];
    if (selected) {
      startScanningProcess(selected);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload & Verification Interface Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Navigation Tabs for Ingest Mode */}
        <div className="px-4 pt-3 pb-0 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => {
                setActiveTab('file');
                setIsCameraActive(false);
              }}
              className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'file' && !isCameraActive
                  ? 'border-sky-600 text-sky-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-base">attach_file</span>
              <span>Upload Document / PDF</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('camera');
                setIsCameraActive(true);
              }}
              className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'camera' || isCameraActive
                  ? 'border-sky-600 text-sky-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-base">photo_camera</span>
              <span>Camera Scan</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                Live
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('sample');
                setIsCameraActive(false);
              }}
              className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'sample' && !isCameraActive
                  ? 'border-sky-600 text-sky-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-base">quick_reference_all</span>
              <span>Sample Prescriptions</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="material-symbols-outlined text-sm text-emerald-600">verified</span>
            <span>21 CFR Part 11 Compliant Ingest</span>
          </div>
        </div>

        {/* TAB 1: FILE UPLOAD DROPZONE */}
        {activeTab === 'file' && !isCameraActive && (
          <div className="p-6">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,.pdf,.heic"
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition cursor-pointer flex flex-col items-center justify-center gap-3 ${
                dragOver
                  ? 'border-sky-500 bg-sky-50/60 scale-[0.99]'
                  : 'border-slate-300 hover:border-sky-400 bg-slate-50/40 hover:bg-slate-50'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-sky-100/70 text-sky-700 flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-3xl">upload_file</span>
              </div>

              <div>
                <div className="text-sm font-bold text-slate-900 flex items-center justify-center gap-1.5">
                  <span>Click to browse your device files</span>
                  <span className="text-slate-400 font-normal">or drop here</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Supports clear photos or PDFs (JPG, PNG, PDF, HEIC up to 25MB). Auto-aligns orientation &amp; removes optical distortion.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <span className="px-2 py-0.8 bg-white border border-slate-200 text-slate-600 text-[11px] rounded-md font-mono">
                  Doctor Signature Checked
                </span>
                <span className="px-2 py-0.8 bg-white border border-slate-200 text-slate-600 text-[11px] rounded-md font-mono">
                  MCI / State Council Registry
                </span>
                <span className="px-2 py-0.8 bg-white border border-slate-200 text-slate-600 text-[11px] rounded-md font-mono">
                  Schedule H Salt Mapping
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">folder_open</span>
                  <span>Select File from Device</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE CAMERA SCANNER SIMULATION */}
        {(activeTab === 'camera' || isCameraActive) && (
          <div className="p-4 sm:p-6 bg-slate-950 text-white">
            {!capturedImage ? (
              /* ACTIVE VIEWFINDER */
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex flex-col items-center">
                {/* Flash Overlay */}
                <div
                  id="camera-flash-overlay"
                  className="hidden absolute inset-0 bg-white z-40 transition-opacity duration-150 pointer-events-none"
                />

                {/* Top Camera Controls */}
                <div className="w-full px-4 py-3 bg-slate-950/80 backdrop-blur-md flex items-center justify-between z-20 border-b border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono font-bold text-slate-200">
                      OCR Camera Scanner (4K HDR)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Torch Toggle */}
                    <button
                      onClick={() => setIsTorchOn(!isTorchOn)}
                      className={`p-1.5 rounded-lg border transition cursor-pointer ${
                        isTorchOn
                          ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                      title="Toggle Flash / Torch"
                    >
                      <span className="material-symbols-outlined text-base">
                        {isTorchOn ? 'flash_on' : 'flash_off'}
                      </span>
                    </button>

                    {/* Camera Switcher */}
                    <button
                      onClick={() => setCameraFacing(cameraFacing === 'back' ? 'front' : 'back')}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition cursor-pointer"
                      title="Switch Camera Lens"
                    >
                      <span className="material-symbols-outlined text-base">flip_camera_ios</span>
                    </button>

                    {/* Close Camera */}
                    <button
                      onClick={() => {
                        setIsCameraActive(false);
                        setActiveTab('file');
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition cursor-pointer"
                      title="Exit Camera"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  </div>
                </div>

                {/* Viewfinder Window with Document Detection Reticle */}
                <div className="relative w-full aspect-4/3 max-w-lg mx-auto flex items-center justify-center p-4 overflow-hidden">
                  {/* Simulated realistic prescription document in camera view */}
                  <div className="w-[85%] h-[88%] bg-amber-50/95 text-slate-900 rounded-lg shadow-2xl p-4 border border-slate-300 relative select-none transform rotate-[-0.8deg] transition duration-500">
                    {/* Medical Clinic Header */}
                    <div className="flex items-center justify-between border-b-2 border-slate-300 pb-2">
                      <div>
                        <div className="font-serif font-black text-xs text-sky-950">
                          METRO HEART &amp; DIABETES CARE CLINIC
                        </div>
                        <div className="text-[9px] text-slate-600 font-mono">
                          Dr. Arvind Mehta, MD, DM (Cardiology) • Reg #88219
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded border border-sky-800 flex items-center justify-center font-serif font-black text-sky-900 text-sm">
                        Rx
                      </div>
                    </div>

                    {/* Patient info */}
                    <div className="flex justify-between text-[9px] py-1.5 border-b border-slate-200 font-mono text-slate-700">
                      <span>Pt: Rajesh Sharma (58/M)</span>
                      <span>Date: 05-Sep-2026</span>
                    </div>

                    {/* Prescribed medicines handwritten simulation */}
                    <div className="pt-2 space-y-2 text-[10px] font-sans">
                      <div className="p-1 bg-white/70 rounded border border-slate-200">
                        <div className="font-bold text-slate-900">1. Tab. Lipitor 10mg (Atorvastatin)</div>
                        <div className="text-[9px] text-slate-500 italic">Sig: 1 tab daily at bedtime x 30 days</div>
                      </div>
                      <div className="p-1 bg-white/70 rounded border border-slate-200">
                        <div className="font-bold text-slate-900">2. Tab. Glucophage 500mg ER (Metformin)</div>
                        <div className="text-[9px] text-slate-500 italic">Sig: 1 tab BD pc x 60 tabs</div>
                      </div>
                    </div>

                    {/* Doctor signature seal */}
                    <div className="absolute bottom-3 right-3 text-right">
                      <div className="font-serif italic text-xs text-sky-900 font-bold border-b border-sky-900 inline-block px-2">
                        A. Mehta
                      </div>
                      <div className="text-[8px] font-mono text-slate-500">Authorized Medical Practitioner</div>
                    </div>
                  </div>

                  {/* Optical Document Framing Reticle (Corners) */}
                  <div className="absolute inset-8 border-2 border-emerald-400/80 rounded-xl pointer-events-none flex flex-col justify-between p-1 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pulse">
                    <div className="flex justify-between">
                      <span className="w-5 h-5 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1" />
                      <span className="w-5 h-5 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1" />
                    </div>
                    <div className="flex justify-between">
                      <span className="w-5 h-5 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1" />
                      <span className="w-5 h-5 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1" />
                    </div>
                  </div>

                  {/* Laser Scanning Line */}
                  <div className="absolute inset-x-8 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-bounce pointer-events-none" />

                  {/* Live Status Badge */}
                  <div className="absolute bottom-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/50 text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5 shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Prescription Detected • Auto-focus 100%</span>
                  </div>
                </div>

                {/* Shutter Bar */}
                <div className="w-full py-4 px-6 bg-slate-950 flex items-center justify-around border-t border-slate-800">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Hold Steady
                  </span>

                  {/* Large Shutter Button */}
                  <button
                    onClick={handleShutterClick}
                    className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center p-1 bg-transparent hover:scale-105 active:scale-95 transition cursor-pointer shadow-lg group"
                    title="Capture Prescription Document"
                  >
                    <div className="w-full h-full rounded-full bg-emerald-500 group-hover:bg-emerald-400 transition" />
                  </button>

                  <span className="text-[11px] text-emerald-400 font-mono">
                    High Clarity
                  </span>
                </div>
              </div>
            ) : (
              /* CAPTURED REVIEW STATE */
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center space-y-4 max-w-md mx-auto">
                <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-3">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
                    <span>Document Snapped Successfully</span>
                  </span>
                  <span className="font-mono text-slate-400 text-[11px]">3.2 MB • 300 DPI</span>
                </div>

                {/* Snapshot Thumbnail */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center">
                  <div className="w-48 bg-amber-50 text-slate-900 rounded p-2 text-left text-[8px] font-mono shadow-md border border-slate-400 space-y-1">
                    <div className="font-bold text-sky-900 border-b border-slate-300 pb-0.5">
                      METRO HEART CLINIC - Dr. A. Mehta
                    </div>
                    <div>Pt: Rajesh Sharma (58 M)</div>
                    <div className="font-sans font-bold text-slate-800">1. Lipitor 10mg (Atorvastatin)</div>
                    <div className="font-sans font-bold text-slate-800">2. Glucophage 500mg ER (Metformin)</div>
                    <div className="text-right text-sky-800 italic font-bold">Signed: A. Mehta</div>
                  </div>
                </div>

                {/* Quality Metrics */}
                <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
                  <div className="bg-slate-800/80 p-2 rounded-lg text-slate-300">
                    <div className="text-slate-400">Sharpness</div>
                    <div className="font-bold text-emerald-400">98.4% High</div>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg text-slate-300">
                    <div className="text-slate-400">Glare</div>
                    <div className="font-bold text-emerald-400">None / Clear</div>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg text-slate-300">
                    <div className="text-slate-400">Prescriber Reg</div>
                    <div className="font-bold text-emerald-400">Verified</div>
                  </div>
                </div>

                {/* Confirmation Controls */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCapturedImage(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">replay</span>
                    <span>Retake Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmCapturedPhoto}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">fact_check</span>
                    <span>Verify &amp; Extract Medicines</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SAMPLE PRESCRIPTIONS GALLERY */}
        {activeTab === 'sample' && !isCameraActive && (
          <div className="p-5 sm:p-6 space-y-3">
            <div className="text-xs font-semibold text-slate-700">
              Select an authentic verified medical prescription to test OCR &amp; generic bioequivalence matching:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.entries(SAMPLE_PRESCRIPTIONS).map(([key, item]) => (
                <div
                  key={key}
                  onClick={() => handleSelectSample(key)}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 transition cursor-pointer text-left space-y-2 group shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center font-serif">
                      Rx
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold border border-emerald-200">
                      {item.confidence}% Match
                    </span>
                  </div>

                  <div>
                    <div className="font-bold text-slate-900 text-xs group-hover:text-sky-800 transition line-clamp-1">
                      {item.doctorName}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{item.clinicName}</div>
                  </div>

                  <div className="pt-1 border-t border-slate-100 text-[11px] text-slate-600 space-y-0.5 font-mono">
                    {item.medicines.map((m) => (
                      <div key={m.id} className="truncate">
                        • {m.brandedName}
                      </div>
                    ))}
                  </div>

                  <div className="text-[10px] text-sky-700 font-bold flex items-center gap-0.5 pt-1">
                    <span>Load &amp; Verify</span>
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SCANNING PROGRESS OVERLAY / SPINNER */}
      {isScanning && (
        <div className="bg-white border border-sky-200 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-sm animate-in fade-in duration-200">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-sky-600 animate-spin">
              progress_activity
            </span>
            <span className="material-symbols-outlined text-xl text-sky-700 absolute">
              document_scanner
            </span>
          </div>

          <div>
            <h3 className="font-headline font-bold text-slate-900 text-sm">
              Analyzing Prescription with Autonomous OCR Diagnostics
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              {scanStage || 'Extracting prescriber license, active salts (INN) and validating bioequivalence.'}
            </p>
          </div>

          {/* Progress bar */}
          <div className="max-w-xs mx-auto space-y-1.5">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
              <div
                className="bg-sky-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>Stage: Regulatory OCR</span>
              <span>{scanProgress}%</span>
            </div>
          </div>
        </div>
      )}

      {/* UPLOADED / VERIFIED PRESCRIPTION DOCUMENT SUMMARY BANNER */}
      {currentRx && !isScanning && (
        <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-2xl">task_alt</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-headline font-black text-xs text-emerald-950">
                  Prescription Verified (Optical Accuracy: {currentRx.confidence}%)
                </h4>
                <span className="px-1.5 py-0.2 rounded bg-emerald-200/80 text-emerald-900 font-mono text-[10px] font-bold">
                  {currentRx.source.toUpperCase()}
                </span>
              </div>
              <div className="text-[11px] text-emerald-800 mt-0.5">
                File: <strong className="font-mono">{currentRx.fileName}</strong> ({currentRx.fileSize}) • {currentRx.doctorName}
              </div>
              <div className="text-[10px] text-emerald-700 font-mono mt-0.5">
                Reg: {currentRx.doctorReg} • {currentRx.clinicName}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={onReset}
              className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-900 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">autorenew</span>
              <span>Upload Different Rx</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
