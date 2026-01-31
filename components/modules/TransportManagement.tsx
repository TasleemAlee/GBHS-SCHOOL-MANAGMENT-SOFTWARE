
import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { type BusRoute, type StudentTransport } from '../../types';
import Button from '../common/Button';

const AddRouteModal: React.FC<{ onClose: () => void; onAdd: (route: Omit<BusRoute, 'id'>) => void; }> = ({ onClose, onAdd }) => {
    const [formState, setFormState] = useState({
        routeName: '',
        driverName: '',
        driverContact: '',
        vehicleNumber: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(formState);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 relative w-full max-w-md">
                 <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"><span className="material-icons-sharp">close</span></button>
                <h2 className="text-2xl font-bold mb-4">Add New Route</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="routeName" value={formState.routeName} onChange={handleChange} placeholder="Route Name (e.g., North Route)" className="p-2 w-full border rounded-md dark:bg-gray-700 dark:border-gray-600" required />
                    <input name="driverName" value={formState.driverName} onChange={handleChange} placeholder="Driver's Name" className="p-2 w-full border rounded-md dark:bg-gray-700 dark:border-gray-600" required />
                    <input name="driverContact" value={formState.driverContact} onChange={handleChange} placeholder="Driver's Contact" className="p-2 w-full border rounded-md dark:bg-gray-700 dark:border-gray-600" required />
                    <input name="vehicleNumber" value={formState.vehicleNumber} onChange={handleChange} placeholder="Vehicle Number" className="p-2 w-full border rounded-md dark:bg-gray-700 dark:border-gray-600" required />
                    <div className="flex justify-end pt-4">
                        <Button type="submit" icon="add">Add Route</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const TransportManagement: React.FC = () => {
    const { students, busRoutes, setBusRoutes, studentTransport, setStudentTransport } = useApp();
    const [activeTab, setActiveTab] = useState<'routes' | 'allocation'>('routes');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const transportMap = useMemo(() => new Map(studentTransport.map(st => [st.studentId, st.routeId])), [studentTransport]);

    const handleAddRoute = (newRoute: Omit<BusRoute, 'id'>) => {
        setBusRoutes(prev => [...prev, { id: Date.now(), ...newRoute }]);
    };
    
    const handleAllocationChange = (studentId: number, routeId: string) => {
        const newRouteId = routeId ? Number(routeId) : null;
        setStudentTransport(prev => {
            const existing = prev.find(st => st.studentId === studentId);
            if (existing) {
                return prev.map(st => st.studentId === studentId ? { ...st, routeId: newRouteId } : st);
            }
            return [...prev, { studentId, routeId: newRouteId }];
        });
    };

    const TabButton: React.FC<{tabId: 'routes' | 'allocation', title: string}> = ({ tabId, title }) => (
        <button onClick={() => setActiveTab(tabId)} className={`px-4 py-2 text-sm font-semibold rounded-md ${activeTab === tabId ? 'bg-primary text-white' : 'dark:text-gray-300'}`}
        style={activeTab === tabId ? {backgroundColor: useApp().schoolSettings.primaryColor} : {}}>
            {title}
        </button>
    );

    return (
        <div className="space-y-6">
            {isModalOpen && <AddRouteModal onClose={() => setIsModalOpen(false)} onAdd={handleAddRoute} />}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Transport Management</h1>
                 {activeTab === 'routes' && <Button icon="add" onClick={() => setIsModalOpen(true)}>Add New Route</Button>}
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md self-start inline-flex space-x-2">
                <TabButton tabId="routes" title="Bus Routes" />
                <TabButton tabId="allocation" title="Student Allocation" />
            </div>

            {activeTab === 'routes' && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                    {busRoutes.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead><tr className="border-b dark:border-gray-700"><th className="p-4">Route Name</th><th className="p-4">Driver</th><th className="p-4">Contact</th><th className="p-4">Vehicle No.</th></tr></thead>
                                <tbody>
                                    {busRoutes.map(route => (
                                        <tr key={route.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="p-4 font-medium">{route.routeName}</td>
                                            <td className="p-4">{route.driverName}</td>
                                            <td className="p-4">{route.driverContact}</td>
                                            <td className="p-4">{route.vehicleNumber}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                         <div className="text-center py-12">
                            <span className="material-icons-sharp text-6xl text-gray-400">directions_bus</span>
                            <h3 className="mt-2 text-xl font-semibold">No Bus Routes Found</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by adding your first bus route.</p>
                            <Button className="mt-6" onClick={() => setIsModalOpen(true)}>Add Route</Button>
                        </div>
                    )}
                </div>
            )}

             {activeTab === 'allocation' && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead><tr className="border-b dark:border-gray-700"><th className="p-4">Student Name</th><th className="p-4">Class</th><th className="p-4">Assigned Route</th></tr></thead>
                            <tbody>
                                {students.map(student => (
                                    <tr key={student.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="p-4 font-medium">{student.name}</td>
                                        <td className="p-4">{student.class}</td>
                                        <td className="p-4">
                                            <select value={transportMap.get(student.id) || ''} onChange={e => handleAllocationChange(student.id, e.target.value)} className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 w-full">
                                                <option value="">Not Assigned</option>
                                                {busRoutes.map(r => <option key={r.id} value={r.id}>{r.routeName}</option>)}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransportManagement;
