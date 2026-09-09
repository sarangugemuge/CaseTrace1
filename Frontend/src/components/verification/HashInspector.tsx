'use client';

import React, { useState, useEffect } from 'react';
import { verificationService } from '../../services/verificationService';
import {
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  CheckCircle,
  RefreshCw,
  Upload,
  Copy,
  Check,
  Zap,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface PresetItem {
  id: string;
  name: string;
  payload: string;
  originalHash: string;
  description: string;
}

const PRESETS: PresetItem[] = [
  {
    id: 'fir',
    name: 'FIR #8942 First Information Report',
    payload: 'OFFICIAL_CASE_PAYLOAD_FIR_2026_CASE_8942_OPERATION_DARKLEDGE',
    originalHash: verificationService.generateHash('OFFICIAL_CASE_PAYLOAD_FIR_2026_CASE_8942_OPERATION_DARKLEDGE'),
    description: 'Lodged at Central Cyber Precinct. Authenticated by Insp. Jenkins.',
  },
  {
    id: 'wire-log',
    name: 'Wire Transfer Audit Export',
    payload: 'SWIFT_TRANSFER:TX-99420:FROM=OFFSHORE_01:TO=SYNDICATE_B:AMOUNT=$42,500,000.00:TIMESTAMP=2026-02-10T14:30:00Z',
    originalHash: verificationService.generateHash('SWIFT_TRANSFER:TX-99420:FROM=OFFSHORE_01:TO=SYNDICATE_B:AMOUNT=$42,500,000.00:TIMESTAMP=2026-02-10T14:30:00Z'),
    description: 'Financial forensic audit record of illicit syndicate wire transfers.',
  },
  {
    id: 'memory-dump',
    name: 'C2 Node Volatile RAM Dump Hash',
    payload: 'RAW_MEM_IMAGE:HOST=C2-ALPHA:DUMP_SIZE=32400MB:ACQUISITION=READONLY_WRITEBLOCKER',
    originalHash: verificationService.generateHash('RAW_MEM_IMAGE:HOST=C2-ALPHA:DUMP_SIZE=32400MB:ACQUISITION=READONLY_WRITEBLOCKER'),
    description: 'Forensic volatile memory acquisition from primary command server.',
  },
];

export const HashInspector: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('fir');

  const [contentInput, setContentInput] = useState(PRESETS[0].payload);
  const [originalHash, setOriginalHash] = useState(PRESETS[0].originalHash);
  const [currentHash, setCurrentHash] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isTampered, setIsTampered] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    status: 'INTEGRITY VERIFIED' | 'INTEGRITY MISMATCH';
    isMatch: boolean;
    details: string;
  } | null>(null);

  // Compute live hash and verify whenever content or original hash changes
  useEffect(() => {
    if (activeTab === 'text') {
      const computed = verificationService.generateHash(contentInput);
      setCurrentHash(computed);

      const match = verificationService.verifyHash(computed, originalHash);
      setVerificationResult({
        status: match ? 'INTEGRITY VERIFIED' : 'INTEGRITY MISMATCH',
        isMatch: match,
        details: match
          ? 'Bit-exact SHA-256 match. Current payload matches original registered reference digest 100%.'
          : 'Tamper Alert! Current computed hash differs from the original registered hash.',
      });
    }
  }, [contentInput, originalHash, activeTab]);

  const handleSelectPreset = (preset: PresetItem) => {
    setSelectedPresetId(preset.id);
    setContentInput(preset.payload);
    setOriginalHash(preset.originalHash);
    setIsTampered(false);
    setUploadedFileName(null);
  };

  const handleSimulateTamper = () => {
    if (isTampered) return;
    setIsTampered(true);
    // Alter 1 character in the content to demonstrate avalanche effect
    setContentInput((prev) => `${prev} [TAMPERED_1_BYTE]`);
  };

  const handleRestoreOriginal = () => {
    const found = PRESETS.find((p) => p.id === selectedPresetId);
    if (found) {
      setContentInput(found.payload);
      setOriginalHash(found.originalHash);
    }
    setIsTampered(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    try {
      const hash = await verificationService.computeFileHash(file);
      setCurrentHash(hash);

      const match = verificationService.verifyHash(hash, originalHash);
      setVerificationResult({
        status: match ? 'INTEGRITY VERIFIED' : 'INTEGRITY MISMATCH',
        isMatch: match,
        details: match
          ? `File "${file.name}" bit-matches the expected reference hash.`
          : `File "${file.name}" hash does NOT match the expected reference hash.`,
      });
    } catch (err) {
      console.error('File hashing error:', err);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-6 shadow-card transition-colors space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-navy-800 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Cryptographic SHA-256 Evidence Integrity Validator
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-sans">
            SHA-256 Verification: Checks whether the document or evidence has changed since it was registered by comparing 64-character mathematical fingerprints bit-for-bit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 px-2.5 py-1 rounded font-bold">
            FIPS 180-4 COMPLIANT
          </span>
          <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-400 border border-blue-300 dark:border-blue-800 px-2.5 py-1 rounded font-bold">
            256-BIT CRYPTO
          </span>
        </div>
      </div>

      {/* Preset Quick-Load Selector */}
      <div className="bg-slate-50 dark:bg-navy-950 p-3.5 rounded-lg border border-slate-200 dark:border-navy-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Quick-Load Official Case Artifacts:
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setActiveTab('text')}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-colors ${
                activeTab === 'text'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 dark:bg-navy-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Payload / Text Mode
            </button>
            <button
              onClick={() => setActiveTab('file')}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-colors ${
                activeTab === 'file'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 dark:bg-navy-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Upload Any File Mode
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(p)}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                selectedPresetId === p.id && !uploadedFileName
                  ? 'bg-blue-50/80 dark:bg-navy-850 border-blue-500 dark:border-blue-500'
                  : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 hover:border-slate-300 dark:hover:border-navy-700'
              }`}
            >
              <div className="font-bold text-slate-900 dark:text-white text-[11px] truncate">{p.name}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{p.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Inputs Section */}
      <div className="space-y-4">
        {activeTab === 'text' ? (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="payload-input" className="block text-slate-700 dark:text-slate-300 font-bold">
                Evidence Payload / Live Content Under Verification:
              </label>
              <div className="flex items-center gap-2">
                {isTampered ? (
                  <button
                    type="button"
                    onClick={handleRestoreOriginal}
                    className="px-2 py-0.5 bg-slate-200 dark:bg-navy-800 hover:bg-slate-300 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 rounded text-[10px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Restore Authentic Original
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSimulateTamper}
                    className="px-2.5 py-0.5 bg-rose-100 dark:bg-rose-950/80 hover:bg-rose-200 dark:hover:bg-rose-900 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 rounded text-[10px] font-bold flex items-center gap-1 transition-colors"
                    title="Simulate modifying a single character to demonstrate SHA-256 avalanche effect"
                  >
                    <Zap className="w-3 h-3 text-rose-500" />
                    Simulate 1-Byte Tamper
                  </button>
                )}
              </div>
            </div>
            <textarea
              id="payload-input"
              aria-label="Evidence payload content under verification"
              value={contentInput}
              onChange={(e) => {
                setContentInput(e.target.value);
                setIsTampered(false);
              }}
              rows={3}
              className={`w-full bg-slate-100 dark:bg-navy-950 border rounded-lg p-2.5 text-slate-900 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors ${
                isTampered
                  ? 'border-rose-500 focus:border-rose-500 bg-rose-50/30 dark:bg-rose-950/20'
                  : 'border-slate-300 dark:border-navy-800 focus:border-blue-500'
              }`}
            />
            {isTampered && (
              <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                SIMULATION ACTIVE: 1 byte modified in payload. Notice how the Current Hash completely diverges!
              </p>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
              Select Local File to Verify:
            </label>
            <div className="border-2 border-dashed border-slate-300 dark:border-navy-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl p-5 text-center transition-colors bg-slate-50/50 dark:bg-navy-950/50">
              <input
                type="file"
                id="file-inspector-input"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="file-inspector-input"
                className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
              >
                <Upload className="w-6 h-6 text-blue-500" />
                <span className="font-bold text-slate-900 dark:text-white">
                  {uploadedFileName ? uploadedFileName : 'Click to select any local evidence file to hash'}
                </span>
                <span className="text-[10px] text-slate-400">
                  Computes genuine SHA-256 hash locally in browser via Web Crypto API
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Expected/Original Reference Hash Input */}
        <div>
          <label htmlFor="original-hash-input" className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
            Original Hash (Authoritative Reference Anchor):
          </label>
          <input
            id="original-hash-input"
            aria-label="Authoritative reference 64-character SHA-256 hash"
            type="text"
            value={originalHash}
            onChange={(e) => setOriginalHash(e.target.value.trim())}
            placeholder="64-character hexadecimal SHA-256 digest"
            className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-800 rounded-lg p-2.5 text-slate-900 dark:text-slate-200 font-bold focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Side-by-Side Comparison Display */}
      <div className="bg-slate-50 dark:bg-navy-950 p-4 rounded-xl border border-slate-200 dark:border-navy-800 space-y-3">
        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-navy-800 pb-2">
          Cryptographic Digest Comparison (Bit-by-Bit Analysis)
        </div>

        {/* Original Hash Row */}
        <div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-bold">ORIGINAL HASH (REGISTERED REFERENCE):</span>
            <button
              onClick={() => handleCopy(originalHash, 'original')}
              className="flex items-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {copiedField === 'original' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copiedField === 'original' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <code className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-2 rounded block break-all text-[11px] text-blue-600 dark:text-blue-400 font-bold">
            {originalHash || '(None specified)'}
          </code>
        </div>

        {/* Current Hash Row */}
        <div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-bold">CURRENT HASH (COMPUTED FROM LIVE PAYLOAD):</span>
            <button
              onClick={() => handleCopy(currentHash, 'current')}
              className="flex items-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {copiedField === 'current' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copiedField === 'current' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <code
            className={`p-2 rounded block break-all text-[11px] font-bold border transition-colors ${
              verificationResult?.isMatch
                ? 'bg-emerald-50/60 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                : 'bg-rose-50/60 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400'
            }`}
          >
            {currentHash || '(Computing...)'}
          </code>
        </div>
      </div>

      {/* Primary Verification Result Banner */}
      {verificationResult && (
        <div
          className={`p-5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono shadow-xs transition-all ${
            verificationResult.isMatch
              ? 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/90 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                verificationResult.isMatch ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white animate-pulse'
              }`}
            >
              {verificationResult.isMatch ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="text-base font-extrabold tracking-wider">
                {verificationResult.status}
              </div>
              <div className="text-xs font-sans font-bold opacity-90 mt-0.5">
                {verificationResult.isMatch
                  ? 'Integrity Verified: Document has not changed since registration.'
                  : 'Tamper Alert: Content has been modified since registration.'}
              </div>
              <div className="text-[11px] opacity-85 mt-0.5 font-sans">
                {verificationResult.details}
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span
              className={`px-3 py-1 rounded text-[11px] font-bold inline-block uppercase border ${
                verificationResult.isMatch
                  ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border-emerald-400 dark:border-emerald-700'
                  : 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 border-rose-400 dark:border-rose-700'
              }`}
            >
              {verificationResult.isMatch ? '100% BIT-EXACT MATCH' : 'HASH MISMATCH DETECTED'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
