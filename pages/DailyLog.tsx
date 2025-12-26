import React, { useState, useMemo } from 'react';
import { AppState, ActivityType, ActivityLog, Subject } from '../types';

interface DailyLogProps {
    state: AppState;
    onLogActivity: (log: Omit<ActivityLog, 'id' | 'userId'>) => void;
}

const DailyLog: React.FC<DailyLogProps> = ({ state, onLogActivity }) => {
    const [selectedType, setSelectedType] = useState<ActivityType>(ActivityType.STUDY);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState(60);
    const [startTime, setStartTime] = useState(new Date().toTimeString().slice(0, 5)); // HH:MM

    // Filter logs for today
    const today = new Date().toISOString().split('T')[0];
    const todaysLogs = useMemo(() => {
        return state.logs.filter(log => log.startTime.startsWith(today)).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }, [state.logs, today]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Calculate start and end ISO strings based on "today" and input time
        const startDateTime = new Date(`${today}T${startTime}:00`);
        const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

        const newLog: Omit<ActivityLog, 'id' | 'userId'> = {
            type: selectedType,
            title: title || selectedType,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            durationMinutes: duration,
            subjectId: selectedType === ActivityType.STUDY ? selectedSubjectId : undefined,
            note: description
        };

        onLogActivity(newLog);

        // Reset form generic parts
        setTitle('');
        setDescription('');
    };

    const getActivityColor = (type: ActivityType) => {
        switch (type) {
            case ActivityType.STUDY: return 'bg-blue-100 text-blue-800 border-blue-200';
            case ActivityType.SLEEP: return 'bg-purple-100 text-purple-800 border-purple-200';
            case ActivityType.MEAL: return 'bg-orange-100 text-orange-800 border-orange-200';
            case ActivityType.SOCIAL: return 'bg-pink-100 text-pink-800 border-pink-200';
            case ActivityType.EXERCISE: return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
                <h1 className="text-3xl font-bold text-slate-900">Daily Workflow</h1>
                <p className="text-slate-500">Track your entire day: sleep, study, meals, and more.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Col: Timeline */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <h2 className="text-xl font-bold mb-6">Today's Timeline ({today})</h2>

                    <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pl-6 py-2">
                        {todaysLogs.length === 0 && (
                            <p className="text-slate-400 italic">No activities logged yet today.</p>
                        )}

                        {todaysLogs.map(log => (
                            <div key={log.id} className="relative">
                                <span className={`absolute -left-[33px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${getActivityColor(log.type).split(' ')[0]}`}></span>
                                <div className={`p-4 rounded-2xl border ${getActivityColor(log.type)}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-xs font-bold uppercase tracking-wider opacity-70">{log.type}</span>
                                            <h3 className="font-bold text-lg">{log.title}</h3>
                                            {log.note && <p className="text-sm opacity-80 mt-1">{log.note}</p>}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold opacity-80">
                                                {new Date(log.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                                {new Date(log.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <p className="text-xs opacity-60">{log.durationMinutes} min</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Col: Add Activity */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-fit">
                    <h2 className="text-xl font-bold mb-4">Log Activity</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Type Selector */}
                        <div className="grid grid-cols-3 gap-2">
                            {Object.values(ActivityType).map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setSelectedType(type)}
                                    className={`p-2 rounded-xl text-xs font-bold transition-all ${selectedType === type ? 'bg-slate-800 text-white shadow-lg scale-105' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        {/* Inputs based on type */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder={selectedType === ActivityType.SLEEP ? "Night Sleep" : "Activity Name"}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                required={selectedType !== ActivityType.STUDY && selectedType !== ActivityType.SLEEP}
                            />
                        </div>

                        {selectedType === ActivityType.STUDY && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                                <select
                                    value={selectedSubjectId}
                                    onChange={e => setSelectedSubjectId(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select Subject</option>
                                    {state.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={e => setStartTime(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Duration (min)</label>
                                <input
                                    type="number"
                                    value={duration}
                                    onChange={e => setDuration(Number(e.target.value))}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                    min="1"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                            />
                        </div>

                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">
                            Log Activity
                        </button>

                    </form>
                </div>

            </div>
        </div>
    );
};

export default DailyLog;
