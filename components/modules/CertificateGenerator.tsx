
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { type Student, type CertificateData } from '../../types';
import Button from '../common/Button';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Helper function from previous LC format
const dateToWords_LC = (dateStr: string) => {
    if (!dateStr) return "---";
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "---";
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'long' }).toLowerCase();
        const year = date.getFullYear();
        const units = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
        const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
        const ordinals = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeen', 'eighteenth', 'nineteenth', 'twentieth', 'twenty-first', 'twenty-second', 'twenty-third', 'twenty-fourth', 'twenty-fifth', 'twenty-sixth', 'twenty-seventh', 'twenty-eighth', 'twenty-ninth', 'thirtieth', 'thirty-first'];
        const numberToWords = (n: number): string => {
            if (n < 20) return units[n];
            const t = Math.floor(n / 10);
            const u = n % 10;
            return tens[t] + (u > 0 ? ' ' + units[u] : "");
        };
        const yearToWords = (y: number): string => {
            if (y >= 2000 && y < 2100) {
                const remainder = y % 100;
                return "two thousand" + (remainder > 0 ? " " + numberToWords(remainder) : "");
            }
            const firstHalf = Math.floor(y / 100);
            const secondHalf = y % 100;
            return numberToWords(firstHalf) + " " + numberToWords(secondHalf);
        };
        return `${ordinals[day]} ${month} ${yearToWords(year)}`;
    } catch { return "---"; }
};

const LeavingCertificateTemplate: React.FC<{ data: CertificateData; schoolSettings: ReturnType<typeof useApp>['schoolSettings'] }> = ({ data, schoolSettings }) => {
    const docColor = schoolSettings.primaryColor || "#f97316";
    
    const SingleRow: React.FC<{num?: string, label: string, value: string}> = ({num, label, value}) => (
        <div className="flex items-end gap-2 text-[13px] h-[28px]">
            {num && <span className="w-6 shrink-0 font-bold text-right">{num}.</span>}
            {!num && <span className="w-6 shrink-0"></span>}
            <span className="shrink-0 font-medium whitespace-nowrap">{label}:</span>
            <div className="flex-1 border-b border-dotted" style={{ borderColor: docColor }}>
                <span className="font-black italic uppercase text-[14px] px-2">
                    {value || <>&nbsp;</>}
                </span>
            </div>
        </div>
    );
    
    const DoubleRow: React.FC<{num: string, label1: string, value1: string, label2: string, value2: string}> = ({num, label1, value1, label2, value2}) => (
        <div className="flex items-end gap-2 text-[13px] h-[28px]">
            <span className="w-6 shrink-0 font-bold text-right">{num}.</span>
            <div className="flex-1 flex items-end gap-x-4">
                <div className="flex-1 flex items-end gap-1">
                    <span className="shrink-0 font-medium whitespace-nowrap">{label1}:</span>
                    <div className="flex-1 border-b border-dotted" style={{ borderColor: docColor }}>
                        <span className="font-black italic uppercase text-[14px] px-1">
                            {value1 || <>&nbsp;</>}
                        </span>
                    </div>
                </div>
                <div className="flex-1 flex items-end gap-1">
                    <span className="shrink-0 font-medium whitespace-nowrap">{label2}:</span>
                    <div className="flex-1 border-b border-dotted" style={{ borderColor: docColor }}>
                        <span className="font-black italic uppercase text-[14px] px-1">
                            {value2 || <>&nbsp;</>}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    const SignatureBlock: React.FC<{ title: string; className?: string }> = ({ title, className }) => (
        <div className={`text-center flex flex-col items-center justify-end ${className}`}><div className="w-full border-t border-dotted mb-1" style={{ borderColor: docColor }}></div><p className="font-black text-[10px] uppercase tracking-widest leading-none">{title}</p></div>
    );
    return (
        <div className="certificate-page bg-[#fdfcf0] w-[1123px] h-[794px] p-0 font-serif relative overflow-hidden flex flex-row border-[2px]" style={{ borderColor: docColor, color: docColor, fontFamily: "'Crimson Pro', serif" }}>
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none">{schoolSettings.logoUrl ? <img src={schoolSettings.logoUrl} alt="" className="w-1/3 object-contain" /> : <span className="material-icons-sharp text-[300px]">school</span>}</div>
            <div className="absolute inset-3 border-[2px] border-double pointer-events-none" style={{ borderColor: docColor }}></div>
            <div className="w-[260px] h-full flex flex-col p-6 border-r border-dashed relative z-20" style={{ borderColor: docColor }}><h2 className="text-center font-black uppercase tracking-widest text-[12px] mb-2">Office Receipt</h2><div className="text-center mb-3">{schoolSettings.logoUrl && <img src={schoolSettings.logoUrl} alt="Logo" className="w-10 h-10 object-contain mx-auto mb-1" />}<p className="text-[8px] font-bold leading-tight uppercase line-clamp-2">{schoolSettings.schoolName}</p></div><div className="space-y-1 text-[10px] flex-grow font-bold uppercase overflow-hidden"><div className="border-b border-dotted pb-0.5 flex justify-between" style={{borderColor: docColor}}>Sr. No: <span className="font-black">{data.serialNo}</span></div><div className="border-b border-dotted pb-0.5 flex justify-between" style={{borderColor: docColor}}>G.R. No: <span className="font-black">{data.grNo}</span></div><div className="flex items-baseline mt-1"><span className="shrink-0 mr-1">Name:</span><span className="font-black truncate flex-1" style={{borderBottom: `1px dotted ${docColor}`}}>{data.pupilName}</span></div><div className="flex items-baseline mt-0.5"><span className="shrink-0 mr-1">Father:</span><span className="font-black truncate flex-1" style={{borderBottom: `1px dotted ${docColor}`}}>{data.fatherName}</span></div><div className="flex items-baseline mt-0.5"><span className="shrink-0 mr-1">Caste:</span><span className="font-black truncate flex-1" style={{borderBottom: `1px dotted ${docColor}`}}>{data.raceCaste}</span></div><div className="flex items-baseline mt-0.5"><span className="shrink-0 mr-1">DOB:</span><span className="font-black truncate flex-1" style={{borderBottom: `1px dotted ${docColor}`}}>{data.dob}</span></div><div className="flex items-baseline mt-0.5"><span className="shrink-0 mr-1">Progress:</span><span className="font-black truncate flex-1" style={{borderBottom: `1px dotted ${docColor}`}}>{data.progress}</span></div><div className="flex items-baseline mt-0.5"><span className="shrink-0 mr-1">Conduct:</span><span className="font-black truncate flex-1" style={{borderBottom: `1px dotted ${docColor}`}}>{data.conduct}</span></div><div className="flex items-baseline mt-0.5"><span className="shrink-0 mr-1">Leaving:</span><span className="font-black truncate flex-1" style={{borderBottom: `1px dotted ${docColor}`}}>{data.leavingDate}</span></div></div><div className="space-y-12 mt-6 pb-6"><SignatureBlock title="Class Teacher" /><SignatureBlock title="Head Master" /></div></div>
            <div className="flex-1 flex flex-col relative z-20 overflow-hidden"><div className="px-10 pt-4 text-center"><div className="flex justify-between items-start mb-0.5"><div className="text-left w-56"><p className="text-[14px] font-bold">G.R. No: <span className="font-black px-1">{data.grNo || '________'}</span></p></div>{schoolSettings.logoUrl && <img src={schoolSettings.logoUrl} alt="Logo" className="w-16 h-16 object-contain" />}<div className="text-right w-56"><p className="text-[14px] font-bold">Sr. No: <span className="font-black px-1">{data.serialNo}</span></p></div></div><h1 className="text-3xl font-black uppercase tracking-tighter mb-0.5 leading-none drop-shadow-sm">{schoolSettings.schoolName}</h1><p className="text-[11px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">{schoolSettings.contactDetails.split('\n')[0]}</p><div className="inline-block px-10 py-1 border rounded-lg bg-white/60 backdrop-blur-sm shadow-sm border-dotted border-gray-400"><h2 className="text-xl font-black uppercase tracking-[0.3em]">School Leaving Certificate</h2></div></div><div className="px-10 space-y-1.5 flex-grow mt-3"><SingleRow num="1" label="Name of the Pupil" value={data.pupilName} /><SingleRow num="2" label="Father's Name" value={data.fatherName} /><DoubleRow num="3" label1="Race and Caste" value1={data.raceCaste} label2="Religion" value2={data.religion} /><SingleRow num="4" label="Place of Birth" value={data.placeOfBirth} /><SingleRow num="5" label="Date of Birth (In Figures)" value={data.dob} /><SingleRow label="(In Words)" value={data.dobInWords} /><SingleRow num="6" label="Last School attended and Class" value={data.lastSchool} /><SingleRow num="7" label="Date of admission in this school" value={data.admissionDate} /><DoubleRow num="8" label1="Progress" value1={data.progress} label2="Conduct" value2={data.conduct} /><DoubleRow num="9" label1="Class in which studying" value1={data.studyingClass} label2="Date of Leaving" value2={data.leavingDate} /><SingleRow num="10" label="Reason of Leaving the School" value={data.leavingReason} /><SingleRow num="11" label="Remarks" value={data.remarks} /></div><div className="flex justify-between items-end px-10 pb-12 pt-1"><SignatureBlock title="CLASS TEACHER" className="w-56" /><div className="flex flex-col items-center"><div className="w-18 h-18 rounded-full border border-dashed flex items-center justify-center opacity-30 rotate-12" style={{ borderColor: docColor }}><p className="text-[7px] font-black text-center uppercase p-1">Official Seal Area</p></div></div><SignatureBlock title="HEAD MASTER" className="w-56" /></div></div>
        </div>
    );
};

const CombinedCertificateTemplate: React.FC<{ data: CertificateData; schoolSettings: ReturnType<typeof useApp>['schoolSettings'] }> = ({ data, schoolSettings }) => {
    const primaryColor = schoolSettings.primaryColor || "#006400";
    return (
        <div className="certificate-page bg-white w-[794px] h-[1123px] mx-auto p-8 font-serif relative overflow-hidden border-[12px] border-double" style={{ borderColor: primaryColor, color: '#1a1a1a', fontFamily: "'Times New Roman', serif" }}>
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">{schoolSettings.logoUrl ? <img src={schoolSettings.logoUrl} alt="" className="w-1/2 object-contain" /> : <span className="material-icons-sharp text-[400px]">school</span>}</div>
            
            {/* Testimonial Part */}
            <div className="h-1/2 flex flex-col">
                <div className="text-center relative z-10 mb-4"><div className="flex justify-center items-center mb-2">{schoolSettings.logoUrl && (<img src={schoolSettings.logoUrl} alt="Logo" className="w-20 h-20 object-contain mr-4" />)}<div className="flex flex-col"><h1 className="text-3xl font-black uppercase tracking-tight leading-none" style={{ color: primaryColor }}>{schoolSettings.schoolName}</h1><p className="text-md font-bold mt-1 uppercase">Taluka Sakrand District Shaheed Benazir Abad</p></div></div><div className="inline-block px-10 py-1.5 rounded-lg mt-2" style={{ backgroundColor: primaryColor }}><h2 className="text-lg font-black uppercase tracking-[0.2em] text-white">TESTIMONIAL CERTIFICATE</h2></div></div>
                <div className="relative z-10 mt-4 space-y-4 text-md leading-relaxed flex-grow">
                    <div className="flex justify-between items-center font-bold text-sm"><p>G.R. No: <span className="border-b-2 border-black px-4 min-w-[100px] inline-block text-center">{data.grNo}</span></p><p>Dated: <span className="border-b-2 border-black px-4 min-w-[100px] inline-block text-center">{data.issueDate}</span></p></div>
                    <p className="indent-8">This is to certified that Mr. / Miss <span className="border-b-2 border-black font-bold uppercase px-2 inline-block min-w-[250px] text-center">{data.pupilName}</span></p>
                    <p>S/o, D/o. <span className="border-b-2 border-black font-bold uppercase px-2 inline-block min-w-[250px] text-center">{data.fatherName}</span><span className="ml-2">by Caste</span><span className="border-b-2 border-black font-bold uppercase px-2 inline-block min-w-[120px] text-center">{data.raceCaste}</span></p>
                    <p>Of Govt. High School Sabu Rahu Nawabshah Passed <span className="font-bold">SSC Part-II class X (ten) Annual /</span> Supplementary Examination 20 <span className="border-b-2 border-black px-2 inline-block min-w-[40px] text-center font-bold">{data.examYear}</span> from the Board of intermediate & Secondary Education Hyderabad, held in the Month of <span className="border-b-2 border-black px-2 inline-block min-w-[80px] text-center font-bold">{data.examMonth}</span> 20 <span className="border-b-2 border-black px-2 inline-block min-w-[40px] text-center font-bold">{data.examYear}</span> in <span className="border-b-2 border-black px-2 inline-block min-w-[100px] text-center font-bold">{data.examGroup}</span> Group.</p>
                    <p>His / Her Seat No: was <span className="border-b-2 border-black px-2 inline-block min-w-[120px] text-center font-bold">{data.seatNo}</span> He / she was passed in <span className="border-b-2 border-black px-2 inline-block min-w-[80px] text-center font-bold">{data.division}</span> Div: / Grade.</p>
                    <p>His / Her date of birth as entered in the General Register of this School.</p>
                </div>
                <div className="flex justify-between items-end z-10"><div className="text-left font-bold text-sm"><p>Dated: <span className="border-b-2 border-black px-4">{data.issueDate}</span></p></div><div className="text-center flex flex-col items-center"><div className="w-48 border-t-2 border-black mb-1"></div><p className="font-black text-lg uppercase tracking-tighter leading-tight">HEAD MASTER</p><p className="text-xs font-bold uppercase">{schoolSettings.schoolName}</p><p className="text-[9px] font-bold uppercase opacity-80">District Shaheed Benazirabad</p></div></div>
            </div>
            
            <div className="border-t-4 border-dotted my-4" style={{borderColor: primaryColor}}></div>

            {/* Character Part */}
            <div className="h-1/2 flex flex-col">
                <div className="text-center relative z-10 mb-4"><div className="flex justify-center items-center mb-2">{schoolSettings.logoUrl && (<img src={schoolSettings.logoUrl} alt="Logo" className="w-20 h-20 object-contain mr-4" />)}<div className="flex flex-col"><h1 className="text-3xl font-black uppercase tracking-tight leading-none" style={{ color: primaryColor }}>{schoolSettings.schoolName}</h1><p className="text-md font-bold mt-1 uppercase">Taluka Sakrand District Shaheed Benazir Abad</p></div></div><div className="inline-block px-10 py-1.5 rounded-lg mt-2" style={{ backgroundColor: primaryColor }}><h2 className="text-lg font-black uppercase tracking-[0.2em] text-white">CHARACTER CERTIFICATE</h2></div></div>
                <div className="relative z-10 mt-4 space-y-4 text-md leading-relaxed flex-grow">
                    <div className="flex justify-between items-center font-bold text-sm"><p>General Register No: <span className="border-b-2 border-black px-4 min-w-[100px] inline-block text-center">{data.grNo}</span></p><p>Date: <span className="border-b-2 border-black px-4 min-w-[100px] inline-block text-center">{data.issueDate}</span></p></div>
                    <p className="indent-8">This is to certified that Mr. / Miss <span className="border-b-2 border-black font-bold uppercase px-2 inline-block min-w-[250px] text-center">{data.pupilName}</span></p>
                    <p>S/o, D/o. <span className="border-b-2 border-black font-bold uppercase px-2 inline-block min-w-[200px] text-center">{data.fatherName}</span><span className="ml-2">by Caste</span><span className="border-b-2 border-black font-bold uppercase px-2 inline-block min-w-[120px] text-center">{data.raceCaste}</span> Was a bonofide</p>
                    <p>Student of this School from <span className="border-b-2 border-black font-bold px-2 inline-block min-w-[120px] text-center">{data.bonafideFrom}</span><span> To </span><span className="border-b-2 border-black font-bold px-2 inline-block min-w-[120px] text-center">{data.bonafideTo}</span></p>
                    <p className="font-bold">He / She bears a {data.conduct.toLowerCase()} moral Character</p>
                </div>
                <div className="flex justify-end items-end z-10"><div className="text-center flex flex-col items-center"><div className="w-48 border-t-2 border-black mb-1"></div><p className="font-black text-lg uppercase tracking-tighter leading-tight">HEAD MASTER</p></div></div>
            </div>
        </div>
    );
};

const CertificateGenerator: React.FC = () => {
    const { schoolSettings, students, addActivity } = useApp();
    const [selectedStudentId, setSelectedStudentId] = useState<number>(0);
    const [selectedBatch, setSelectedBatch] = useState('All');
    const [certType, setCertType] = useState<'LC' | 'Combined'>('Combined');
    const [search, setSearch] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const [previewScale, setPreviewScale] = useState(0.5);

    const availableBatches = useMemo(() => {
        const yearsSet = new Set<string>();
        students.forEach(s => { const dateStr = s['Date of Admission'] || s.admissionDate || s.AdmissionDate; if (dateStr) { let d = new Date(dateStr); if (isNaN(d.getTime())) { const match = String(dateStr).match(/\d{4}/); if (match) yearsSet.add(match[0]); } else { yearsSet.add(d.getFullYear().toString()); } } });
        return (['All', ...Array.from(yearsSet)] as string[]).sort((a, b) => b.localeCompare(a));
    }, [students]);

    const [formData, setFormData] = useState<CertificateData>({
        serialNo: '1001', grNo: '', pupilName: '', fatherName: '', raceCaste: '', religion: 'ISLAM', placeOfBirth: '', dob: '', dobInWords: '',
        lastSchool: 'SAME SCHOOL', admissionDate: '', progress: 'SATISFACTORY', conduct: 'GOOD', studyingClass: '', leavingDate: new Date().toISOString().split('T')[0],
        leavingReason: 'COMPLETION OF ACADEMIC SESSION', remarks: 'PASSED & PROMOTED', issueDate: new Date().toISOString().split('T')[0],
        examYear: new Date().getFullYear().toString().slice(-2), examMonth: 'MAY', examGroup: 'SCIENCE', seatNo: '', division: 'FIRST',
        bonafideFrom: '', bonafideTo: new Date().toISOString().split('T')[0]
    });

    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            const name = String(s.name || s['Name of Pupil'] || '').toLowerCase();
            const rollNo = String(s.rollNo || s['General Register No.'] || '').toLowerCase();
            const matchesSearch = name.includes(search.toLowerCase()) || rollNo.includes(search.toLowerCase());
            const admDate = s['Date of Admission'] || s.admissionDate || s.AdmissionDate;
            let studentYear = 'N/A';
            if (admDate) { const d = new Date(admDate); if (!isNaN(d.getTime())) studentYear = d.getFullYear().toString(); else { const match = String(admDate).match(/\d{4}/); if (match) studentYear = match[0]; } }
            const matchesBatch = selectedBatch === 'All' || studentYear === selectedBatch;
            return matchesSearch && matchesBatch;
        });
    }, [students, search, selectedBatch]);

    useEffect(() => {
        if (selectedStudentId === 0 && filteredStudents.length > 0) setSelectedStudentId(filteredStudents[0].id);
        else if (filteredStudents.length === 0) setSelectedStudentId(0);
    }, [filteredStudents]);

    useEffect(() => {
        const student = students.find(s => s.id === selectedStudentId);
        if (student) {
            const fatherName = student['Father Name'] || student.fatherName || '';
            const parts = fatherName.trim().split(/\s+/);
            const autoCaste = parts.length > 1 ? parts[parts.length - 1] : (student['Race and Caste'] || student['Caste'] || '');
            setFormData(prev => ({
                ...prev, grNo: student['General Register No.'] || student.rollNo || '', pupilName: student['Name of Pupil'] || student.name || '', fatherName: fatherName,
                religion: student['Religion'] || prev.religion, placeOfBirth: student['Place of Birth'] || prev.placeOfBirth, dob: student['Date of Birth (Numerical)'] || student.dob || '',
                dobInWords: student['Date of Birth (In Words)'] || dateToWords_LC(student['Date of Birth (Numerical)'] || student.dob || ''),
                lastSchool: student['Last School Attended'] || prev.lastSchool, admissionDate: student['Date of Admission'] || student.admissionDate || '',
                bonafideFrom: student['Date of Admission'] || student.admissionDate || '', progress: student['Progress'] || prev.progress, conduct: student['Conduct'] || prev.conduct,
                studyingClass: `Class ${student['Class From Which Left'] || student.class}`, leavingDate: student['Date of Leaving'] || prev.leavingDate, bonafideTo: student['Date of Leaving'] || prev.leavingDate,
                remarks: student['Remarks'] || prev.remarks, raceCaste: autoCaste.toUpperCase(),
            }));
        }
    }, [selectedStudentId, students]);

    useEffect(() => {
        const handleResize = () => {
            if (previewContainerRef.current) {
                const w = certType === 'LC' ? 1123 : 794;
                const h = certType === 'LC' ? 794 : 1123;
                const containerWidth = previewContainerRef.current.offsetWidth - 64;
                const containerHeight = previewContainerRef.current.offsetHeight - 64;
                const scaleW = containerWidth / w;
                const scaleH = containerHeight / h;
                setPreviewScale(Math.min(scaleW, scaleH, 1));
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [certType]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePrint = () => { addActivity('Certificate Print', `Printed ${certType} for ${formData.pupilName}`); window.print(); };

    const generatePdfFile = async () => {
        setIsGenerating(true);
        const element = document.getElementById('cert-print-root');
        if (!element) return;
        try {
            const canvas = await html2canvas(element, { scale: 2.5, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const orientation = certType === 'LC' ? 'l' : 'p';
            const pdf = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
            if (orientation === 'l') pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
            else pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
            pdf.save(`${formData.pupilName.replace(/\s+/g, '_')}_${certType}.pdf`);
            addActivity('Export PDF', `Saved ${certType} for ${formData.pupilName} as PDF.`);
        } catch (e) { console.error(e); } finally { setIsGenerating(false); }
    };
    
    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,700;0,900;1,400;1,700&display=swap');
                @media print {
                    body * { visibility: hidden !important; }
                    .print-area, .print-area * { visibility: visible !important; }
                    .print-area { position: fixed !important; left: 0 !important; top: 0 !important; margin: 0 !important; padding: 0 !important; border: none !important; box-shadow: none !important; z-index: 99999 !important; background: white !important; }
                    .print-area.landscape .certificate-page { width: 297mm !important; height: 210mm !important; page-break-after: always; }
                    .print-area.portrait .certificate-page { width: 210mm !important; height: 297mm !important; page-break-after: always; }
                }
                @page landscape-page { size: A4 landscape; margin: 0; }
                @page portrait-page { size: A4 portrait; margin: 0; }
                .print-area.landscape { page: landscape-page; }
                .print-area.portrait { page: portrait-page; }
            `}</style>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
                <div><h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Certificate Engine</h1><p className="text-sm text-gray-400 font-bold uppercase tracking-widest italic">High Fidelity Official Certification</p></div>
                <div className="flex flex-wrap gap-3 w-full md:w-auto"><div className="flex bg-white dark:bg-gray-800 p-1 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"><button onClick={() => setCertType('LC')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${certType === 'LC' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400'}`}>Leaving Certificate</button><button onClick={() => setCertType('Combined')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${certType === 'Combined' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400'}`}>Testimonial/Character</button></div><Button onClick={handlePrint} icon="print" className="shadow-lg font-black uppercase text-xs">Print (Ctrl+P)</Button><Button variant="secondary" onClick={generatePdfFile} icon="picture_as_pdf" className="font-black uppercase text-xs" disabled={isGenerating || students.length === 0}>{isGenerating ? 'Wait...' : 'Save PDF'}</Button></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 no-print">
                <div className="lg:col-span-4 space-y-6"><div className="bg-white dark:bg-gray-800 p-7 rounded-3xl shadow-sm border dark:border-gray-700 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar"><h2 className="text-xs font-black dark:text-white uppercase tracking-[0.2em] border-b pb-4 flex items-center"><span className="material-icons-sharp mr-2 text-indigo-500">manage_search</span>Filter & Edit</h2><div className="space-y-4"><div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Admission Batch</label><select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} className="w-full p-3 border rounded-2xl dark:bg-gray-700 text-xs font-black dark:border-gray-600 dark:text-white uppercase">{availableBatches.map(s => <option key={s} value={s}>{s === 'All' ? 'All Batches' : `Session ${s}`}</option>)}</select></div><div className="relative"><span className="material-icons-sharp absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span><input type="text" placeholder="Search GR # or Pupil Name..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-3 border rounded-2xl dark:bg-gray-700 outline-none text-xs font-bold dark:border-gray-600 dark:text-white" /></div><div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Selection</label><select value={selectedStudentId} onChange={e => setSelectedStudentId(Number(e.target.value))} className="w-full p-3 border rounded-2xl dark:bg-gray-700 outline-none font-bold dark:border-gray-600 dark:text-white">{filteredStudents.length > 0 ? filteredStudents.map(s => (<option key={s.id} value={s.id}>{s.name || s['Name of Pupil']} (GR: {s.rollNo || s['General Register No.']})</option>)) : <option value="0">No matches found</option>}</select></div><hr className="dark:border-gray-700" /><h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Manual Overrides</h3><div className="space-y-3"><input type="text" name="pupilName" placeholder="Pupil Name" value={formData.pupilName} onChange={handleInputChange} className="w-full p-2 border rounded-xl dark:bg-gray-900 text-xs font-bold dark:border-gray-700 dark:text-white" /><input type="text" name="fatherName" placeholder="Father's Name" value={formData.fatherName} onChange={handleInputChange} className="w-full p-2 border rounded-xl dark:bg-gray-900 text-xs font-bold dark:border-gray-700 dark:text-white" /><input type="text" name="raceCaste" placeholder="Caste" value={formData.raceCaste} onChange={handleInputChange} className="w-full p-2 border rounded-xl dark:bg-gray-900 text-xs font-bold dark:border-gray-700 dark:text-white" /><input type="text" name="conduct" placeholder="Conduct (e.g. good)" value={formData.conduct} onChange={handleInputChange} className="w-full p-2 border rounded-xl dark:bg-gray-900 text-xs font-bold dark:border-gray-700 dark:text-white" /></div></div></div></div>
                <div className="lg:col-span-8 bg-gray-50 dark:bg-gray-900 rounded-[40px] p-4 border-4 border-dashed dark:border-gray-800 flex flex-col items-center justify-center overflow-hidden min-h-[600px] lg:min-h-[85vh] relative" ref={previewContainerRef}><div className="absolute top-6 left-10 flex items-center space-x-3 text-gray-400"><span className="material-icons-sharp text-indigo-500 animate-pulse">visibility</span><p className="text-[11px] font-black uppercase tracking-[0.2em] italic">Live {certType === 'LC' ? 'Landscape' : 'Portrait'} Page Rendering</p></div><div id="cert-print-root" className={`relative shadow-2xl transition-all duration-300 print-area ${certType === 'LC' ? 'landscape' : 'portrait'}`} style={{ width: certType === 'LC' ? '1123px' : '794px', height: certType === 'LC' ? '794px' : '1123px', transform: `scale(${previewScale})`, transformOrigin: 'center center' }}>{certType === 'LC' ? <LeavingCertificateTemplate data={formData} schoolSettings={schoolSettings} /> : <CombinedCertificateTemplate data={formData} schoolSettings={schoolSettings} />}</div></div>
            </div>
        </div>
    );
};

export default CertificateGenerator;
