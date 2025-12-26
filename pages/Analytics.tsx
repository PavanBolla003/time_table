import React, { useMemo } from 'react';
import { AppState, ActivityType } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend, LineChart, Line
} from 'recharts';

interface AnalyticsProps {
  state: AppState;
}

const Analytics: React.FC<AnalyticsProps> = ({ state }) => {
  const { logs, subjects } = state;

  // Study Logs only for Study Charts
  const studyLogs = logs.filter(l => l.type === ActivityType.STUDY && l.subjectId);

  // Process subject-wise data
  const subjectData = useMemo(() => {
    const data: Record<string, { name: string; minutes: number; color: string }> = {};
    studyLogs.forEach(log => {
      const subject = subjects.find(s => s.id === log.subjectId);
      if (!subject) return;
      if (!data[subject.id]) {
        data[subject.id] = { name: subject.name, minutes: 0, color: subject.color };
      }
      data[subject.id].minutes += log.durationMinutes;
    });
    return Object.values(data).sort((a, b) => b.minutes - a.minutes);
  }, [studyLogs, subjects]);

  // Activity Breakdown
  const activityData = useMemo(() => {
    const data: Record<string, number> = {};
    logs.forEach(log => {
      data[log.type] = (data[log.type] || 0) + log.durationMinutes;
    });

    const colors: Record<string, string> = {
      [ActivityType.STUDY]: '#3b82f6',
      [ActivityType.SLEEP]: '#a855f7',
      [ActivityType.MEAL]: '#f97316',
      [ActivityType.SOCIAL]: '#ec4899',
      [ActivityType.EXERCISE]: '#22c55e',
      [ActivityType.CLASS]: '#06b6d4',
      [ActivityType.OTHER]: '#64748b',
    };

    return Object.entries(data).map(([type, minutes]) => ({
      name: type,
      minutes,
      color: colors[type] || '#ccc'
    })).sort((a, b) => b.minutes - a.minutes);
  }, [logs]);

  // Process daily progress (last 7 days - Total Study)
  const dailyData = useMemo(() => {
    const data: Record<string, number> = {};
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    last7Days.forEach(date => {
      data[date] = 0;
    });

    studyLogs.forEach(log => {
      const dateKey = log.startTime.split('T')[0];
      if (data[dateKey] !== undefined) {
        data[dateKey] += log.durationMinutes;
      }
    });

    return last7Days.map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      hours: parseFloat((data[date] / 60).toFixed(1)),
    }));
  }, [studyLogs]);

  const totalStudyMinutes = subjectData.reduce((acc, curr) => acc + curr.minutes, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Analytics & Insights</h1>
        <p className="text-slate-500">Visualize your workflow, sleep, and study habits.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Activity Breakdown - NEW */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Daily Workflow Breakdown</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activityData}
                  dataKey="minutes"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                >
                  {activityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${Math.floor(value / 60)}h ${value % 60}m`, 'Duration']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ paddingLeft: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Trend - Study */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Study Consistency (Last 7 Days)</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Improved Subject Breakdown */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Subject Distribution</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  formatter={(value: number) => [`${Math.floor(value / 60)}h ${value % 60}m`, 'Time']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="minutes" radius={[0, 4, 4, 0]}>
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Total Study Time</h3>
              <p className="text-3xl font-black text-blue-600">{(totalStudyMinutes / 60).toFixed(1)} <span className="text-lg text-slate-400 font-medium">hours</span></p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
