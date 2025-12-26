
import React, { useState } from 'react';
import { AppState, DayOfWeek, ScheduleItem, Subject } from '../types';
import { DAYS_OF_WEEK } from '../constants';

interface TimetableProps {
  state: AppState;
  onAddSchedule: (item: Omit<ScheduleItem, 'id' | 'userId'>) => void;
  onRemoveSchedule: (id: string) => void;
}

const Timetable: React.FC<TimetableProps> = ({ state, onAddSchedule, onRemoveSchedule }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    subjectId: state.subjects[0]?.id || '',
    day: DayOfWeek.MONDAY,
    startTime: '09:00',
    endTime: '10:00',
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSchedule(newEntry);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Weekly Planner</h1>
          <p className="text-slate-500">Organize your repeating classes and sessions.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center space-x-2 shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Schedule</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-x-auto scrollbar-hide">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-7 border-b border-slate-100">
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className="py-4 text-center border-r border-slate-50 last:border-0">
                <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">{day}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 h-[600px]">
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className="border-r border-slate-50 last:border-0 p-3 space-y-3 bg-slate-50/30 overflow-y-auto scrollbar-hide">
                {state.schedules
                  .filter(s => s.day === day)
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map(item => {
                    const subject = state.subjects.find(s => s.id === item.subjectId);
                    return (
                      <div 
                        key={item.id} 
                        className="group relative bg-white p-3 rounded-xl border border-slate-100 shadow-sm transition-all hover:shadow-md cursor-default"
                        style={{ borderLeftColor: subject?.color, borderLeftWidth: '4px' }}
                      >
                        <button 
                          onClick={() => onRemoveSchedule(item.id)}
                          className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <h4 className="text-xs font-bold text-slate-900 truncate">{subject?.name}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">{item.startTime} - {item.endTime}</p>
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Add Schedule Entry</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Subject</label>
                <select 
                  value={newEntry.subjectId}
                  onChange={(e) => setNewEntry({...newEntry, subjectId: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {state.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Day</label>
                  <select 
                    value={newEntry.day}
                    onChange={(e) => setNewEntry({...newEntry, day: e.target.value as DayOfWeek})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                   {/* Empty space for grid alignment */}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Start Time</label>
                  <input 
                    type="time" 
                    value={newEntry.startTime}
                    onChange={(e) => setNewEntry({...newEntry, startTime: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">End Time</label>
                  <input 
                    type="time" 
                    value={newEntry.endTime}
                    onChange={(e) => setNewEntry({...newEntry, endTime: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md"
                >
                  Add Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;
