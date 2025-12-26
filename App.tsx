
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, ViewType, Subject, ScheduleItem, StudyLog, DayOfWeek } from './types';
import { loadState, saveState, clearState, saveRemoteState, subscribeToRemoteState } from './db';
import { AuthProvider, useAuth } from './AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Timetable from './pages/Timetable';
import Analytics from './pages/Analytics';
import Chatbot from './pages/Chatbot';
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
    const newLog: StudyLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user?.uid || state.user?.id || 'guest',
      subjectId,
      date: date || new Date().toISOString().split('T')[0],
      durationMinutes,
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

  const handleUpdateFromAI = useCallback((action: string, args: any) => {
    if (action === 'addStudyLog') {
      const subject = state.subjects.find(s =>
        s.name.toLowerCase().includes(args.subjectName.toLowerCase())
      );
      if (subject) {
        handleLogSession(subject.id, args.durationMinutes, args.date);
      }
    } else if (action === 'updateSchedule') {
      const subject = state.subjects.find(s =>
        s.name.toLowerCase().includes(args.subjectName.toLowerCase())
      );
      if (subject) {
        handleAddSchedule({
          subjectId: subject.id,
          day: args.day as DayOfWeek,
          startTime: args.startTime,
          endTime: args.endTime
        });
      }
    }
  }, [state.subjects, handleLogSession, handleAddSchedule]);

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
      case 'ANALYTICS':
        return <Analytics state={state} />;
      case 'CHATBOT':
        return <Chatbot state={state} onUpdateFromAI={handleUpdateFromAI} />;
      case 'SETTINGS':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
              <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
              <p className="text-slate-500">Manage your profile and study categories.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Profile Settings */}
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  User Profile
                </h2>

                {/* Auth Status */}
                <div className="bg-blue-50 p-4 rounded-xl mb-4">
                  {user ? (
                    <div className="flex items-center gap-3">
                      <img src={user.photoURL || "https://ui-avatars.com/api/?name=" + user.displayName} className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="font-bold text-slate-900">Logged in as {user.displayName}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <p className="text-slate-600">Sync your data across devices</p>
                      <button onClick={signInWithGoogle} className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50">
                        Sign in with Google
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">User Name</label>
                    <input
                      type="text"
                      value={state.user?.name}
                      onChange={(e) => setState(prev => ({ ...prev, user: prev.user ? { ...prev.user, name: e.target.value } : null }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Profile Picture Upload - Removed */}
                  {/* 
                  {user && (
                    <div>
                      ...
                    </div>
                  )}
                  */}

                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Daily Goal (Hours)</label>
                    <input
                      type="number"
                      value={state.user?.dailyGoalHours}
                      onChange={(e) => setState(prev => ({ ...prev, user: prev.user ? { ...prev.user, dailyGoalHours: Number(e.target.value) } : null }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="pt-4 border-t border-slate-50">
                    <button
                      onClick={() => { if (confirm('Erase all data?')) { clearState(); window.location.reload(); } }}
                      className="text-red-600 text-sm font-medium hover:text-red-700 transition-colors flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Reset all application data
                    </button>
                  </div>
                </div>
              </div>

              {/* Manage Subjects */}
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  Manage Subjects
                </h2>

                <div className="space-y-4">
                  {/* Add New Subject */}
                  <div className="flex gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="New subject name..."
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <input
                      type="color"
                      value={newSubjectColor}
                      onChange={(e) => setNewSubjectColor(e.target.value)}
                      className="w-10 h-10 p-1 bg-white border border-slate-200 rounded-xl cursor-pointer"
                    />
                    <button
                      onClick={handleAddSubject}
                      className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  {/* List of Subjects */}
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                    {state.subjects.map(subject => (
                      <div key={subject.id} className="group flex items-center justify-between bg-white border border-slate-100 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: subject.color }}></div>
                          {editingSubjectId === subject.id ? (
                            <input
                              type="text"
                              defaultValue={subject.name}
                              onBlur={(e) => handleUpdateSubject(subject.id, e.target.value, subject.color)}
                              autoFocus
                              className="bg-white border border-slate-200 rounded px-2 py-0.5 text-sm"
                            />
                          ) : (
                            <span className="text-sm font-medium text-slate-700">{subject.name}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingSubjectId(subject.id)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button
                            onClick={() => handleDeleteSubject(subject.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
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
