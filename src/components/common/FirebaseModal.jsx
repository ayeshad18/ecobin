import React, { useState } from 'react';
import { Database, X, Copy, Check, ShieldCheck, Layers, FileCode } from 'lucide-react';
import { defaultFirebaseConfig, FIREBASE_SETUP_GUIDE } from '../../services/firebaseConfig';

export default function FirebaseModal({ isOpen, onClose }) {
  const [copiedConfig, setCopiedConfig] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(defaultFirebaseConfig, null, 2));
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-navy-900/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-sand-light border border-sand-border rounded-2xl max-w-2xl w-full shadow-elevated p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-sand-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-navy text-sand flex items-center justify-center shadow">
              <Database className="w-5 h-5 text-terracotta-light" />
            </div>
            <div>
              <h2 className="font-extrabold text-navy text-base sm:text-lg">
                Firebase Backend Architecture
              </h2>
              <p className="text-xs text-charcoal">
                Collection schemas for Authentication, Dustbins, Cleaning Logs & Reports
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-sand text-charcoal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-xs">
          <div className="bg-white p-4 rounded-xl border border-sand-border space-y-2">
            <h3 className="font-bold text-navy text-sm flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-terracotta" />
              <span>Modular Architecture Overview</span>
            </h3>
            <p className="text-charcoal leading-relaxed">
              EcoBin separates IoT telemetry (received via <strong>ThingSpeak</strong>) from relational persistence (managed via <strong>Firebase Firestore</strong>). The application currently runs with an in-memory &amp; localStorage replica that mirrors Firestore collections 1-to-1, allowing zero-friction offline execution.
            </p>
          </div>

          {/* Firestore Collections Table */}
          <div className="bg-white p-4 rounded-xl border border-sand-border space-y-2.5">
            <h4 className="font-bold text-navy uppercase tracking-wider text-[11px]">
              Firestore Collections &amp; Document Schemas
            </h4>
            <div className="space-y-2">
              <div className="bg-sand/40 p-2.5 rounded-lg border border-sand-border">
                <span className="font-mono font-bold text-navy">/dustbins/{'{binId}'}</span>
                <p className="text-charcoal text-[11px] mt-0.5">
                  Fields: <code>id, name, zone, location, fillLevel, distanceCm, tiltAngle, isOverturned, isOffline, batteryPercent, assignedStaffId, thingspeakField</code>
                </p>
              </div>

              <div className="bg-sand/40 p-2.5 rounded-lg border border-sand-border">
                <span className="font-mono font-bold text-navy">/cleaning_staff/{'{staffId}'}</span>
                <p className="text-charcoal text-[11px] mt-0.5">
                  Fields: <code>id, name, role, assignedZone, email, phone, shift, active</code>
                </p>
              </div>

              <div className="bg-sand/40 p-2.5 rounded-lg border border-sand-border">
                <span className="font-mono font-bold text-navy">/cleaning_records/{'{logId}'}</span>
                <p className="text-charcoal text-[11px] mt-0.5">
                  Fields: <code>id, binId, binName, staffId, staffName, cleanedAt, beforeFill, afterFill, notes</code>
                </p>
              </div>

              <div className="bg-sand/40 p-2.5 rounded-lg border border-sand-border">
                <span className="font-mono font-bold text-navy">/problem_reports/{'{reportId}'}</span>
                <p className="text-charcoal text-[11px] mt-0.5">
                  Fields: <code>id, binId, reportedBy, staffName, issueType, priority, description, status, createdAt</code>
                </p>
              </div>

              <div className="bg-sand/40 p-2.5 rounded-lg border border-sand-border">
                <span className="font-mono font-bold text-navy">/location_suggestions/{'{sugId}'}</span>
                <p className="text-charcoal text-[11px] mt-0.5">
                  Fields: <code>id, suggestedBy, staffName, locationName, zone, reason, expectedTraffic, status</code>
                </p>
              </div>
            </div>
          </div>

          {/* Config file reference */}
          <div className="bg-navy-dark text-sand-light p-3.5 rounded-xl border border-sand/15 font-mono text-[11px] space-y-2">
            <div className="flex items-center justify-between text-dusty-light">
              <span>src/services/firebaseConfig.js</span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-terracotta-light hover:text-white"
              >
                {copiedConfig ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedConfig ? 'Copied' : 'Copy Template'}</span>
              </button>
            </div>
            <pre className="text-sand/90 overflow-x-auto whitespace-pre">
              {JSON.stringify(defaultFirebaseConfig, null, 2)}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-2 border-t border-sand-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-navy text-sand font-bold text-xs"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
