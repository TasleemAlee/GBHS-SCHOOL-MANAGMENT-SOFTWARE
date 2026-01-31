
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { type AttendanceRecord, type Student } from '../../types';
import Button from '../common/Button';

const Attendance: React.FC = () => {
    const { students, attendance, setAttendance, addActivity, schoolSettings } = useApp();
    const [view, setView] = useState<'entry' | 'history'>('entry');
    const [selectedBatch, setSelectedBatch] = useState('All');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [tempAttendance, setTempAttendance] = useState<Record<number, AttendanceRecord['status']>>({});
    const [message, setMessage] = useState('');

    const availableBatches = useMemo(() => {
        const yearsSet = new Set<string>();
        students.forEach(s => {
            const dateStr = s['Date of Admission'] || s.admissionDate || s.AdmissionDate;
            if (dateStr) {
                const d = new Date(dateStr);
                if (!isNaN(d.getTime())) yearsSet.add(d.getFullYear().toString());
                else {
                    const match = String(dateStr).match(/\d{4}/);
                    if (match) yearsSet.add(match[0]);
                }
            }
        });
        return (['All', ...Array.from(yearsSet)] as string[]).sort((a, b) => b.localeCompare(a));
    }, [students]);
    
    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            if (s.status !== 'Studying') return false;
            if (selectedBatch === 'All') return true;
            
            const admDate = s['Date of Admission'] || s.admissionDate || s.AdmissionDate;
            let studentYear = 'N/A';
            if (admDate) {
                const d = new Date(admDate);
                if (!isNaN(d.getTime())) studentYear = d.getFullYear().toString();
                else {
                    const match = String(admDate).match(/\d{4}/);
                    if (match) studentYear = match[0];
                }
            }
            return studentYear === selectedBatch;
        });
    }, [students, selectedBatch]);

    useEffect(() => {
        if (view === 'entry' && selectedBatch !== 'All') {
            const existingForDate = attendance.filter(a => a.date === date);
            const map: Record<number, AttendanceRecord['status']> = {};
            existingForDate.forEach(a => { map[a.studentId] = a.status; });
            filteredStudents.forEach(student => { if (!map[student.id]) map[student.id] = 'present'; });
            setTempAttendance(map);
        } else {
            setTempAttendance({});
        }
    }, [date, selectedBatch, view, filteredStudents]);

    const handleStatus = (studentId: number, status: AttendanceRecord['status']) => {
        setTempAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const handleSubmit = () => {
        if (selectedBatch === 'All') return;
        const recordsToSave: AttendanceRecord[] = filteredStudents.map(student => ({
            studentId: student.id,
            date,
            status: tempAttendance[student.id] || 'present'
        }));
        setAttendance(prev => {
            const filteredOut = prev.filter(a => a.date !== date || !filteredStudents.some(s => s.id === a.studentId));
            return [...filteredOut, ...recordsToSave];
        });
        addActivity('Attendance Marked', `Batch ${selectedBatch} marked for ${date}.`);
        setMessage(`Attendance recorded successfully.`);
        setTimeout(() => setMessage(''), 3000);
    };

    const StudentAvatar = ({ student }: { student: Student }) => {
        const name = student["Name of Pupil"] || student.name || "?";
        if (student.profilePicUrl && !student.profilePicUrl.includes('pravatar.cc')) {
            return <img src={student.profilePicUrl} className="h-10 w-10 rounded-2xl object-cover border" alt="" />;
        }
        return (
            <div className="h-10 w-10 rounded-2xl flex items-center justify-center font-black text-white shadow-sm" style={{ backgroundColor: schoolSettings.primaryColor }}>
                {name.charAt(0).toUpperCase()}
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in no-print">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white uppercase tracking-tight">Attendance Ledger</h1>
                <div className="flex bg-white dark:bg-gray-800 p-1 rounded-2xl shadow-sm border dark:border-gray-700">
                    <button onClick={() => setView('entry')} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${view === 'entry' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500'}`}>Take Roll Call</button>
                    <button onClick={() => setView('history')} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${view === 'history' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500'}`}>History Logs</button>
                </div>
            </div>

            {view === 'entry' && (
                <>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase">Target Date</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-3 border rounded-2xl dark:bg-gray-700 outline-none focus:ring-2 ring-indigo-500 transition-all text-sm dark:text-white" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase">Target Batch</label>
                            <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} className="w-full p-3 border rounded-2xl dark:bg-gray-700 outline-none focus:ring-2 ring-indigo-500 transition-all text-sm dark:text-white">
                                <option value="All">-- Select Batch --</option>
                                {availableBatches.filter(b => b !== 'All').map(b => <option key={b} value={b}>Batch {b}</option>)}
                            </select>
                        </div>
                        <div className="lg:col-span-2 flex items-end">
                            <Button onClick={handleSubmit} icon="verified" className="w-full py-3 shadow-md" disabled={selectedBatch === 'All'}>Submit Daily Roll Call</Button>
                        </div>
                    </div>

                    {message && (
                        <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-4 rounded-2xl border border-green-200 dark:border-green-800 font-bold text-sm animate-fade-in flex items-center">
                            <span className="material-icons-sharp mr-2">check_circle</span>
                            {message}
                        </div>
                    )}

                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left min-w-[700px]">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="p-5 text-xs font-bold uppercase text-gray-400">Student Identity</th>
                                        <th className="p-5 text-xs font-bold uppercase text-gray-400">Status</th>
                                        <th className="p-5 text-xs font-bold uppercase text-gray-400 text-center">Marking</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedBatch === 'All' ? (
                                        <tr>
                                            <td colSpan={3} className="p-24 text-center text-gray-400">
                                                <span className="material-icons-sharp text-7xl block mb-4 opacity-10">checklist</span>
                                                <p className="font-bold uppercase tracking-widest text-xs">Select a batch to auto-fetch students.</p>
                                            </td>
                                        </tr>
                                    ) : filteredStudents.length > 0 ? filteredStudents.map(student => (
                                        <tr key={student.id} className="border-b dark:border-gray-700 hover:bg-indigo-50/20 transition-all">
                                            <td className="p-5 flex items-center space-x-4">
                                                <StudentAvatar student={student} />
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white leading-none">{student.name || student["Name of Pupil"]}</p>
                                                    <p className="text-[10px] text-indigo-500 font-mono font-bold uppercase mt-1">GR: {student.rollNo || student["General Register No."]}</p>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                    tempAttendance[student.id] === 'present' ? 'bg-green-100 text-green-700' :
                                                    tempAttendance[student.id] === 'absent' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {tempAttendance[student.id]}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex justify-center space-x-2">
                                                    {(['present', 'absent', 'leave'] as const).map(status => (
                                                        <button
                                                            key={status}
                                                            onClick={() => handleStatus(student.id, status)}
                                                            className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase ${
                                                                tempAttendance[student.id] === status 
                                                                ? 'ring-2 ring-offset-2 ring-indigo-500 scale-105 shadow-lg opacity-100' 
                                                                : 'opacity-20 grayscale hover:opacity-50'
                                                            }`}
                                                            style={{ 
                                                                backgroundColor: tempAttendance[student.id] === status ? (status === 'present' ? '#10b981' : status === 'absent' ? '#ef4444' : '#f59e0b') : '#9ca3af',
                                                                color: 'white'
                                                            }}
                                                        >
                                                            {status}
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={3} className="p-20 text-center text-gray-400 italic">No records found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {view === 'history' && (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border dark:border-gray-700 text-center py-20 text-gray-400">
                    <span className="material-icons-sharp text-6xl block mb-4 opacity-10">history</span>
                    <p className="font-bold uppercase tracking-widest text-xs">Attendance archives are processed automatically.</p>
                </div>
            )}
        </div>
    );
};

export default Attendance;
