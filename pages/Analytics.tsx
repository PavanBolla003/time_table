
import React, { useMemo } from 'react';
import { AppState } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie, Legend, LineChart, Line
} from 'recharts';

interface AnalyticsProps {
  state: AppState;
}

const Analytics: React.FC<AnalyticsProps> = ({ state }) => {
  const { logs, subjects } = state;

  // Process subject-wise data
  const subjectData = useMemo(() => {
    const data: Record<string, { name: string; minutes: number; color: string }> = {};
    logs.forEach(log => {
      const subject = subjects.find(s => s.id === log.subjectId);
      if (!subject) return;
      if (!data[subject.id]) {
        data[subject.id] = { name: subject.name, minutes: 0, color: subject.color };
      }
      data[subject.id].minutes += log.durationMinutes;
    });
    return Object.values(data).sort((a, b) => b.minutes - a.minutes);
  }, [logs, subjects]);

  // Process daily progress (last 7 days)
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

    logs.forEach(log => {
      if (data[log.date] !== undefined) {
        data[log.date] += log.durationMinutes;
      }
    });

    return last7Days.map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      hours: parseFloat((data[date] / 60).toFixed(1)),
    }));
  }, [logs]);

  const totalMinutes = subjectData.reduce((acc, curr) => acc + curr.minutes, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Study Analytics</h1>
        <p className="text-slate-500">Insights into your learning habits and time allocation.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Weekly Trend */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Weekly Study Trend (Hours)</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Breakdown */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Time by Subject</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subjectData}
                  dataKey="minutes"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                >
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${Math.floor(value / 60)}h ${value % 60}m`, 'Study Time']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performer Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm col-span-1 md:col-span-2 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold text-slate-900">Lifetime Focus</h3>
            <p className="text-slate-500">You have dedicated a total of <span className="font-bold text-blue-600">{(totalMinutes / 60).toFixed(1)} hours</span> to your education.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {subjectData.map(subject => (
              <div key={subject.name} className="flex items-center space-x-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }}></div>
                <span className="text-sm font-medium text-slate-700">{subject.name}</span>
                <span className="text-sm font-bold text-slate-900">{((subject.minutes / totalMinutes) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
