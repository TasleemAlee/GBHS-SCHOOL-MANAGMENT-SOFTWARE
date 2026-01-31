
import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import Button from '../common/Button';
import 'jspdf-autotable';
import { type Mark } from '../../types';

const Marksheets: React.FC = () => {
    const { students, marks, setMarks, sessions, setSessions, subjects, setSubjects, addActivity } = useApp();
    const [view, setView] = useState<'edit' | 'setup'>('edit');
    const [selectedBatch, setSelectedBatch] = useState('All');
    const [selectedTerm, setSelectedTerm] = useState<'Mid-Term' | 'Final-Exam'>('Mid-Term');
    const [selectedYear, setSelectedYear] = useState(sessions[sessions.length - 1]);
    
    const [draftMarks, setDraftMarks] = useState<Record<string, number>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');

    const [newSubject, setNewSubject] = useState('');
    const [newSession, setNewSession] = useState('');

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

    const handleMarkChange = (studentId: number, subjectId: string, val: string) => {
        const numVal = parseInt(val);
        const value = isNaN(numVal) ? 0 : Math.min(100, Math.max(0, numVal));
        const key = `${studentId}-${subjectId}-${selectedTerm}-${selectedYear}`;
        setDraftMarks(prev => ({ ...prev, [key]: value }));
    };

    const saveAllMarks = () => {
        setIsSaving(true);
        const updates: Mark[] = [];
        Object.entries(draftMarks).forEach(([key, score]) => {
            const [studentId, subjectId, term, year] = key.split('-');
            updates.push({
                studentId: Number(studentId),
                subjectId,
                term: term as any,
                year,
                marks: score as number,
                totalMarks: 100
            });
        });

        setMarks(prev => {
            let newList = [...prev];
            updates.forEach(upd => {
                const idx = newList.findIndex(m => 
                    m.studentId === upd.studentId && 
                    m.subjectId === upd.subjectId && 
                    m.term === upd.term && 
                    m.year === upd.year
                );
                if (idx > -1) newList[idx] = upd;
                else newList.push(upd);
            });
            return newList;
        });

        setTimeout(() => {
            setIsSaving(false);
            setDraftMarks({});
            addActivity('Exam Update', `Updated marks for Batch ${selectedBatch}`);
            setStatusMsg('Marks committed to official record.');
            setTimeout(() => setStatusMsg(''), 3000);
        }, 800);
    };

    const getMarkValue = (studentId: number, subjectId: string) => {
        const key = `${studentId}-${subjectId}-${selectedTerm}-${selectedYear}`;
        if (draftMarks[key] !== undefined) return draftMarks[key];
        const existing = marks.find(m => 
            m.studentId === studentId && 
            m.subjectId === subjectId && 
            m.term === selectedTerm && 
            m.year === selectedYear
        );
        return existing ? existing.marks : '';
    };

    const addSubject = () => {
        if (!newSubject.trim()) return;
        const newId = newSubject.trim().toLowerCase().replace(/\s+/g, '-');
        if (subjects.some(s => s.id === newId)) {
            alert('Subject with this name already exists.');
            return;
        }
        setSubjects(prev => [...prev, { id: newId, name: newSubject.trim() }]);
        addActivity('System Update', `Added subject: ${newSubject.trim()}`);
        setNewSubject('');
    };

    const deleteSubject = (id: string) => {
        if (window.confirm('Are you sure you want to delete this subject? All associated marks will remain but will be orphaned.')) {
            const subjectName = subjects.find(s => s.id === id)?.name;
            setSubjects(prev => prev.filter(s => s.id !== id));
            addActivity('System Update', `Removed subject: ${subjectName}`);
        }
    };

    const addSession = () => {
        if (!newSession.trim() || !/^\d{4}-\d{2}$/.test(newSession.trim())) {
            alert('Please use the format YYYY-YY (e.g., 2024-25)');
            return;
        }
        if (sessions.includes(newSession.trim())) {
            alert('This session already exists.');
            return;
        }
        setSessions(prev => [...prev, newSession.trim()].sort());
        addActivity('System Update', `Added session: ${newSession.trim()}`);
        setNewSession('');
    };

    const deleteSession = (session: string) => {
        if (window.confirm('Are you sure you want to delete this session?')) {
            setSessions(prev => prev.filter(s => s !== session));
            addActivity('System Update', `Removed session: ${session}`);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in no-print">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white uppercase tracking-tight">Academic Grading</h1>
                <div className="flex bg-white dark:bg-gray-800 p-1 rounded-2xl shadow-sm border dark:border-gray-700">
                    <button onClick={() => setView('edit')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${view === 'edit' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500'}`}>Score Entry</button>
                    <button onClick={() => setView('setup')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${view === 'setup' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500'}`}>Subject Setup</button>
                </div>
            </div>

            {statusMsg && (
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-4 rounded-2xl text-green-700 dark:text-green-300 font-bold text-sm flex items-center">
                    <span className="material-icons-sharp mr-2 text-sm">check_circle</span>
                    {statusMsg}
                </div>
            )}

            {view === 'edit' ? (
                <>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400">Academic Session</label>
                            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="w-full p-3 border rounded-2xl dark:bg-gray-700 text-sm dark:text-white">
                                {sessions.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400">Term</label>
                            <select value={selectedTerm} onChange={e => setSelectedTerm(e.target.value as any)} className="w-full p-3 border rounded-2xl dark:bg-gray-700 text-sm dark:text-white">
                                <option>Mid-Term</option>
                                <option>Final-Exam</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-indigo-500">Target Batch</label>
                            <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} className="w-full p-3 border rounded-2xl dark:bg-gray-700 font-bold text-sm dark:text-white">
                                <option value="All">-- Select Batch --</option>
                                {availableBatches.filter(b => b !== 'All').map(b => <option key={b} value={b}>Batch {b}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1 flex items-end">
                            <Button icon="save" onClick={saveAllMarks} disabled={isSaving || Object.keys(draftMarks).length === 0 || selectedBatch === 'All'} className="w-full py-3 shadow-md">
                                {isSaving ? 'Processing...' : 'Commit Results'}
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left min-w-[1000px]">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="p-5 text-xs font-bold uppercase text-gray-400">Student Identity</th>
                                        {subjects.map(sub => <th key={sub.id} className="p-5 text-xs font-bold uppercase text-gray-400 text-center">{sub.name}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedBatch === 'All' ? (
                                        <tr>
                                            <td colSpan={subjects.length + 1} className="p-24 text-center text-gray-400">
                                                <span className="material-icons-sharp text-7xl block mb-4 opacity-10">history_edu</span>
                                                <p className="font-bold uppercase tracking-widest text-xs">Select a batch to load marksheets.</p>
                                            </td>
                                        </tr>
                                    ) : filteredStudents.length > 0 ? filteredStudents.map(student => (
                                        <tr key={student.id} className="border-b dark:border-gray-700 hover:bg-indigo-50/20 transition-all">
                                            <td className="p-5 whitespace-nowrap">
                                                <p className="font-bold text-gray-900 dark:text-white leading-none">{student.name || student["Name of Pupil"]}</p>
                                                <p className="text-xs text-indigo-500 font-mono font-bold uppercase mt-1">GR: {student.rollNo || student["General Register No."]}</p>
                                            </td>
                                            {subjects.map(sub => (
                                                <td key={sub.id} className="p-5 text-center">
                                                    <input 
                                                        type="number" 
                                                        className={`w-16 p-2 text-center border rounded-xl dark:bg-gray-700 outline-none transition-all text-sm font-bold dark:text-white ${draftMarks[`${student.id}-${sub.id}-${selectedTerm}-${selectedYear}`] !== undefined ? 'border-indigo-500 bg-indigo-50' : 'dark:border-gray-600'}`} 
                                                        value={getMarkValue(student.id, sub.id)}
                                                        onChange={e => handleMarkChange(student.id, sub.id, e.target.value)}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={subjects.length + 1} className="p-20 text-center text-gray-400 italic">No records found for Batch {selectedBatch}.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border dark:border-gray-700">
                        <h2 className="text-xl font-black mb-4">Academic Subjects</h2>
                        <div className="space-y-2 mb-4">
                            {subjects.map(s => (
                                <div key={s.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                    <p className="font-bold text-sm">{s.name}</p>
                                    <button onClick={() => deleteSubject(s.id)} className="text-red-400 hover:text-red-600"><span className="material-icons-sharp text-base">delete</span></button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="New Subject Name" className="flex-1 p-2 border rounded-xl dark:bg-gray-700 text-sm"/>
                            <Button onClick={addSubject}>Add</Button>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border dark:border-gray-700">
                        <h2 className="text-xl font-black mb-4">Academic Sessions</h2>
                        <div className="space-y-2 mb-4">
                            {sessions.map(s => (
                                <div key={s} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                    <p className="font-bold text-sm">{s}</p>
                                    <button onClick={() => deleteSession(s)} className="text-red-400 hover:text-red-600"><span className="material-icons-sharp text-base">delete</span></button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input value={newSession} onChange={e => setNewSession(e.target.value)} placeholder="e.g., 2024-25" className="flex-1 p-2 border rounded-xl dark:bg-gray-700 text-sm"/>
                            <Button onClick={addSession}>Add</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Marksheets;
