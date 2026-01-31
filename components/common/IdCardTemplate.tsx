
import React from 'react';
import { type Student, type Staff } from '../../types';
import { type SchoolSettings } from '../../types';

interface IdCardTemplateProps {
  person: Student | Staff;
  type: 'student' | 'staff';
  schoolSettings: SchoolSettings;
}

const IdCardTemplate: React.FC<IdCardTemplateProps> = ({ person, type, schoolSettings }) => {
    const isStudent = type === 'student';
    const student = isStudent ? (person as Student) : null;
    const staff = !isStudent ? (person as Staff) : null;

    const primaryColor = schoolSettings.primaryColor || '#059669';
    const headerStyle = {
        background: `linear-gradient(45deg, ${primaryColor}, ${primaryColor}E6)`
    };

    return (
        <div className="w-[336px] h-[211px] bg-white dark:bg-gray-800 shadow-xl rounded-2xl flex flex-col font-sans text-xs overflow-hidden border border-gray-100 dark:border-gray-700"
             style={{ fontFamily: "'Inter', sans-serif" }}>
            
            <div className="absolute top-0 left-0 w-full h-full opacity-5 dark:opacity-10 pointer-events-none" style={{
                backgroundImage: `url(${schoolSettings.logoUrl})`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundSize: '40%',
            }}></div>
            
            <header className="flex items-center p-2 text-white rounded-t-2xl relative" style={headerStyle}>
                <div className="w-10 h-10 rounded-full border border-white bg-white flex items-center justify-center p-0.5 overflow-hidden shrink-0">
                    <img src={schoolSettings.logoUrl || 'https://via.placeholder.com/40'} alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div className="ml-2 overflow-hidden">
                    <h2 className="font-black text-sm leading-tight truncate uppercase tracking-tighter">GBHS SABU RAHU</h2>
                    <p className="text-[8px] opacity-90 truncate font-medium">Govt Boys High School, Naushahro Feroze</p>
                </div>
            </header>
            
            <main className="flex-1 flex p-2.5 z-10">
                <div className="w-[30%] flex flex-col items-center">
                    <img 
                        src={person.profilePicUrl} 
                        alt={person.name} 
                        className="w-16 h-20 object-cover rounded-lg border shadow-sm" 
                        style={{ borderColor: primaryColor }} 
                    />
                    <div className="mt-1.5 text-center">
                         <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">ID NO</p>
                         <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300">{person.id.toString().slice(-6)}</p>
                    </div>
                </div>
                <div className="w-[70%] pl-3 space-y-1.5 text-gray-800 dark:text-gray-200">
                    <p className="font-black text-sm leading-tight uppercase" style={{ color: primaryColor }}>{person.name || person['Name in Full']}</p>
                    {isStudent && student && (
                        <div className="grid grid-cols-1 gap-y-0.5 text-[9px]">
                            <p><span className="font-bold text-gray-400 uppercase text-[8px] mr-1">Roll No:</span> {student['GR No / Roll No'] || student.rollNo}</p>
                            <p><span className="font-bold text-gray-400 uppercase text-[8px] mr-1">Father:</span> {student['Father Name'] || student.fatherName}</p>
                            <p><span className="font-bold text-gray-400 uppercase text-[8px] mr-1">DOB:</span> {student['Date of Birth'] || student.dob}</p>
                            <p className="leading-tight"><span className="font-bold text-gray-400 uppercase text-[8px] mr-1">Address:</span> {student.address || student.Taluka || 'Sabu Rahu'}</p>
                        </div>
                    )}
                    {!isStudent && staff && (
                        <div className="grid grid-cols-1 gap-y-0.5 text-[9px]">
                            <p><span className="font-bold text-gray-400 uppercase text-[8px] mr-1">Personal ID:</span> {staff['Personal ID'] || staff.employeeId}</p>
                            <p><span className="font-bold text-gray-400 uppercase text-[8px] mr-1">Designation:</span> {staff['Designation'] || staff.role}</p>
                            <p><span className="font-bold text-gray-400 uppercase text-[8px] mr-1">BPS:</span> {staff['BPS'] || 'N/A'}</p>
                            <p><span className="font-bold text-gray-400 uppercase text-[8px] mr-1">CNIC:</span> {staff['CNIC No.'] || 'N/A'}</p>
                        </div>
                    )}
                </div>
            </main>
             <footer className="text-center text-white py-1.5 rounded-b-2xl" style={headerStyle}>
                <p className="font-black uppercase tracking-widest text-[10px]">{isStudent ? 'STUDENT' : 'OFFICIAL STAFF'}</p>
            </footer>
        </div>
    );
};

export default IdCardTemplate;
