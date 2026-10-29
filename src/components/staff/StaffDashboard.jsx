import React, { useState } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  RotateCcw, 
  MapPin, 
  CheckCircle, 
  Clock, 
  Flame, 
  PlusCircle, 
  MessageSquarePlus, 
  Compass, 
  ArrowUpRight, 
  Radio, 
  BatteryMedium, 
  Check, 
  X,
  History,
  Info,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getBinStatus, getStatusBadgeInfo, BIN_STATUS } from '../../services/store';

export default function StaffDashboard({
  currentUser,
  bins,
  cleaningLogs,
  onMarkCleaned,
  onReportProblem,
  onSuggestLocation,
}) {
  const [filterZoneOnly, setFilterZoneOnly] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'needs_attention', 'normal'
  
  // Modals state
  const [cleanModalBin, setCleanModalBin] = useState(null);
  const [afterFillLevel, setAfterFillLevel] = useState(5);
  const [cleaningNotes, setCleaningNotes] = useState('');

  const [problemModalOpen, setProblemModalOpen] = useState(false);
  const [problemBinId, setProblemBinId] = useState('');
  const [problemCategory, setProblemCategory] = useState('Damaged Lid / Swing Door');
  const [problemPriority, setProblemPriority] = useState('Medium');
  const [problemDescription, setProblemDescription] = useState('');

  const [suggestionModalOpen, setSuggestionModalOpen] = useState(false);
  const [suggestLocationName, setSuggestLocationName] = useState('');
  const [suggestZone, setSuggestZone] = useState(currentUser.assignedZone || 'North Campus');
  const [suggestReason, setSuggestReason] = useState('');
  const [suggestWasteType, setSuggestWasteType] = useState('General & Recyclables');

  // Filter bins
  const staffZone = currentUser.assignedZone;
  let displayedBins = bins;
  if (filterZoneOnly && staffZone) {
    displayedBins = displayedBins.filter(b => b.zone === staffZone);
  }

  if (statusFilter === 'needs_attention') {
    displayedBins = displayedBins.filter(b => {
      const st = getBinStatus(b);
      return st === BIN_STATUS.CRITICAL || st === BIN_STATUS.NEEDS_CLEANING || st === BIN_STATUS.OVERTURNED;
    });
  } else if (statusFilter === 'normal') {
    displayedBins = displayedBins.filter(b => getBinStatus(b) === BIN_STATUS.NORMAL);
  }

  // Attention bins count
  const criticalCount = displayedBins.filter(b => getBinStatus(b) === BIN_STATUS.CRITICAL).length;
  const overturnedCount = displayedBins.filter(b => getBinStatus(b) === BIN_STATUS.OVERTURNED).length;
  const needsCleanCount = displayedBins.filter(b => getBinStatus(b) === BIN_STATUS.NEEDS_CLEANING).length;

  // Urgent bins for banner
  const urgentBins = displayedBins.filter(b => {
    const st = getBinStatus(b);
    return st === BIN_STATUS.CRITICAL || st === BIN_STATUS.OVERTURNED;
  });

  // Shift cleanings done by this staff member
  const myCleanings = cleaningLogs.filter(log => log.staffId === currentUser.id);

  // Handle Mark Cleaned submit
  const handleCleanSubmit = (e) => {
    e.preventDefault();
    if (!cleanModalBin) return;

    onMarkCleaned(cleanModalBin.id, Number(afterFillLevel), cleaningNotes);

    // Confetti effect
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#C77962', '#8196AB', '#F3EBDD', '#202B3C']
      });
    } catch (err) {
      // safe fallback
    }

    setCleanModalBin(null);
    setAfterFillLevel(5);
    setCleaningNotes('');
  };

  // Handle Problem Report submit
  const handleProblemSubmit = (e) => {
    e.preventDefault();
    if (!problemDescription.trim()) return;

    const targetBin = bins.find(b => b.id === problemBinId);
    onReportProblem({
      binId: problemBinId || 'GENERAL',
      binName: targetBin ? targetBin.name : 'Campus General Area',
      reportedBy: currentUser.id,
      staffName: currentUser.name,
      issueType: problemCategory,
      priority: problemPriority,
      description: problemDescription,
    });

    setProblemModalOpen(false);
    setProblemBinId('');
    setProblemDescription('');
  };

  // Handle Suggestion submit
  const handleSuggestionSubmit = (e) => {
    e.preventDefault();
    if (!suggestLocationName.trim() || !suggestReason.trim()) return;

    onSuggestLocation({
      suggestedBy: currentUser.id,
      staffName: currentUser.name,
      locationName: suggestLocationName,
      zone: suggestZone,
      reason: `${suggestReason} (Expected waste: ${suggestWasteType})`,
      expectedTraffic: 'High student foot traffic',
    });

    setSuggestionModalOpen(false);
    setSuggestLocationName('');
    setSuggestReason('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Staff Header & Zone Context */}
      <div className="bg-sand-light border border-sand-border rounded-2xl p-4 sm:p-6 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy tracking-tight">
              Welcome, {currentUser.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-dusty/30 text-navy-dark border border-dusty/40">
              Staff Portal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-charcoal mt-1 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-terracotta" />
            <span>Assigned Sector: <strong>{currentUser.assignedZone}</strong></span>
            <span className="text-dusty">•</span>
            <span>Shift: {currentUser.shift}</span>
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => { setProblemBinId(displayedBins[0]?.id || ''); setProblemModalOpen(true); }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-charcoal hover:bg-charcoal-dark text-sand font-bold text-xs shadow-sm transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-terracotta-light" />
            <span>Report Problem</span>
          </button>

          <button
            onClick={() => setSuggestionModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-terracotta hover:bg-terracotta-dark text-white font-bold text-xs shadow-sm transition-colors"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>Suggest New Bin</span>
          </button>
        </div>
      </div>

      {/* High Attention Urgent Alert Banner */}
      {urgentBins.length > 0 && (
        <div className="bg-terracotta/15 border-2 border-terracotta rounded-2xl p-4 sm:p-5 shadow-elevated">
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-terracotta text-white flex items-center justify-center shrink-0 shadow">
                <Flame className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-navy">
                  Immediate Action Required: {urgentBins.length} Urgent Bin{urgentBins.length > 1 ? 's' : ''} in Your Sector
                </h3>
                <p className="text-xs text-charcoal mt-0.5">
                  The following dustbins are critically full (&gt;85%) or have triggered tilt overturn sensors:
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {urgentBins.map(b => (
                    <span 
                      key={b.id} 
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        b.isOverturned ? 'bg-charcoal text-sand' : 'bg-terracotta text-white'
                      }`}
                    >
                      {b.isOverturned ? '🚨 Overturned' : `🔥 ${b.fillLevel}% Full`} — {b.id} ({b.name})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-sand-light border border-sand-border p-4 rounded-xl shadow-soft">
          <div className="text-[11px] font-bold text-charcoal uppercase tracking-wider">
            {filterZoneOnly ? 'My Zone Bins' : 'All Campus Bins'}
          </div>
          <div className="text-2xl font-extrabold text-navy mt-1">
            {displayedBins.length}
          </div>
          <div className="text-[11px] text-dusty-dark mt-0.5 flex items-center gap-1">
            <Compass className="w-3 h-3 text-dusty" />
            <span>Zone: {filterZoneOnly ? staffZone : 'All Zones'}</span>
          </div>
        </div>

        <div className="bg-sand-light border border-sand-border p-4 rounded-xl shadow-soft">
          <div className="text-[11px] font-bold text-charcoal uppercase tracking-wider">
            Critical (&gt;85%)
          </div>
          <div className="text-2xl font-extrabold text-terracotta mt-1">
            {criticalCount}
          </div>
          <div className="text-[11px] text-terracotta-dark mt-0.5">
            Require urgent emptying
          </div>
        </div>

        <div className="bg-sand-light border border-sand-border p-4 rounded-xl shadow-soft">
          <div className="text-[11px] font-bold text-charcoal uppercase tracking-wider">
            Overturned / Tilt
          </div>
          <div className="text-2xl font-extrabold text-charcoal mt-1">
            {overturnedCount}
          </div>
          <div className="text-[11px] text-charcoal mt-0.5">
            Physical tilt alert triggered
          </div>
        </div>

        <div className="bg-sand-light border border-sand-border p-4 rounded-xl shadow-soft">
          <div className="text-[11px] font-bold text-charcoal uppercase tracking-wider">
            Cleaned by Me Today
          </div>
          <div className="text-2xl font-extrabold text-navy mt-1">
            {myCleanings.length}
          </div>
          <div className="text-[11px] text-dusty-dark mt-0.5 flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>Recorded in audit log</span>
          </div>
        </div>
      </div>

      {/* Filter and View Controls */}
      <div className="bg-sand-light border border-sand-border p-3.5 rounded-2xl shadow-soft flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Zone toggle */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterZoneOnly(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterZoneOnly
                ? 'bg-navy text-sand shadow-sm'
                : 'text-charcoal hover:bg-sand/60'
            }`}
          >
            My Assigned Zone ({staffZone})
          </button>
          <button
            onClick={() => setFilterZoneOnly(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              !filterZoneOnly
                ? 'bg-navy text-sand shadow-sm'
                : 'text-charcoal hover:bg-sand/60'
            }`}
          >
            Entire Campus ({bins.length} Bins)
          </button>
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1 w-full sm:w-auto justify-end text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              statusFilter === 'all'
                ? 'bg-dusty text-navy'
                : 'text-charcoal hover:text-navy'
            }`}
          >
            All ({displayedBins.length})
          </button>
          <button
            onClick={() => setStatusFilter('needs_attention')}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              statusFilter === 'needs_attention'
                ? 'bg-terracotta text-white'
                : 'text-charcoal hover:text-navy'
            }`}
          >
            Needs Attention ({criticalCount + overturnedCount + needsCleanCount})
          </button>
          <button
            onClick={() => setStatusFilter('normal')}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              statusFilter === 'normal'
                ? 'bg-navy text-sand'
                : 'text-charcoal hover:text-navy'
            }`}
          >
            Normal
          </button>
        </div>
      </div>

      {/* Dustbin Tiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayedBins.map((bin) => {
          const status = getBinStatus(bin);
          const badge = getStatusBadgeInfo(status);

          // Visual fill progress bar styling
          let barBg = 'bg-dusty-dark';
          let gaugeBorder = 'border-dusty/40';
          let gaugeRing = 'ring-dusty/30';

          if (status === BIN_STATUS.CRITICAL) {
            barBg = 'bg-terracotta';
            gaugeBorder = 'border-terracotta';
            gaugeRing = 'ring-terracotta/40';
          } else if (status === BIN_STATUS.NEEDS_CLEANING) {
            barBg = 'bg-terracotta-light';
            gaugeBorder = 'border-terracotta-light';
            gaugeRing = 'ring-terracotta-light/30';
          } else if (status === BIN_STATUS.OVERTURNED) {
            barBg = 'bg-charcoal';
            gaugeBorder = 'border-charcoal';
            gaugeRing = 'ring-charcoal/40';
          }

          return (
            <div
              key={bin.id}
              className={`bg-white rounded-2xl border-2 transition-all shadow-soft hover:shadow-elevated flex flex-col justify-between overflow-hidden ${
                status === BIN_STATUS.CRITICAL
                  ? 'border-terracotta ring-1 ring-terracotta/30'
                  : status === BIN_STATUS.OVERTURNED
                  ? 'border-charcoal ring-1 ring-charcoal/30'
                  : 'border-sand-border hover:border-dusty'
              }`}
            >
              {/* Card Top / Header */}
              <div className="p-4 sm:p-5 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-navy bg-sand/60 px-2 py-0.5 rounded border border-sand-border">
                        {bin.id}
                      </span>
                      <span className="text-[11px] font-semibold text-dusty-dark">
                        {bin.zone}
                      </span>
                    </div>
                    <h3 className="font-bold text-navy text-sm sm:text-base mt-1.5 leading-snug">
                      {bin.name}
                    </h3>
                  </div>

                  {/* Status Badge */}
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${badge.pillBg}`}>
                    <span className={`w-2 h-2 rounded-full ${
                      status === BIN_STATUS.CRITICAL || status === BIN_STATUS.OVERTURNED ? 'animate-ping' : ''
                    } ${
                      status === BIN_STATUS.CRITICAL ? 'bg-terracotta' : status === BIN_STATUS.OVERTURNED ? 'bg-charcoal' : 'bg-dusty-dark'
                    }`}></span>
                    {badge.label}
                  </span>
                </div>

                {/* Location snippet */}
                <p className="text-xs text-charcoal mt-2 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-dusty shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{bin.location}</span>
                </p>

                {/* Fill Percentage & Progress Gauge */}
                <div className="mt-4 pt-3 border-t border-sand-border/70">
                  <div className="flex items-end justify-between mb-1.5">
                    <span className="text-xs font-bold text-charcoal">
                      Waste Fill Level
                    </span>
                    <span className="text-2xl font-black font-mono text-navy">
                      {bin.fillLevel}%
                    </span>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full h-3.5 bg-sand-light rounded-full overflow-hidden border border-sand-border p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barBg}`}
                      style={{ width: `${Math.min(100, Math.max(5, bin.fillLevel))}%` }}
                    />
                  </div>
                </div>

                {/* Sensor Telemetry Readings */}
                <div className="mt-4 grid grid-cols-2 gap-2 bg-sand/40 p-2.5 rounded-xl border border-sand-border/80 text-[11px]">
                  <div>
                    <span className="text-charcoal block">Ultrasonic Distance:</span>
                    <span className="font-mono font-bold text-navy">
                      {bin.distanceCm !== null ? `${bin.distanceCm} cm` : 'Calculating...'}
                    </span>
                  </div>
                  <div>
                    <span className="text-charcoal block">Tilt Inclination:</span>
                    <span className={`font-mono font-bold ${bin.isOverturned ? 'text-terracotta font-extrabold' : 'text-navy'}`}>
                      {bin.tiltAngle}° {bin.isOverturned ? '(TIPPED)' : '(Upright)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-charcoal block">ESP32 Telemetry:</span>
                    <span className="font-mono text-charcoal-light flex items-center gap-1">
                      <Radio className="w-3 h-3 text-dusty" />
                      <span>{bin.espNodeId || 'Node'} • Ch#{bin.thingspeakField}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-charcoal block">Battery:</span>
                    <span className="font-mono font-bold text-navy flex items-center gap-1">
                      <BatteryMedium className="w-3 h-3 text-dusty" />
                      <span>{bin.batteryPercent}%</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 bg-sand/20 border-t border-sand-border flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCleanModalBin(bin);
                    setAfterFillLevel(5);
                    setCleaningNotes('');
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-terracotta hover:bg-terracotta-dark text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Mark as Cleaned</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProblemBinId(bin.id);
                    setProblemModalOpen(true);
                  }}
                  title="Report a problem with this bin or its sensor"
                  className="p-2 rounded-xl bg-white hover:bg-sand/60 text-charcoal border border-sand-border hover:border-dusty transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-charcoal-light hover:text-terracotta" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {displayedBins.length === 0 && (
        <div className="bg-sand-light border border-sand-border rounded-2xl p-8 text-center text-charcoal">
          <Info className="w-8 h-8 text-dusty mx-auto mb-2" />
          <h3 className="font-bold text-navy">No dustbins match this filter</h3>
          <p className="text-xs mt-1">Try switching to "Entire Campus" or resetting the status filter.</p>
        </div>
      )}

      {/* Staff Cleaning Shift History Section */}
      <div className="bg-sand-light border border-sand-border rounded-2xl p-5 sm:p-6 shadow-soft">
        <div className="flex items-center justify-between pb-3 border-b border-sand-border">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-dusty-dark" />
            <h2 className="font-extrabold text-navy text-base sm:text-lg">
              My Shift Cleaning Log
            </h2>
          </div>
          <span className="text-xs text-charcoal font-medium">
            {myCleanings.length} completed cleanings recorded
          </span>
        </div>

        {myCleanings.length > 0 ? (
          <div className="mt-4 space-y-2.5">
            {myCleanings.map(log => (
              <div 
                key={log.id}
                className="bg-white p-3.5 rounded-xl border border-sand-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-navy bg-sand/60 px-1.5 py-0.5 rounded">
                      {log.binId}
                    </span>
                    <span className="font-bold text-navy">{log.binName}</span>
                  </div>
                  {log.notes && (
                    <p className="text-charcoal mt-1 text-[11px] italic">
                      "{log.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 text-charcoal shrink-0">
                  <div className="text-right">
                    <div className="font-bold text-navy">
                      <span className="text-terracotta line-through mr-1">{log.beforeFill}%</span>
                      <span className="text-emerald-600 font-extrabold">→ {log.afterFill}%</span>
                    </div>
                    <div className="text-[10px] text-charcoal-light flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3 text-dusty" />
                      <span>{new Date(log.cleanedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-charcoal-light">
            You haven't marked any bins as cleaned during this shift yet.
          </div>
        )}
      </div>

      {/* MODAL 1: Mark as Cleaned */}
      {cleanModalBin && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-sand-light border border-sand-border rounded-2xl max-w-md w-full shadow-elevated p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sand-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-terracotta text-white flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-navy text-base">Record Bin Cleaning</h3>
                  <p className="text-xs text-charcoal">Update bin status & reset fill level</p>
                </div>
              </div>
              <button 
                onClick={() => setCleanModalBin(null)}
                className="p-1 rounded-lg hover:bg-sand text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCleanSubmit} className="space-y-4">
              <div className="bg-sand/60 p-3 rounded-xl border border-sand-border text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-charcoal">Dustbin ID:</span>
                  <span className="font-mono font-bold text-navy">{cleanModalBin.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal">Location:</span>
                  <span className="font-semibold text-navy">{cleanModalBin.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal">Current (Before) Fill Level:</span>
                  <span className="font-mono font-bold text-terracotta">{cleanModalBin.fillLevel}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal">Cleaned By:</span>
                  <span className="font-semibold text-navy">{currentUser.name}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  After-Cleaning Fill Level (%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="25"
                    step="1"
                    value={afterFillLevel}
                    onChange={(e) => setAfterFillLevel(e.target.value)}
                    className="flex-1 accent-terracotta cursor-pointer"
                  />
                  <span className="w-12 text-center py-1 bg-white border border-sand-border rounded-lg font-mono font-bold text-sm text-navy">
                    {afterFillLevel}%
                  </span>
                </div>
                <p className="text-[10px] text-charcoal-light mt-1">
                  Typically 0% to 5% with a fresh empty liner.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  Cleaning Notes / Verification
                </label>
                <input
                  type="text"
                  value={cleaningNotes}
                  onChange={(e) => setCleaningNotes(e.target.value)}
                  placeholder="e.g., Replaced 240L liner, sanitized lid & sensor"
                  className="w-full px-3 py-2 bg-white border border-sand-border rounded-xl text-xs text-navy focus:outline-none focus:border-terracotta"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCleanModalBin(null)}
                  className="px-4 py-2 rounded-xl border border-sand-border text-xs font-bold text-charcoal hover:bg-sand"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-terracotta hover:bg-terracotta-dark text-white text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Cleaned</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Report Problem */}
      {problemModalOpen && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-sand-light border border-sand-border rounded-2xl max-w-md w-full shadow-elevated p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sand-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-charcoal text-white flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-terracotta-light" />
                </div>
                <div>
                  <h3 className="font-bold text-navy text-base">Report Field Problem</h3>
                  <p className="text-xs text-charcoal">Notify campus facilities operations</p>
                </div>
              </div>
              <button 
                onClick={() => setProblemModalOpen(false)}
                className="p-1 rounded-lg hover:bg-sand text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProblemSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  Associated Dustbin
                </label>
                <select
                  value={problemBinId}
                  onChange={(e) => setProblemBinId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-sand-border rounded-xl text-xs text-navy font-semibold focus:outline-none focus:border-terracotta"
                >
                  <option value="">General Area (No specific bin)</option>
                  {bins.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.id} — {b.name} ({b.zone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  Issue Classification
                </label>
                <select
                  value={problemCategory}
                  onChange={(e) => setProblemCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-sand-border rounded-xl text-xs text-navy focus:outline-none focus:border-terracotta"
                >
                  <option value="Damaged Lid / Swing Door">Damaged Lid / Swing Door</option>
                  <option value="Sensor Offline / Unreadable">Sensor Offline / Low Battery</option>
                  <option value="Physical Overturn / Vandalism">Physical Overturn / Vandalism</option>
                  <option value="Foul Odor / Hazardous Waste">Foul Odor / Hazardous Waste</option>
                  <option value="Pest or Rodent Infestation">Pest or Rodent Infestation</option>
                  <option value="Physical Obstruction / Access Blocked">Physical Obstruction / Access Blocked</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Low', 'Medium', 'Critical'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setProblemPriority(p)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition-all ${
                        problemPriority === p
                          ? p === 'Critical'
                            ? 'bg-terracotta text-white border-terracotta'
                            : 'bg-navy text-sand border-navy'
                          : 'bg-white border-sand-border text-charcoal'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  Description of Issue
                </label>
                <textarea
                  rows="3"
                  required
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="Detail what is wrong, physical damage, or hazard observed..."
                  className="w-full px-3 py-2 bg-white border border-sand-border rounded-xl text-xs text-navy focus:outline-none focus:border-terracotta"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProblemModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-sand-border text-xs font-bold text-charcoal hover:bg-sand"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-charcoal hover:bg-charcoal-dark text-sand text-xs font-bold shadow-md transition-colors"
                >
                  Submit Problem Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Suggest New Location */}
      {suggestionModalOpen && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-sand-light border border-sand-border rounded-2xl max-w-md w-full shadow-elevated p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sand-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-terracotta text-white flex items-center justify-center">
                  <MessageSquarePlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-navy text-base">Suggest New Dustbin Location</h3>
                  <p className="text-xs text-charcoal">Help facilities optimize campus bin placements</p>
                </div>
              </div>
              <button 
                onClick={() => setSuggestionModalOpen(false)}
                className="p-1 rounded-lg hover:bg-sand text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSuggestionSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  Proposed Location / Landmark
                </label>
                <input
                  type="text"
                  required
                  value={suggestLocationName}
                  onChange={(e) => setSuggestLocationName(e.target.value)}
                  placeholder="e.g., Maker Space Courtyard, Lawn Benches"
                  className="w-full px-3 py-2 bg-white border border-sand-border rounded-xl text-xs text-navy focus:outline-none focus:border-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  Campus Sector / Zone
                </label>
                <select
                  value={suggestZone}
                  onChange={(e) => setSuggestZone(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-sand-border rounded-xl text-xs text-navy focus:outline-none focus:border-terracotta"
                >
                  <option value="North Campus">North Campus (Science & Engineering)</option>
                  <option value="Central Quad">Central Quad (Library & Student Union)</option>
                  <option value="South Campus">South Campus (Cafeteria & Sports)</option>
                  <option value="East Campus">East Campus (Hostels & Residential)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  Expected Primary Waste Type
                </label>
                <select
                  value={suggestWasteType}
                  onChange={(e) => setSuggestWasteType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-sand-border rounded-xl text-xs text-navy focus:outline-none focus:border-terracotta"
                >
                  <option value="General & Recyclables">General & Recyclables (Cardboard, Cans, Cups)</option>
                  <option value="Food & Organic Waste">Food & Organic Waste (Snack wrapper, cafeteria leftovers)</option>
                  <option value="Paper & Study Materials">Paper & Study Materials (Notes, printouts)</option>
                  <option value="Plastic Bottles & Beverage Cans">Plastic Bottles & Beverage Cans</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  Why is a new bin needed here?
                </label>
                <textarea
                  rows="3"
                  required
                  value={suggestReason}
                  onChange={(e) => setSuggestReason(e.target.value)}
                  placeholder="Describe foot traffic, student gathering patterns, or litter noticed on pathways..."
                  className="w-full px-3 py-2 bg-white border border-sand-border rounded-xl text-xs text-navy focus:outline-none focus:border-terracotta"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSuggestionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-sand-border text-xs font-bold text-charcoal hover:bg-sand"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-terracotta hover:bg-terracotta-dark text-white text-xs font-bold shadow-md transition-colors"
                >
                  Submit Suggestion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
