import React, { useState } from 'react';
import { 
  Trash2, 
  Wifi, 
  Radio, 
  ShieldAlert, 
  User, 
  Sliders, 
  LogOut, 
  ChevronDown, 
  RefreshCw,
  Database,
  Menu,
  X
} from 'lucide-react';

export default function Navbar({ 
  currentUser, 
  onLogout, 
  onSwitchUser, 
  allStaff, 
  iotConfig, 
  onOpenIotModal, 
  onOpenFirebaseModal,
  onRefreshData,
  isRefreshing
}) {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isStaff = currentUser?.role === 'Cleaning Staff';

  return (
    <header className="bg-navy text-sand border-b border-sand/10 sticky top-0 z-40 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-terracotta to-terracotta-dark flex items-center justify-center text-white shadow-md">
              <Trash2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-sand">EcoBin</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sand/15 text-sand-light border border-sand/20">
                  IoT Campus v1.0
                </span>
              </div>
              <p className="text-xs text-dusty-light hidden sm:block">
                Smarter Waste. Better Campuses.
              </p>
            </div>
          </div>

          {/* Desktop Right Controls */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* IoT Live/Simulation Status Pill */}
            <button
              onClick={onOpenIotModal}
              title="Click to configure ThingSpeak & ESP32 Telemetry"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                iotConfig.useSimulated
                  ? 'bg-navy-light text-sand-light border-sand/20 hover:border-terracotta/50'
                  : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/50'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  iotConfig.useSimulated ? 'bg-terracotta' : 'bg-emerald-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  iotConfig.useSimulated ? 'bg-terracotta' : 'bg-emerald-500'
                }`}></span>
              </span>
              <span className="font-mono">
                {iotConfig.useSimulated ? 'ESP32 Sim Feed' : `ThingSpeak #${iotConfig.channelId}`}
              </span>
              <Sliders className="w-3.5 h-3.5 text-dusty" />
            </button>

            {/* Manual Refresh Button */}
            <button
              onClick={onRefreshData}
              disabled={isRefreshing}
              title="Refresh sensor data now"
              className="p-2 rounded-lg bg-navy-light hover:bg-navy-dark text-dusty-light hover:text-sand border border-sand/10 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-terracotta' : ''}`} />
            </button>

            {/* Firebase Guide Button */}
            <button
              onClick={onOpenFirebaseModal}
              title="View Firebase Backend Integration Architecture"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-light hover:bg-navy-dark text-xs font-medium text-sand-light border border-sand/10 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-dusty-light" />
              <span>Backend Config</span>
            </button>

            {/* Role & Profile Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sand/10 hover:bg-sand/15 text-sand border border-sand/20 transition-all text-xs font-semibold"
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isStaff ? 'bg-dusty text-navy' : 'bg-terracotta text-white'
                }`}>
                  {isStaff ? 'ST' : 'AD'}
                </div>
                <div className="text-left">
                  <div className="leading-tight">{currentUser.name}</div>
                  <div className="text-[10px] text-dusty-light font-normal">
                    {isStaff ? `${currentUser.assignedZone}` : 'Administration'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-dusty" />
              </button>

              {/* Role Dropdown Menu */}
              {showRoleDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-navy-light border border-sand/20 rounded-xl shadow-elevated py-2 z-50 text-xs"
                  onClick={() => setShowRoleDropdown(false)}
                >
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-dusty tracking-wider border-b border-sand/10">
                    Switch Active Account (Demo)
                  </div>

                  {/* Admin Account */}
                  <button
                    onClick={() => onSwitchUser({
                      id: 'admin-01',
                      name: 'Dr. Aris Thorne',
                      role: 'Administration Center',
                      email: 'facilities.admin@campus.edu',
                      department: 'Campus Operations & Facilities'
                    })}
                    className="w-full text-left px-3 py-2 hover:bg-navy flex items-center justify-between text-sand transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-terracotta-light">Dr. Aris Thorne</div>
                      <div className="text-[11px] text-dusty-light">Administration Center</div>
                    </div>
                    {!isStaff && <span className="text-terracotta font-bold">✓</span>}
                  </button>

                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-dusty tracking-wider border-t border-sand/10 mt-1">
                    Cleaning Staff Profiles
                  </div>

                  {allStaff.map(st => (
                    <button
                      key={st.id}
                      onClick={() => onSwitchUser(st)}
                      className="w-full text-left px-3 py-2 hover:bg-navy flex items-center justify-between text-sand transition-colors"
                    >
                      <div>
                        <div className="font-semibold">{st.name}</div>
                        <div className="text-[11px] text-dusty-light">Zone: {st.assignedZone}</div>
                      </div>
                      {currentUser.id === st.id && <span className="text-terracotta font-bold">✓</span>}
                    </button>
                  ))}

                  <div className="border-t border-sand/10 mt-2 pt-1 px-2">
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-terracotta-light hover:bg-terracotta/10 text-left font-medium transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out to Login Screen</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Logout Icon */}
            <button
              onClick={onLogout}
              title="Logout"
              className="p-2 rounded-lg bg-navy-light hover:bg-terracotta/20 text-dusty-light hover:text-terracotta-light border border-sand/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenIotModal}
              className="p-1.5 rounded-lg bg-navy-light text-terracotta-light border border-sand/10"
              title="IoT Settings"
            >
              <Radio className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-navy-light text-sand border border-sand/10"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-sand/15 bg-navy-dark px-4 py-4 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-sand/10">
            <div>
              <div className="font-bold text-sand text-sm">{currentUser.name}</div>
              <div className="text-xs text-dusty-light">
                {isStaff ? `Cleaning Staff • ${currentUser.assignedZone}` : 'Administration Center'}
              </div>
            </div>
            <button
              onClick={onRefreshData}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-navy-light text-xs text-sand"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-terracotta' : ''}`} />
              Sync
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => { onOpenIotModal(); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-navy-light text-sand-light border border-sand/10"
            >
              <Sliders className="w-4 h-4 text-terracotta" />
              <span>IoT & Simulator</span>
            </button>
            <button
              onClick={() => { onOpenFirebaseModal(); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-navy-light text-sand-light border border-sand/10"
            >
              <Database className="w-4 h-4 text-dusty" />
              <span>Firebase Setup</span>
            </button>
          </div>

          <div className="pt-2 border-t border-sand/10">
            <div className="text-[11px] font-bold text-dusty uppercase tracking-wider mb-2">Switch Account</div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onSwitchUser({
                    id: 'admin-01',
                    name: 'Dr. Aris Thorne',
                    role: 'Administration Center',
                    email: 'facilities.admin@campus.edu'
                  });
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs flex justify-between ${
                  !isStaff ? 'bg-terracotta/20 text-terracotta-light font-bold' : 'bg-navy-light text-sand'
                }`}
              >
                <span>Dr. Aris Thorne (Admin)</span>
                {!isStaff && <span>✓</span>}
              </button>
              {allStaff.map(st => (
                <button
                  key={st.id}
                  onClick={() => { onSwitchUser(st); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex justify-between ${
                    currentUser.id === st.id ? 'bg-dusty/30 text-sand font-bold' : 'bg-navy-light text-sand-light'
                  }`}
                >
                  <span>{st.name} ({st.assignedZone})</span>
                  {currentUser.id === st.id && <span>✓</span>}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => { onLogout(); setMobileMenuOpen(false); }}
            className="w-full flex items-center justify-center gap-2 py-2 mt-2 rounded-lg bg-terracotta/15 text-terracotta-light text-xs font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </header>
  );
}
