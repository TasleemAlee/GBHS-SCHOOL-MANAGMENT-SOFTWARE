
import React, { useState, useMemo } from 'react';
import Button from '../common/Button';
import { useApp } from '../../contexts/AppContext';
import { type Expense } from '../../types';

const AddExpenseModal: React.FC<{ onClose: () => void; onAdd: (expense: Omit<Expense, 'id'>) => void; }> = ({ onClose, onAdd }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Academics');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !amount) return;
        onAdd({
            title,
            category,
            amount: parseFloat(amount),
            date,
        });
        onClose();
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 relative w-full max-w-md">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                    <span className="material-icons-sharp">close</span>
                </button>
                <h2 className="text-2xl font-bold mb-4 dark:text-white">Add New Expense</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium dark:text-gray-300">Title</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium dark:text-gray-300">Category</label>
                        <select value={category} onChange={e => setCategory(e.target.value)} className="mt-1 block w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                           <option>Academics</option>
                           <option>Utilities</option>
                           <option>Events</option>
                           <option>Maintenance</option>
                           <option>Salary</option>
                           <option>Other</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium dark:text-gray-300">Amount</label>
                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 block w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium dark:text-gray-300">Date</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" required />
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button type="submit" icon="add">Add Expense</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const ExpenseTracker: React.FC = () => {
    const { expenses, setExpenses } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddExpense = (newExpense: Omit<Expense, 'id'>) => {
        setExpenses(prev => [...prev, { id: Date.now(), ...newExpense }]);
    };
    
    const totalThisMonth = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        return expenses
            .filter(e => {
                const expenseDate = new Date(e.date);
                return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
            })
            .reduce((sum, e) => sum + e.amount, 0);
    }, [expenses]);


    return (
        <div className="space-y-6">
            {isModalOpen && <AddExpenseModal onClose={() => setIsModalOpen(false)} onAdd={handleAddExpense} />}

            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Expense Tracker</h1>
                <Button icon="add" onClick={() => setIsModalOpen(true)}>Add New Expense</Button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                 <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Total This Month</h2>
                 <p className="text-4xl font-bold" style={{color: '#DB2777'}}>${totalThisMonth.toLocaleString()}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold mb-4 dark:text-white">All Expenses</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b dark:border-gray-700">
                                <th className="p-4">Date</th>
                                <th className="p-4">Title</th>
                                <th className="p-4">Category</th>
                                <th className="p-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(expense => (
                                <tr key={expense.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="p-4 whitespace-nowrap">{expense.date}</td>
                                    <td className="p-4 font-medium">{expense.title}</td>
                                    <td className="p-4"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 dark:bg-gray-600">{expense.category}</span></td>
                                    <td className="p-4 text-right font-semibold">${expense.amount.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ExpenseTracker;
