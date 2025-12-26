import React, { useState } from 'react';
import { AppState, Subject } from '../types';
import { clearState } from '../db';
import { useAuth } from '../AuthContext';

interface SettingsProps {
    state: AppState;
    setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const Settings: React.FC<SettingsProps> = ({ state, setState }) => {
    const { user, signInWithGoogle } = useAuth();
    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectColor, setNewSubjectColor] = useState('#3b82f6');
    const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);

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

    const handleUserUpdate = (field: string, value: any) => {
        setState(prev => ({
            ...prev,
            user: prev.user ? { ...prev.user, [field]: value } : null
        }));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
                <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
                <p className="text-slate-500">Manage your profile, goals, and study categories.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Profile Settings */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        User Profile & Goals
                    </h2>

                    {/* Auth Status */}
                    <div className="bg-blue-50 p-4 rounded-xl mb-4">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <img src={user.photoURL || "https://ui-avatars.com/api/?name=" + user.displayName} className="w-10 h-10 rounded-full" alt="Profile" />
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
                            <label className="text-sm font-medium text-slate-700 block mb-1">Display Name</label>
                            <input
                                type="text"
                                value={state.user?.name || ''}
                                onChange={(e) => handleUserUpdate('name', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1">Daily Study Goal (Hours)</label>
                                <input
                                    type="number"
                                    value={state.user?.dailyGoalHours || 0}
                                    onChange={(e) => handleUserUpdate('dailyGoalHours', Number(e.target.value))}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1">Sleep Goal (Hours)</label>
                                <input
                                    type="number"
                                    value={state.user?.sleepGoalHours || 0}
                                    onChange={(e) => handleUserUpdate('sleepGoalHours', Number(e.target.value))}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1">Social Media Limit (Minutes)</label>
                            <input
                                type="number"
                                value={state.user?.socialMediaLimitMinutes || 0}
                                onChange={(e) => handleUserUpdate('socialMediaLimitMinutes', Number(e.target.value))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:outline-none"
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
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-none">
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
};

export default Settings;
