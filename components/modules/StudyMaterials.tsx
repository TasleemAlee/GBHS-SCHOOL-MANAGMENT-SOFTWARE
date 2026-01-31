
import React, { useState, useMemo, useRef } from 'react';
import Button from '../common/Button';
import { useApp } from '../../contexts/AppContext';
import { type StudyMaterial } from '../../types';

const AddMaterialModal: React.FC<{ onClose: () => void; onAdd: (material: Omit<StudyMaterial, 'id'>) => void; }> = ({ onClose, onAdd }) => {
    const { students, subjects } = useApp();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formState, setFormState] = useState({
        title: '',
        subject: subjects[0]?.name || '',
        class: 'All',
        fileUrl: '',
        fileName: '',
        mimeType: ''
    });

    const uniqueClasses = ['All', ...Array.from(new Set(students.map(s => s.class)))].sort();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setFormState(prev => ({
                        ...prev,
                        fileUrl: event.target.result as string,
                        fileName: file.name,
                        mimeType: file.type
                    }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.fileUrl) {
            alert("Please select a file to upload.");
            return;
        }
        onAdd({
            ...formState,
            uploadDate: new Date().toISOString().split('T')[0]
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 relative w-full max-w-md animate-fade-in border dark:border-gray-700">
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-red-500">
                    <span className="material-icons-sharp">close</span>
                </button>
                <h2 className="text-2xl font-black mb-6">Upload Material</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase">Title</label>
                        <input type="text" value={formState.title} onChange={e => setFormState({...formState, title: e.target.value})} placeholder="e.g. Algebra Chapter 1" className="w-full p-3 border rounded-2xl dark:bg-gray-700 outline-none focus:ring-2 ring-indigo-500" required />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase">Subject</label>
                            <select value={formState.subject} onChange={e => setFormState({...formState, subject: e.target.value})} className="w-full p-3 border rounded-2xl dark:bg-gray-700 text-sm">
                                {subjects.map(s => <option key={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase">Class</label>
                            <select value={formState.class} onChange={e => setFormState({...formState, class: e.target.value})} className="w-full p-3 border rounded-2xl dark:bg-gray-700 text-sm">
                                {uniqueClasses.map(c => <option key={c}>{c === 'All' ? 'Every Class' : `Class ${c}`}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase">Attachment (PDF, Word, Image)</label>
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-200 dark:border-gray-700 p-6 rounded-2xl text-center cursor-pointer hover:border-indigo-500 transition-all bg-gray-50/50 dark:bg-gray-900/50 group"
                        >
                            <span className="material-icons-sharp text-gray-300 group-hover:text-indigo-500 text-4xl block mb-2">cloud_upload</span>
                            <p className="text-xs font-bold text-gray-500 group-hover:text-gray-700">
                                {formState.fileName ? `Selected: ${formState.fileName}` : 'Select File to Upload'}
                            </p>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
                    </div>
                    <div className="pt-4">
                        <Button type="submit" icon="rocket_launch" className="w-full py-4 shadow-lg">Process & Publish</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const StudyMaterials: React.FC = () => {
    const { studyMaterials, setStudyMaterials, students, subjects, addActivity } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [classFilter, setClassFilter] = useState('All');
    const [subjectFilter, setSubjectFilter] = useState('All');

    const uniqueClasses = ['All', ...Array.from(new Set(students.map(s => s.class)))].sort();
    const uniqueSubjects = ['All', ...subjects.map(s => s.name)];

    const handleAddMaterial = (newMaterial: Omit<StudyMaterial, 'id'>) => {
        setStudyMaterials(prev => [...prev, { id: Date.now(), ...newMaterial }]);
        addActivity('Material Published', `New resource: ${newMaterial.title}`);
    };

    const handleDelete = (id: number) => {
        const material = studyMaterials.find(m => m.id === id);
        if (window.confirm(`Are you sure you want to delete ${material?.title}?`)) {
            setStudyMaterials(prev => prev.filter(m => m.id !== id));
            addActivity('Material Removed', material?.title || '');
        }
    };
    
    const filteredMaterials = useMemo(() => {
        return studyMaterials.filter(m => 
            (classFilter === 'All' || m.class === classFilter) &&
            (subjectFilter === 'All' || m.subject === subjectFilter)
        );
    }, [studyMaterials, classFilter, subjectFilter]);

    return (
        <div className="space-y-6 animate-fade-in">
            {isModalOpen && <AddMaterialModal onClose={() => setIsModalOpen(false)} onAdd={handleAddMaterial} />}

            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Resources & Downloads</h1>
                <Button icon="add" onClick={() => setIsModalOpen(true)}>New Material</Button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black uppercase text-gray-400">Class</span>
                    <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="p-2 border rounded-xl dark:bg-gray-700 text-xs font-bold">
                        {uniqueClasses.map(c => <option key={c} value={c}>{c === 'All' ? 'Everywhere' : `Class ${c}`}</option>)}
                    </select>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black uppercase text-gray-400">Subject</span>
                    <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} className="p-2 border rounded-xl dark:bg-gray-700 text-xs font-bold">
                        {uniqueSubjects.map(s => <option key={s} value={s}>{s === 'All' ? 'All Subjects' : s}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMaterials.map(material => (
                    <div key={material.id} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col group hover:shadow-xl transition-all">
                        <div className="flex-grow">
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl">
                                    <span className="material-icons-sharp text-indigo-500">
                                        {material.mimeType?.includes('pdf') ? 'picture_as_pdf' : 
                                         material.mimeType?.includes('image') ? 'image' : 'description'}
                                    </span>
                                </div>
                                <button onClick={() => handleDelete(material.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500">
                                    <span className="material-icons-sharp">delete</span>
                                </button>
                            </div>
                            <h3 className="font-bold text-lg mt-4 text-gray-800 dark:text-white leading-tight">{material.title}</h3>
                            <div className="flex space-x-2 mt-3">
                                <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500">{material.subject}</span>
                                <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600">{material.class === 'All' ? 'Open' : `Class ${material.class}`}</span>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t dark:border-gray-700 flex justify-between items-center">
                            <div className="flex flex-col">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Added On</p>
                                <p className="text-xs font-bold">{material.uploadDate}</p>
                            </div>
                            <a href={material.fileUrl} download={material.fileName} className="flex items-center p-2 rounded-xl bg-indigo-600 text-white shadow-lg hover:scale-110 transition-transform">
                                <span className="material-icons-sharp text-sm">download</span>
                            </a>
                        </div>
                    </div>
                ))}
                {filteredMaterials.length === 0 && (
                    <div className="col-span-full py-20 text-center text-gray-400">
                        <span className="material-icons-sharp text-6xl block mb-4 opacity-20">library_books</span>
                        <p className="font-bold uppercase tracking-widest text-xs">No materials shared for this class.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudyMaterials;
