'use client';
import React, { useState, useRef } from 'react';
import { kycService, DocumentType } from '@/services/kyc.service';
import { ActionButton } from '@/components/admin/AdminUI';
import { CheckCircle, Upload, AlertCircle, Clock, Shield, Sparkles, UserCheck, FileCheck, Lock, X, File } from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Personal Info', description: 'Name, date of birth, nationality', icon: UserCheck },
  { id: 2, title: 'Address', description: 'Residential address details', icon: Shield },
  { id: 3, title: 'Identity Document', description: 'Passport, ID or driving licence', icon: FileCheck },
  { id: 4, title: 'Document Upload', description: 'Upload front, back and selfie', icon: Upload },
  { id: 5, title: 'Review & Submit', description: 'Confirm and submit for review', icon: CheckCircle },
];

const DOC_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'passport', label: 'Passport' },
  { value: 'national_id', label: 'National ID Card' },
  { value: 'drivers_license', label: "Driver's Licence" },
];

interface UploadedFile {
  file: File;
  preview?: string;
}

interface FileUploadBoxProps {
  label: string;
  sublabel?: string;
  uploaded: UploadedFile | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
  accept?: string;
}

function FileUploadBox({ label, sublabel, uploaded, onUpload, onRemove, accept = 'image/*,.pdf' }: FileUploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImage = uploaded?.file.type.startsWith('image/');

  if (uploaded) {
    return (
      <div
        className="flex flex-col gap-2 p-3 rounded-xl border-2 transition-all w-full"
        style={{ borderColor: 'var(--primary)', backgroundColor: 'rgba(245,196,0,0.04)' }}
      >
        {/* Preview */}
        {isImage && uploaded.preview ? (
          <div className="w-full h-20 rounded-lg overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
            <img src={uploaded.preview} alt="Document preview" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full h-20 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
            <File size={24} style={{ color: 'var(--primary)' }} />
          </div>
        )}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <CheckCircle size={11} style={{ color: 'var(--primary)' }} />
              <span className="text-xs font-semibold truncate" style={{ color: 'var(--primary)' }}>{label}</span>
            </div>
            <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{uploaded.file.name}</p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)', opacity: 0.7 }}>{formatSize(uploaded.file.size)}</p>
          </div>
          <button
            onClick={onRemove}
            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 hover:bg-red-500/20 transition-colors"
            style={{ color: '#ef4444' }}
          >
            <X size={10} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed transition-all w-full group min-h-[100px]"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'rgba(255,255,255,0.02)',
        }}
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors group-hover:bg-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <Upload size={15} style={{ color: 'var(--muted-foreground)' }} />
        </div>
        <div className="text-center">
          <span className="text-xs font-semibold block" style={{ color: 'var(--foreground)' }}>{label}</span>
          {sublabel && <span className="text-xs block mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{sublabel}</span>}
          <span className="text-xs block mt-1" style={{ color: 'var(--muted-foreground)', opacity: 0.6 }}>Click to browse</span>
        </div>
      </button>
    </>
  );
}

interface KYCVerificationFlowProps {
  onComplete?: () => void;
  isFirstLogin?: boolean;
}

export default function KYCVerificationFlow({ onComplete, isFirstLogin }: KYCVerificationFlowProps) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [approved, setApproved] = useState(false);

  // Step 1 — Personal Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [nationality, setNationality] = useState('');

  // Step 2 — Address
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');

  // Step 3 — Document
  const [docType, setDocType] = useState<DocumentType>('passport');
  const [docNumber, setDocNumber] = useState('');
  const [docExpiry, setDocExpiry] = useState('');

  // Step 4 — File uploads
  const [frontFile, setFrontFile] = useState<UploadedFile | null>(null);
  const [backFile, setBackFile] = useState<UploadedFile | null>(null);
  const [selfieFile, setSelfieFile] = useState<UploadedFile | null>(null);
  const [poaFile, setPoaFile] = useState<UploadedFile | null>(null);

  const createUploadedFile = (file: File): UploadedFile => {
    const isImage = file.type.startsWith('image/');
    if (isImage) {
      const preview = URL.createObjectURL(file);
      return { file, preview };
    }
    return { file };
  };

  const handleFileUpload = (setter: (f: UploadedFile | null) => void) => (file: File) => {
    setter(createUploadedFile(file));
  };

  const handleFileRemove = (current: UploadedFile | null, setter: (f: UploadedFile | null) => void) => () => {
    if (current?.preview) URL.revokeObjectURL(current.preview);
    setter(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await kycService.submitKYC('cust-001');
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  const inputCls = "w-full text-xs px-3 py-2.5 rounded-lg border outline-none transition-colors focus:ring-1 focus:ring-yellow-500/30";
  const inputStyle = { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--foreground)' };

  // KYC Approved state
  if (approved) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-5 text-center">
        <div className="relative">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(245,196,0,0.15)', border: '2px solid rgba(245,196,0,0.3)' }}>
            <Sparkles size={32} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#22c55e' }}>
            <CheckCircle size={14} color="#fff" />
          </div>
        </div>
        <div>
          <h3 className="text-base font-bold mb-1" style={{ color: 'var(--foreground)' }}>Account Fully Activated!</h3>
          <p className="text-xs max-w-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            Your KYC has been approved. Your account is now fully activated with complete trading access. A confirmation email has been sent to you.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e' }}>
          <CheckCircle size={12} />
          Full trading access enabled
        </div>
        {onComplete && (
          <button
            onClick={onComplete}
            className="px-6 py-2.5 rounded-lg text-sm font-bold transition-all active:scale-95"
            style={{ backgroundColor: 'var(--primary)', color: '#000' }}
          >
            Go to Dashboard →
          </button>
        )}
      </div>
    );
  }

  // Submitted — awaiting review
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-5 text-center">
        <div className="relative">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(59,130,246,0.12)', border: '2px solid rgba(59,130,246,0.25)' }}>
            <Clock size={32} style={{ color: '#3b82f6' }} />
          </div>
        </div>
        <div>
          <h3 className="text-base font-bold mb-1" style={{ color: 'var(--foreground)' }}>Verification Under Review</h3>
          <p className="text-xs max-w-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            Your documents have been submitted successfully. Our compliance team will review within 1–2 business days. You'll receive a notification and email once approved.
          </p>
        </div>
        {/* Uploaded files summary */}
        <div className="w-full max-w-xs space-y-1.5">
          {[
            { label: 'Document Front', file: frontFile },
            { label: 'Document Back', file: backFile },
            { label: 'Selfie with Document', file: selfieFile },
            { label: 'Proof of Address', file: poaFile },
          ].filter(f => f.file).map(({ label, file }) => (
            <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
              <CheckCircle size={11} style={{ color: '#22c55e' }} />
              <span style={{ color: 'var(--foreground)' }}>{label}</span>
              <span className="ml-auto truncate max-w-[100px]" style={{ color: 'var(--muted-foreground)' }}>{file!.file.name}</span>
            </div>
          ))}
        </div>
        <div className="w-full max-w-xs space-y-2">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs" style={{ backgroundColor: 'rgba(245,196,0,0.06)', border: '1px solid rgba(245,196,0,0.2)' }}>
            <Shield size={12} style={{ color: 'var(--primary)' }} />
            <span style={{ color: 'var(--muted-foreground)' }}>Reference: KYC-{Date.now().toString().slice(-8)}</span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
            <Lock size={12} style={{ color: 'var(--muted-foreground)' }} />
            <span style={{ color: 'var(--muted-foreground)' }}>Awaiting authorised review &amp; approval</span>
          </div>
        </div>
        {isFirstLogin && (
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            You can access limited features while your KYC is being reviewed.
          </p>
        )}
        {onComplete && (
          <button
            onClick={onComplete}
            className="text-xs px-4 py-2 rounded-lg border transition-all hover:bg-white/5"
            style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
          >
            Continue to Dashboard
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Step progress */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-1 flex-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  backgroundColor: step > s.id ? 'var(--primary)' : step === s.id ? 'rgba(245,196,0,0.2)' : 'var(--card)',
                  border: `1.5px solid ${step >= s.id ? 'var(--primary)' : 'var(--border)'}`,
                  color: step > s.id ? '#000' : step === s.id ? 'var(--primary)' : 'var(--muted-foreground)',
                }}
              >
                {step > s.id ? <CheckCircle size={13} /> : s.id}
              </div>
              <span className="text-xs hidden md:block text-center leading-tight" style={{ color: step === s.id ? 'var(--primary)' : 'var(--muted-foreground)' }}>
                {s.title}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px mb-4" style={{ backgroundColor: step > s.id ? 'var(--primary)' : 'var(--border)' }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step content */}
      <div className="rounded-xl border p-5 space-y-4" style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
        <div className="mb-1">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{STEPS[step - 1].title}</h3>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{STEPS[step - 1].description}</p>
        </div>

        {step === 1 && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs mb-1.5 block font-medium" style={{ color: 'var(--muted-foreground)' }}>First Name</label>
              <input className={inputCls} style={inputStyle} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" />
            </div>
            <div>
              <label className="text-xs mb-1.5 block font-medium" style={{ color: 'var(--muted-foreground)' }}>Last Name</label>
              <input className={inputCls} style={inputStyle} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" />
            </div>
            <div>
              <label className="text-xs mb-1.5 block font-medium" style={{ color: 'var(--muted-foreground)' }}>Date of Birth</label>
              <input type="date" className={inputCls} style={inputStyle} value={dob} onChange={e => setDob(e.target.value)} />
            </div>
            <div>
              <label className="text-xs mb-1.5 block font-medium" style={{ color: 'var(--muted-foreground)' }}>Nationality</label>
              <input className={inputCls} style={inputStyle} value={nationality} onChange={e => setNationality(e.target.value)} placeholder="e.g. British" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div>
              <label className="text-xs mb-1.5 block font-medium" style={{ color: 'var(--muted-foreground)' }}>Street Address</label>
              <input className={inputCls} style={inputStyle} value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main Street" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs mb-1.5 block font-medium" style={{ color: 'var(--muted-foreground)' }}>City</label>
                <input className={inputCls} style={inputStyle} value={city} onChange={e => setCity(e.target.value)} placeholder="London" />
              </div>
              <div>
                <label className="text-xs mb-1.5 block font-medium" style={{ color: 'var(--muted-foreground)' }}>Postal Code</label>
                <input className={inputCls} style={inputStyle} value={postalCode} onChange={e => setPostalCode(e.target.value)} placeholder="SW1A 1AA" />
              </div>
            </div>
            <div>
              <label className="text-xs mb-1.5 block font-medium" style={{ color: 'var(--muted-foreground)' }}>Country</label>
              <input className={inputCls} style={inputStyle} value={country} onChange={e => setCountry(e.target.value)} placeholder="United Kingdom" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <div>
              <label className="text-xs mb-1.5 block font-medium" style={{ color: 'var(--muted-foreground)' }}>Document Type</label>
              <div className="flex gap-2">
                {DOC_TYPES.map(dt => (
                  <button key={dt.value} onClick={() => setDocType(dt.value)}
                    className="flex-1 text-xs py-2 px-3 rounded-lg border transition-all"
                    style={{
                      borderColor: docType === dt.value ? 'var(--primary)' : 'var(--border)',
                      backgroundColor: docType === dt.value ? 'rgba(245,196,0,0.1)' : 'transparent',
                      color: docType === dt.value ? 'var(--primary)' : 'var(--muted-foreground)',
                    }}>
                    {dt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs mb-1.5 block font-medium" style={{ color: 'var(--muted-foreground)' }}>Document Number</label>
                <input className={inputCls} style={inputStyle} value={docNumber} onChange={e => setDocNumber(e.target.value)} placeholder="e.g. 123456789" />
              </div>
              <div>
                <label className="text-xs mb-1.5 block font-medium" style={{ color: 'var(--muted-foreground)' }}>Expiry Date</label>
                <input type="date" className={inputCls} style={inputStyle} value={docExpiry} onChange={e => setDocExpiry(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg text-xs flex items-start gap-2" style={{ backgroundColor: 'rgba(245,196,0,0.06)', border: '1px solid rgba(245,196,0,0.2)', color: 'var(--muted-foreground)' }}>
              <AlertCircle size={12} className="mt-0.5 shrink-0" style={{ color: 'var(--primary)' }} />
              <span>Accepted formats: JPG, PNG, PDF. Max 10 MB per file. Ensure all four corners are visible and text is legible.</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FileUploadBox
                label="Document Front"
                sublabel="Front side of your ID"
                uploaded={frontFile}
                onUpload={handleFileUpload(setFrontFile)}
                onRemove={handleFileRemove(frontFile, setFrontFile)}
              />
              <FileUploadBox
                label="Document Back"
                sublabel="Back side of your ID"
                uploaded={backFile}
                onUpload={handleFileUpload(setBackFile)}
                onRemove={handleFileRemove(backFile, setBackFile)}
              />
              <FileUploadBox
                label="Selfie with Document"
                sublabel="Hold ID next to your face"
                uploaded={selfieFile}
                onUpload={handleFileUpload(setSelfieFile)}
                onRemove={handleFileRemove(selfieFile, setSelfieFile)}
              />
              <FileUploadBox
                label="Proof of Address"
                sublabel="Utility bill or bank statement"
                uploaded={poaFile}
                onUpload={handleFileUpload(setPoaFile)}
                onRemove={handleFileRemove(poaFile, setPoaFile)}
                accept="image/*,.pdf"
              />
            </div>
            {/* Upload progress summary */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${([frontFile, backFile, selfieFile, poaFile].filter(Boolean).length / 4) * 100}%`,
                    backgroundColor: 'var(--primary)',
                  }}
                />
              </div>
              <span className="text-xs shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                {[frontFile, backFile, selfieFile, poaFile].filter(Boolean).length}/4 uploaded
              </span>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-3">
            <div className="space-y-1">
              {[
                ['Full Name', `${firstName} ${lastName}`],
                ['Date of Birth', dob || '—'],
                ['Nationality', nationality || '—'],
                ['Address', `${address}, ${city} ${postalCode}, ${country}`],
                ['Document Type', DOC_TYPES.find(d => d.value === docType)?.label || '—'],
                ['Document Number', docNumber || '—'],
                ['Document Expiry', docExpiry || '—'],
                ['Front Upload', frontFile ? `✓ ${frontFile.file.name}` : '✗ Missing'],
                ['Back Upload', backFile ? `✓ ${backFile.file.name}` : '✗ Missing'],
                ['Selfie', selfieFile ? `✓ ${selfieFile.file.name}` : '✗ Missing'],
                ['Proof of Address', poaFile ? `✓ ${poaFile.file.name}` : '✗ Missing'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-xs py-1.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <span style={{ color: 'var(--muted-foreground)' }}>{label}</span>
                  <span className="max-w-[180px] truncate text-right" style={{ color: String(value).includes('✗') ? '#ef4444' : 'var(--foreground)' }}>{value}</span>
                </div>
              ))}
            </div>
            <div className="p-3 rounded-lg text-xs" style={{ backgroundColor: 'rgba(245,196,0,0.06)', border: '1px solid rgba(245,196,0,0.2)', color: 'var(--muted-foreground)' }}>
              By submitting, you confirm all information is accurate and the documents are genuine. An authorised compliance officer will review your submission.
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setStep(s => Math.max(1, s - 1))}
          disabled={step === 1}
          className="text-xs px-4 py-2 rounded-lg border transition-colors disabled:opacity-40"
          style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
          Back
        </button>
        {step < 5 ? (
          <ActionButton variant="primary" onClick={() => setStep(s => s + 1)}>
            Continue →
          </ActionButton>
        ) : (
          <ActionButton variant="primary" onClick={handleSubmit}>
            {submitting ? 'Submitting...' : 'Submit for Review'}
          </ActionButton>
        )}
      </div>
    </div>
  );
}
