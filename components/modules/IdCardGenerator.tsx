
import React, { useState, useRef, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import Button from '../common/Button';
import IdCardTemplate from '../common/IdCardTemplate';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const IdCardGenerator: React.FC = () => {
    const { schoolSettings, students, staff } = useApp();
    const [cardType, setCardType] = useState<'student' | 'staff'>('student');
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const [selectedClass, setSelectedClass] = useState('All');
    const cardRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const uniqueClasses = useMemo(() => ['All', ...new Set(students.map(s => s.class))].sort(), [students]);

    const filteredList = useMemo(() => {
        const list = cardType === 'student' ? students : staff;
        return list.filter(p => {
            const name = String(p.name || '').toLowerCase();
            const rollNo = String(p.rollNo || p['GR No / Roll No'] || p['PERSONAL NUMBER'] || '').toLowerCase();
            const searchTerm = search.toLowerCase();
            
            const matchesSearch = name.includes(searchTerm) || rollNo.includes(searchTerm);
            const matchesClass = cardType === 'staff' || selectedClass === 'All' || p.class === selectedClass;
            return matchesSearch && matchesClass;
        });
    }, [students, staff, cardType, search, selectedClass]);

    const selectedPerson = filteredList.find(p => p.id === selectedId);

    const generatePdf = async () => {
        const input = cardRef.current;
        if (!input || !selectedPerson) return;
        setIsGenerating(true);
        try {
            const canvas = await html2canvas(input, { scale: 3, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: [85.6, 53.98]
            });
            pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 53.98);
            pdf.save(`${selectedPerson.name.replace(/\s+/g, '_')}_ID.pdf`);
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    const generateBulkPdf = async () => {
        const targetList = filteredList.slice(0, 50); // Limit bulk to 50 for performance
        if (targetList.length === 0) return;
        
        const confirm = window.confirm(`Generate ID Cards for ${targetList.length} people? This may take a minute.`);
        if (!confirm) return;

        setIsGenerating(true);
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: [85.6, 53.98]
        });

        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '-9999px';
        document.body.appendChild(container);

        try {
            for (let i = 0; i < targetList.length; i++) {
                const person = targetList[i];
                const root = document.createElement('div');
                container.appendChild(root);
                
                // Render a temporary component to capture it as an image for the PDF
                await new Promise<void>((resolve) => {
                   import('react-dom/client').then(({ createRoot }) => {
                       const reactRoot = createRoot(root);
                       reactRoot.render(<IdCardTemplate person={person} type={cardType} schoolSettings={schoolSettings} />);
                       setTimeout(async () => {
                           const canvas = await html2canvas(root, { scale: 2, useCORS: true });
                           const imgData = canvas.toDataURL('image/png');
                           if (i > 0) pdf.addPage([85.6, 53.98], 'landscape');
                           pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 53.98);
                           reactRoot.unmount();
                           container.removeChild(root);
                           resolve();
                       }, 150);
                   });
                });
            }
            pdf.save(`${selectedClass}_Bulk_IDs.pdf`);
        } catch (e) {
            console.error(e);
        } finally {
            if (document.body.contains(container)) document.body.removeChild(container);
            setIsGenerating(false);
        }
    };
    
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Identity Center</h1>
                <div className="flex bg-white dark:bg-gray-800 p-1.5 rounded-2xl shadow-sm border dark:border-gray-700">
                    <button onClick={() => { setCardType('student'); setSelectedId(null); }} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${cardType === 'student' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-500'}`}>Students</button>
                    <button onClick={() => { setCardType('staff'); setSelectedId(null); }} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${cardType === 'staff' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-500'}`}>Staff Members</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm space-y-6 border dark:border-gray-700">
                    <h2 className="text-xl font-bold dark:text-white">Selector</h2>
                    
                    <div className="space-y-4">
                        <div className="relative">
                            <span className="material-icons-sharp absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                            <input 
                                type="text" 
                                placeholder="Search by name/roll..." 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border rounded-2xl dark:bg-gray-700 dark:border-gray-600 outline-none text-sm dark:text-white" 
                            />
                        </div>

                        {cardType === 'student' && (
                            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full p-3 border rounded-2xl dark:bg-gray-700 dark:border-gray-600 outline-none text-sm dark:text-white font-bold">
                                {uniqueClasses.map(c => <option key={c} value={c}>{c === 'All' ? 'Every Class' : `Class ${c}`}</option>)}
                            </select>
                        )}

                        <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                            {filteredList.map(p => (
                                <button 
                                    key={p.id} 
                                    onClick={() => setSelectedId(p.id)}
                                    className={`w-full p-3 text-left rounded-xl border transition-all flex items-center space-x-3 ${selectedId === p.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-100 dark:border-gray-700 hover:bg-gray-50'}`}
                                >
                                    <img src={p.profilePicUrl} className="w-8 h-8 rounded-full border" alt="" />
                                    <div>
                                        <p className="text-xs font-black truncate max-w-[150px]">{p.name || 'No Name'}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{p.rollNo || p['GR No / Roll No'] || p['PERSONAL NUMBER'] || 'N/A'}</p>
                                    </div>
                                </button>
                            ))}
                            {filteredList.length === 0 && <p className="text-center text-xs text-gray-400 py-4">No records found</p>}
                        </div>

                        <div className="pt-4 space-y-2">
                            <Button onClick={generatePdf} className="w-full" icon="download" disabled={!selectedPerson || isGenerating}>
                                {isGenerating ? 'Wait...' : 'Download Individual'}
                            </Button>
                            <Button onClick={generateBulkPdf} variant="secondary" className="w-full" icon="library_add_check" disabled={filteredList.length === 0 || isGenerating}>
                                Bulk Print Current List ({filteredList.length})
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-3xl shadow-inner p-8 border dark:border-gray-800 min-h-[400px]">
                     {selectedPerson ? (
                        <div className="animate-fade-in scale-125 md:scale-150">
                           <div ref={cardRef}>
                              <IdCardTemplate person={selectedPerson} type={cardType} schoolSettings={schoolSettings} />
                           </div>
                        </div>
                     ) : (
                        <div className="text-center text-gray-400">
                            <span className="material-icons-sharp text-8xl opacity-10">badge</span>
                            <p className="font-black uppercase tracking-widest text-xs mt-4">Preview Area</p>
                            <p className="text-[10px] mt-1">Select a record from the list to preview the ID card</p>
                        </div>
                     )}
                </div>
            </div>
        </div>
    );
};

export default IdCardGenerator;
