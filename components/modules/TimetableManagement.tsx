
import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import Button from '../common/Button';

const TimetableManagement: React.FC = () => {
    const { students, staff, timetable, setTimetable, subjects, addActivity } = useApp();
    const uniqueClasses = useMemo(() => [...new Set(students.map(s => s.class))].sort(), [students]);
    const [selectedClass, setSelectedClass] = useState(uniqueClasses[0] || '');
    const [editMode, setEditMode] = useState(false);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
    const periods = [1, 2, 3, 4, 5, 6, 7, 8];

    const handleCellChange = (day: string, period: number, field: 'subjectId' | 'teacherId', value: string) => {
        const id = Number(value);
        setTimetable(prev => {
            const index = prev.findIndex(t => t.class === selectedClass && t.dayOfWeek === day && t.period === period);
            const newTimetable = [...prev];
            if (index > -1) {
                newTimetable[index] = { ...newTimetable[index], [field]: field === 'teacherId' ? id : value };
            } else {
                newTimetable.push({
                    id: Date.now(),
                    class: selectedClass,
                    dayOfWeek: day as any,
                    period,
                    subjectId: field === 'subjectId' ? value : (subjects[0]?.id || ''),
                    teacherId: field === 'teacherId' ? id : (staff[0]?.id || 0)
                });
            }
            return newTimetable;
        });
    };

    const saveTimetable = () => {
        setEditMode(false);
        addActivity('Timetable Updated', `Schedule updated for class ${selectedClass}`);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Routine Master</h1>
                <div className="flex space-x-3 bg-white dark:bg-gray-800 p-1 rounded-2xl shadow-sm border dark:border-gray-700">
                    <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="p-2 rounded-xl border dark:bg-gray-700 font-bold text-sm outline-none">
                        {uniqueClasses.map(c => <option key={c} value={c}>{c === 'All' ? 'Select Class' : `Class ${c}`}</option>)}
                    </select>
                    {editMode ? (
                        <Button onClick={saveTimetable} icon="save" className="rounded-xl">Save All</Button>
                    ) : (
                        <Button onClick={() => setEditMode(true)} icon="edit" variant="secondary" className="rounded-xl">Edit Mode</Button>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden overflow-x-auto custom-scrollbar">
                <table className="w-full border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700/50">
                            <th className="p-5 border-b dark:border-gray-600 text-xs font-bold uppercase text-gray-400">Period</th>
                            {days.map(day => <th key={day} className="p-5 border-b dark:border-gray-600 text-xs font-bold uppercase text-gray-400">{day}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {periods.map(period => (
                            <tr key={period} className="hover:bg-indigo-50/10 transition-colors">
                                <td className="p-5 border-r dark:border-gray-600 font-black text-xs bg-gray-50/50 dark:bg-gray-700/30 text-center uppercase tracking-widest text-gray-400">#{period}</td>
                                {days.map(day => {
                                    const entry = timetable.find(t => t.class === selectedClass && t.dayOfWeek === day && t.period === period);
                                    return (
                                        <td key={`${day}-${period}`} className="p-3 border dark:border-gray-700 min-w-[160px]">
                                            {editMode ? (
                                                <div className="space-y-1">
                                                    <select 
                                                        value={entry?.subjectId || ''} 
                                                        onChange={e => handleCellChange(day, period, 'subjectId', e.target.value)}
                                                        className="w-full text-[10px] font-bold p-2 rounded-xl border dark:bg-gray-700 focus:ring-2 ring-indigo-500"
                                                    >
                                                        <option value="">- Subject -</option>
                                                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                    </select>
                                                    <select 
                                                        value={entry?.teacherId || ''} 
                                                        onChange={e => handleCellChange(day, period, 'teacherId', e.target.value)}
                                                        className="w-full text-[10px] p-2 rounded-xl border dark:bg-gray-700 focus:ring-2 ring-indigo-500"
                                                    >
                                                        <option value="">- Teacher -</option>
                                                        {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                    </select>
                                                </div>
                                            ) : (
                                                <div className="text-center p-2 rounded-xl border border-transparent group hover:border-indigo-100 transition-all">
                                                    <p className="font-bold text-sm text-indigo-600 dark:text-indigo-400 truncate">{subjects.find(s => s.id === entry?.subjectId)?.name || '-'}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter truncate">{staff.find(s => s.id === entry?.teacherId)?.name || '-'}</p>
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="text-[10px] text-gray-400 text-center font-black uppercase tracking-widest">Select a class to load its specific timetable</p>
        </div>
    );
};

export default TimetableManagement;
