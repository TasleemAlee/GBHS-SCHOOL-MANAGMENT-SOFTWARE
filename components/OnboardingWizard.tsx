
import React, { useState, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import Button from './common/Button';

const OnboardingWizard: React.FC = () => {
    const { schoolSettings, setSchoolSettings } = useApp();
    const [step, setStep] = useState(1);
    const [localSettings, setLocalSettings] = useState({ ...schoolSettings });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleColorChange = (color: string) => {
        setLocalSettings(prev => ({ ...prev, primaryColor: color }));
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setLocalSettings(prev => ({ ...prev, logoUrl: event.target.result as string }));
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const finishOnboarding = () => {
        setSchoolSettings({ ...localSettings, onboardingComplete: true });
    };

    const colorPalette = ['#4F46E5', '#0891B2', '#059669', '#DB2777', '#D97706', '#6D28D9'];

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 transition-all duration-500">
                <h1 className="text-3xl font-bold text-center mb-2 dark:text-white" style={{ color: localSettings.primaryColor }}>Welcome to Zenith!</h1>
                <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Let's set up your school's new home.</p>
                
                {/* Progress Bar */}
                <div className="relative mb-8">
                    <div className="h-2 bg-gray-200 rounded-full"></div>
                    <div className="absolute top-0 left-0 h-2 rounded-full" style={{ width: `${(step / 3) * 100}%`, backgroundColor: localSettings.primaryColor, transition: 'width 0.5s ease' }}></div>
                </div>

                {step === 1 && (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-2xl font-semibold dark:text-white">School Details</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">School Name</label>
                            <input type="text" name="schoolName" value={localSettings.schoolName} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1" style={{'--tw-ring-color': localSettings.primaryColor} as React.CSSProperties} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Details (Address/Phone)</label>
                            <textarea name="contactDetails" value={localSettings.contactDetails} onChange={handleInputChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1" style={{'--tw-ring-color': localSettings.primaryColor} as React.CSSProperties}></textarea>
                        </div>
                        <Button onClick={nextStep} className="w-full">Next</Button>
                    </div>
                )}
                
                {step === 2 && (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-2xl font-semibold dark:text-white">Branding</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">School Logo</label>
                            <div className="flex items-center space-x-4">
                                {localSettings.logoUrl ? <img src={localSettings.logoUrl} alt="logo" className="w-20 h-20 rounded-full object-cover"/> : <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">Logo</div>}
                                <Button onClick={() => fileInputRef.current?.click()} variant="secondary">Upload Logo</Button>
                                <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*"/>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Color</label>
                            <div className="flex space-x-3">
                                {colorPalette.map(color => (
                                    <button key={color} onClick={() => handleColorChange(color)} className={`w-10 h-10 rounded-full border-4 ${localSettings.primaryColor === color ? '' : 'border-transparent'}`} style={{ backgroundColor: color, borderColor: localSettings.primaryColor === color ? 'white' : 'transparent', boxShadow: `0 0 0 2px ${color}` }}></button>
                                ))}
                                <input type="color" value={localSettings.primaryColor} onChange={e => handleColorChange(e.target.value)} className="w-10 h-10 p-0 border-none cursor-pointer rounded-full" />
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <Button onClick={prevStep} variant="secondary">Back</Button>
                            <Button onClick={nextStep}>Next</Button>
                        </div>
                    </div>
                )}
                
                {step === 3 && (
                    <div className="text-center animate-fade-in">
                        <h2 className="text-2xl font-semibold dark:text-white mb-4">Ready to Go!</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">You've successfully set up your school. You can change these settings later in the admin panel.</p>
                        <div className="flex justify-between">
                            <Button onClick={prevStep} variant="secondary">Back</Button>
                            <Button onClick={finishOnboarding} icon="rocket_launch">Launch Dashboard</Button>
                        </div>
                    </div>
                )}
            </div>
            <style>{`
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-in-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default OnboardingWizard;