
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
    type SchoolSettings, type Module, Role, type Student, type Mark, 
    type Expense, type FeeRecord, type Staff, type StudyMaterial, 
    type TimetableEntry, type Alert, type OtherFee, type Announcement, 
    type Activity, type BusRoute, type StudentTransport, type Book, type BookIssueRecord, type AttendanceRecord, type ClassFeeConfig,
    type Workspace, type Subject
} from '../types';
import { ALL_MODULES, MOCK_SUBJECTS } from '../constants';

interface AppContextType {
    schoolSettings: SchoolSettings;
    setSchoolSettings: React.Dispatch<React.SetStateAction<SchoolSettings>>;
    modules: Module[];
    setModules: React.Dispatch<React.SetStateAction<Module[]>>;
    subjects: Subject[];
    setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
    currentRole: Role;
    setCurrentRole: React.Dispatch<React.SetStateAction<Role>>;
    theme: 'light' | 'dark';
    setTheme: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
    students: Student[];
    setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
    studentHeaders: string[];
    setStudentHeaders: React.Dispatch<React.SetStateAction<string[]>>;
    staff: Staff[];
    setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
    staffHeaders: string[];
    setStaffHeaders: React.Dispatch<React.SetStateAction<string[]>>;
    classFees: ClassFeeConfig[];
    setClassFees: React.Dispatch<React.SetStateAction<ClassFeeConfig[]>>;
    sessions: string[];
    setSessions: React.Dispatch<React.SetStateAction<string[]>>;
    marks: Mark[];
    setMarks: React.Dispatch<React.SetStateAction<Mark[]>>;
    fees: FeeRecord[];
    setFees: React.Dispatch<React.SetStateAction<FeeRecord[]>>;
    expenses: Expense[];
    setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
    otherFees: OtherFee[];
    setOtherFees: React.Dispatch<React.SetStateAction<OtherFee[]>>;
    attendance: AttendanceRecord[];
    setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
    alerts: Alert[];
    setAlerts: React.Dispatch<React.SetStateAction<Alert[]>>;
    activities: Activity[];
    addActivity: (action: string, details: string) => void;
    studyMaterials: StudyMaterial[]; setStudyMaterials: any;
    timetable: TimetableEntry[]; setTimetable: any;
    announcements: Announcement[]; setAnnouncements: any;
    busRoutes: BusRoute[]; setBusRoutes: any;
    studentTransport: StudentTransport[]; setStudentTransport: any;
    books: Book[]; setBooks: any;
    bookIssueRecords: BookIssueRecord[]; setBookIssueRecords: any;
    isOffline: boolean;
    lastSync: string;
    workspaces: Workspace[];
    currentWorkspaceId: string;
    switchWorkspace: (id: string) => void;
    createNewWorkspace: (name: string) => void;
    exportWorkspace: (id: string) => void;
    importWorkspace: (json: string) => void;
    sidebarCollapsed: boolean;
    setSidebarCollapsed: (v: boolean) => void;
    isMobileSidebarOpen: boolean;
    setIsMobileSidebarOpen: (v: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function useStickyState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [value, setValue] = useState<T>(() => {
        const stickyValue = window.localStorage.getItem(key);
        return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    });
    useEffect(() => {
        window.localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);
    return [value, setValue];
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [workspaces, setWorkspaces] = useStickyState<Workspace[]>('zenith_workspaces', []);
    const [currentWorkspaceId, setCurrentWorkspaceId] = useStickyState<string>('zenith_current_ws', '');

    const [schoolSettings, setSchoolSettings] = useStickyState<SchoolSettings>('schoolSettings', {
        schoolName: 'GOVT BOYS HIGH SCHOOL SABU RAHU',
        logoUrl: '', 
        primaryColor: '#f97316', 
        contactDetails: 'opposite Al Baraka Bank, Main Highway Sabu Rahu',
        onboardingComplete: true,
    });

    const [modules, setModules] = useStickyState<Module[]>('schoolModules', ALL_MODULES);
    const [subjects, setSubjects] = useStickyState<Subject[]>('schoolSubjects', MOCK_SUBJECTS);
    const [students, setStudents] = useStickyState<Student[]>('schoolStudents', []);
    
    const [studentHeaders, setStudentHeaders] = useStickyState<string[]>('studentHeaders', [
        'General Register No.',
        'Name of Pupil',
        'Father Name',
        'Religion',
        'Date of Birth (In Words)',
        'Date of Birth (Numerical)',
        'Place of Birth',
        'Last School Attended',
        'Date of Admission',
        'Class in Which Admitted',
        'Progress',
        'Conduct',
        'Date of Leaving',
        'Class From Which Left',
        'Remarks',
        'Status'
    ]);
    
    const [staff, setStaff] = useStickyState<Staff[]>('schoolStaff', []);
    const [staffHeaders, setStaffHeaders] = useStickyState<string[]>('staffHeaders', [
        'Personal ID',
        'Name in Full',
        'Date of Birth',
        'CNIC No.',
        'Designation',
        'BPS',
        'Date of Entry in Govt. Service',
        'Date of Posting at Current School',
        'Contact Number'
    ]);

    const [classFees, setClassFees] = useStickyState<ClassFeeConfig[]>('classFees', []);
    const [sessions, setSessions] = useStickyState<string[]>('academicSessions', ['2023-24', '2024-25', '2025-26']);
    
    const [marks, setMarks] = useStickyState<Mark[]>('schoolMarks', []);
    const [fees, setFees] = useStickyState<FeeRecord[]>('schoolFees', []);
    const [expenses, setExpenses] = useStickyState<Expense[]>('schoolExpenses', []);
    const [otherFees, setOtherFees] = useStickyState<OtherFee[]>('schoolOtherFees', []);
    const [attendance, setAttendance] = useStickyState<AttendanceRecord[]>('schoolAttendance', []);
    const [activities, setActivities] = useStickyState<Activity[]>('schoolActivities', []);
    const [alerts, setAlerts] = useStickyState<Alert[]>('schoolAlerts', []);
    const [studyMaterials, setStudyMaterials] = useStickyState<StudyMaterial[]>('studyMaterials', []);
    const [timetable, setTimetable] = useStickyState<TimetableEntry[]>('timetable', []);
    const [announcements, setAnnouncements] = useStickyState<Announcement[]>('announcements', []);
    const [busRoutes, setBusRoutes] = useStickyState<BusRoute[]>('busRoutes', []);
    const [studentTransport, setStudentTransport] = useStickyState<StudentTransport[]>('studentTransport', []);
    const [books, setBooks] = useStickyState<Book[]>('books', []);
    const [bookIssueRecords, setBookIssueRecords] = useStickyState<BookIssueRecord[]>('bookIssueRecords', []);

    const [currentRole, setCurrentRole] = useState<Role>(Role.SCHOOL_ADMIN);
    const [theme, setTheme] = useStickyState<'light' | 'dark'>('appTheme', 'light');
    const [sidebarCollapsed, setSidebarCollapsed] = useStickyState<boolean>('sidebarCollapsed', false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [lastSync, setLastSync] = useState(new Date().toISOString());

    const addActivity = useCallback((action: string, details: string) => {
        setActivities(prev => [{ id: Date.now(), action, details, timestamp: new Date().toISOString() }, ...prev].slice(0, 50));
    }, [setActivities]);

    const switchWorkspace = (id: string) => {
        const targetWS = workspaces.find(ws => ws.id === id);
        if (targetWS) {
            setCurrentWorkspaceId(id);
            setSchoolSettings(targetWS.settings);
            setStudents(targetWS.data.students || []);
            setStaff(targetWS.data.staff || []);
            setFees(targetWS.data.fees || []);
            setExpenses(targetWS.data.expenses || []);
            setAttendance(targetWS.data.attendance || []);
            setMarks(targetWS.data.marks || []);
            setOtherFees(targetWS.data.otherFees || []);
            setStudyMaterials(targetWS.data.studyMaterials || []);
            setTimetable(targetWS.data.timetable || []);
            setAnnouncements(targetWS.data.announcements || []);
            setBusRoutes(targetWS.data.busRoutes || []);
            setStudentTransport(targetWS.data.studentTransport || []);
            setBooks(targetWS.data.books || []);
            setBookIssueRecords(targetWS.data.bookIssueRecords || []);
            setClassFees(targetWS.data.classFees || []);
            setSubjects(targetWS.data.subjects || MOCK_SUBJECTS);
            setSessions(targetWS.data.sessions || ['2024-25']);
            setStudentHeaders(targetWS.data.studentHeaders || []);
            setStaffHeaders(targetWS.data.staffHeaders || []);
        }
    };

    const createNewWorkspace = (name: string) => {
        const id = 'ws_' + Date.now();
        const newWS: Workspace = {
            id, name, createdAt: new Date().toISOString(), lastActive: new Date().toISOString(),
            settings: {
                schoolName: name, logoUrl: '', primaryColor: '#f97316', contactDetails: '', onboardingComplete: true
            },
            data: { 
                students: [], staff: [], fees: [], expenses: [], attendance: [], marks: [],
                otherFees: [], studyMaterials: [], timetable: [], announcements: [],
                busRoutes: [], studentTransport: [], books: [], bookIssueRecords: [],
                classFees: [], subjects: MOCK_SUBJECTS, sessions: ['2024-25'],
                studentHeaders: [ 'General Register No.', 'Name of Pupil', 'Father Name', 'Religion', 'Date of Birth (In Words)', 'Date of Birth (Numerical)', 'Place of Birth', 'Last School Attended', 'Date of Admission', 'Class in Which Admitted', 'Progress', 'Conduct', 'Date of Leaving', 'Class From Which Left', 'Remarks', 'Status' ], 
                staffHeaders: [ 'Personal ID', 'Name in Full', 'Date of Birth', 'CNIC No.', 'Designation', 'BPS', 'Date of Entry in Govt. Service', 'Date of Posting at Current School', 'Contact Number' ]
            }
        };
        setWorkspaces(prev => [...prev, newWS]);
        if (!currentWorkspaceId) setCurrentWorkspaceId(id);
    };

    const exportWorkspace = (id: string) => {
        const ws = workspaces.find(w => w.id === id);
        if (!ws) return;

        let workspaceToExport: Workspace = JSON.parse(JSON.stringify(ws));

        if (id === currentWorkspaceId) {
            workspaceToExport.settings = schoolSettings;
            workspaceToExport.data = {
                students, staff, fees, expenses, attendance, marks, otherFees, studyMaterials,
                timetable, announcements, busRoutes, studentTransport, books, bookIssueRecords,
                classFees, subjects, sessions, studentHeaders, staffHeaders
            };
            workspaceToExport.lastActive = new Date().toISOString();
        }
        
        const blob = new Blob([JSON.stringify(workspaceToExport, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${workspaceToExport.name}_GBHS_Backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addActivity("Data Export", `Local backup created for ${workspaceToExport.name}.`);
    };

    const importWorkspace = (json: string) => {
        try {
            const ws: Workspace = JSON.parse(json);
            if (!ws.id || !ws.name) throw new Error("Invalid Format");
            setWorkspaces(prev => [...prev.filter(w => w.id !== ws.id), ws]);
            window.alert("Workspace Imported Successfully!");
        } catch (e) {
            window.alert("Failed to import. Invalid GBHS backup file.");
        }
    };

    useEffect(() => {
        const handleConnection = () => setIsOffline(!navigator.onLine);
        window.addEventListener('online', handleConnection);
        window.addEventListener('offline', handleConnection);
        return () => {
            window.removeEventListener('online', handleConnection);
            window.removeEventListener('offline', handleConnection);
        };
    }, []);

    const value = {
        schoolSettings, setSchoolSettings, modules, setModules, currentRole, setCurrentRole,
        theme, setTheme, students, setStudents, studentHeaders, setStudentHeaders,
        staff, setStaff, staffHeaders, setStaffHeaders, classFees, setClassFees,
        sessions, setSessions, marks, setMarks, fees, setFees, expenses, setExpenses,
        otherFees, setOtherFees, attendance, setAttendance, alerts, setAlerts,
        activities, addActivity, studyMaterials, setStudyMaterials, timetable, setTimetable,
        announcements, setAnnouncements, busRoutes, setBusRoutes, studentTransport, setStudentTransport,
        books, setBooks, bookIssueRecords, setBookIssueRecords, isOffline, lastSync,
        workspaces, currentWorkspaceId, switchWorkspace, createNewWorkspace, exportWorkspace, importWorkspace,
        sidebarCollapsed, setSidebarCollapsed, subjects, setSubjects,
        isMobileSidebarOpen, setIsMobileSidebarOpen
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within AppProvider');
    return context;
};
