
import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import { type Student, type ModuleId } from '../../types';
import Button from '../common/Button';
import ConfirmationModal from '../common/ConfirmationModal';
import ImageCropper from '../common/ImageCropper';

const StudentFormModal: React.FC<{
    onClose: () => void; 
    onSave: (student: Omit<Student, 'id'> | Student) => void;
    initialData?: Student | null;
}> = ({ onClose, onSave, initialData }) => {
    const { studentHeaders, schoolSettings } = useApp();
    const [formState, setFormState] = useState(() => {
        if (initialData) return initialData;
        const initial: any = { 
            profilePicUrl: '', 
            class: '', 
            status: 'Studying', 
            admissionDate: new Date().toISOString().split('T')[0] 
        };
        studentHeaders.forEach(h => { if (initial[h] === undefined) initial[h] = ''; });
        return initial;
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [showImageOptions, setShowImageOptions] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);

    const openCamera = async () => {
        try {
            setShowImageOptions(false);
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsCameraOpen(true);
        } catch (err) {
            console.error("Error accessing camera: ", err);
            alert("Could not access camera. Please ensure permissions are granted in your browser settings.");
        }
    };

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                context.drawImage(videoRef.current, 0, 0, videoRef.current.videoWidth, videoRef.current.videoHeight);
                const dataUrl = canvasRef.current.toDataURL('image/jpeg');
                setImageToCrop(dataUrl);
                closeCamera();
            }
        }
    };

    const closeCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsCameraOpen(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShowImageOptions(false);
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setImageToCrop(event.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = (croppedImageUrl: string) => {
        setFormState(prev => ({ ...prev, profilePicUrl: croppedImageUrl }));
        setImageToCrop(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formState,
            name: formState["Name of Pupil"] || formState.name || 'Student Name',
            rollNo: formState["General Register No."] || formState.rollNo || 'N/A',
        });
        onClose();
    };

    const nameForAvatar = formState["Name of Pupil"] || formState.name || '?';
    const initial = nameForAvatar.charAt(0).toUpperCase();

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 overflow-y-auto">
            {imageToCrop && (
                <ImageCropper 
                    imageSrc={imageToCrop}
                    onCropComplete={onCropComplete}
                    onClose={() => setImageToCrop(null)}
                />
            )}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md md:max-w-2xl lg:max-w-4xl flex flex-col max-h-[90vh] animate-fade-in border border-gray-100 dark:border-gray-700">
                {isCameraOpen && (
                    <div className="absolute inset-0 bg-black/90 z-30 flex flex-col items-center justify-center p-4">
                        <video ref={videoRef} autoPlay playsInline className="w-full max-w-md rounded-2xl mb-4"></video>
                        <canvas ref={canvasRef} className="hidden"></canvas>
                        <div className="flex space-x-4">
                            <Button onClick={captureImage} icon="photo_camera">Capture</Button>
                            <Button onClick={closeCamera} variant="secondary">Cancel</Button>
                        </div>
                    </div>
                )}
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center shrink-0">
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tight">
                        {initialData ? 'Update Record' : 'Official Registration'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors z-20">
                        <span className="material-icons-sharp text-3xl">close</span>
                    </button>
                </div>
                <div className="overflow-y-auto custom-scrollbar p-8">
                    <form onSubmit={handleSubmit} id="student-form">
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative group">
                                <div className="relative cursor-pointer" onClick={() => setShowImageOptions(o => !o)}>
                                    {formState.profilePicUrl && !formState.profilePicUrl.includes('pravatar.cc') ? (
                                        <img src={formState.profilePicUrl} className="h-32 w-32 rounded-full object-cover border-4 border-indigo-50 dark:border-gray-700 shadow-xl" alt="" />
                                    ) : (
                                        <div className="h-32 w-32 rounded-full border-4 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-gray-900 shadow-xl">
                                            <span className="text-5xl font-black" style={{ color: schoolSettings.primaryColor }}>{initial}</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-indigo-600/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                        <span className="material-icons-sharp text-white text-4xl">photo_camera</span>
                                    </div>
                                </div>
                                {showImageOptions && (
                                    <div className="absolute top-full mt-2 w-48 bg-white dark:bg-gray-700 rounded-xl shadow-lg border dark:border-gray-600 z-10 p-2 space-y-1">
                                        <button type="button" onClick={openCamera} className="w-full flex items-center px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"><span className="material-icons-sharp mr-2 text-base">photo_camera</span>Use Camera</button>
                                        <button type="button" onClick={() => { fileInputRef.current?.click(); }} className="w-full flex items-center px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"><span className="material-icons-sharp mr-2 text-base">upload_file</span>Upload File</button>
                                        <button type="button" onClick={() => { setFormState(p => ({...p, profilePicUrl: ''})); setShowImageOptions(false); }} className="w-full flex items-center px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><span className="material-icons-sharp mr-2 text-base">delete</span>Remove</button>
                                    </div>
                                )}
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Personal Photo Required</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Enrollment Status</label>
                                <select name="status" value={formState.status} onChange={handleChange} className="w-full p-3 rounded-xl border dark:bg-gray-700 focus:ring-2 ring-indigo-500 transition-all outline-none text-xs font-bold dark:text-white">
                                    <option value="Studying">Studying (Active)</option>
                                    <option value="Left">Left School</option>
                                    <option value="Completed Education">Completed Session</option>
                                </select>
                            </div>
                            {studentHeaders.filter(h => h !== 'Status').map(header => (
                                <div key={header} className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{header}</label>
                                    <input name={header} type={header.includes('Date') || header.includes('DOB') ? 'date' : 'text'} value={formState[header] || ''} onChange={handleChange} className="w-full p-3 rounded-xl border dark:bg-gray-700 focus:ring-2 ring-indigo-500 outline-none text-xs font-bold dark:text-white" required={header.includes('Name') || header.includes('Register')}/>
                                </div>
                            ))}
                        </div>
                    </form>
                </div>
                <div className="p-6 border-t dark:border-gray-700 flex justify-end gap-3 shrink-0">
                    <Button variant="secondary" onClick={onClose}>Discard Changes</Button>
                    <Button type="submit" form="student-form" icon="verified">Commit Record</Button>
                </div>
            </div>
        </div>
    );
};

const StudentManagement: React.FC<{ setActiveModule: (id: ModuleId) => void }> = ({ setActiveModule }) => {
    const { students, setStudents, studentHeaders, addActivity, schoolSettings } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const [batchFilter, setBatchFilter] = useState('All');

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

    const filtered = useMemo(() => {
        return students.filter(s => {
            const nameStr = String(s.name || s["Name of Pupil"] || '').toLowerCase();
            const rollStr = String(s.rollNo || s["General Register No."] || '');
            const matchesSearch = nameStr.includes(search.toLowerCase()) || rollStr.includes(search);
            
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
            const matchesBatch = batchFilter === 'All' || studentYear === batchFilter;
            return matchesSearch && matchesBatch;
        });
    }, [students, search, batchFilter]);

    const handleSave = (data: any) => {
        if (data.id) {
            setStudents(prev => prev.map(s => s.id === data.id ? data : s));
            addActivity('Database Update', `Record for ${data.name || data["Name of Pupil"]} updated.`);
        } else {
            setStudents(prev => [...prev, { ...data, id: Date.now() }]);
            addActivity('New Admission', `Student ${data.name || data["Name of Pupil"]} added.`);
        }
        setIsModalOpen(false);
        setEditingStudent(null);
    };

    const StudentAvatar = ({ student }: { student: Student }) => {
        const name = student["Name of Pupil"] || student.name || "?";
        if (student.profilePicUrl && !student.profilePicUrl.includes('pravatar.cc')) {
            return <img src={student.profilePicUrl} className="h-12 w-12 rounded-2xl object-cover border" alt="" />;
        }
        return (
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center font-black text-white shadow-sm" style={{ backgroundColor: schoolSettings.primaryColor }}>
                {name.charAt(0).toUpperCase()}
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in no-print">
            {isModalOpen && <StudentFormModal onClose={() => setIsModalOpen(false)} onSave={handleSave} initialData={editingStudent} />}
            {deletingId && (
                <ConfirmationModal 
                    title="Permanent Deletion" 
                    message="Remove pupil from registry?" 
                    onConfirm={() => { setStudents(prev => prev.filter(s => s.id !== deletingId)); setDeletingId(null); }}
                    onCancel={() => setDeletingId(null)}
                />
            )}

            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Official Pupil Registry</h1>
                <Button icon="person_add" onClick={() => { setEditingStudent(null); setIsModalOpen(true); }}>Register Pupil</Button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4 border border-gray-100 dark:border-gray-700">
                <div className="relative">
                    <span className="material-icons-sharp absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                    <input type="text" placeholder="Search by Name or GR #..." className="w-full pl-10 pr-4 py-3 rounded-2xl border dark:bg-gray-700 outline-none text-xs font-bold dark:text-white" value={search} onChange={e => setSearch(e.target.value)}/>
                </div>
                <div className="flex items-center space-x-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Batch:</label>
                    <select value={batchFilter} onChange={e => setBatchFilter(e.target.value)} className="flex-1 p-3 rounded-2xl border dark:bg-gray-700 outline-none text-xs dark:text-white font-black uppercase">
                        {availableBatches.map(b => <option key={b} value={b}>{b === 'All' ? 'Every Batch' : `Year ${b}`}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden overflow-x-auto">
                <table className="w-full text-left min-w-[1200px]">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="p-5 w-16 text-[10px] font-black text-gray-400 uppercase tracking-widest">Profile</th>
                            {studentHeaders.map(h => <th key={h} className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>)}
                            <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? filtered.map(s => (
                            <tr key={s.id} className="border-b dark:border-gray-700 hover:bg-indigo-50/10 transition-all">
                                <td className="p-5 cursor-pointer" title="Edit Profile" onClick={() => { setEditingStudent(s); setIsModalOpen(true); }}>
                                    <StudentAvatar student={s} />
                                </td>
                                {studentHeaders.map(h => (
                                    <td key={h} className="p-5">
                                        <p className={`text-xs whitespace-nowrap ${h.includes('Name') ? 'font-black text-gray-900 dark:text-white uppercase' : 'text-gray-600 dark:text-gray-400 font-bold'}`}>
                                            {String(s[h] || s[h.toLowerCase()] || '-')}
                                        </p>
                                    </td>
                                ))}
                                <td className="p-5 text-center">
                                    <div className="flex justify-center space-x-2">
                                        <button onClick={() => { setEditingStudent(s); setIsModalOpen(true); }} className="p-2 text-indigo-500 hover:scale-110 transition-transform"><span className="material-icons-sharp">edit</span></button>
                                        <button onClick={() => setDeletingId(s.id)} className="p-2 text-red-500 hover:scale-110 transition-transform"><span className="material-icons-sharp">delete</span></button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={studentHeaders.length + 2} className="p-20 text-center text-gray-400 italic font-bold">No records matched your search.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentManagement;
