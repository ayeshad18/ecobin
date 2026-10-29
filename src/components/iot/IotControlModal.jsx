import React, { useState } from 'react';
import { 
  Radio, 
  Wifi, 
  Sliders, 
  Check, 
  X, 
  RefreshCw, 
  AlertTriangle, 
  ShieldCheck, 
  Cpu, 
  Copy, 
  Zap, 
  Terminal, 
  Activity,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { fetchThingSpeakFeed, getEsp32ArduinoFirmwareCode } from '../../services/thingspeak';

export default function IotControlModal({
  isOpen,
  onClose,
  iotConfig,
  onSaveIotConfig,
  bins,
  onSimulateBinEvent,
  onResetStoreDefaults,
}) {
  const [activeTab, setActiveTab] = useState('config'); // 'config', 'simulator', 'firmware'
  
  // Local form state
  const [channelId, setChannelId] = useState(iotConfig.channelId || '');
  const [readApiKey, setReadApiKey] = useState(iotConfig.readApiKey || '');
  const [useSimulated, setUseSimulated] = useState(iotConfig.useSimulated ?? true);
  const [autoRefresh, setAutoRefresh] = useState(iotConfig.autoRefresh ?? true);
  const [refreshIntervalSec, setRefreshIntervalSec] = useState(iotConfig.refreshIntervalSec || 15);

  // Live test state
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testError, setTestError] = useState('');

  // Simulator target bin
  const [simBinId, setSimBinId] = useState(bins[0]?.id || 'BIN-SCI-01');

  // Copy status for firmware code
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTestLoading(true);
    setTestError('');
    setTestResult(null);

    try {
      const data = await fetchThingSpeakFeed(channelId, readApiKey);
      setTestResult(data);
    } catch (err) {
      setTestError(err.message || 'Failed to reach ThingSpeak API.');
    } finally {
      setTestLoading(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSaveIotConfig({
      channelId,
      readApiKey,
      useSimulated,
      autoRefresh,
      refreshIntervalSec: Number(refreshIntervalSec),
    });
    onClose();
  };

  const handleCopyFirmware = () => {
    const code = getEsp32ArduinoFirmwareCode(channelId, 'YOUR_WRITE_API_KEY');
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-navy-900/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-sand-light border border-sand-border rounded-2xl max-w-2xl w-full shadow-elevated p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-sand-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-navy text-sand flex items-center justify-center shadow">
              <Radio className="w-5 h-5 text-terracotta-light" />
            </div>
            <div>
              <h2 className="font-extrabold text-navy text-base sm:text-lg">
                IoT Gateway & ESP32 Telemetry Control
              </h2>
              <p className="text-xs text-charcoal">
                ThingSpeak REST API connection, live hardware bench simulator, and ESP32 firmware
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

        {/* Tab Switcher */}
        <div className="bg-sand p-1 rounded-xl border border-sand-border flex gap-1">
          <button
            onClick={() => setActiveTab('config')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'config'
                ? 'bg-navy text-sand shadow-sm'
                : 'text-charcoal hover:text-navy'
            }`}
          >
            <Wifi className="w-3.5 h-3.5 text-dusty-light" />
            <span>ThingSpeak Config</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'simulator'
                ? 'bg-navy text-sand shadow-sm'
                : 'text-charcoal hover:text-navy'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-terracotta" />
            <span>ESP32 Hardware Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('firmware')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'firmware'
                ? 'bg-navy text-sand shadow-sm'
                : 'text-charcoal hover:text-navy'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-dusty-light" />
            <span>ESP32 C++ Code</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: THINGSPEAK CONFIGURATION */}
        {/* ======================================================== */}
        {activeTab === 'config' && (
          <form onSubmit={handleSave} className="space-y-4">
            
            {/* Feed Mode Selector: Simulated vs Live */}
            <div className="bg-white p-4 rounded-xl border border-sand-border space-y-3">
              <label className="block text-xs font-bold text-navy uppercase tracking-wider">
                Telemetry Data Source
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUseSimulated(true)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    useSimulated
                      ? 'border-terracotta bg-terracotta/10 ring-2 ring-terracotta/30'
                      : 'border-sand-border bg-sand-light/50 hover:border-dusty'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-navy">Simulated ESP32 Gateway</span>
                    {useSimulated && <Check className="w-4 h-4 text-terracotta font-bold" />}
                  </div>
                  <p className="text-[11px] text-charcoal mt-1">
                    Ideal for demos, offline testing, and hardware bench triggers.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setUseSimulated(false)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    !useSimulated
                      ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/30'
                      : 'border-sand-border bg-sand-light/50 hover:border-dusty'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-navy">Live ThingSpeak Channel</span>
                    {!useSimulated && <Check className="w-4 h-4 text-emerald-600 font-bold" />}
                  </div>
                  <p className="text-[11px] text-charcoal mt-1">
                    Connects directly to live ThingSpeak HTTP feeds from your ESP32.
                  </p>
                </button>
              </div>
            </div>

            {/* ThingSpeak Channel Credentials */}
            <div className="bg-white p-4 rounded-xl border border-sand-border space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-navy uppercase tracking-wider">
                  ThingSpeak Channel Details
                </span>
                <span className="text-[11px] text-dusty-dark">
                  Channel / Read Key
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">
                    Channel ID
                  </label>
                  <input
                    type="text"
                    value={channelId}
                    onChange={(e) => setChannelId(e.target.value)}
                    placeholder="e.g. 2548912"
                    className="w-full px-3 py-2 bg-sand-light/60 border border-sand-border rounded-xl font-mono text-navy focus:outline-none focus:border-terracotta"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">
                    Read API Key (Optional for Public)
                  </label>
                  <input
                    type="password"
                    value={readApiKey}
                    onChange={(e) => setReadApiKey(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="w-full px-3 py-2 bg-sand-light/60 border border-sand-border rounded-xl font-mono text-navy focus:outline-none focus:border-terracotta"
                  />
                </div>
              </div>

              {/* Security Warning Alert */}
              <div className="bg-navy/5 border border-sand-border p-3 rounded-xl flex items-start gap-2.5 text-[11px] text-charcoal">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-navy">Security Note:</strong> Only your <em>Read API Key</em> or public channel ID is needed here. Never paste your ThingSpeak <em>Write API Key</em> into frontend client code. Write keys belong exclusively inside the ESP32 firmware.
                </div>
              </div>
            </div>

            {/* Refresh Interval Settings */}
            <div className="bg-white p-4 rounded-xl border border-sand-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-navy block">Auto-Sync Telemetry Interval</span>
                <span className="text-charcoal-light text-[11px]">Periodically queries ThingSpeak REST endpoint</span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={refreshIntervalSec}
                  onChange={(e) => setRefreshIntervalSec(e.target.value)}
                  className="bg-sand/60 border border-sand-border rounded-lg px-2.5 py-1.5 font-bold text-navy text-xs focus:outline-none"
                >
                  <option value="10">Every 10 seconds</option>
                  <option value="15">Every 15 seconds (Recommended)</option>
                  <option value="30">Every 30 seconds</option>
                  <option value="60">Every 60 seconds</option>
                </select>

                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testLoading || !channelId}
                  className="px-3 py-1.5 rounded-lg bg-sand hover:bg-sand-dark text-navy font-bold text-xs border border-sand-border flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testLoading ? 'animate-spin text-terracotta' : ''}`} />
                  <span>Test Feed</span>
                </button>
              </div>
            </div>

            {/* Test Connection Output */}
            {testError && (
              <div className="p-3 rounded-xl bg-terracotta/15 border border-terracotta text-terracotta-dark text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{testError}</span>
              </div>
            )}

            {testResult && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-400 text-emerald-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <Check className="w-4 h-4" />
                  <span>Successfully fetched ThingSpeak Channel #{testResult.channel?.id || channelId}!</span>
                </div>
                {testResult.latestFeed ? (
                  <div className="text-[11px] grid grid-cols-2 gap-2 mt-1 pt-1 border-t border-emerald-200">
                    <div>Fill Level: <strong>{testResult.latestFeed.fillLevel}%</strong></div>
                    <div>Distance: <strong>{testResult.latestFeed.distanceCm} cm</strong></div>
                    <div>Tilt: <strong>{testResult.latestFeed.tiltAngle}°</strong> ({testResult.latestFeed.isOverturned ? 'TIPPED' : 'Upright'})</div>
                    <div>Battery: <strong>{testResult.latestFeed.batteryPercent}%</strong></div>
                  </div>
                ) : (
                  <div className="text-[11px] text-emerald-700">Channel reached, but no feed entries recorded yet.</div>
                )}
              </div>
            )}

            {/* Save Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-sand-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-sand-border text-xs font-bold text-charcoal hover:bg-sand"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-terracotta hover:bg-terracotta-dark text-white text-xs font-bold shadow-md transition-colors"
              >
                Apply IoT Settings
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* TAB 2: INTERACTIVE HARDWARE SIMULATOR */}
        {/* ======================================================== */}
        {activeTab === 'simulator' && (
          <div className="space-y-4 text-xs">
            
            <div className="bg-white p-4 rounded-xl border border-sand-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-navy text-sm">ESP32 Hardware Event Simulator</h3>
                  <p className="text-[11px] text-charcoal">
                    Simulate real-world hardware telemetry on campus bins to verify alert logic and staff workflows.
                  </p>
                </div>
              </div>

              {/* Target Bin selector */}
              <div>
                <label className="block font-bold text-navy uppercase tracking-wider mb-1 text-[11px]">
                  Target Dustbin to Trigger
                </label>
                <select
                  value={simBinId}
                  onChange={(e) => setSimBinId(e.target.value)}
                  className="w-full px-3 py-2 bg-sand-light/60 border border-sand-border rounded-xl font-bold text-navy text-xs focus:outline-none"
                >
                  {bins.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.id} — {b.name} ({b.zone}) [Current: {b.fillLevel}%, {b.isOverturned ? 'Overturned' : 'Upright'}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                
                {/* 1. Overturn */}
                <button
                  type="button"
                  onClick={() => onSimulateBinEvent(simBinId, {
                    isOverturned: true,
                    tiltAngle: 84,
                  })}
                  className="p-3 rounded-xl bg-charcoal hover:bg-charcoal-dark text-sand text-left font-bold transition-all shadow-sm flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-terracotta" />
                      <span>Simulate Bin Overturn</span>
                    </div>
                    <div className="text-[10px] text-sand-light font-normal mt-0.5">
                      Sets tilt inclination to 84° (Overturned)
                    </div>
                  </div>
                  <Zap className="w-4 h-4 text-terracotta-light" />
                </button>

                {/* 2. Trash Spike */}
                <button
                  type="button"
                  onClick={() => onSimulateBinEvent(simBinId, {
                    fillLevel: 96,
                    distanceCm: 3.2,
                    isOverturned: false,
                    tiltAngle: 3,
                  })}
                  className="p-3 rounded-xl bg-terracotta hover:bg-terracotta-dark text-white text-left font-bold transition-all shadow-sm flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-sand" />
                      <span>Simulate Trash Surge (96%)</span>
                    </div>
                    <div className="text-[10px] text-sand-light font-normal mt-0.5">
                      Spikes fill level & triggers Critical Alert
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>

                {/* 3. Disconnect / Offline */}
                <button
                  type="button"
                  onClick={() => onSimulateBinEvent(simBinId, {
                    isOffline: true,
                  })}
                  className="p-3 rounded-xl bg-sand hover:bg-sand-dark text-navy text-left font-bold transition-all border border-sand-border flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Radio className="w-4 h-4 text-dusty-dark" />
                      <span>Simulate Device Offline</span>
                    </div>
                    <div className="text-[10px] text-charcoal font-normal mt-0.5">
                      Simulates WiFi dropout or battery depletion
                    </div>
                  </div>
                </button>

                {/* 4. Restore Upright / Online */}
                <button
                  type="button"
                  onClick={() => onSimulateBinEvent(simBinId, {
                    isOverturned: false,
                    tiltAngle: 2,
                    isOffline: false,
                  })}
                  className="p-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-left font-bold transition-all shadow-sm flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      <span>Right Bin Upright & Online</span>
                    </div>
                    <div className="text-[10px] text-emerald-200 font-normal mt-0.5">
                      Clears tilt alert and restores connectivity
                    </div>
                  </div>
                </button>
              </div>

              {/* Reset All Bins to Default Demo Data */}
              <div className="pt-3 border-t border-sand-border flex items-center justify-between">
                <span className="text-[11px] text-charcoal">
                  Want to reset all dustbins and mock history to initial state?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Reset all campus dustbins to initial college demo configuration?')) {
                      onResetStoreDefaults();
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-navy hover:bg-navy-light text-sand text-[11px] font-bold"
                >
                  Reset Demo Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: ESP32 ARDUINO FIRMWARE REFERENCE */}
        {/* ======================================================== */}
        {activeTab === 'firmware' && (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-navy text-sm">ESP32 Arduino Firmware (C++)</h3>
                <p className="text-[11px] text-charcoal">
                  Tested with ESP32 DevKit v1, HC-SR04 ultrasonic distance sensor, and MPU-6050 accelerometer.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyFirmware}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-terracotta hover:bg-terracotta-dark text-white font-bold text-xs shadow-sm transition-colors"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy Code'}</span>
              </button>
            </div>

            <div className="bg-navy-dark text-sand-light p-4 rounded-xl font-mono text-[11px] max-h-96 overflow-y-auto border border-sand/15 select-all">
              <pre className="whitespace-pre">
                {getEsp32ArduinoFirmwareCode(channelId || 'YOUR_CHANNEL_ID', 'YOUR_WRITE_API_KEY')}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
