import React, { useState } from 'react';
import { 
  Trash2, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  Lock, 
  Mail, 
  Radio, 
  Cpu, 
  Layers, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function LoginPage({ onLogin, allStaff }) {
  const [activeTab, setActiveTab] = useState('staff'); // 'staff' | 'admin'
  const [selectedStaffId, setSelectedStaffId] = useState(allStaff[0]?.id || 'staff-01');
  const [adminEmail, setAdminEmail] = useState('facilities.admin@campus.edu');
  const [adminPassword, setAdminPassword] = useState('campus@2026');
  const [staffPassword, setStaffPassword] = useState('staff123');
  const [authError, setAuthError] = useState('');

  const handleStaffLogin = (e) => {
    e.preventDefault();
    setAuthError('');
    const staff = allStaff.find(s => s.id === selectedStaffId);
    if (!staff) {
      setAuthError('Please select a valid staff member');
      return;
    }
    onLogin(staff);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setAuthError('');
    if (!adminEmail) {
      setAuthError('Please enter admin email');
      return;
    }
    const adminUser = {
      id: 'admin-01',
      name: 'Dr. Aris Thorne',
      role: 'Administration Center',
      email: adminEmail,
      department: 'Campus Operations & Facilities'
    };
    onLogin(adminUser);
  };

  const currentSelectedStaff = allStaff.find(s => s.id === selectedStaffId) || allStaff[0];

  return (
    <div className="min-h-screen bg-sand flex flex-col justify-between">
      {/* Top Banner */}
      <div className="bg-navy text-sand py-4 px-6 border-b border-sand/15">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-terracotta to-terracotta-dark flex items-center justify-center text-white shadow-md">
              <Trash2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight">EcoBin</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sand/10 text-sand-light border border-sand/20">
                  ESP32 • ThingSpeak • Firebase
                </span>
              </div>
              <p className="text-xs text-dusty-light">Smarter Waste. Better Campuses.</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-dusty-light">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>College IoT Telemetry Gateway Ready</span>
          </div>
        </div>
      </div>

      {/* Main Login Card Area */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col justify-center">
        
        {/* Intro Tagline */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
            Campus Smart Waste System
          </h1>
          <p className="mt-2 text-sm sm:text-base text-charcoal max-w-xl mx-auto">
            Real-time ultrasonic fill monitoring, tilt detection, and streamlined campus cleaning operations. Select your portal below to continue.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="bg-sand-light p-1.5 rounded-2xl border border-sand-border shadow-soft flex mb-6 max-w-md mx-auto w-full">
          <button
            type="button"
            onClick={() => { setActiveTab('staff'); setAuthError(''); }}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'staff'
                ? 'bg-navy text-sand shadow-md'
                : 'text-charcoal hover:text-navy hover:bg-sand/60'
            }`}
          >
            <Users className="w-4 h-4 text-terracotta-light" />
            <span>Cleaning Staff Portal</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('admin'); setAuthError(''); }}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'admin'
                ? 'bg-navy text-sand shadow-md'
                : 'text-charcoal hover:text-navy hover:bg-sand/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-dusty-light" />
            <span>Administration Center</span>
          </button>
        </div>

        {/* Error message */}
        {authError && (
          <div className="mb-4 max-w-md mx-auto w-full p-3 rounded-xl bg-terracotta/15 border border-terracotta text-terracotta-dark text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* Portal 1: Cleaning Staff Login */}
        {activeTab === 'staff' && (
          <div className="bg-sand-light border border-sand-border rounded-2xl shadow-elevated p-6 sm:p-8 max-w-xl mx-auto w-full transition-all">
            <div className="flex items-center gap-3 pb-4 border-b border-sand-border/80">
              <div className="w-10 h-10 rounded-xl bg-dusty/30 text-navy flex items-center justify-center font-bold">
                <Users className="w-5 h-5 text-navy" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-navy">Cleaning Staff Sign-In</h2>
                <p className="text-xs text-charcoal">
                  Access your assigned campus zones, live bin fill levels, and mark completed shifts.
                </p>
              </div>
            </div>

            <form onSubmit={handleStaffLogin} className="mt-5 space-y-4">
              {/* Select Staff Member */}
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">
                  Select Staff Member Profile
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {allStaff.map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setSelectedStaffId(st.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedStaffId === st.id
                          ? 'border-terracotta bg-terracotta/10 ring-2 ring-terracotta/40'
                          : 'border-sand-border bg-white hover:border-dusty'
                      }`}
                    >
                      <div className="font-bold text-navy text-xs sm:text-sm">{st.name}</div>
                      <div className="text-[11px] text-terracotta font-semibold">{st.assignedZone}</div>
                      <div className="text-[10px] text-charcoal-light mt-1">{st.shift.split(' ')[0]}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Staff Details Card */}
              {currentSelectedStaff && (
                <div className="bg-sand/60 border border-sand-border p-3.5 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between text-navy">
                    <span className="text-charcoal">Assigned Area:</span>
                    <span className="font-bold">{currentSelectedStaff.assignedZone}</span>
                  </div>
                  <div className="flex justify-between text-navy">
                    <span className="text-charcoal">Official Email:</span>
                    <span className="font-mono text-[11px]">{currentSelectedStaff.email}</span>
                  </div>
                  <div className="flex justify-between text-navy">
                    <span className="text-charcoal">Contact Radio:</span>
                    <span className="font-mono text-[11px]">{currentSelectedStaff.phone}</span>
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  Staff Passcode
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-charcoal-light" />
                  <input
                    type="password"
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    placeholder="Enter staff PIN or passcode"
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-sand-border rounded-xl text-xs sm:text-sm text-navy focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
                  />
                </div>
                <p className="text-[10px] text-charcoal-light mt-1">
                  * Demo mode: Pre-filled passcode is ready for instant sign-in.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-terracotta hover:bg-terracotta-dark text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <span>Enter Cleaning Staff Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Portal 2: Administration Center Login */}
        {activeTab === 'admin' && (
          <div className="bg-sand-light border border-sand-border rounded-2xl shadow-elevated p-6 sm:p-8 max-w-xl mx-auto w-full transition-all">
            <div className="flex items-center gap-3 pb-4 border-b border-sand-border/80">
              <div className="w-10 h-10 rounded-xl bg-navy text-sand flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5 text-terracotta-light" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-navy">Administration Center Portal</h2>
                <p className="text-xs text-charcoal">
                  Campus Facilities Management, IoT fleet governance, and maintenance audit logs.
                </p>
              </div>
            </div>

            <form onSubmit={handleAdminLogin} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  Administrative Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-charcoal-light" />
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                    placeholder="facilities.admin@campus.edu"
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-sand-border rounded-xl text-xs sm:text-sm text-navy focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  Master Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-charcoal-light" />
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-sand-border rounded-xl text-xs sm:text-sm text-navy focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
                  />
                </div>
              </div>

              {/* Admin Privileges Checklist */}
              <div className="bg-navy/5 border border-sand-border p-3 rounded-xl text-xs space-y-1.5 text-charcoal">
                <div className="text-[11px] font-bold text-navy">Administrator Privileges:</div>
                <div className="flex items-center gap-2 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-dusty" />
                  <span>Add, edit, deactivate & remove IoT bins across all zones</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-dusty" />
                  <span>Assign and reallocate cleaning staff to campus sectors</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-dusty" />
                  <span>Triage staff problem reports and approve new location requests</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-dusty" />
                  <span>Audit cleaning logs and export official CSV reports</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-navy hover:bg-navy-light text-sand font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <span>Enter Administration Center</span>
                <ArrowRight className="w-4 h-4 text-terracotta-light" />
              </button>
            </form>
          </div>
        )}

        {/* Quick Demo Shortcuts */}
        <div className="mt-8 text-center">
          <p className="text-xs font-semibold text-charcoal mb-2">
            Direct Evaluation Shortcuts:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => onLogin(allStaff[0])}
              className="px-3 py-1.5 rounded-lg bg-white border border-sand-border text-xs font-medium text-navy hover:border-terracotta hover:text-terracotta transition-colors shadow-sm"
            >
              🧹 Demo: Rajesh Kumar (North Staff)
            </button>
            <button
              onClick={() => onLogin(allStaff[1])}
              className="px-3 py-1.5 rounded-lg bg-white border border-sand-border text-xs font-medium text-navy hover:border-terracotta hover:text-terracotta transition-colors shadow-sm"
            >
              🧹 Demo: Maria Santos (Central Staff)
            </button>
            <button
              onClick={() => onLogin({
                id: 'admin-01',
                name: 'Dr. Aris Thorne',
                role: 'Administration Center',
                email: 'facilities.admin@campus.edu',
                department: 'Campus Operations & Facilities'
              })}
              className="px-3 py-1.5 rounded-lg bg-white border border-sand-border text-xs font-medium text-navy hover:border-navy hover:text-terracotta-dark transition-colors shadow-sm"
            >
              🏢 Demo: Dr. Thorne (Admin Center)
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="bg-sand-light border-t border-sand-border py-4 px-6 text-center text-xs text-charcoal">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>EcoBin</strong> — College IoT Smart Campus Project
          </div>
          <div className="flex items-center gap-4 text-charcoal-light">
            <span>ESP32 + HC-SR04 + MPU6050</span>
            <span>•</span>
            <span>ThingSpeak REST API</span>
            <span>•</span>
            <span>Firebase Firestore Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
