
import React, { useState, useEffect, useRef } from 'react';
import { Subject } from '../types';

interface StudyTimerProps {
  subjects: Subject[];
  onLogSession: (subjectId: string, durationMinutes: number) => void;
}

const StudyTimer: React.FC<StudyTimerProps> = ({ subjects, onLogSession }) => {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  // Using any to avoid NodeJS.Timeout vs number conflict in browser environments
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const toggleTimer = () => setIsActive(!isActive);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStop = () => {
    if (seconds >= 60) {
      onLogSession(selectedSubjectId, Math.floor(seconds / 60));
    }
    setIsActive(false);
    setSeconds(0);
  };

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">Study Session</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isActive ? 'bg-green-100 text-green-700 animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
          {isActive ? 'Tracking' : 'Idle'}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center py-6">
        <div className="text-5xl font-mono font-bold tracking-tighter text-slate-900 tabular-nums">
          {formatTime(seconds)}
        </div>
        <p className="text-slate-400 text-sm mt-2">Hours : Minutes : Seconds</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Focusing on:</label>
          <select 
            disabled={isActive}
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
          >
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="flex space-x-2">
          <button 
            onClick={toggleTimer}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all shadow-sm ${
              isActive 
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isActive ? 'Pause' : 'Start Timer'}
          </button>
          
          {(seconds > 0 || isActive) && (
            <button 
              onClick={handleStop}
              className="px-4 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors shadow-sm"
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyTimer;
