
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, ViewType, Subject, ScheduleItem, ActivityLog, ActivityType, DayOfWeek } from './types';
import { loadState, saveState, clearState, saveRemoteState, subscribeToRemoteState } from './db';
import { AuthProvider, useAuth } from './AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Timetable from './pages/Timetable';
import Analytics from './pages/Analytics';
import Chatbot from './pages/Chatbot';
import Settings from './pages/Settings';
import DailyLog from './pages/DailyLog';
// Storage removed as per user request
// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const AppContent: React.FC = () => {
  const { user, signInWithGoogle, logout } = useAuth();
  const [state, setState] = useState<AppState>(loadState());
  const [activeView, setActiveView] = useState<ViewType>('DASHBOARD');
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState('#3b82f6');
  // const [uploading, setUploading] = useState(false);

  // Realtime Sync state on user change
  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToRemoteState(user.uid, (remoteState) => {
        setState(remoteState);
      });
      return () => unsubscribe();
    } else {
      setState(loadState());
    }
  }, [user]);

  // Persistence effect
  useEffect(() => {
    if (user) {
      saveRemoteState(user.uid, state);
    } else {
      saveState(state);
    }
  }, [state, user]);

  const handleLogSession = useCallback((subjectId: string, durationMinutes: number, date?: string) => {
    const subject = state.subjects.find(s => s.id === subjectId);
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user?.uid || state.user?.id || 'guest',
      type: ActivityType.STUDY,
      title: subject ? `Studied ${subject.name}` : 'Study Session',
      subjectId,
      startTime: date ? new Date(date).toISOString() : new Date().toISOString(),
      // Simple approximation for endTime since we only had duration before
      endTime: new Date(Date.now() + durationMinutes * 60000).toISOString(),
      durationMinutes,
    };
    setState(prev => ({
      ...prev,
      logs: [...prev.logs, newLog]
    }));
  }, [state.user, user, state.subjects]);

  const handleLogActivity = useCallback((log: Omit<ActivityLog, 'id' | 'userId'>) => {
    const newLog: ActivityLog = {
      ...log,
      id: Math.random().toString(36).substr(2, 9),
      userId: user?.uid || state.user?.id || 'guest',
    };
    setState(prev => ({
      ...prev,
      logs: [...prev.logs, newLog]
    }));
  }, [state.user, user]);

  const handleAddSchedule = useCallback((item: Omit<ScheduleItem, 'id' | 'userId'>) => {
    const newItem: ScheduleItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      userId: user?.uid || state.user?.id || 'guest',
    };
    setState(prev => ({
      ...prev,
      schedules: [...prev.schedules, newItem]
    }));
  }, [state.user, user]);

  const handleRemoveSchedule = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      schedules: prev.schedules.filter(s => s.id !== id)
    }));
  }, []);

  const handleAddSubject = () => {
    if (!newSubjectName.trim()) return;
    const newSub: Subject = {
      id: 'sub_' + Math.random().toString(36).substr(2, 9),
      name: newSubjectName.trim(),
      color: newSubjectColor
    };
    setState(prev => ({ ...prev, subjects: [...prev.subjects, newSub] }));
    setNewSubjectName('');
    setNewSubjectColor('#3b82f6');
  };

  const handleUpdateSubject = (id: string, name: string, color: string) => {
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => s.id === id ? { ...s, name, color } : s)
    }));
    setEditingSubjectId(null);
  };

  const handleDeleteSubject = (id: string) => {
    if (confirm('Are you sure? This will remove this subject from your options (existing logs remain).')) {
      setState(prev => ({
        ...prev,
        subjects: prev.subjects.filter(s => s.id !== id)
      }));
    }
  };

  // AI Handler
  const handleUpdateFromAI = useCallback((action: string, args: any) => {
    if (action === 'logActivity') {
      // Find subject ID if it's a study session and subject name is provided in title or inferred
      let subjectId = undefined;
      if (args.type === 'Study') {
        const subject = state.subjects.find(s =>
          args.title.toLowerCase().includes(s.name.toLowerCase())
        );
        if (subject) subjectId = subject.id;
      }

      // Calculate timestamps
      // If startTime is provided (HH:mm), use today's date + time
      let startTime = new Date().toISOString();
      if (args.startTime) {
        const today = new Date().toISOString().split('T')[0];
        startTime = new Date(`${today}T${args.startTime}:00`).toISOString();
      }

      const endTime = new Date(new Date(startTime).getTime() + args.durationMinutes * 60000).toISOString();

      const newLog: Omit<ActivityLog, 'id' | 'userId'> = {
        type: args.type as ActivityType || ActivityType.OTHER,
        title: args.title,
        durationMinutes: args.durationMinutes,
        startTime,
        endTime,
        subjectId
      };

      handleLogActivity(newLog);

    } else if (action === 'updateSchedule') {
      // Try to find subject
      const subject = state.subjects.find(s =>
        (args.subjectName || args.title).toLowerCase().includes(s.name.toLowerCase())
      );

      handleAddSchedule({
        subjectId: subject?.id,
        title: args.title || subject?.name || 'Class',
        type: subject ? ActivityType.STUDY : ActivityType.CLASS, // Simple inference
        day: args.day as DayOfWeek,
        startTime: args.startTime,
        endTime: args.endTime
      });
    }
  }, [state.subjects, handleLogActivity, handleAddSchedule]);

  const onLogout = () => {
    logout();
    window.location.reload();
  };

  /* 
  // Storage removed
  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     ...
  };
  */

  const renderView = () => {
    switch (activeView) {
      case 'DASHBOARD':
        return <Dashboard state={state} onLogSession={handleLogSession} />;
      case 'TIMETABLE':
        return <Timetable state={state} onAddSchedule={handleAddSchedule} onRemoveSchedule={handleRemoveSchedule} />;
      case 'DAILY_LOG':
        return <DailyLog state={state} onLogActivity={handleLogActivity} />;
      case 'ANALYTICS':
        return <Analytics state={state} />;
      case 'CHATBOT':
        return <Chatbot state={state} onUpdateFromAI={handleUpdateFromAI} />;
      case 'SETTINGS':
        return <Settings state={state} setState={setState} />;
      case 'DASHBOARD':
        return <Dashboard state={state} onLogSession={handleLogSession} />;
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar activeView={activeView} setActiveView={setActiveView} onLogout={onLogout} />

      <main className="flex-1 p-4 md:p-10 pb-24 md:pb-10 overflow-y-auto h-screen scrollbar-hide">
        <div className="max-w-6xl mx-auto">
          {renderView()}
        </div>
      </main>

      {/* Mobile Bottom Navigation - Same as before */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-40 shadow-lg">
        {[
          { id: 'DASHBOARD', icon: 'M3.75 6h2.25v2.25H3.75V6zM3.75 15.75h2.25V18H3.75v-2.25zM13.5 6h2.25v2.25H13.5V6zM13.5 15.75h2.25V18h-2.25v-2.25z' },
          { id: 'TIMETABLE', icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5' },
          { id: 'DAILY_LOG', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
          { id: 'CHATBOT', icon: 'M7.5 8.25h9m-9 3h9m-9 3h9m-9 3h9M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z' },
          { id: 'SETTINGS', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id as ViewType)}
            className={`p-2 rounded-xl transition-all ${activeView === item.id ? 'bg-blue-50 text-blue-600 scale-110' : 'text-slate-400'}`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
          </button>
        ))}
      </nav>
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
