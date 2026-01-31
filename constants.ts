
import { type Module, Role } from './types';

export const ALL_MODULES: Module[] = [
    { id: 'dashboard', name: 'Dashboard', icon: 'dashboard', enabled: true, roleAccess: [Role.SCHOOL_ADMIN, Role.TEACHER] },
    { id: 'student-management', name: 'Students', icon: 'groups', enabled: true, roleAccess: [Role.SCHOOL_ADMIN] },
    { id: 'staff-management', name: 'Staff', icon: 'badge', enabled: true, roleAccess: [Role.SCHOOL_ADMIN] },
    { id: 'attendance', name: 'Attendance', icon: 'checklist', enabled: true, roleAccess: [Role.SCHOOL_ADMIN, Role.TEACHER] },
    { id: 'announcements', name: 'Announcements', icon: 'campaign', enabled: true, roleAccess: [Role.SCHOOL_ADMIN] },
    { id: 'timetable-management', name: 'Timetable', icon: 'grid_view', enabled: true, roleAccess: [Role.SCHOOL_ADMIN, Role.TEACHER] },
    { id: 'marks-sheets', name: 'Exams & Marksheets', icon: 'history_edu', enabled: true, roleAccess: [Role.SCHOOL_ADMIN, Role.TEACHER] },
    { id: 'study-materials', name: 'Study Materials', icon: 'menu_book', enabled: true, roleAccess: [Role.SCHOOL_ADMIN, Role.TEACHER] },
    { id: 'transport-management', name: 'Transport', icon: 'directions_bus', enabled: true, roleAccess: [Role.SCHOOL_ADMIN] },
    { id: 'library-management', name: 'Library', icon: 'local_library', enabled: true, roleAccess: [Role.SCHOOL_ADMIN, Role.TEACHER] },
    { id: 'fee-management', name: 'Fee Management', icon: 'payments', enabled: true, roleAccess: [Role.SCHOOL_ADMIN] },
    { id: 'other-fees', name: 'Other Collections', icon: 'account_balance_wallet', enabled: true, roleAccess: [Role.SCHOOL_ADMIN] },
    { id: 'expense-tracker', name: 'Expense Tracker', icon: 'receipt_long', enabled: true, roleAccess: [Role.SCHOOL_ADMIN] },
    { id: 'id-card-generator', name: 'ID Cards', icon: 'contact_mail', enabled: true, roleAccess: [Role.SCHOOL_ADMIN] },
    { id: 'certificate-generator', name: 'Certificates', icon: 'workspace_premium', enabled: true, roleAccess: [Role.SCHOOL_ADMIN] },
    { id: 'data-import', name: 'Data Import', icon: 'upload_file', enabled: true, roleAccess: [Role.SCHOOL_ADMIN] },
    { id: 'admin-settings', name: 'Admin Settings', icon: 'settings', enabled: true, roleAccess: [Role.SCHOOL_ADMIN, Role.SUPER_ADMIN] },
];

export const MOCK_SUBJECTS = [
    { id: 'math', name: 'Mathematics' },
    { id: 'sci', name: 'Science' },
    { id: 'eng', name: 'English' },
    { id: 'hist', name: 'History' },
    { id: 'geo', name: 'Geography' },
];
