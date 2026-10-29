import React, { useState } from 'react';
import { 
  Trash2, 
  AlertTriangle, 
  RotateCcw, 
  MapPin, 
  CheckCircle, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash, 
  UserCheck, 
  Users, 
  FileText, 
  Download, 
  Radio, 
  Check, 
  X, 
  Power, 
  ShieldAlert, 
  Compass, 
  Flame, 
  Sparkles,
  ChevronRight,
  TrendingDown,
  Building
} from 'lucide-react';
import { getBinStatus, getStatusBadgeInfo, BIN_STATUS } from '../../services/store';

export default function AdminDashboard({
  currentUser,
  bins,
  staff,
  cleaningLogs,
  reports,
  suggestions,
  onAddBin,
  onUpdateBin,
  onDeleteBin,
  onToggleBinActive,
  onAddStaff,
  onUpdateStaff,
  onUpdateReportStatus,
  onUpdateSuggestionStatus,
  onMarkCleaned,
}) {
  const [activeTab, setActiveTab] = useState('bins'); // 'bins', 'staff', 'reports', 'suggestions', 'history'
  
  // Search & Filter for Bins
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modals
  const [isAddBinOpen, setIsAddBinOpen] = useState(false);
  const [editingBin, setEditingBin] = useState(null);
  const [binFormData, setBinFormData] = useState({
    id: '',
    name: '',
    zone: 'North Campus',
    location: '',
    assignedStaffId: staff[0]?.id || 'staff-01',
    espNodeId: 'ESP32-NODE-09',
    thingspeakField: 1,
    fillLevel: 10,
    distanceCm: 72,
    tiltAngle: 1,
    isOverturned: false,
    isOffline: false,
    batteryPercent: 95,
  });

  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [staffFormData, setStaffFormData] = useState({
    name: '',
    role: 'Cleaning Staff',
    assignedZone: 'North Campus',
    email: '',
    phone: '',
    shift: 'Morning (07:00 - 15:00)',
  });

  // Calculate Summary KPI counts
  const totalDustbins = bins.length;
  const activeDustbins = bins.filter(b => b.active !== false).length;
  const cleaningRequiredCount = bins.filter(b => getBinStatus(b) === BIN_STATUS.NEEDS_CLEANING).length;
  const criticalCount = bins.filter(b => getBinStatus(b) === BIN_STATUS.CRITICAL).length;
  const overturnedCount = bins.filter(b => getBinStatus(b) === BIN_STATUS.OVERTURNED).length;
  const offlineCount = bins.filter(b => getBinStatus(b) === BIN_STATUS.OFFLINE).length;

  // Filtered Bins List
  const filteredBins = bins.filter(b => {
    const matchesSearch = 
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesZone = selectedZone === 'All' || b.zone === selectedZone;
    const binSt = getBinStatus(b);
    const matchesStatus = 
      selectedStatus === 'All' ||
      (selectedStatus === 'critical' && binSt === BIN_STATUS.CRITICAL) ||
      (selectedStatus === 'needs_cleaning' && binSt === BIN_STATUS.NEEDS_CLEANING) ||
      (selectedStatus === 'overturned' && binSt === BIN_STATUS.OVERTURNED) ||
      (selectedStatus === 'offline' && binSt === BIN_STATUS.OFFLINE) ||
      (selectedStatus === 'normal' && binSt === BIN_STATUS.NORMAL);

    return matchesSearch && matchesZone && matchesStatus;
  });

  // Bin Form Handlers
  const openAddBinModal = () => {
    const nextNum = bins.length + 1;
    setBinFormData({
      id: `BIN-NEW-0${nextNum}`,
      name: '',
      zone: 'North Campus',
      location: '',
      assignedStaffId: staff[0]?.id || 'staff-01',
      espNodeId: `ESP32-NODE-0${nextNum}`,
      thingspeakField: (nextNum % 8) || 1,
      fillLevel: 12,
      distanceCm: 70.4,
      tiltAngle: 2,
      isOverturned: false,
      isOffline: false,
      batteryPercent: 94,
    });
    setEditingBin(null);
    setIsAddBinOpen(true);
  };

  const openEditBinModal = (bin) => {
    setEditingBin(bin);
    setBinFormData({
      id: bin.id,
      name: bin.name,
      zone: bin.zone,
      location: bin.location,
      assignedStaffId: bin.assignedStaffId || staff[0]?.id,
      espNodeId: bin.espNodeId || 'ESP32-NODE-01',
      thingspeakField: bin.thingspeakField || 1,
      fillLevel: bin.fillLevel,
      distanceCm: bin.distanceCm,
      tiltAngle: bin.tiltAngle || 1,
      isOverturned: bin.isOverturned || false,
      isOffline: bin.isOffline || false,
      batteryPercent: bin.batteryPercent || 90,
    });
    setIsAddBinOpen(true);
  };

  const handleSaveBin = (e) => {
    e.preventDefault();
    if (!binFormData.name.trim() || !binFormData.id.trim()) return;

    if (editingBin) {
      onUpdateBin(editingBin.id, binFormData);
    } else {
      onAddBin(binFormData);
    }
    setIsAddBinOpen(false);
  };

  // Staff Form Handlers
  const handleSaveStaff = (e) => {
    e.preventDefault();
    if (!staffFormData.name.trim() || !staffFormData.email.trim()) return;
    onAddStaff(staffFormData);
    setIsAddStaffOpen(false);
    setStaffFormData({
      name: '',
      role: 'Cleaning Staff',
      assignedZone: 'North Campus',
      email: '',
      phone: '',
      shift: 'Morning (07:00 - 15:00)',
    });
  };

  // CSV Report Generator
  const handleExportCSV = () => {
    const headers = ['Log ID', 'Timestamp', 'Bin ID', 'Bin Name', 'Staff Name', 'Before Fill %', 'After Fill %', 'Fill Reduced %', 'Notes'];
    const rows = cleaningLogs.map(l => [
      `"${l.id}"`,
      `"${new Date(l.cleanedAt).toLocaleString()}"`,
      `"${l.binId}"`,
      `"${l.binName.replace(/"/g, '""')}"`,
      `"${l.staffName}"`,
      l.beforeFill,
      l.afterFill,
      l.beforeFill - l.afterFill,
      `"${(l.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ecobin_audit_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner / Facilities Status */}
      <div className="bg-sand-light border border-sand-border rounded-2xl p-4 sm:p-6 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy tracking-tight">
              Administration Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-navy text-sand border border-sand/20">
              Campus Operations
            </span>
          </div>
          <p className="text-xs sm:text-sm text-charcoal mt-1 flex items-center gap-2">
            <Building className="w-4 h-4 text-dusty-dark" />
            <span>Facilities & Infrastructure Management • University College IoT Smart Campus</span>
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={openAddBinModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-terracotta hover:bg-terracotta-dark text-white font-bold text-xs shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Dustbin</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-navy hover:bg-navy-light text-sand font-bold text-xs shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-terracotta-light" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 5 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Card 1: Total Dustbins */}
        <div className="bg-sand-light border border-sand-border p-4 rounded-xl shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-charcoal uppercase tracking-wider">
              Total Dustbins
            </span>
            <Trash2 className="w-4 h-4 text-dusty-dark" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-navy mt-1">
            {totalDustbins}
          </div>
          <div className="text-[11px] text-dusty-dark mt-1">
            {activeDustbins} active on campus
          </div>
        </div>

        {/* Card 2: Bins Requiring Cleaning */}
        <div className="bg-sand-light border border-sand-border p-4 rounded-xl shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-charcoal uppercase tracking-wider">
              Needs Cleaning
            </span>
            <RotateCcw className="w-4 h-4 text-terracotta-light" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-terracotta-dark mt-1">
            {cleaningRequiredCount}
          </div>
          <div className="text-[11px] text-charcoal mt-1">
            Fill level between 60% - 85%
          </div>
        </div>

        {/* Card 3: Critically Full Bins */}
        <div className="bg-sand-light border-2 border-terracotta/40 p-4 rounded-xl shadow-soft bg-terracotta/5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-terracotta-dark uppercase tracking-wider">
              Critically Full
            </span>
            <Flame className="w-4 h-4 text-terracotta" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-terracotta mt-1">
            {criticalCount}
          </div>
          <div className="text-[11px] text-terracotta-dark font-medium mt-1">
            Exceeding 85% capacity
          </div>
        </div>

        {/* Card 4: Overturned Bins */}
        <div className="bg-sand-light border border-sand-border p-4 rounded-xl shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-charcoal uppercase tracking-wider">
              Overturned
            </span>
            <ShieldAlert className="w-4 h-4 text-charcoal" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-charcoal mt-1">
            {overturnedCount}
          </div>
          <div className="text-[11px] text-charcoal mt-1">
            Tilt sensor alert triggered
          </div>
        </div>

        {/* Card 5: Offline Bins */}
        <div className="bg-sand-light border border-sand-border p-4 rounded-xl shadow-soft col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-charcoal uppercase tracking-wider">
              Offline Devices
            </span>
            <Radio className="w-4 h-4 text-dusty" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-dusty-dark mt-1">
            {offlineCount}
          </div>
          <div className="text-[11px] text-dusty-dark mt-1">
            No telemetry ping &gt;15 min
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="bg-sand-light p-1.5 rounded-2xl border border-sand-border shadow-soft flex flex-wrap gap-1">
        <button
          onClick={() => setActiveTab('bins')}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'bins'
              ? 'bg-navy text-sand shadow-sm'
              : 'text-charcoal hover:text-navy hover:bg-sand/60'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5 text-terracotta-light" />
          <span>Dustbins Fleet ({bins.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'staff'
              ? 'bg-navy text-sand shadow-sm'
              : 'text-charcoal hover:text-navy hover:bg-sand/60'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-dusty-light" />
          <span>Staff & Zones ({staff.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'reports'
              ? 'bg-navy text-sand shadow-sm'
              : 'text-charcoal hover:text-navy hover:bg-sand/60'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-terracotta" />
          <span>Problem Reports ({reports.filter(r => r.status !== 'Resolved').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('suggestions')}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'suggestions'
              ? 'bg-navy text-sand shadow-sm'
              : 'text-charcoal hover:text-navy hover:bg-sand/60'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-dusty" />
          <span>New Suggestions ({suggestions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'history'
              ? 'bg-navy text-sand shadow-sm'
              : 'text-charcoal hover:text-navy hover:bg-sand/60'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-terracotta-light" />
          <span>Cleaning History ({cleaningLogs.length})</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: DUSTBINS FLEET MANAGEMENT (CRUD) */}
      {/* ======================================================== */}
      {activeTab === 'bins' && (
        <div className="space-y-4">
          
          {/* Search & Filter Toolbar */}
          <div className="bg-sand-light border border-sand-border p-3.5 rounded-2xl shadow-soft flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-charcoal-light" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, name, or location..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-sand-border rounded-xl text-xs text-navy focus:outline-none focus:border-terracotta"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-charcoal font-semibold">Zone:</span>
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="bg-white border border-sand-border px-2.5 py-1.5 rounded-xl font-semibold text-navy focus:outline-none"
                >
                  <option value="All">All Campus Zones</option>
                  <option value="North Campus">North Campus</option>
                  <option value="Central Quad">Central Quad</option>
                  <option value="South Campus">South Campus</option>
                  <option value="East Campus">East Campus</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-charcoal font-semibold">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-white border border-sand-border px-2.5 py-1.5 rounded-xl font-semibold text-navy focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="critical">Critical (&gt;85%)</option>
                  <option value="needs_cleaning">Needs Cleaning (60-85%)</option>
                  <option value="overturned">Overturned (Tilt)</option>
                  <option value="offline">Offline</option>
                  <option value="normal">Normal (&lt;60%)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dustbins Table / Cards */}
          <div className="bg-white border border-sand-border rounded-2xl shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-sand/40 border-b border-sand-border text-navy uppercase font-bold tracking-wider text-[11px]">
                    <th className="py-3 px-4">Bin ID</th>
                    <th className="py-3 px-4">Location & Sector</th>
                    <th className="py-3 px-4">Fill Level</th>
                    <th className="py-3 px-4">Sensor Status</th>
                    <th className="py-3 px-4">Assigned Staff</th>
                    <th className="py-3 px-4">Telemetry Node</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-border/60">
                  {filteredBins.map((bin) => {
                    const status = getBinStatus(bin);
                    const badge = getStatusBadgeInfo(status);
                    const assignedStaffMember = staff.find(s => s.id === bin.assignedStaffId);

                    return (
                      <tr 
                        key={bin.id} 
                        className={`hover:bg-sand/20 transition-colors ${
                          !bin.active ? 'opacity-50 bg-sand/10' : ''
                        }`}
                      >
                        {/* Bin ID */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-extrabold text-navy bg-sand/60 px-2 py-0.5 rounded border border-sand-border">
                              {bin.id}
                            </span>
                            {!bin.active && (
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-charcoal/20 text-charcoal">
                                Deactivated
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Name & Location */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-navy">{bin.name}</div>
                          <div className="text-[11px] text-charcoal flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-dusty" />
                            <span>{bin.location} ({bin.zone})</span>
                          </div>
                        </td>

                        {/* Fill Level */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-sand-light rounded-full overflow-hidden border border-sand-border">
                              <div
                                className={`h-full rounded-full ${
                                  status === BIN_STATUS.CRITICAL
                                    ? 'bg-terracotta'
                                    : status === BIN_STATUS.NEEDS_CLEANING
                                    ? 'bg-terracotta-light'
                                    : status === BIN_STATUS.OVERTURNED
                                    ? 'bg-charcoal'
                                    : 'bg-dusty-dark'
                                }`}
                                style={{ width: `${Math.min(100, Math.max(5, bin.fillLevel))}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold text-navy">{bin.fillLevel}%</span>
                          </div>
                          <span className="text-[10px] text-charcoal-light">
                            {bin.distanceCm} cm distance
                          </span>
                        </td>

                        {/* Sensor Status */}
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${badge.pillBg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.bg}`}></span>
                            <span>{badge.label}</span>
                          </span>
                          <div className="text-[10px] text-charcoal-light mt-0.5">
                            Tilt: {bin.tiltAngle}° • Batt: {bin.batteryPercent}%
                          </div>
                        </td>

                        {/* Assigned Staff */}
                        <td className="py-3 px-4">
                          <span className="font-semibold text-navy">
                            {assignedStaffMember ? assignedStaffMember.name : 'Unassigned'}
                          </span>
                          <div className="text-[10px] text-charcoal-light">
                            {assignedStaffMember?.shift.split(' ')[0]}
                          </div>
                        </td>

                        {/* Telemetry Node */}
                        <td className="py-3 px-4 font-mono text-[11px] text-charcoal">
                          <div className="flex items-center gap-1 text-navy">
                            <Radio className="w-3 h-3 text-dusty" />
                            <span>{bin.espNodeId}</span>
                          </div>
                          <span className="text-[10px] text-dusty-dark">
                            Ch Field #{bin.thingspeakField}
                          </span>
                        </td>

                        {/* Action buttons */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Quick clean simulation */}
                            <button
                              onClick={() => onMarkCleaned(bin.id, 5, 'Cleaned via Admin dispatch')}
                              title="Reset Fill to 5% (Mark Cleaned)"
                              className="p-1.5 rounded-lg bg-sand/60 hover:bg-sand text-charcoal hover:text-navy border border-sand-border"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => openEditBinModal(bin)}
                              title="Edit Dustbin details"
                              className="p-1.5 rounded-lg bg-sand/60 hover:bg-sand text-navy border border-sand-border"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Toggle active / deactivate */}
                            <button
                              onClick={() => onToggleBinActive(bin.id)}
                              title={bin.active ? 'Deactivate Dustbin' : 'Activate Dustbin'}
                              className={`p-1.5 rounded-lg border ${
                                bin.active
                                  ? 'bg-sand/60 text-dusty-dark border-sand-border hover:bg-charcoal/10'
                                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              }`}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete dustbin ${bin.id}?`)) {
                                  onDeleteBin(bin.id);
                                }
                              }}
                              title="Delete dustbin"
                              className="p-1.5 rounded-lg bg-sand/60 hover:bg-terracotta/20 text-terracotta-dark border border-sand-border"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredBins.length === 0 && (
              <div className="py-8 text-center text-charcoal text-xs">
                No dustbins match your search criteria.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: STAFF & ZONE MANAGEMENT */}
      {/* ======================================================== */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-navy text-base">
              Cleaning Personnel & Campus Sectors
            </h2>
            <button
              onClick={() => setIsAddStaffOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-terracotta hover:bg-terracotta-dark text-white font-bold text-xs shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Staff Member</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {staff.map((st) => {
              const staffBins = bins.filter(b => b.assignedStaffId === st.id);
              const staffCleaningsToday = cleaningLogs.filter(l => l.staffId === st.id);

              return (
                <div
                  key={st.id}
                  className="bg-white border border-sand-border rounded-2xl p-5 shadow-soft hover:shadow-elevated transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-navy text-sand flex items-center justify-center font-bold text-sm">
                          {st.avatar || st.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-navy text-sm sm:text-base">{st.name}</h3>
                          <span className="text-[11px] font-semibold text-terracotta-dark">{st.role}</span>
                        </div>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Active on duty"></span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-sand-border/80 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-charcoal">Assigned Sector:</span>
                        <span className="font-bold text-navy">{st.assignedZone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal">Shift Hours:</span>
                        <span className="text-navy">{st.shift}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal">Official Email:</span>
                        <span className="font-mono text-[11px] text-navy">{st.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal">Radio Contact:</span>
                        <span className="font-mono text-[11px] text-navy">{st.phone}</span>
                      </div>
                    </div>

                    {/* Performance Chips */}
                    <div className="mt-4 grid grid-cols-2 gap-2 bg-sand/30 p-2.5 rounded-xl border border-sand-border/80 text-center">
                      <div>
                        <div className="text-[10px] text-charcoal font-semibold uppercase">Assigned Bins</div>
                        <div className="text-lg font-bold text-navy mt-0.5">{staffBins.length}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-charcoal font-semibold uppercase">Cleaned Today</div>
                        <div className="text-lg font-bold text-emerald-700 mt-0.5">{staffCleaningsToday.length}</div>
                      </div>
                    </div>
                  </div>

                  {/* Reassign Zone Control */}
                  <div className="mt-4 pt-3 border-t border-sand-border flex items-center justify-between text-xs">
                    <span className="text-charcoal font-semibold">Reassign:</span>
                    <select
                      value={st.assignedZone}
                      onChange={(e) => onUpdateStaff(st.id, { assignedZone: e.target.value })}
                      className="bg-sand/60 border border-sand-border rounded-lg px-2 py-1 font-semibold text-navy text-xs focus:outline-none"
                    >
                      <option value="North Campus">North Campus</option>
                      <option value="Central Quad">Central Quad</option>
                      <option value="South Campus">South Campus</option>
                      <option value="East Campus">East Campus</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: PROBLEM REPORTS & INCIDENTS */}
      {/* ======================================================== */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-navy text-base">
              Field Problem Reports & Sensor Alerts
            </h2>
            <span className="text-xs text-charcoal">
              {reports.length} total reports recorded
            </span>
          </div>

          <div className="space-y-3">
            {reports.map((rep) => (
              <div 
                key={rep.id} 
                className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-soft transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  rep.status === 'Open'
                    ? 'border-terracotta ring-1 ring-terracotta/20'
                    : rep.status === 'In Progress'
                    ? 'border-dusty'
                    : 'border-sand-border opacity-75'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-navy bg-sand/60 px-2 py-0.5 rounded border border-sand-border">
                      {rep.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      rep.priority === 'Critical'
                        ? 'bg-terracotta text-white'
                        : rep.priority === 'Medium'
                        ? 'bg-terracotta-light/30 text-terracotta-dark'
                        : 'bg-sand text-charcoal'
                    }`}>
                      {rep.priority} Priority
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      rep.status === 'Open'
                        ? 'bg-terracotta/15 text-terracotta-dark border border-terracotta/30'
                        : rep.status === 'In Progress'
                        ? 'bg-dusty/20 text-dusty-dark border border-dusty/40'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {rep.status}
                    </span>
                    <span className="text-[11px] text-charcoal-light flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(rep.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <h3 className="font-bold text-navy text-sm">
                    {rep.issueType} — {rep.binName} ({rep.binId})
                  </h3>
                  
                  <p className="text-xs text-charcoal">
                    {rep.description}
                  </p>

                  <div className="text-[11px] text-dusty-dark">
                    Reported by: <strong>{rep.staffName}</strong>
                  </div>

                  {rep.resolutionNotes && (
                    <div className="mt-1 text-[11px] bg-sand/40 p-2 rounded-lg text-charcoal border border-sand-border">
                      <strong>Resolution Note:</strong> {rep.resolutionNotes}
                    </div>
                  )}
                </div>

                {/* Status Update Actions */}
                <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                  {rep.status !== 'In Progress' && rep.status !== 'Resolved' && (
                    <button
                      onClick={() => onUpdateReportStatus(rep.id, 'In Progress')}
                      className="px-3 py-1.5 rounded-xl bg-navy text-sand text-xs font-bold hover:bg-navy-light transition-colors"
                    >
                      Dispatch Staff
                    </button>
                  )}
                  {rep.status !== 'Resolved' && (
                    <button
                      onClick={() => {
                        const note = prompt('Enter resolution notes:', 'Physical repair completed and sensor recalibrated');
                        if (note) onUpdateReportStatus(rep.id, 'Resolved', note);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: LOCATION SUGGESTIONS REVIEW */}
      {/* ======================================================== */}
      {activeTab === 'suggestions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-navy text-base">
              Staff Suggestions for New Dustbin Deployments
            </h2>
            <span className="text-xs text-charcoal">
              Help facilities plan campus expansion
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((sug) => (
              <div 
                key={sug.id}
                className="bg-white border border-sand-border rounded-2xl p-5 shadow-soft flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-navy bg-sand/60 px-2 py-0.5 rounded border border-sand-border">
                        {sug.id}
                      </span>
                      <h3 className="font-bold text-navy text-base mt-1.5">
                        {sug.locationName}
                      </h3>
                      <div className="text-xs text-dusty-dark flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Sector: {sug.zone}</span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                      sug.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : sug.status === 'Declined'
                        ? 'bg-charcoal/20 text-charcoal border-charcoal/40'
                        : 'bg-sand text-terracotta-dark border-sand-border'
                    }`}>
                      {sug.status}
                    </span>
                  </div>

                  <div className="mt-3 bg-sand/30 p-3 rounded-xl border border-sand-border text-xs text-charcoal space-y-1">
                    <p><strong>Rationale:</strong> {sug.reason}</p>
                    <p className="text-charcoal-light"><strong>Estimated Footfall:</strong> {sug.expectedTraffic}</p>
                  </div>

                  <div className="text-[11px] text-charcoal-light mt-2 flex items-center justify-between">
                    <span>Suggested by: <strong>{sug.staffName}</strong></span>
                    <span>{new Date(sug.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-sand-border flex items-center justify-end gap-2">
                  {sug.status !== 'Approved' && (
                    <button
                      onClick={() => onUpdateSuggestionStatus(sug.id, 'Approved')}
                      className="px-3.5 py-1.5 rounded-xl bg-terracotta hover:bg-terracotta-dark text-white font-bold text-xs transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve Location</span>
                    </button>
                  )}
                  {sug.status !== 'Declined' && (
                    <button
                      onClick={() => onUpdateSuggestionStatus(sug.id, 'Declined')}
                      className="px-3.5 py-1.5 rounded-xl bg-sand hover:bg-sand-dark text-charcoal font-bold text-xs border border-sand-border transition-colors"
                    >
                      Decline
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: CLEANING HISTORY & BASIC AUDIT REPORT */}
      {/* ======================================================== */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-extrabold text-navy text-base">
                Campus Waste Cleaning Audit Log
              </h2>
              <p className="text-xs text-charcoal">
                Historical records of all bin emptying, before/after fill metrics, and staff verification.
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-navy hover:bg-navy-light text-sand font-bold text-xs shadow-sm transition-colors"
            >
              <Download className="w-4 h-4 text-terracotta-light" />
              <span>Download CSV Audit Report</span>
            </button>
          </div>

          <div className="bg-white border border-sand-border rounded-2xl shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-sand/40 border-b border-sand-border text-navy uppercase font-bold tracking-wider text-[11px]">
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Dustbin</th>
                    <th className="py-3 px-4">Cleaning Staff</th>
                    <th className="py-3 px-4">Before Clean</th>
                    <th className="py-3 px-4">After Clean</th>
                    <th className="py-3 px-4">Capacity Freed</th>
                    <th className="py-3 px-4">Verification Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-border/60">
                  {cleaningLogs.map((log) => {
                    const reduction = log.beforeFill - log.afterFill;
                    return (
                      <tr key={log.id} className="hover:bg-sand/20 transition-colors">
                        <td className="py-3 px-4 font-mono text-navy">
                          {new Date(log.cleanedAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-navy bg-sand/60 px-1.5 py-0.5 rounded mr-1.5">
                            {log.binId}
                          </span>
                          <span className="font-semibold text-navy">{log.binName}</span>
                        </td>
                        <td className="py-3 px-4 font-bold text-navy">
                          {log.staffName}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-terracotta">
                          {log.beforeFill}%
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                          {log.afterFill}%
                        </td>
                        <td className="py-3 px-4 font-mono font-extrabold text-navy">
                          <span className="text-emerald-700">+{reduction}%</span>
                        </td>
                        <td className="py-3 px-4 text-charcoal italic max-w-xs truncate">
                          {log.notes || 'Routine emptying'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT DUSTBIN */}
      {isAddBinOpen && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-sand-light border border-sand-border rounded-2xl max-w-lg w-full shadow-elevated p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-sand-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-navy text-sand flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-terracotta-light" />
                </div>
                <div>
                  <h3 className="font-bold text-navy text-base">
                    {editingBin ? 'Edit Dustbin Configuration' : 'Register New Campus Dustbin'}
                  </h3>
                  <p className="text-xs text-charcoal">Configure unique ID, campus location, and ESP32 telemetry node</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddBinOpen(false)}
                className="p-1 rounded-lg hover:bg-sand text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBin} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                    Unique Dustbin ID
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingBin}
                    value={binFormData.id}
                    onChange={(e) => setBinFormData({ ...binFormData, id: e.target.value })}
                    placeholder="e.g. BIN-ENG-05"
                    className="w-full px-3 py-2 bg-white border border-sand-border rounded-xl text-xs font-mono font-bold text-navy focus:outline-none focus:border-terracotta disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                    Campus Sector / Zone
                  </label>
                  <select
                    value={binFormData.zone}
                    onChange={(e) => setBinFormData({ ...binFormData, zone: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-sand-border rounded-xl text-xs text-navy focus:outline-none focus:border-terracotta"
                  >
                    <option value="North Campus">North Campus</option>
                    <option value="Central Quad">Central Quad</option>
                    <option value="South Campus">South Campus</option>
                    <option value="East Campus">East Campus</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  Dustbin Display Name
                </label>
                <input
                  type="text"
                  required
                  value={binFormData.name}
                  onChange={(e) => setBinFormData({ ...binFormData, name: e.target.value })}
                  placeholder="e.g. Engineering Workshop East Dock"
                  className="w-full px-3 py-2 bg-white border border-sand-border rounded-xl text-xs text-navy focus:outline-none focus:border-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  Specific Physical Location
                </label>
                <input
                  type="text"
                  required
                  value={binFormData.location}
                  onChange={(e) => setBinFormData({ ...binFormData, location: e.target.value })}
                  placeholder="e.g. Ground Floor adjacent to CNC Lab exit 3"
                  className="w-full px-3 py-2 bg-white border border-sand-border rounded-xl text-xs text-navy focus:outline-none focus:border-terracotta"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                    Assign Cleaning Staff
                  </label>
                  <select
                    value={binFormData.assignedStaffId}
                    onChange={(e) => setBinFormData({ ...binFormData, assignedStaffId: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-sand-border rounded-xl text-xs text-navy focus:outline-none focus:border-terracotta"
                  >
                    {staff.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.assignedZone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                    ESP32 Node ID
                  </label>
                  <input
                    type="text"
                    value={binFormData.espNodeId}
                    onChange={(e) => setBinFormData({ ...binFormData, espNodeId: e.target.value })}
                    placeholder="e.g. ESP32-NODE-09"
                    className="w-full px-3 py-2 bg-white border border-sand-border rounded-xl text-xs font-mono text-navy focus:outline-none focus:border-terracotta"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                    ThingSpeak Channel Field
                  </label>
                  <select
                    value={binFormData.thingspeakField}
                    onChange={(e) => setBinFormData({ ...binFormData, thingspeakField: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-sand-border rounded-xl text-xs font-mono text-navy focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(f => (
                      <option key={f} value={f}>Field {f} (Channel Sensor)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                    Initial Fill Level (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={binFormData.fillLevel}
                    onChange={(e) => setBinFormData({ ...binFormData, fillLevel: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-sand-border rounded-xl text-xs font-mono text-navy focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-sand-border">
                <button
                  type="button"
                  onClick={() => setIsAddBinOpen(false)}
                  className="px-4 py-2 rounded-xl border border-sand-border text-xs font-bold text-charcoal hover:bg-sand"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-terracotta hover:bg-terracotta-dark text-white text-xs font-bold shadow-md transition-colors"
                >
                  {editingBin ? 'Save Changes' : 'Create Dustbin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD STAFF MEMBER */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-sand-light border border-sand-border rounded-2xl max-w-md w-full shadow-elevated p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sand-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-navy text-sand flex items-center justify-center">
                  <Users className="w-4 h-4 text-dusty-light" />
                </div>
                <div>
                  <h3 className="font-bold text-navy text-base">Add Cleaning Personnel</h3>
                  <p className="text-xs text-charcoal">Enroll staff member and assign campus sector</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddStaffOpen(false)}
                className="p-1 rounded-lg hover:bg-sand text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  Staff Full Name
                </label>
                <input
                  type="text"
                  required
                  value={staffFormData.name}
                  onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3 py-2 bg-white border border-sand-border rounded-xl text-xs text-navy focus:outline-none focus:border-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  Assigned Campus Sector
                </label>
                <select
                  value={staffFormData.assignedZone}
                  onChange={(e) => setStaffFormData({ ...staffFormData, assignedZone: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-sand-border rounded-xl text-xs text-navy focus:outline-none"
                >
                  <option value="North Campus">North Campus</option>
                  <option value="Central Quad">Central Quad</option>
                  <option value="South Campus">South Campus</option>
                  <option value="East Campus">East Campus</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={staffFormData.email}
                    onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                    placeholder="alex.m@campus.edu"
                    className="w-full px-3 py-2 bg-white border border-sand-border rounded-xl text-xs text-navy focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                    Contact Phone / Radio
                  </label>
                  <input
                    type="text"
                    required
                    value={staffFormData.phone}
                    onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value })}
                    placeholder="+1 (555) 012-3456"
                    className="w-full px-3 py-2 bg-white border border-sand-border rounded-xl text-xs text-navy focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  Assigned Shift
                </label>
                <select
                  value={staffFormData.shift}
                  onChange={(e) => setStaffFormData({ ...staffFormData, shift: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-sand-border rounded-xl text-xs text-navy focus:outline-none"
                >
                  <option value="Morning (07:00 - 15:00)">Morning (07:00 - 15:00)</option>
                  <option value="Evening (14:00 - 22:00)">Evening (14:00 - 22:00)</option>
                  <option value="Night Patrol (22:00 - 06:00)">Night Patrol (22:00 - 06:00)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-sand-border">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="px-4 py-2 rounded-xl border border-sand-border text-xs font-bold text-charcoal hover:bg-sand"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-navy hover:bg-navy-light text-sand text-xs font-bold shadow-md transition-colors"
                >
                  Enroll Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
