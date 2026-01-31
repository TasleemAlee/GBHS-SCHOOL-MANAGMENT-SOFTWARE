
import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { GoogleGenAI } from "@google/genai";
import Button from './Button';

const ZenithAI: React.FC = () => {
    const { students, staff, fees, schoolSettings } = useApp();
    const [loading, setLoading] = useState(false);
    const [briefing, setBriefing] = useState<string | null>(null);

    const generateBriefing = async () => {
        setLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Act as a Senior School Consultant for ${schoolSettings.schoolName}. 
                Analyze these stats and provide a 3-sentence optimistic morning briefing:
                - Students: ${students.length}
                - Staff: ${staff.length}
                - Total Fee Revenue: $${fees.reduce((acc, f) => acc + (f.status === 'Paid' ? f.amount : 0), 0)}
                - Outstanding: $${fees.reduce((acc, f) => acc + (f.status !== 'Paid' ? f.amount : 0), 0)}
                
                Keep it professional, encouraging, and brief.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });

            setBriefing(response.text || "Failed to generate briefing.");
        } catch (e) {
            console.error("AI Error:", e);
            setBriefing("Zenith AI is currently resting. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-indigo-900 text-white p-6 rounded-3xl shadow-xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-icons-sharp text-8xl">auto_awesome</span>
            </div>
            <div className="relative z-10 space-y-3">
                <div className="flex items-center space-x-2">
                    <span className="material-icons-sharp text-indigo-400">auto_awesome</span>
                    <h2 className="text-sm font-black uppercase tracking-[0.2em]">Zenith Intelligence</h2>
                </div>
                {briefing ? (
                    <p className="text-sm leading-relaxed font-medium animate-fade-in italic">"{briefing}"</p>
                ) : (
                    <div>
                        <p className="text-xs font-medium opacity-70 mb-4">Let AI analyze your school's data and provide strategic insights for today.</p>
                        <Button 
                            onClick={generateBriefing} 
                            disabled={loading} 
                            className="bg-white/10 hover:bg-white/20 border-none shadow-none text-white text-xs"
                        >
                            {loading ? 'Processing...' : 'Generate Today\'s Briefing'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ZenithAI;
