
import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { type Student, type Staff, type FeeRecord, type Expense, type AttendanceRecord } from '../../types';
import Button from '../common/Button';
import * as XLSX from 'xlsx';

type DataType = 'students' | 'staff';

const DataImport: React.FC = () => {
    const { 
        setStudents, setStaff, setStudentHeaders, setStaffHeaders, 
        studentHeaders, staffHeaders, addActivity, 
        setFees, setExpenses, setAttendance, students: currentStudents 
    } = useApp();
    
    const [dataType, setDataType] = useState<DataType>('students');
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [fileHeaders, setFileHeaders] = useState<string[]>([]);
    const [fileName, setFileName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessOptions, setShowSuccessOptions] = useState(false);
    const [importedCount, setImportedCount] = useState(0);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setFileName(file.name);
        setShowSuccessOptions(false);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];

                if (jsonData.length > 0) {
                    const rawHeaders = jsonData[0].map(h => String(h || '').trim()).filter(h => h !== '');
                    const dataRows = jsonData.slice(1).filter(row => row.some(cell => cell !== ''));

                    const rows = dataRows.map(row => {
                        const obj: any = {};
                        rawHeaders.forEach((header, index) => {
                            obj[header] = row[index] !== undefined ? row[index] : '';
                        });
                        return obj;
                    });

                    setFileHeaders(rawHeaders);
                    setPreviewData(rows);
                }
            } catch (err) {
                console.error("Error reading file:", err);
                window.alert("Failed to parse the file. Please ensure it's a valid Excel or CSV document.");
            } finally {
                setIsLoading(false);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleImport = () => {
        if (previewData.length === 0) return;

        let finalCount = 0;

        if (dataType === 'students') {
            const newHeaders = Array.from(new Set([...studentHeaders, ...fileHeaders]));
            setStudentHeaders(newHeaders);

            const mappedStudents: Student[] = previewData.map((row, idx) => {
                const studentId = Date.now() + idx;
                
                // Strict mapping based on the provided 15-column sequence
                const name = row['Name of Pupil'] || row['Student Name'] || row.Name || 'Unknown Student';
                const rollNo = row['General Register No.'] || row['GR No'] || row.rollno || `GR-${idx + 1}`;
                const classValue = String(row['Class in Which Admitted'] || row['Class From Which Left'] || row.Class || 'N/A');
                
                return {
                    ...row, 
                    id: studentId,
                    name,
                    rollNo,
                    class: classValue,
                    fatherName: row['Father Name'] || '',
                    dob: row['Date of Birth (Numerical)'] || row.dob || '',
                    parentContact: row['Parent Contact'] || '',
                    profilePicUrl: `https://i.pravatar.cc/150?u=${rollNo}`,
                    address: row['Place of Birth'] || row.Address || '',
                    bloodGroup: '',
                    admissionDate: row['Date of Admission'] || new Date().toISOString().split('T')[0],
                    status: row.Status || 'Studying'
                };
            });

            setStudents(prev => [...prev, ...mappedStudents]);
            finalCount = mappedStudents.length;
            addActivity('Data Import', `Imported ${finalCount} students matching GBHS 15-column sequence.`);
        } else {
            const newHeaders = Array.from(new Set([...staffHeaders, ...fileHeaders]));
            setStaffHeaders(newHeaders);

            const mappedStaff: Staff[] = previewData.map((row, idx) => ({
                ...row,
                id: Date.now() + idx,
                name: row['FULL NAME WITH CNIC NUMBER'] || row.Name || 'Unknown Staff',
                employeeId: row['PERSONAL NUMBER'] || row.employeeid || `E-${idx + 1}`,
                role: 'Teacher',
                subject: row['SUBJECT SPECIALIZATION CODE'] || '',
                contact: '',
                phoneNumber: '',
                joinDate: new Date().toISOString().split('T')[0],
                profilePicUrl: `https://i.pravatar.cc/150?u=${idx}`
            }));

            setStaff(prev => [...prev, ...mappedStaff]);
            finalCount = mappedStaff.length;
            addActivity('Data Import', `Imported ${finalCount} staff members.`);
        }

        setImportedCount(finalCount);
        setShowSuccessOptions(true);
        setPreviewData([]);
        setFileName('');
        
        const input = document.getElementById('excel-upload') as HTMLInputElement;
        if (input) input.value = '';
    };

    const generateSampleData = () => {
        setIsLoading(true);
        setTimeout(() => {
            const sampleFees: FeeRecord[] = [];
            const sampleExpenses: Expense[] = [];
            const sampleAttendance: AttendanceRecord[] = [];
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth();
            
            currentStudents.forEach(student => {
                for (let month = 0; month < 12; month++) {
                    const dueDate = new Date(currentYear, month, 10);
                    const isPast = month < currentMonth;
                    sampleFees.push({
                        id: Date.now() + Math.random(),
                        studentId: student.id,
                        amount: 150, 
                        dueDate: dueDate.toISOString().split('T')[0],
                        status: isPast ? 'Paid' : 'Unpaid'
                    });
                }
            });

            const expenseCategories = ['Academics', 'Utilities', 'Maintenance', 'Events', 'Salary'];
            for (let month = 0; month < 12; month++) {
                expenseCategories.forEach(cat => {
                    sampleExpenses.push({
                        id: Date.now() + Math.random(),
                        title: `Monthly ${cat} Settlement`,
                        category: cat,
                        amount: 300 + Math.floor(Math.random() * 1200),
                        date: new Date(currentYear, month, 15).toISOString().split('T')[0]
                    });
                });
            }

            currentStudents.forEach(student => {
                for (let d = 0; d < 30; d++) {
                    const checkDate = new Date();
                    checkDate.setDate(checkDate.getDate() - d);
                    if (checkDate.getDay() !== 0 && checkDate.getDay() !== 6) {
                        sampleAttendance.push({
                            studentId: student.id,
                            date: checkDate.toISOString().split('T')[0],
                            status: Math.random() > 0.08 ? 'present' : 'absent'
                        });
                    }
                }
            });

            setFees(prev => [...prev, ...sampleFees]);
            setExpenses(prev => [...prev, ...sampleExpenses]);
            setAttendance(prev => [...prev, ...sampleAttendance]);
            
            addActivity('Data Enrichment', 'Populated financial and attendance history.');
            setIsLoading(false);
            setShowSuccessOptions(false);
            window.alert('Success! System populated with historical financial and attendance data.');
        }, 800);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-black dark:text-white">Smart Bulk Import</h1>
                <div className="flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                    <span className="material-icons-sharp text-indigo-500 text-sm">info</span>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Sequence: General Register No., Name of Pupil, Father Name...</p>
                </div>
            </div>
            
            {showSuccessOptions && (
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-6 rounded-3xl animate-fade-in shadow-lg">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center text-white">
                            <span className="material-icons-sharp text-2xl">check</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-green-800 dark:text-green-200">Import Complete!</h2>
                            <p className="text-sm text-green-700 dark:text-green-300">
                                {importedCount} records successfully committed to the database.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-6">
                        <Button onClick={generateSampleData} icon="auto_fix_high" disabled={isLoading} className="shadow-lg">
                            {isLoading ? 'Processing...' : 'Auto-Generate 1 Year History'}
                        </Button>
                        <Button variant="secondary" onClick={() => setShowSuccessOptions(false)} icon="close">Close Notification</Button>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm space-y-8 border border-gray-100 dark:border-gray-700">
                <div className="flex flex-wrap gap-6 items-center">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Target</label>
                        <select 
                            value={dataType} 
                            onChange={e => setDataType(e.target.value as DataType)} 
                            className="w-64 p-3 border rounded-2xl dark:bg-gray-700 dark:border-gray-600 dark:text-white font-bold text-sm outline-none focus:ring-2 ring-indigo-500"
                        >
                            <option value="students">Import Student Enrollment</option>
                            <option value="staff">Import Staff Directory</option>
                        </select>
                    </div>
                    
                    <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Choose Spreadsheet</label>
                        <div className="flex gap-2">
                             <input 
                                type="file" 
                                id="excel-upload" 
                                className="hidden" 
                                accept=".xlsx, .xls, .csv" 
                                onChange={handleFileChange} 
                            />
                            <Button icon="cloud_upload" onClick={() => document.getElementById('excel-upload')?.click()} className="flex-1 py-3">
                                {fileName ? fileName : 'Select Excel / CSV File'}
                            </Button>
                            {fileName && (
                                <Button variant="secondary" icon="refresh" onClick={() => { setFileName(''); setPreviewData([]); }}>Reset</Button>
                            )}
                        </div>
                    </div>
                </div>

                {isLoading && (
                    <div className="p-20 text-center flex flex-col items-center justify-center">
                        <div className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-indigo-500 font-black uppercase tracking-widest text-xs">Analyzing spreadsheet structure...</p>
                    </div>
                )}

                {previewData.length > 0 && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 gap-4">
                            <div>
                                <h2 className="text-xl font-black dark:text-white">Mapping Verified</h2>
                                <p className="text-sm text-gray-500">Found {previewData.length} records with {fileHeaders.length} unique columns.</p>
                            </div>
                            <Button onClick={handleImport} icon="bolt" className="px-10 py-4 shadow-xl text-lg h-fit">Commit To Database</Button>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Data Preview (First 10 Rows)</h3>
                            <div className="overflow-auto max-h-[500px] border dark:border-gray-700 rounded-3xl shadow-inner bg-white dark:bg-gray-900 custom-scrollbar">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                                        <tr>
                                            {fileHeaders.map(h => (
                                                <th key={h} className="p-4 border-b dark:border-gray-700 font-black text-indigo-600 uppercase tracking-tight whitespace-nowrap bg-gray-50 dark:bg-gray-800">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewData.slice(0, 10).map((row, i) => (
                                            <tr key={i} className="border-b dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                                {fileHeaders.map(h => (
                                                    <td key={h} className="p-4 whitespace-nowrap dark:text-gray-300 font-medium">{String(row[h] !== undefined ? row[h] : '-')}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 text-center font-bold uppercase tracking-[0.2em]">Verification phase: Records are currently only in memory. Click 'Commit' to save them permanently.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataImport;
