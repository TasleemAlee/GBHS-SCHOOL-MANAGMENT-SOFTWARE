
export interface SchoolSettings {
    schoolName: string;
    logoUrl: string;
    primaryColor: string;
    contactDetails: string;
    onboardingComplete: boolean;
}

export interface Workspace {
    id: string;
    name: string;
    createdAt: string;
    lastActive: string;
    settings: SchoolSettings;
    data: {
        students: Student[];
        staff: Staff[];
        fees: FeeRecord[];
        expenses: Expense[];
        attendance: AttendanceRecord[];
        marks: Mark[];
        otherFees?: OtherFee[];
        studyMaterials?: StudyMaterial[];
        timetable?: TimetableEntry[];
        announcements?: Announcement[];
        busRoutes?: BusRoute[];
        studentTransport?: StudentTransport[];
        books?: Book[];
        bookIssueRecords?: BookIssueRecord[];
        classFees?: ClassFeeConfig[];
        subjects?: Subject[];
        sessions?: string[];
        studentHeaders?: string[];
        staffHeaders?: string[];
    };
}

export enum Role {
    SUPER_ADMIN = 'Super Admin',
    SCHOOL_ADMIN = 'School Admin',
    TEACHER = 'Teacher',
    STUDENT = 'Student',
}

export type StudentStatus = 'Studying' | 'Left' | 'Completed Education';

export enum CertificateType {
    TESTIMONIAL = 'Testimonial Certificate',
    CHARACTER = 'Character Certificate',
}

export interface CertificateData {
    serialNo: string;
    grNo: string;
    pupilName: string;
    fatherName: string;
    raceCaste: string;
    religion: string;
    placeOfBirth: string;
    dob: string;
    dobInWords: string;
    lastSchool: string;
    admissionDate: string;
    progress: string;
    conduct: string;
    studyingClass: string;
    leavingDate: string;
    leavingReason: string;
    remarks: string;
    issueDate: string;

    // Testimonial specific
    examType?: 'Annual' | 'Supplementary';
    examYear?: string;
    examBoard?: string;
    examMonth?: string;
    examGroup?: string;
    seatNo?: string;
    division?: string;

    // Character specific
    bonafideFrom?: string;
    bonafideTo?: string;
}

export type ModuleId = 'dashboard' | 'attendance' | 'expense-tracker' | 'other-fees' | 'marks-sheets' | 'fee-management' | 'certificate-generator' | 'admin-settings' | 'student-management' | 'staff-management' | 'id-card-generator' | 'study-materials' | 'data-import' | 'timetable-management' | 'announcements' | 'transport-management' | 'library-management' | 'workspaces';

export interface Module {
    id: ModuleId;
    name: string;
    icon: string;
    enabled: boolean;
    roleAccess: Role[];
}

export interface Student {
    id: number;
    name: string;
    rollNo: string;
    class: string;
    fatherName: string;
    dob: string;
    parentContact: string;
    profilePicUrl: string;
    address: string;
    bloodGroup: string;
    admissionDate: string;
    status: StudentStatus;
    [key: string]: any;
}

export interface ClassFeeConfig {
    className: string;
    amount: number;
}

export interface Subject {
    id: string;
    name: string;
}

export interface Staff {
    id: number;
    name: string;
    employeeId: string;
    role: 'Teacher' | 'Admin' | 'Support Staff';
    subject: string;
    contact: string;
    phoneNumber: string;
    joinDate: string;
    profilePicUrl: string;
    [key: string]: any;
}

export interface AttendanceRecord {
    studentId: number;
    date: string;
    status: 'present' | 'absent' | 'leave';
}

export interface Mark {
    studentId: number;
    subjectId: string;
    term: 'Mid-Term' | 'Final-Exam';
    year: string;
    marks: number;
    totalMarks: number;
}

export interface Expense {
    id: number;
    title: string;
    category: string;
    amount: number;
    date: string;
}

export interface OtherFee {
    id: number;
    title: string;
    category: string;
    amount: number;
    date: string;
}

export interface FeeRecord {
    id: number;
    studentId: number;
    amount: number;
    dueDate: string;
    status: 'Paid' | 'Unpaid' | 'Overdue';
}

export interface Announcement {
    id: number;
    title: string;
    message: string;
    target: 'All' | 'Staff' | 'Parents';
    date: string;
}

export interface Activity {
    id: number;
    action: string;
    details: string;
    timestamp: string;
}

export interface Alert {
    id: number;
    message: string;
    type: 'info' | 'warning' | 'danger';
    timestamp: string;
    read: boolean;
}

export interface StudyMaterial { 
    id: number; 
    title: string; 
    subject: string; 
    class: string; 
    fileUrl: string; 
    fileName: string;
    mimeType: string;
    uploadDate: string; 
}
export interface TimetableEntry { id: number; class: string; dayOfWeek: string; period: number; subjectId: string; teacherId: number; }
export interface BusRoute { id: number; routeName: string; driverName: string; driverContact: string; vehicleNumber: string; }
export interface StudentTransport { studentId: number; routeId: number | null; }
export interface Book { id: number; title: string; author: string; isbn: string; totalCopies: number; availableCopies: number; }
export interface BookIssueRecord { id: number; bookId: number; studentId: number; issueDate: string; dueDate: string; returnDate: string | null; }
