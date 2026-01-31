
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { type Announcement, type Student, type Staff } from '../../types';
import Button from '../common/Button';

const Announcements: React.FC = () => {
    const { announcements, setAnnouncements, staff, students, addActivity } = useApp();
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [target, setTarget] = useState<'All' | 'Staff' | 'Parents'>('All');
    const [isSending, setIsSending] = useState(false);
    const [isSimModalOpen, setIsSimModalOpen] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');

    const targetList = useMemo(() => {
        if (target === 'Staff') return staff;
        if (target === 'Parents') return students.filter(s => s.status === 'Studying');
        return [];
    }, [target, staff, students]);
    
    const filteredTargetList = useMemo(() => {
        if (!searchTerm) return targetList;
        return targetList.filter(p => 
            (p.name || p['Name in Full'] || p['Name of Pupil'] || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [targetList, searchTerm]);

    useEffect(() => {
        // Reset selection when target changes
        setSelectedIds(new Set());
    }, [target]);

    const handleSelectionChange = (id: number) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredTargetList.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredTargetList.map(p => p.id)));
        }
    };
    
    const triggerSmsSend = () => {
        setIsSending(true);

        const normalizePakistaniNumber = (phoneStr: string | number): string | null => {
            const phoneMatch = String(phoneStr).match(/(?:\+92|92|0)?(3\d{9})\b/);
            if (phoneMatch && phoneMatch[1]) {
                return `+92${phoneMatch[1]}`;
            }
            return null;
        };

        let recipients: string[] = [];
        
        if (target === 'All') {
             const studentNumbers = students
                .filter(s => s.status === 'Studying')
                .map(s => normalizePakistaniNumber(s['Mobile No. of Father/ Guardian'] || s.parentContact))
                .filter((p): p is string => !!p);
            
            const staffNumbers = staff
                .map(m => normalizePakistaniNumber(m['Contact Number']))
                .filter((p): p is string => !!p);
            
            recipients = Array.from(new Set([...studentNumbers, ...staffNumbers]));
        } else {
            const selectedPeople = targetList.filter(p => selectedIds.has(p.id));
            if (target === 'Staff') {
                recipients = selectedPeople
                    .map(p => normalizePakistaniNumber((p as Staff)['Contact Number']))
                    .filter((p): p is string => !!p);
            } else { // Parents
                 recipients = selectedPeople
                    .map(p => normalizePakistaniNumber((p as Student)['Mobile No. of Father/ Guardian'] || (p as Student).parentContact))
                    .filter((p): p is string => !!p);
            }
        }

        if (recipients.length === 0) {
            setIsSending(false);
            setIsSimModalOpen(false);
            setStatusMessage({type: 'error', text: `No valid Pakistani mobile numbers found for the selected recipients.`});
            return;
        }

        const newAnn: Announcement = { id: Date.now(), title, message, target, date: new Date().toISOString() };
        const recipientsString = recipients.join(',');
        const smsUri = `sms:${recipientsString}?body=${encodeURIComponent(message)}`;
        
        window.location.href = smsUri;
        
        setAnnouncements(prev => [newAnn, ...prev]);
        addActivity('SMS Broadcast', `Handed off to device's SMS app for ${recipients.length} recipients.`);
        
        setTitle('');
        setMessage('');
        setIsSending(false);
        setIsSimModalOpen(false);
        setStatusMessage({type: 'success', text: "Your messaging app is open. Please confirm to send."});
        setTimeout(() => setStatusMessage(null), 5000);
    };

    const handleSend = () => {
        if (!title || !message) {
             setStatusMessage({type: 'error', text: "Title and message cannot be empty."});
            return;
        };
        if (target !== 'All' && selectedIds.size === 0) {
            setStatusMessage({type: 'error', text: "Please select at least one recipient."});
            return;
        }
        setStatusMessage(null);
        setIsSimModalOpen(true);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {isSimModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-sm text-center transform transition-all scale-95 opacity-0 animate-scale-in">
                        <span className="material-icons-sharp text-5xl text-indigo-500 mb-3">sim_card</span>
                        <h2 className="text-xl font-bold mb-2 dark:text-white">Choose SIM Card</h2>
                        <p className="text-sm text-gray-500 mb-6">Select a SIM to send the broadcast. Your device's SMS app will handle the final confirmation. Carrier rates will apply.</p>
                        <div className="space-y-3">
                            <Button onClick={triggerSmsSend} disabled={isSending} className="w-full" icon="sim_card_download">
                                {isSending ? 'Preparing...' : 'Send via SIM 1'}
                            </Button>
                            <Button onClick={triggerSmsSend} disabled={isSending} className="w-full" icon="sim_card_download">
                                {isSending ? 'Preparing...' : 'Send via SIM 2'}
                            </Button>
                        </div>
                        <button onClick={() => setIsSimModalOpen(false)} className="mt-6 text-sm text-gray-400 hover:underline">
                            Cancel
                        </button>
                    </div>
                </div>
            )}
            <style>{`
                .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
                .animate-scale-in { animation: scaleIn 0.2s ease-out 0.1s forwards; }
                @keyframes fadeIn { to { opacity: 1; } }
                @keyframes scaleIn { to { transform: scale(1); opacity: 1; } }
            `}</style>

            <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">GBHS Broadcast Center</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm space-y-4 border dark:border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-bold dark:text-white">Compose SMS Blast</h2>
                    </div>

                     {statusMessage && (
                        <div className={`p-4 rounded-xl text-sm font-bold flex items-center ${statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'} border`}>
                            <span className="material-icons-sharp mr-2 text-base">{statusMessage.type === 'success' ? 'check_circle' : 'error'}</span>
                            {statusMessage.text}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Target Audience</label>
                            <div className="flex space-x-2">
                                {(['All', 'Staff', 'Parents'] as const).map(t => (
                                    <button 
                                        key={t}
                                        onClick={() => setTarget(t)}
                                        className={`flex-1 py-3 rounded-xl text-sm font-black border transition-all ${target === t ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-transparent text-gray-500 dark:border-gray-700'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {target !== 'All' && (
                            <div className="p-4 border dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-900/30 space-y-3">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-black">{`Select ${target}`}</h3>
                                    <p className="text-xs font-bold">{selectedIds.size} / {filteredTargetList.length} selected</p>
                                </div>
                                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search..." className="w-full p-2 border rounded-lg text-xs dark:bg-gray-800 dark:border-gray-600"/>
                                <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                    {filteredTargetList.map(p => (
                                        <label key={p.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700/50 cursor-pointer">
                                            <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => handleSelectionChange(p.id)} className="rounded"/>
                                            <span className="text-xs font-bold">{p.name || p['Name in Full'] || p['Name of Pupil']}</span>
                                        </label>
                                    ))}
                                </div>
                                <button onClick={toggleSelectAll} className="text-xs font-bold text-indigo-600">{selectedIds.size === filteredTargetList.length ? 'Deselect All' : 'Select All'}</button>
                            </div>
                        )}
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-1">Subject</label>
                            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. School Holiday Notice" className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:ring-2 ring-emerald-500" />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Message Content</label>
                            </div>
                            <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Type the official message here..." rows={6} className="w-full p-3 rounded-xl border dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:ring-2 ring-emerald-500 resize-none" />
                            <p className="text-[10px] text-right text-gray-400 font-bold mt-1 uppercase">{message.length} Characters</p>
                        </div>
                        <Button className="w-full py-4 shadow-xl" onClick={handleSend} disabled={isSending} icon={isSending ? 'hourglass_top' : 'send'}>
                            {isSending ? 'Preparing...' : 'Initiate SMS Blast'}
                        </Button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border dark:border-gray-700 flex flex-col h-[700px]">
                    <h2 className="text-xl font-bold mb-6 dark:text-white border-b pb-4">Broadcast History Logs</h2>
                    <div className="overflow-y-auto space-y-4 flex-1 pr-2 custom-scrollbar">
                        {announcements.length > 0 ? announcements.map(ann => (
                            <div key={ann.id} className="p-5 border dark:border-gray-700 rounded-2xl relative hover:border-emerald-300 transition-all bg-gray-50/50 dark:bg-gray-900/30">
                                <span className="absolute top-4 right-4 text-[10px] font-black bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded text-emerald-700 uppercase">{ann.target}</span>
                                <h4 className="font-black text-emerald-700 dark:text-emerald-400 uppercase text-sm">{ann.title}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">{ann.message}</p>
                                <div className="flex justify-between items-center mt-4 pt-4 border-t dark:border-gray-700">
                                     <p className="text-[10px] text-gray-400 font-black uppercase">{new Date(ann.date).toLocaleString()}</p>
                                     <span className="material-icons-sharp text-emerald-500 text-sm" title="Handed off to SMS App">forward_to_inbox</span>
                                </div>
                            </div>
                        )) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-20">
                                <span className="material-icons-sharp text-8xl">forum</span>
                                <p className="mt-2 uppercase tracking-widest text-xs font-black">No Sent Broadcasts</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Announcements;
