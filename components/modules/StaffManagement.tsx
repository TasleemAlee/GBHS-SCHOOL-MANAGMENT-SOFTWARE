
import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import { type Staff, type ModuleId } from '../../types';
import Button from '../common/Button';
import ConfirmationModal from '../common/ConfirmationModal';
import ImageCropper from '../common/ImageCropper';

const normalizeDateForInput = (dateStr: any): string => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
};

const findValueCaseInsensitive = (obj: any, key: string): any => {
    if (!obj) return undefined;
    if (obj[key] !== undefined) return obj[key];
    const lowerKey = key.toLowerCase();
    const foundKey = Object.keys(obj).find(k => k.toLowerCase() === lowerKey);
    return foundKey ? obj[foundKey] : undefined;
};

const StaffFormModal: React.FC<{ 
    onClose: () => void; 
    onSave: (staff: Omit<Staff, 'id'> | Staff) => void;
    initialData?: Staff | null;
}> = ({ onClose, onSave, initialData }) => {
    const { staffHeaders, schoolSettings } = useApp();
    const [formState, setFormState] = useState(() => {
        const initial: any = { 
            profilePicUrl: initialData?.profilePicUrl || '', 
            role: initialData?.role || 'Teacher', 
            id: initialData?.id 
        };

        staffHeaders.forEach(h => {
            let val = findValueCaseInsensitive(initialData, h);
            if (h.includes('Date') || h.toLowerCase().includes('dob')) {
                initial[h] = normalizeDateForInput(val);
            } else {
                initial[h] = val !== undefined ? val : '';
            }
        });

        // Ensure core joinDate is synchronized
        if (initialData) {
            initial.joinDate = normalizeDateForInput(initialData.joinDate);
        } else {
            initial.joinDate = new Date().toISOString().split('T')[0];
        }

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
        
        // Map dynamic header fields back to strict interface fields
        const finalStaff = {
            ...formState,
            name: formState['Name in Full'] || formState.name || 'Staff Member',
            employeeId: formState['Personal ID'] || formState.employeeId || 'N/A',
            joinDate: formState['Date of Entry in Govt. Service'] || formState.joinDate || ''
        };

        onSave(finalStaff);
        onClose();
    };

    const nameForAvatar = formState['Name in Full'] || formState.name || '?';
    const initialChar = nameForAvatar.charAt(0).toUpperCase();

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4 overflow-y-auto">
             {imageToCrop && (
                <ImageCropper 
                    imageSrc={imageToCrop}
                    onCropComplete={onCropComplete}
                    onClose={() => setImageToCrop(null)}
                />
            )}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl w-full max-w-md md:max-w-2xl lg:max-w-4xl flex flex-col max-h-[90vh] animate-fade-in border border-gray-100 dark:border-gray-700">
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
                        {initialData ? 'Update Staff Profile' : 'New Appointment Entry'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors z-20">
                        <span className="material-icons-sharp text-3xl">close</span>
                    </button>
                </div>
                <div className="overflow-y-auto custom-scrollbar p-8">
                    <form onSubmit={handleSubmit} id="staff-form">
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative group">
                                <div className="relative cursor-pointer" onClick={() => setShowImageOptions(o => !o)}>
                                    {formState.profilePicUrl ? (
                                        <img src={formState.profilePicUrl} className="h-32 w-32 rounded-full object-cover border-4 shadow-md" alt="" />
                                    ) : (
                                        <div className="h-32 w-32 rounded-full border-4 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-gray-900 shadow-xl">
                                            <span className="text-5xl font-black" style={{ color: schoolSettings.primaryColor }}>{initialChar}</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
                            <p className="text-[10px] text-gray-400 mt-2 font-black uppercase tracking-widest">Official Portrait Required</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {staffHeaders.map(header => (
                                <div key={header} className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{header}</label>
                                    <input 
                                        name={header} 
                                        type={header.includes('Date') || header.toLowerCase().includes('dob') ? 'date' : 'text'} 
                                        value={formState[header] || ''} 
                                        onChange={handleChange} 
                                        className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white text-xs font-bold outline-none focus:ring-2 ring-emerald-500" 
                                        required 
                                    />
                                </div>
                            ))}
                        </div>
                    </form>
                </div>
                <div className="p-6 border-t dark:border-gray-700 flex justify-end gap-3 shrink-0">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="staff-form" icon="verified">Commit to Registry</Button>
                </div>
            </div>
        </div>
    );
};

const StaffManagement: React.FC<{ setActiveModule: (id: ModuleId) => void }> = ({ setActiveModule }) => {
    const { staff, setStaff, staffHeaders, addActivity, schoolSettings } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        return staff.filter(m => {
            const nameStr = String(m.name || m['Name in Full'] || '').toLowerCase();
            const idStr = String(m.employeeId || m['Personal ID'] || '');
            return nameStr.includes(search.toLowerCase()) || idStr.includes(search);
        });
    }, [staff, search]);

    const handleSave = (data: any) => {
        if (data.id) {
            setStaff(prev => prev.map(s => s.id === data.id ? { ...s, ...data } : s));
            addActivity('Staff Update', `Updated record for ${data.name}`);
        } else {
            setStaff(prev => [...prev, { ...data, id: Date.now() }]);
            addActivity('New Hire', `Added staff member ${data.name}`);
        }
        setIsModalOpen(false);
        setEditingStaff(null);
    };

    const StaffAvatar = ({ member }: { member: Staff }) => {
        const name = member["Name in Full"] || member.name || "?";
        if (member.profilePicUrl) {
            return <img src={member.profilePicUrl} className="h-12 w-12 rounded-2xl object-cover border" alt="" />;
        }
        return (
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center font-black text-white shadow-sm" style={{ backgroundColor: schoolSettings.primaryColor }}>
                {name.charAt(0).toUpperCase()}
            </div>
        );
    };
    
    return (
        <div className="space-y-6 animate-fade-in">
            {isModalOpen && <StaffFormModal onClose={() => { setIsModalOpen(false); setEditingStaff(null); }} onSave={handleSave} initialData={editingStaff} />}
            {deletingId && (
                <ConfirmationModal 
                    title="Terminate Record"
                    message="Remove employee from official system?"
                    onConfirm={() => { setStaff(prev => prev.filter(s => s.id !== deletingId)); setDeletingId(null); }}
                    onCancel={() => setDeletingId(null)}
                />
            )}

            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Employee Directory</h1>
                <Button icon="add" onClick={() => { setEditingStaff(null); setIsModalOpen(true); }}>Add Employee</Button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="relative">
                    <span className="material-icons-sharp absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                    <input type="text" placeholder="Search by Employee Name or CNIC..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-2xl dark:bg-gray-700 dark:text-white text-xs font-bold outline-none" />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="p-5 w-16 text-[10px] font-black text-gray-400 uppercase tracking-widest">Profile</th>
                            {staffHeaders.map(h => <th key={h} className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>)}
                            <th className="p-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? filtered.map(member => (
                            <tr key={member.id} className="border-b dark:border-gray-700 hover:bg-emerald-50/10 transition-all">
                                <td className="p-5 cursor-pointer" title="Edit Profile" onClick={() => { setEditingStaff(member); setIsModalOpen(true); }}>
                                    <StaffAvatar member={member} />
                                </td>
                                {staffHeaders.map(h => (
                                    <td key={h} className="p-5 text-xs font-black whitespace-nowrap text-gray-900 dark:text-gray-300 uppercase">
                                        {String(member[h] || member[h.toLowerCase()] || '-')}
                                    </td>
                                ))}
                                <td className="p-5 text-center">
                                    <div className="flex justify-center space-x-2">
                                        <button onClick={() => { setEditingStaff(member); setIsModalOpen(true); }} className="p-2 text-emerald-600 hover:scale-110 transition-transform"><span className="material-icons-sharp">edit</span></button>
                                        <button onClick={() => setDeletingId(member.id)} className="p-2 text-red-500 hover:scale-110 transition-transform"><span className="material-icons-sharp">delete</span></button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={staffHeaders.length + 2} className="p-20 text-center text-gray-400 italic">No staff matches your query.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StaffManagement;
