
import React from 'react';
import { useApp } from '../../contexts/AppContext';

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
}

const Toggle: React.FC<ToggleProps> = ({ enabled, onChange, label }) => {
    const { schoolSettings } = useApp();

    return (
        <label className="flex items-center cursor-pointer">
            <div className="relative">
                <input type="checkbox" className="sr-only" checked={enabled} onChange={() => onChange(!enabled)} />
                <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                <div
                    className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform"
                    style={{ 
                        transform: enabled ? 'translateX(100%)' : 'translateX(0)',
                        backgroundColor: enabled ? schoolSettings.primaryColor : 'white',
                    }}
                ></div>
            </div>
            {label && <div className="ml-3 text-gray-700 dark:text-gray-300 font-medium">{label}</div>}
        </label>
    );
};

export default Toggle;
