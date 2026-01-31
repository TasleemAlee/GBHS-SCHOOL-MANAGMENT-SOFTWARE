
import React, { useState, useMemo, useEffect } from 'react';
import { useApp, AppProvider } from './contexts/AppContext';
import OnboardingWizard from './components/OnboardingWizard';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Attendance from './components/modules/Attendance';
import Marksheets from './components/modules/Marksheets';
import CertificateGenerator from './components/modules/CertificateGenerator';
import AdminSettings from './components/modules/AdminSettings';
import ExpenseTracker from './components/modules/ExpenseTracker';
import OtherFees from './components/modules/OtherFees';
import FeeManagement from './components/modules/FeeManagement';
import StudentManagement from './components/modules/StudentManagement';
import StaffManagement from './components/modules/StaffManagement';
import IdCardGenerator from './components/modules/IdCardGenerator';
import StudyMaterials from './components/modules/StudyMaterials';
import DataImport from './components/modules/DataImport';
import TimetableManagement from './components/modules/TimetableManagement';
import Announcements from './components/modules/Announcements';
import TransportManagement from './components/modules/TransportManagement';
import LibraryManagement from './components/modules/LibraryManagement';
import CommandPalette from './components/common/CommandPalette';
import { type ModuleId } from './types';

const AppContent: React.FC = () => {
    const { schoolSettings, theme, sidebarCollapsed, isMobileSidebarOpen, setIsMobileSidebarOpen } = useApp();
    const [activeModule, setActiveModule] = useState<ModuleId>('dashboard');
    const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setCommandPaletteOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (theme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [theme]);

    const renderModule = () => {
        switch (activeModule) {
            case 'dashboard': return <Dashboard setActiveModule={setActiveModule} />;
            case 'attendance': return <Attendance />;
            case 'marks-sheets': return <Marksheets />;
            case 'certificate-generator': return <CertificateGenerator />;
            case 'admin-settings': return <AdminSettings />;
            case 'expense-tracker': return <ExpenseTracker />;
            case 'other-fees': return <OtherFees />;
            case 'fee-management': return <FeeManagement />;
            case 'student-management': return <StudentManagement setActiveModule={setActiveModule} />;
            case 'staff-management': return <StaffManagement setActiveModule={setActiveModule} />;
            case 'id-card-generator': return <IdCardGenerator />;
            case 'study-materials': return <StudyMaterials />;
            case 'data-import': return <DataImport />;
            case 'timetable-management': return <TimetableManagement />;
            case 'announcements': return <Announcements />;
            case 'transport-management': return <TransportManagement />;
            case 'library-management': return <LibraryManagement />;
            default: return <Dashboard setActiveModule={setActiveModule} />;
        }
    };
    
    const customStyles = useMemo(() => `
        :root {
            --primary-color: ${schoolSettings.primaryColor};
            --primary-color-light: ${schoolSettings.primaryColor}1A;
            --primary-color-dark: ${schoolSettings.primaryColor}E6;
        }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
    `, [schoolSettings.primaryColor]);

    if (!schoolSettings.onboardingComplete) return <OnboardingWizard />;

    return (
        <>
            <style>{customStyles}</style>
            <CommandPalette 
                isOpen={isCommandPaletteOpen} 
                onClose={() => setCommandPaletteOpen(false)} 
                setActiveModule={setActiveModule} 
            />
             {isMobileSidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setIsMobileSidebarOpen(false)}></div>}

            <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-hidden">
                {/* Mobile Sidebar */}
                <div className={`fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out md:hidden ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <Sidebar 
                        activeModule={activeModule} 
                        setActiveModule={setActiveModule} 
                        isMobile={true}
                        onMobileNavigate={() => setIsMobileSidebarOpen(false)}
                    />
                </div>

                {/* Desktop Sidebar */}
                <div className={`hidden md:flex transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
                    <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />
                </div>
                
                <div className="flex-1 flex flex-col overflow-hidden relative">
                    <Header />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50 p-4 sm:p-6 md:p-8 custom-scrollbar pb-24 md:pb-8">
                        {renderModule()}
                    </main>

                    {/* Mobile Navigation */}
                    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 h-16 flex items-center justify-around px-4 z-20">
                        {[
                            { id: 'dashboard', icon: 'dashboard' },
                            { id: 'student-management', icon: 'groups' },
                            { id: 'attendance', icon: 'checklist' },
                            { id: 'fee-management', icon: 'payments' },
                            { id: 'admin-settings', icon: 'settings' }
                        ].map(item => (
                            <button 
                                key={item.id}
                                onClick={() => setActiveModule(item.id as any)}
                                className={`p-2 rounded-xl flex flex-col items-center space-y-1 ${activeModule === item.id ? 'text-indigo-600' : 'text-gray-400'}`}
                            >
                                <span className="material-icons-sharp text-2xl">{item.icon}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

const App: React.FC = () => (
    <AppProvider>
        <AppContent />
    </AppProvider>
);

export default App;
