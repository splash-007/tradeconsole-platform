'use client';
import React, { useState } from 'react';
import { kycService, KYCStatus, DocumentType } from '@/services/kyc.service';
import { ActionButton } from '@/components/admin/AdminUI';
import { CheckCircle, Upload, AlertCircle, Clock, Shield } from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Personal Info', description: 'Name, date of birth, nationality' },
  { id: 2, title: 'Address', description: 'Residential address details' },
  { id: 3, title: 'Identity Document', description: 'Passport, ID or driving licence' },
  { id: 4, title: 'Document Upload', description: 'Upload front, back and selfie' },
  { id: 5, title: 'Review & Submit', description: 'Confirm and submit for review' },
];

const DOC_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'passport', label: 'Passport' },
  { value: 'national_id', label: 'National ID Card' },
  { value: 'drivers_license', label: "Driver's Licence" },
];

interface UploadBoxProps {
  label: string;
  uploaded: boolean;
  onUpload: () => void;
}

function UploadBox({ label, uploaded, onUpload }: UploadBoxProps) {
  return (
    <button
      onClick={onUpload}
      className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed transition-all w-full"
      style={{
        borderColor: uploaded ? 'var(--primary)' : 'var(--border)',
        backgroundColor: uploaded ? 'rgba(245,196,0,0.06)' : 'transparent',
      }}
    >
      {uploaded ? (
        <CheckCircle size={20} style={{ color: 'var(--primary)' }} />
      ) : (
        <Upload size={20} style={{ color: 'var(--muted-foreground)' }} />
      )}
      <span className="text-xs font-medium" style={{ color: uploaded ? 'var(--primary)' : 'var(--muted-foreground)' }}>
        {uploaded ? 'Uploaded ✓' : label}
      </span>
    </button>
  );
}

export default function KYCVerificationFlow() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [kycStatus, setKycStatus] = useState<KYCStatus>('not_started');

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

  // Step 4 — Uploads
  const [frontUploaded, setFrontUploaded] = useState(false);
  const [backUploaded, setBackUploaded] = useState(false);
  const [selfieUploaded, setSelfieUploaded] = useState(false);
  const [poaUploaded, setPoaUploaded] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    await kycService.submitKYC('cust-001');
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setKycStatus('under_review');
    }, 1500);
  };

  const inputCls = "w-full text-xs px-3 py-2 rounded border outline-none transition-colors";
  const inputStyle = { backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(245,196,0,0.15)' }}>
          <Clock size={28} style={{ color: 'var(--primary)' }} />
        </div>
        <div>
          <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--foreground)' }}>Verification Under Review</h3>
          <p className="text-xs max-w-xs" style={{ color: 'var(--muted-foreground)' }}>
            Your documents have been submitted. Our compliance team will review within 1–2 business days. You'll be notified once verified.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded border text-xs" style={{ borderColor: 'rgba(245,196,0,0.3)', backgroundColor: 'rgba(245,196,0,0.06)', color: 'var(--muted-foreground)' }}>
          <Shield size={12} style={{ color: 'var(--primary)' }} />
          Reference: KYC-{Date.now().toString().slice(-8)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Step progress */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-1 flex-1">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  backgroundColor: step > s.id ? 'var(--primary)' : step === s.id ? 'rgba(245,196,0,0.2)' : 'var(--card)',
                  border: `1.5px solid ${step >= s.id ? 'var(--primary)' : 'var(--border)'}`,
                  color: step > s.id ? '#000' : step === s.id ? 'var(--primary)' : 'var(--muted-foreground)',
                }}
              >
                {step > s.id ? <CheckCircle size={12} /> : s.id}
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
      <div className="rounded-lg border p-4 space-y-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
        <div className="mb-2">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{STEPS[step - 1].title}</h3>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{STEPS[step - 1].description}</p>
        </div>

        {step === 1 && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--muted-foreground)' }}>First Name</label>
              <input className={inputCls} style={inputStyle} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--muted-foreground)' }}>Last Name</label>
              <input className={inputCls} style={inputStyle} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--muted-foreground)' }}>Date of Birth</label>
              <input type="date" className={inputCls} style={inputStyle} value={dob} onChange={e => setDob(e.target.value)} />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--muted-foreground)' }}>Nationality</label>
              <input className={inputCls} style={inputStyle} value={nationality} onChange={e => setNationality(e.target.value)} placeholder="e.g. British" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--muted-foreground)' }}>Street Address</label>
              <input className={inputCls} style={inputStyle} value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main Street" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--muted-foreground)' }}>City</label>
                <input className={inputCls} style={inputStyle} value={city} onChange={e => setCity(e.target.value)} placeholder="London" />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--muted-foreground)' }}>Postal Code</label>
                <input className={inputCls} style={inputStyle} value={postalCode} onChange={e => setPostalCode(e.target.value)} placeholder="SW1A 1AA" />
              </div>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--muted-foreground)' }}>Country</label>
              <input className={inputCls} style={inputStyle} value={country} onChange={e => setCountry(e.target.value)} placeholder="United Kingdom" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--muted-foreground)' }}>Document Type</label>
              <div className="flex gap-2">
                {DOC_TYPES.map(dt => (
                  <button key={dt.value} onClick={() => setDocType(dt.value)}
                    className="flex-1 text-xs py-2 px-3 rounded border transition-all"
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
                <label className="text-xs mb-1 block" style={{ color: 'var(--muted-foreground)' }}>Document Number</label>
                <input className={inputCls} style={inputStyle} value={docNumber} onChange={e => setDocNumber(e.target.value)} placeholder="e.g. 123456789" />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--muted-foreground)' }}>Expiry Date</label>
                <input type="date" className={inputCls} style={inputStyle} value={docExpiry} onChange={e => setDocExpiry(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <div className="p-2 rounded text-xs flex items-start gap-2" style={{ backgroundColor: 'rgba(245,196,0,0.06)', color: 'var(--muted-foreground)' }}>
              <AlertCircle size={12} className="mt-0.5 shrink-0" style={{ color: 'var(--primary)' }} />
              Ensure documents are clear, unobstructed and all four corners are visible. Max file size: 10MB per file.
            </div>
            <div className="grid grid-cols-2 gap-3">
              <UploadBox label="Document Front" uploaded={frontUploaded} onUpload={() => setFrontUploaded(true)} />
              <UploadBox label="Document Back" uploaded={backUploaded} onUpload={() => setBackUploaded(true)} />
              <UploadBox label="Selfie with Document" uploaded={selfieUploaded} onUpload={() => setSelfieUploaded(true)} />
              <UploadBox label="Proof of Address" uploaded={poaUploaded} onUpload={() => setPoaUploaded(true)} />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-3">
            <div className="space-y-2">
              {[
                ['Full Name', `${firstName} ${lastName}`],
                ['Date of Birth', dob || '—'],
                ['Nationality', nationality || '—'],
                ['Address', `${address}, ${city} ${postalCode}, ${country}`],
                ['Document Type', DOC_TYPES.find(d => d.value === docType)?.label || '—'],
                ['Document Number', docNumber || '—'],
                ['Document Expiry', docExpiry || '—'],
                ['Front Upload', frontUploaded ? '✓ Uploaded' : '✗ Missing'],
                ['Back Upload', backUploaded ? '✓ Uploaded' : '✗ Missing'],
                ['Selfie', selfieUploaded ? '✓ Uploaded' : '✗ Missing'],
                ['Proof of Address', poaUploaded ? '✓ Uploaded' : '✗ Missing'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-xs py-1 border-b" style={{ borderColor: 'var(--border)' }}>
                  <span style={{ color: 'var(--muted-foreground)' }}>{label}</span>
                  <span style={{ color: String(value).includes('✗') ? '#ef4444' : 'var(--foreground)' }}>{value}</span>
                </div>
              ))}
            </div>
            <div className="p-2 rounded text-xs" style={{ backgroundColor: 'rgba(245,196,0,0.06)', color: 'var(--muted-foreground)' }}>
              By submitting, you confirm all information is accurate and the documents are genuine.
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setStep(s => Math.max(1, s - 1))}
          disabled={step === 1}
          className="text-xs px-4 py-2 rounded border transition-colors disabled:opacity-40"
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
