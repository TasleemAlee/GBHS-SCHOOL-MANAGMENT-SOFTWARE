
import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { type OtherFee } from '../../types';
import Button from '../common/Button';

const OtherFees: React.FC = () => {
    const { otherFees, setOtherFees, addActivity } = useApp();
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Exam Fee');
    const [amount, setAmount] = useState('');

    const handleCollect = () => {
        if (!title || !amount) return;
        const newFee: OtherFee = {
            id: Date.now(),
            title,
            category,
            amount: Number(amount),
            date: new Date().toISOString().split('T')[0]
        };
        setOtherFees(prev => [newFee, ...prev]);
        addActivity('Other Fee Collected', `${category}: ${title} - $${amount}`);
        setTitle('');
        setAmount('');
    };

    const totalCollected = useMemo(() => otherFees.reduce((acc, f) => acc + f.amount, 0), [otherFees]);

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Other Collections</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm self-start space-y-4 border dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-4 dark:text-white">Record New Collection</h2>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Description (e.g. Student Name / Tour Name)" className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600" />
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600">
                        <option>Exam Fee</option>
                        <option>Uniform Fee</option>
                        <option>Tour Fee</option>
                        <option>Annual Function</option>
                        <option>Sports Fee</option>
                    </select>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount ($)" className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600" />
                    <Button className="w-full" onClick={handleCollect} icon="add_card">Collect & Save</Button>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-lg">
                        <p className="opacity-80 text-sm font-bold">Total Misc. Revenue</p>
                        <h3 className="text-4xl font-black">${totalCollected.toLocaleString()}</h3>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden border dark:border-gray-700">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="p-4 text-xs font-bold uppercase text-gray-400">Date</th>
                                    <th className="p-4 text-xs font-bold uppercase text-gray-400">Category</th>
                                    <th className="p-4 text-xs font-bold uppercase text-gray-400">Description</th>
                                    <th className="p-4 text-xs font-bold uppercase text-gray-400 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {otherFees.map(f => (
                                    <tr key={f.id} className="border-b dark:border-gray-700">
                                        <td className="p-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{f.date}</td>
                                        <td className="p-4"><span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-[10px] uppercase font-bold">{f.category}</span></td>
                                        <td className="p-4 font-semibold text-gray-800 dark:text-gray-200">{f.title}</td>
                                        <td className="p-4 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">${f.amount.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OtherFees;
