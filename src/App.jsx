import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import LoginPage from './components/auth/LoginPage';
import StaffDashboard from './components/staff/StaffDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import IotControlModal from './components/iot/IotControlModal';
import FirebaseModal from './components/common/FirebaseModal';
import { 
  loadEcoBinStore, 
  saveEcoBinStore, 
  resetEcoBinStore, 
  BIN_TOTAL_HEIGHT_CM 
} from './services/store';
import { fetchThingSpeakFeed } from './services/thingspeak';

export default function App() {
  // Load persistent store
  const [store, setStore] = useState(() => loadEcoBinStore());

  // Active authenticated user (default to null for login page, or restore from session)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = sessionStorage.getItem('ecobin_current_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Modal visibility
  const [isIotModalOpen, setIsIotModalOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync store changes to localStorage
  const updateStore = (updater) => {
    setStore(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      saveEcoBinStore(next);
      return next;
    });
  };

  // Auth handlers
  const handleLogin = (user) => {
    setCurrentUser(user);
    try {
      sessionStorage.setItem('ecobin_current_user', JSON.stringify(user));
    } catch (e) {
      // ignore storage errors
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      sessionStorage.removeItem('ecobin_current_user');
    } catch (e) {
      // ignore
    }
  };

  const handleSwitchUser = (user) => {
    setCurrentUser(user);
    try {
      sessionStorage.setItem('ecobin_current_user', JSON.stringify(user));
    } catch (e) {
      // ignore
    }
  };

  // Staff cleaning submission
  const handleMarkCleaned = (binId, afterFill, notes) => {
    const after = Number(afterFill);
    const wasteDepth = (after / 100) * BIN_TOTAL_HEIGHT_CM;
    const distanceCm = parseFloat((BIN_TOTAL_HEIGHT_CM - wasteDepth).toFixed(1));

    updateStore(prev => {
      const targetBin = prev.bins.find(b => b.id === binId);
      const beforeFill = targetBin ? targetBin.fillLevel : 90;

      const newLog = {
        id: `log-${Date.now().toString().slice(-4)}`,
        binId,
        binName: targetBin ? targetBin.name : binId,
        staffId: currentUser?.id || 'staff-01',
        staffName: currentUser?.name || 'Staff Member',
        cleanedAt: new Date().toISOString(),
        beforeFill,
        afterFill: after,
        notes: notes || 'Emptied and liner replaced.',
      };

      const updatedBins = prev.bins.map(b => {
        if (b.id === binId) {
          return {
            ...b,
            fillLevel: after,
            distanceCm,
            isOverturned: false,
            tiltAngle: 2,
            lastCleaned: new Date().toISOString(),
            lastPing: new Date().toISOString(),
          };
        }
        return b;
      });

      return {
        ...prev,
        bins: updatedBins,
        cleaningLogs: [newLog, ...prev.cleaningLogs],
      };
    });
  };

  // Staff problem report
  const handleReportProblem = (reportData) => {
    const newReport = {
      id: `rep-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      status: 'Open',
      ...reportData,
    };

    updateStore(prev => ({
      ...prev,
      reports: [newReport, ...prev.reports],
    }));
  };

  // Staff suggestion
  const handleSuggestLocation = (sugData) => {
    const newSug = {
      id: `sug-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      status: 'Under Review',
      ...sugData,
    };

    updateStore(prev => ({
      ...prev,
      suggestions: [newSug, ...prev.suggestions],
    }));
  };

  // Admin Bin CRUD
  const handleAddBin = (binData) => {
    updateStore(prev => ({
      ...prev,
      bins: [...prev.bins, { ...binData, active: true, lastPing: new Date().toISOString() }],
    }));
  };

  const handleUpdateBin = (binId, updates) => {
    updateStore(prev => ({
      ...prev,
      bins: prev.bins.map(b => b.id === binId ? { ...b, ...updates } : b),
    }));
  };

  const handleDeleteBin = (binId) => {
    updateStore(prev => ({
      ...prev,
      bins: prev.bins.filter(b => b.id !== binId),
    }));
  };

  const handleToggleBinActive = (binId) => {
    updateStore(prev => ({
      ...prev,
      bins: prev.bins.map(b => b.id === binId ? { ...b, active: b.active === false ? true : false } : b),
    }));
  };

  // Admin Staff Management
  const handleAddStaff = (staffData) => {
    const newStaff = {
      id: `staff-${(store.staff.length + 1).toString().padStart(2, '0')}`,
      avatar: staffData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      active: true,
      ...staffData,
    };

    updateStore(prev => ({
      ...prev,
      staff: [...prev.staff, newStaff],
    }));
  };

  const handleUpdateStaff = (staffId, updates) => {
    updateStore(prev => ({
      ...prev,
      staff: prev.staff.map(s => s.id === staffId ? { ...s, ...updates } : s),
    }));
  };

  // Admin Report Status update
  const handleUpdateReportStatus = (reportId, status, resolutionNotes = '') => {
    updateStore(prev => ({
      ...prev,
      reports: prev.reports.map(r => r.id === reportId ? {
        ...r,
        status,
        ...(resolutionNotes ? { resolutionNotes } : {})
      } : r),
    }));
  };

  // Admin Suggestion Status update
  const handleUpdateSuggestionStatus = (sugId, status) => {
    updateStore(prev => ({
      ...prev,
      suggestions: prev.suggestions.map(s => s.id === sugId ? { ...s, status } : s),
    }));
  };

  // IoT Config Save
  const handleSaveIotConfig = (newConfig) => {
    updateStore(prev => ({
      ...prev,
      iotConfig: {
        ...prev.iotConfig,
        ...newConfig,
        lastSyncTime: new Date().toISOString(),
      },
    }));
  };

  // Simulated Hardware Event trigger
  const handleSimulateBinEvent = (binId, patch) => {
    updateStore(prev => ({
      ...prev,
      bins: prev.bins.map(b => {
        if (b.id === binId) {
          return {
            ...b,
            ...patch,
            lastPing: new Date().toISOString(),
          };
        }
        return b;
      }),
    }));
  };

  // Reset to default demo data
  const handleResetStoreDefaults = () => {
    const fresh = resetEcoBinStore();
    setStore(fresh);
  };

  // Manual or Periodic Refresh from ThingSpeak
  const handleRefreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (!store.iotConfig.useSimulated && store.iotConfig.channelId) {
        // Live ThingSpeak REST feed retrieval
        const feedData = await fetchThingSpeakFeed(
          store.iotConfig.channelId,
          store.iotConfig.readApiKey
        );

        if (feedData && feedData.latestFeed) {
          const lf = feedData.latestFeed;
          // Map to first bin or designated channel field
          updateStore(prev => {
            const updatedBins = prev.bins.map((b, idx) => {
              if (idx === 0 || b.thingspeakField === 1) {
                return {
                  ...b,
                  fillLevel: lf.fillLevel !== null ? lf.fillLevel : b.fillLevel,
                  distanceCm: lf.distanceCm !== null ? lf.distanceCm : b.distanceCm,
                  tiltAngle: lf.tiltAngle,
                  isOverturned: lf.isOverturned,
                  batteryPercent: lf.batteryPercent !== null ? lf.batteryPercent : b.batteryPercent,
                  lastPing: new Date().toISOString(),
                };
              }
              return b;
            });
            return {
              ...prev,
              bins: updatedBins,
              iotConfig: {
                ...prev.iotConfig,
                lastSyncTime: new Date().toISOString(),
              }
            };
          });
        }
      } else {
        // Simulated jitter update for demo feedback
        updateStore(prev => ({
          ...prev,
          bins: prev.bins.map(b => {
            if (b.isOffline || b.fillLevel < 5) return b;
            // tiny natural jitter
            const jitter = (Math.random() * 2 - 1);
            const newFill = Math.min(100, Math.max(0, Math.round(b.fillLevel + jitter)));
            return {
              ...b,
              fillLevel: newFill,
              lastPing: new Date().toISOString(),
            };
          }),
          iotConfig: {
            ...prev.iotConfig,
            lastSyncTime: new Date().toISOString(),
          }
        }));
      }
    } catch (err) {
      console.warn('Refresh error:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  }, [store.iotConfig]);

  // Periodic polling timer
  useEffect(() => {
    if (!store.iotConfig.autoRefresh) return;
    const intervalMs = (store.iotConfig.refreshIntervalSec || 15) * 1000;
    const timer = setInterval(() => {
      handleRefreshData();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [store.iotConfig.autoRefresh, store.iotConfig.refreshIntervalSec, handleRefreshData]);

  // If user is not logged in, render dedicated login page
  if (!currentUser) {
    return (
      <LoginPage 
        onLogin={handleLogin} 
        allStaff={store.staff} 
      />
    );
  }

  const isStaff = currentUser.role === 'Cleaning Staff';

  return (
    <div className="min-h-screen bg-sand text-navy flex flex-col justify-between selection:bg-terracotta selection:text-white">
      {/* Top Persistent App Navigation */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchUser={handleSwitchUser}
        allStaff={store.staff}
        iotConfig={store.iotConfig}
        onOpenIotModal={() => setIsIotModalOpen(true)}
        onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
        onRefreshData={handleRefreshData}
        isRefreshing={isRefreshing}
      />

      {/* Main Dynamic View: Role Based */}
      <main className="flex-1 pb-12">
        {isStaff ? (
          <StaffDashboard
            currentUser={currentUser}
            bins={store.bins}
            cleaningLogs={store.cleaningLogs}
            onMarkCleaned={handleMarkCleaned}
            onReportProblem={handleReportProblem}
            onSuggestLocation={handleSuggestLocation}
          />
        ) : (
          <AdminDashboard
            currentUser={currentUser}
            bins={store.bins}
            staff={store.staff}
            cleaningLogs={store.cleaningLogs}
            reports={store.reports}
            suggestions={store.suggestions}
            onAddBin={handleAddBin}
            onUpdateBin={handleUpdateBin}
            onDeleteBin={handleDeleteBin}
            onToggleBinActive={handleToggleBinActive}
            onAddStaff={handleAddStaff}
            onUpdateStaff={handleUpdateStaff}
            onUpdateReportStatus={handleUpdateReportStatus}
            onUpdateSuggestionStatus={handleUpdateSuggestionStatus}
            onMarkCleaned={handleMarkCleaned}
          />
        )}
      </main>

      {/* IoT Gateway & ESP32 Simulator Modal */}
      <IotControlModal
        isOpen={isIotModalOpen}
        onClose={() => setIsIotModalOpen(false)}
        iotConfig={store.iotConfig}
        onSaveIotConfig={handleSaveIotConfig}
        bins={store.bins}
        onSimulateBinEvent={handleSimulateBinEvent}
        onResetStoreDefaults={handleResetStoreDefaults}
      />

      {/* Firebase Backend Schema Modal */}
      <FirebaseModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
      />

      {/* Persistent Footer */}
      <footer className="bg-sand-light border-t border-sand-border py-4 px-6 text-xs text-charcoal">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-navy">EcoBin</span>
            <span className="text-dusty">•</span>
            <span>Smarter Waste. Better Campuses.</span>
          </div>
          <div className="flex items-center gap-3 text-charcoal-light font-mono text-[11px]">
            <span>Active Role: <strong className="text-navy">{currentUser.role}</strong></span>
            <span>•</span>
            <span>Channel: #{store.iotConfig.channelId || 'Demo'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
