import React, { useState } from 'react';

export const ArchitectureBlueprint: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'database' | 'algorithm' | 'telemetry'>('architecture');

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen font-sans pb-16">
      {/* Top Banner */}
      <div className="bg-slate-950 border-b border-slate-800 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-sky-400 uppercase tracking-wider">
              <span>SYSTEM ARCHITECTURE &amp; COMPLIANCE SPEC</span>
              <span>•</span>
              <span>VERSION 3.4-PROD</span>
            </div>
            <h1 className="font-headline font-black text-2xl sm:text-3xl text-white tracking-tight mt-1">
              MediLocator Technical Blueprint
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              Production architecture for multi-tenant generic medicine marketplace with 21 CFR Part 11 compliance, PostgreSQL Row-Level Security (RLS) isolation, salt bioequivalence extraction, and thermal cold-chain telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>100% RLS ENFORCED</span>
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 bg-slate-950/60 sticky top-10 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto py-2">
          {[
            { id: 'architecture', label: 'System Topology & Tiers', icon: 'hub' },
            { id: 'database', label: 'PostgreSQL RLS Multi-Tenancy', icon: 'database' },
            { id: 'algorithm', label: 'Salt Bioequivalence Engine', icon: 'biotech' },
            { id: 'telemetry', label: 'Cold-Chain IoT Stream', icon: 'sensors' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'architecture' && (
          <div className="space-y-8">
            {/* System Topology Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Tier 1: Client Ingress */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-sky-400 uppercase">TIER 01</span>
                    <span className="material-symbols-outlined text-sky-400">devices</span>
                  </div>
                  <h3 className="font-headline font-bold text-white text-base mt-2">Client Surfaces</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Multi-persona responsive web apps with offline PWA synchronization.
                  </p>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-700/50">
                    <span className="font-bold text-white block">Patient Mobile Web / PWA</span>
                    <span className="text-[11px] text-slate-400">Rx upload, savings comparison, live tracking</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-700/50">
                    <span className="font-bold text-white block">Pharmacist Terminal</span>
                    <span className="text-[11px] text-slate-400">300 DPI raw ingest, OCR diagnostics, FIFO SLA</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-700/50">
                    <span className="font-bold text-white block">Regulatory Authority Portal</span>
                    <span className="text-[11px] text-slate-400">21 CFR Part 11 audit trails &amp; partner KYC</span>
                  </div>
                </div>
              </div>

              {/* Tier 2: Gateway & Security */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-teal-400 uppercase">TIER 02</span>
                    <span className="material-symbols-outlined text-teal-400">security</span>
                  </div>
                  <h3 className="font-headline font-bold text-white text-base mt-2">Perimeter &amp; Gateway</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    High-throughput TLS 1.3 reverse proxy with tokenized tenant claim parsing.
                  </p>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-700/50">
                    <span className="font-bold text-white block">Kong API Gateway / WAF</span>
                    <span className="text-[11px] text-slate-400">Rate limiting, IP whitelisting, DDoS guard</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-700/50">
                    <span className="font-bold text-white block">JWT &amp; RBAC Verifier</span>
                    <span className="text-[11px] text-slate-400">Injects tenant_id into downstream PostgreSQL context</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-700/50">
                    <span className="font-bold text-white block">mTLS Health Mesh</span>
                    <span className="text-[11px] text-slate-400">Zero-trust microservice communication</span>
                  </div>
                </div>
              </div>

              {/* Tier 3: Core Domain Services */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">TIER 03</span>
                    <span className="material-symbols-outlined text-amber-400">memory</span>
                  </div>
                  <h3 className="font-headline font-bold text-white text-base mt-2">Microservices Core</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Containerized business logic executing regulatory and clinical workflows.
                  </p>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-700/50">
                    <span className="font-bold text-white block">OCR Medical Ingest Engine</span>
                    <span className="text-[11px] text-slate-400">300 DPI edge multi-band handwritten doctor extraction</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-700/50">
                    <span className="font-bold text-white block">Salt Reconciliation Microservice</span>
                    <span className="text-[11px] text-slate-400">FDA Orange Book "AB" bioequivalence mapper</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-700/50">
                    <span className="font-bold text-white block">IoT Cold-Chain Telemetry Broker</span>
                    <span className="text-[11px] text-slate-400">MQTT ingestion for real-time 2°C - 8°C couriers</span>
                  </div>
                </div>
              </div>

              {/* Tier 4: Data & Compliance Persistence */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">TIER 04</span>
                    <span className="material-symbols-outlined text-emerald-400">storage</span>
                  </div>
                  <h3 className="font-headline font-bold text-white text-base mt-2">Data &amp; Compliance Tier</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Cryptographically audited persistence with strict Row-Level Security.
                  </p>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-700/50">
                    <span className="font-bold text-emerald-400 block">PostgreSQL (RLS Enforced)</span>
                    <span className="text-[11px] text-slate-400">Zero cross-tenant leakage for prescriptions</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-700/50">
                    <span className="font-bold text-teal-300 block">Redis In-Memory Salt Cache</span>
                    <span className="text-[11px] text-slate-400">104,821 active salt formulations at 1.2ms latency</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-700/50">
                    <span className="font-bold text-purple-300 block">Immutable Audit Ledger</span>
                    <span className="text-[11px] text-slate-400">21 CFR Part 11 SHA-256 tamper-evident log</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Architecture Metrics */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
              <h3 className="font-headline font-bold text-white text-base mb-4">
                Real-Time Cluster Telemetry
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-400 uppercase font-mono text-[10px]">Average Salt Lookup Latency</div>
                  <div className="text-emerald-400 font-mono text-xl font-bold mt-1">1.24 ms</div>
                  <div className="text-[10px] text-slate-500 mt-1">Redis Hot In-Memory Cache</div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-400 uppercase font-mono text-[10px]">RLS Isolation Failures</div>
                  <div className="text-emerald-400 font-mono text-xl font-bold mt-1">0 (0.00%)</div>
                  <div className="text-[10px] text-slate-500 mt-1">Formal Postgres Verification</div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-400 uppercase font-mono text-[10px]">Pharmacist TAT Median</div>
                  <div className="text-sky-400 font-mono text-xl font-bold mt-1">11.2 mins</div>
                  <div className="text-[10px] text-slate-500 mt-1">Statutory Target &lt; 15m</div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-400 uppercase font-mono text-[10px]">Cold Chain Outliers</div>
                  <div className="text-emerald-400 font-mono text-xl font-bold mt-1">0 Breaches</div>
                  <div className="text-[10px] text-slate-500 mt-1">All Deliveries 2°C - 8°C</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'database' && (
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline font-bold text-white text-base">
                    PostgreSQL Row-Level Security (RLS) Multi-Tenant Enclosure
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tenant isolation is mathematically enforced at the PostgreSQL database engine level using session variables.
                  </p>
                </div>
                <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">
                  21 CFR Part 11 Validated
                </span>
              </div>

              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
                <pre className="text-sky-300">
{`-- 1. Enable Row-Level Security on sensitive clinical tables
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispensing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_batches ENABLE ROW LEVEL SECURITY;

-- 2. Define Tenant Isolation Policy for active Dispensary Node
CREATE POLICY tenant_isolation_policy ON prescriptions
  FOR ALL
  TO clinical_app_user
  USING (tenant_id = current_setting('app.current_tenant_id', true)::VARCHAR)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true)::VARCHAR);

-- 3. Application session context injection (run on connection acquisition)
SET LOCAL app.current_tenant_id = 'tenant_pharmacy_001';

-- 4. Query is automatically scoped with zero cross-pharmacy leakage
SELECT id, patient_mrn, brand_prescribed, generic_dispensed, status
FROM prescriptions
WHERE status = 'QUEUED_FOR_DISPENSE';`}
                </pre>
              </div>

              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs space-y-2">
                <span className="font-bold text-white block">Why Row-Level Security (RLS)?</span>
                <p className="text-slate-400 leading-relaxed">
                  In healthcare SaaS, sharing a physical database across hundreds of independent retail pharmacies without RLS risks catastrophic HIPAA and Drug Act violations if a developer forgets a <code>WHERE tenant_id = ...</code> clause. PostgreSQL RLS intercepts every SQL execution at the database kernel, ensuring that no pharmacy node can ever see or modify another pharmacy's prescription records.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'algorithm' && (
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-headline font-bold text-white text-base">
                Autonomous Salt Extraction &amp; Bioequivalence Matching Algorithm
              </h3>
              <p className="text-xs text-slate-400">
                Deterministic 4-phase therapeutic substitution pipeline adhering to FDA Orange Book standards.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500 text-white font-bold text-xs flex items-center justify-center">1</span>
                    <span className="font-bold text-white text-xs">INN Salt Normalization</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Extracts raw handwritten and OCR text, stripping brand trade names (e.g. Lipitor®) into international nonproprietary names (Atorvastatin Calcium Trihydrate).
                  </p>
                </div>

                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500 text-white font-bold text-xs flex items-center justify-center">2</span>
                    <span className="font-bold text-white text-xs">Dosage &amp; Release Verification</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Verifies equivalent physical form (Oral Tablet, Capsule, Solution) and pharmacokinetic release characteristics (IR vs ER/XR) to prevent dose dumping.
                  </p>
                </div>

                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500 text-white font-bold text-xs flex items-center justify-center">3</span>
                    <span className="font-bold text-white text-xs">Therapeutic Equivalence Check</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Queries the FDA Orange Book registry to ensure an "AB" rating, certifying that in vivo dissolution curves and AUC values match within 90% confidence limits.
                  </p>
                </div>

                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center">4</span>
                    <span className="font-bold text-white text-xs">Statutory Price Ceiling Audit</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Validates against national ceiling price databases (NPPA / statutory caps) to maximize consumer cost savings before displaying substitution.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'telemetry' && (
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline font-bold text-white text-base">
                    MQTT Cold-Chain Thermal Sensor Telemetry Stream
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live temperature monitoring preventing temperature excursion for biologicals, insulins, and sensitive APIs.
                  </p>
                </div>
                <span className="font-mono text-xs text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded">
                  Topic: telemetry/coldchain/courier_442
                </span>
              </div>

              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto">
                <pre>
{`{
  "courier_id": "courier_442",
  "order_id": "ORD-2026-9942",
  "dispensary_node": "tenant_pharmacy_001",
  "temperature_celsius": 4.0,
  "safe_band": { "min": 2.0, "max": 8.0 },
  "excursion_detected": false,
  "tamper_seal_intact": true,
  "location": {
    "lat": 40.7589,
    "lng": -73.9851,
    "speed_kmh": 22.4
  },
  "battery_pct": 94,
  "timestamp": "2026-09-07T14:38:12Z",
  "signature": "0x32ba119f801bc4a7"
}`}
                </pre>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
