
import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import Button from '../common/Button';
import jsPDF from 'jspdf';
import { type FeeRecord } from '../../types';

const FeeManagement: React.FC = () => {
    const { students, fees, setFees, classFees, setClassFees, schoolSettings, addActivity } = useApp();
    const [selectedClass, setSelectedClass] = useState('All');
    const [view, setView] = useState<'records' | 'config'>('records');
    const [statusMsg, setStatusMsg] = useState('');
    
    // Local state for fee config to allow 'Save All' behavior
    const [localClassFees, setLocalClassFees] = useState(classFees);

    const uniqueClasses = useMemo(() => ['All', ...new Set(students.map(s => s.class))].sort(), [students]);
    
    const filteredFees = useMemo(() => {
        return fees.filter(f => {
            const student = students.find(s => s.id === f.studentId);
            const matchesClass = selectedClass === 'All' || student?.class === selectedClass;
            return matchesClass;
        }).sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
    }, [fees, students, selectedClass]);

    const stats = useMemo(() => {
        const collected = filteredFees.filter(f => f.status === 'Paid').reduce((acc, f) => acc + f.amount, 0);
        const outstanding = filteredFees.filter(f => f.status !== 'Paid').reduce((acc, f) => acc + f.amount, 0);
        return { collected, outstanding, paidCount: filteredFees.filter(f => f.status === 'Paid').length, total: filteredFees.length };
    }, [filteredFees]);

    const markPaid = (feeId: number) => {
        setFees(prev => prev.map(f => f.id === feeId ? { ...f, status: 'Paid' } : f));
        
        const fee = fees.find(f => f.id === feeId);
        const student = students.find(s => s.id === fee?.studentId);
        addActivity('Fee Collection', `Payment of $${fee?.amount} received from ${student?.name || student?.["Name Of Student's"] || 'Student'}`);
        
        setStatusMsg('Payment recorded and saved to database!');
        setTimeout(() => setStatusMsg(''), 3000);
    };

    const handleLocalFeeChange = (className: string, amount: string) => {
        const val = parseFloat(amount) || 0;
        setLocalClassFees(prev => {
            const existing = prev.find(cf => cf.className === className);
            if (existing) return prev.map(cf => cf.className === className ? { ...cf, amount: val } : cf);
            return [...prev, { className, amount: val }];
        });
    };

    const saveFeeConfig = () => {
        setClassFees(localClassFees);
        setStatusMsg('Class fee configuration saved to database!');
        addActivity('System Update', 'Updated class-wise fee structure.');
        setTimeout(() => setStatusMsg(''), 3000);
    };

    const generateMonthlyInvoices = () => {
        // Save config first to be sure
        setClassFees(localClassFees);

        if (!window.confirm("This will generate new 'Unpaid' fee records for ALL studying students based on the SAVED Class Fee Configuration. Continue?")) return;
        
        const today = new Date();
        const dueDate = new Date(today.getFullYear(), today.getMonth(), 10).toISOString().split('T')[0];
        
        const newRecords: FeeRecord[] = [];
        students.filter(s => s.status === 'Studying').forEach(student => {
            const config = localClassFees.find(cf => cf.className === student.class);
            if (config && config.amount > 0) {
                const monthYear = dueDate.substring(0, 7);
                const alreadyExists = fees.some(f => f.studentId === student.id && f.dueDate.startsWith(monthYear));
                
                if (!alreadyExists) {
                    newRecords.push({
                        id: Date.now() + Math.random(),
                        studentId: student.id,
                        amount: config.amount,
                        dueDate: dueDate,
                        status: 'Unpaid'
                    });
                }
            }
        });

        if (newRecords.length === 0) {
            alert("No new invoices generated. Either fees are already generated for this month or Class Fee Setup is empty for the current student classes.");
            return;
        }

        setFees(prev => [...prev, ...newRecords]);
        addActivity('Billing', `Generated ${newRecords.length} monthly invoices.`);
        alert(`Successfully generated ${newRecords.length} student invoices for ${dueDate}`);
        setView('records');
    };

    const downloadReceipt = (feeId: number) => {
        const fee = fees.find(f => f.id === feeId);
        const student = students.find(s => s.id === fee?.studentId);
        if (!fee || !student) return;

        const doc = new jsPDF() as any;
        doc.setFillColor(schoolSettings.primaryColor);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text(schoolSettings.schoolName.toUpperCase(), 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text("OFFICIAL PAYMENT RECEIPT", 105, 28, { align: 'center' });
        doc.setTextColor(50, 50, 50);
        doc.line(15, 45, 195, 45);
        doc.setFontSize(12);
        doc.text(`Receipt ID: #${Math.floor(fee.id)}`, 15, 55);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 195, 55, { align: 'right' });
        doc.rect(15, 65, 180, 40);
        doc.text(`Student: ${student.name || student["Name Of Student's"]}`, 20, 75);
        doc.text(`Roll No: ${student.rollNo || student["GR #"]}`, 20, 85);
        doc.text(`Class: ${student.class}`, 120, 75);
        doc.text(`Status: ${fee.status.toUpperCase()}`, 120, 85);
        doc.setFontSize(16);
        doc.text(`Amount Paid: $${fee.amount.toLocaleString()}`, 105, 120, { align: 'center' });
        doc.setFontSize(8);
        doc.text("Computer generated receipt. Thank you for your payment.", 105, 140, { align: 'center' });
        doc.save(`${student.name}_Receipt.pdf`);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Accounts & Fees</h1>
                <div className="bg-white dark:bg-gray-800 p-1.5 rounded-2xl shadow-sm flex w-full sm:w-auto border dark:border-gray-700">
                    <button onClick={() => setView('records')} className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-sm font-bold transition-all ${view === 'records' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500'}`}>Fee Records</button>
                    <button onClick={() => { setView('config'); setLocalClassFees(classFees); }} className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-sm font-bold transition-all ${view === 'config' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500'}`}>Fee Setup</button>
                </div>
            </div>

            {statusMsg && (
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-4 rounded-2xl text-green-700 dark:text-green-300 font-bold text-sm animate-fade-in flex items-center">
                    <span className="material-icons-sharp mr-2 text-sm">check_circle</span>
                    {statusMsg}
                </div>
            )}
            
            {view === 'records' ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border-b-8 border-green-500 hover:shadow-md transition-shadow dark:border-gray-700">
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Collected</p>
                            <h3 className="text-2xl sm:text-3xl font-black text-green-600 truncate">${stats.collected.toLocaleString()}</h3>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border-b-8 border-red-500 hover:shadow-md transition-shadow dark:border-gray-700">
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Outstanding</p>
                            <h3 className="text-2xl sm:text-3xl font-black text-red-500 truncate">${stats.outstanding.toLocaleString()}</h3>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border-b-8 border-indigo-500 hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1 dark:border-gray-700">
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Collection Rate</p>
                            <h3 className="text-2xl sm:text-3xl font-black text-indigo-600">{((stats.paidCount / (stats.total || 1)) * 100).toFixed(1)}%</h3>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
                            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="p-3 border rounded-2xl dark:bg-gray-700 w-full sm:w-64 outline-none text-sm dark:border-gray-600">
                                {uniqueClasses.map(c => <option key={c} value={c}>{c === 'All' ? 'Every Class' : `Class ${c}`}</option>)}
                            </select>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Button icon="print" variant="secondary" onClick={() => window.print()} className="flex-1 sm:flex-none text-xs">Print Statement</Button>
                            </div>
                        </div>

                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left min-w-[750px]">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="p-5 text-xs font-bold uppercase text-gray-400">Date Due</th>
                                        <th className="p-5 text-xs font-bold uppercase text-gray-400">Student Identity</th>
                                        <th className="p-5 text-xs font-bold uppercase text-gray-400">Amount</th>
                                        <th className="p-5 text-xs font-bold uppercase text-gray-400">Status</th>
                                        <th className="p-5 text-xs font-bold uppercase text-gray-400 text-center">Manage</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredFees.length > 0 ? filteredFees.map(fee => {
                                        const student = students.find(s => s.id === fee.studentId);
                                        return (
                                            <tr key={fee.id} className="border-b dark:border-gray-700 hover:bg-indigo-50/20 transition-all">
                                                <td className="p-5 text-sm font-medium text-gray-500 dark:text-gray-400">{fee.dueDate}</td>
                                                <td className="p-5">
                                                    <p className="font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{student?.name || student?.["Name Of Student's"]}</p>
                                                    <p className="text-xs text-indigo-500 font-bold tracking-tighter uppercase">GR: {student?.rollNo || student?.["GR #"]}</p>
                                                </td>
                                                <td className="p-5 font-mono font-bold text-lg dark:text-white">${fee.amount.toLocaleString()}</td>
                                                <td className="p-5">
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${fee.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {fee.status}
                                                    </span>
                                                </td>
                                                <td className="p-5 text-center space-x-2 whitespace-nowrap">
                                                    {fee.status !== 'Paid' && (
                                                        <button onClick={() => markPaid(fee.id)} className="p-2.5 text-green-500 bg-green-50 dark:bg-green-900/20 rounded-xl hover:scale-110 transition-transform shadow-sm" title="Mark as Paid">
                                                            <span className="material-icons-sharp">check_circle</span>
                                                        </button>
                                                    )}
                                                    <button onClick={() => downloadReceipt(fee.id)} className="p-2.5 text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl hover:scale-110 transition-transform shadow-sm" title="Download Receipt">
                                                        <span className="material-icons-sharp">receipt</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan={5} className="p-20 text-center text-gray-400">
                                                <span className="material-icons-sharp text-5xl block mb-2 opacity-30">receipt</span>
                                                <p className="font-bold text-xs uppercase tracking-widest">No fee records found.</p>
                                                <p className="text-[10px] mt-1">Go to 'Fee Setup' to configure class rates and generate invoices.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 w-full">
                    <div className="flex flex-wrap justify-between items-start mb-8 gap-4">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold dark:text-white">Fee Configuration</h2>
                            <p className="text-sm text-gray-500">Define the monthly tuition rates for each specific class grade.</p>
                        </div>
                        <div className="flex gap-3">
                            <Button icon="save" variant="secondary" onClick={saveFeeConfig}>Save Rates</Button>
                            <Button icon="auto_fix_high" onClick={generateMonthlyInvoices} className="shadow-lg">Generate Invoices</Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {uniqueClasses.filter(c => c !== 'All').map(className => (
                            <div key={className} className="flex flex-col space-y-2 group">
                                <label className="text-[10px] font-black text-gray-400 group-hover:text-indigo-500 uppercase tracking-widest transition-colors">Class Grade: {className}</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                    <input 
                                        type="number" 
                                        value={localClassFees.find(cf => cf.className === className)?.amount || ''}
                                        placeholder="0.00"
                                        onChange={e => handleLocalFeeChange(className, e.target.value)}
                                        className="w-full pl-8 pr-4 py-3 rounded-2xl border dark:border-gray-700 dark:bg-gray-900 outline-none focus:ring-2 ring-indigo-500 transition-all text-sm font-bold dark:text-white"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-12 pt-8 border-t dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest max-w-sm">
                            Step 1: Set the amounts for each class. <br/>
                            Step 2: Click 'Save Rates' to persist the configuration. <br/>
                            Step 3: Click 'Generate Invoices' to create unpaid records for all active students.
                        </div>
                        <Button icon="done_all" onClick={() => { saveFeeConfig(); setView('records'); }}>Save & Go Back</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeeManagement;
