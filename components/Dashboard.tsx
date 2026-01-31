
import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { type ModuleId } from '../types';
import ZenithAI from './common/ZenithAI';

const Dashboard: React.FC<{setActiveModule: (id: ModuleId) => void}> = ({setActiveModule}) => {
    const { students, staff, fees, activities, attendance, isOffline, lastSync, schoolSettings } = useApp();
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formattedDate = currentDateTime.toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const formattedTime = currentDateTime.toLocaleTimeString();

    const todayDate = new Date().toISOString().split('T')[0];
    const todayAttendance = useMemo(() => {
        const records = attendance.filter(a => a.date === todayDate);
        const present = records.filter(r => r.status === 'present').length;
        const absent = records.filter(r => r.status === 'absent').length;
        return { present, absent, total: records.length };
    }, [attendance, todayDate]);

    const totalRevenue = fees.filter(f => f.status === 'Paid').reduce((acc, f) => acc + f.amount, 0);
    const pendingRevenue = fees.filter(f => f.status !== 'Paid').reduce((acc, f) => acc + f.amount, 0);

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">GBHS SABU RAHU</h1>
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Management Dashboard</p>
                </div>
                <div className="text-right">
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{formattedTime}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">{formattedDate}</p>
                </div>
                <div className="flex items-center space-x-2 text-xs bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <span className={`h-2.5 w-2.5 rounded-full ${isOffline ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse`}></span>
                    <span className="font-bold uppercase tracking-widest text-[10px] dark:text-white">{isOffline ? 'Offline Database' : 'Server Online'}</span>
                    {!isOffline && <span className="text-xs text-gray-400 ml-2">[{new Date(lastSync).toLocaleTimeString()}]</span>}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <ZenithAI />
                </div>
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8 rounded-3xl shadow-lg text-white flex flex-col justify-center">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Quick Command</p>
                    <p className="text-xl font-black leading-tight">Press <kbd className="bg-white/20 px-2 py-0.5 rounded border border-white/30 text-sm">CMD + K</kbd> to find any student or record instantly.</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Students</p>
                        <span className="material-icons-sharp text-emerald-500 group-hover:scale-125 transition-transform">groups</span>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white">{students.length}</h3>
                    <p className="text-[10px] text-emerald-600 font-bold mt-1">Total Boys Enrolled</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Attendance</p>
                        <span className="material-icons-sharp text-blue-500 group-hover:scale-125 transition-transform">how_to_reg</span>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white">{todayAttendance.present}</h3>
                    <p className="text-[10px] text-gray-400 font-bold mt-1">Present Today ({todayAttendance.absent} Absent)</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Collection</p>
                        <span className="material-icons-sharp text-indigo-500 group-hover:scale-125 transition-transform">payments</span>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white">Rs. {totalRevenue.toLocaleString()}</h3>
                    <p className="text-[10px] text-indigo-500 font-bold mt-1">Fee Collection Total</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Staff</p>
                        <span className="material-icons-sharp text-emerald-600 group-hover:scale-125 transition-transform">badge</span>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white">{staff.length}</h3>
                    <p className="text-[10px] text-emerald-600 font-bold mt-1">Teaching & Support Staff</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h2 className="text-xl font-black mb-8 uppercase tracking-widest text-gray-400">Main Modules</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { id: 'attendance', icon: 'checklist', label: 'Roll Call', color: 'text-blue-500', bg: 'bg-blue-50' },
                                { id: 'student-management', icon: 'person_add', label: 'Admission', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                { id: 'marks-sheets', icon: 'history_edu', label: 'Exams', color: 'text-purple-500', bg: 'bg-purple-50' },
                                { id: 'announcements', icon: 'campaign', label: 'SMS Blast', color: 'text-orange-500', bg: 'bg-orange-50' }
                            ].map(tool => (
                                <button 
                                    key={tool.id} 
                                    onClick={() => setActiveModule(tool.id as any)} 
                                    className="p-6 rounded-3xl flex flex-col items-center hover:scale-105 transition-all shadow-sm border dark:border-gray-700 bg-white dark:bg-gray-800 active:scale-95"
                                >
                                    <div className={`${tool.bg} dark:bg-gray-700 p-4 rounded-2xl mb-3`}>
                                        <span className={`material-icons-sharp ${tool.color} text-3xl`}>{tool.icon}</span>
                                    </div>
                                    <span className="text-xs font-black text-gray-700 dark:text-gray-200 uppercase tracking-widest">{tool.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-[500px]">
                    <h2 className="text-xl font-black mb-8 uppercase tracking-widest text-gray-400">History Feed</h2>
                    <div className="overflow-y-auto space-y-4 flex-1 pr-2 custom-scrollbar">
                        {activities.length > 0 ? activities.map(act => (
                            <div key={act.id} className="flex space-x-4 p-4 bg-gray-50/50 dark:bg-gray-700/30 rounded-2xl border border-gray-50 dark:border-gray-700">
                                <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 shadow-sm border dark:border-gray-600">
                                    <span className="material-icons-sharp text-emerald-600 text-lg">bolt</span>
                                </div>
                                <div>
                                    <p className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-tight leading-none">{act.action}</p>
                                    <p className="text-xs text-gray-500 font-medium mt-1">{act.details}</p>
                                    <p className="text-[9px] text-gray-400 mt-2 font-black uppercase">{new Date(act.timestamp).toLocaleTimeString()}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-20">
                                <span className="material-icons-sharp text-6xl mb-2">feed</span>
                                <p className="text-xs font-black uppercase tracking-widest">No Recent Logs</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
