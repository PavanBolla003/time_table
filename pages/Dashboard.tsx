
import React from 'react';
import { AppState, Subject, DayOfWeek } from '../types';
import StudyTimer from '../components/StudyTimer';

interface DashboardProps {
  state: AppState;
  onLogSession: (subjectId: string, durationMinutes: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, onLogSession }) => {
  const { user, logs, subjects, schedules } = state;
  const today = new Date().toISOString().split('T')[0];
  const todayLogs = logs.filter(l => l.date === today);
  const totalMinutesToday = todayLogs.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const progress = Math.min((totalMinutesToday / ((user?.dailyGoalHours || 6) * 60)) * 100, 100);

  const getDayName = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()] as DayOfWeek;
  };

  const todaySchedule = schedules.filter(s => s.day === getDayName());

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user?.name}!</h1>
          <p className="text-slate-500 mt-1">Ready to smash your study goals today?</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 inline-flex items-center space-x-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-sm font-medium text-slate-600">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Progress & Timer */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg shadow-blue-100">
            <h3 className="text-lg font-semibold opacity-90">Daily Goal Progress</h3>
            <div className="mt-4 flex items-baseline space-x-2">
              <span className="text-4xl font-bold">{(totalMinutesToday / 60).toFixed(1)}</span>
              <span className="text-lg opacity-75">/ {user?.dailyGoalHours}h</span>
            </div>
            <div className="mt-6 w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="mt-4 text-sm opacity-90">
              {progress >= 100 ? "Goal achieved! 🥳" : `${Math.ceil((user!.dailyGoalHours * 60 - totalMinutesToday) / 60)}h remaining today.`}
            </p>
          </div>

          <StudyTimer subjects={subjects} onLogSession={onLogSession} />
        </div>

        {/* Middle Column - Today's Schedule */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800">Today's Schedule</h3>
          </div>
          <div className="space-y-3">
            {todaySchedule.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 p-8 rounded-2xl text-center">
                <p className="text-slate-400 italic">No classes scheduled for today.</p>
              </div>
            ) : (
              todaySchedule.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(item => {
                const subject = subjects.find(s => s.id === item.subjectId);
                return (
                  <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
                    <div className="w-2 h-10 rounded-full" style={{ backgroundColor: subject?.color }}></div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800">{subject?.name}</h4>
                      <p className="text-sm text-slate-500">{item.startTime} - {item.endTime}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column - Recent Activity */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xl font-bold text-slate-800">Recent Logs</h3>
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-50">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm italic">No logs found.</div>
            ) : (
              logs.slice(-5).reverse().map(log => {
                const subject = subjects.find(s => s.id === log.subjectId);
                return (
                  <div key={log.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: subject?.color }}>
                        {subject?.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{subject?.name}</p>
                        <p className="text-xs text-slate-400">{new Date(log.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-slate-600">{log.durationMinutes}m</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
