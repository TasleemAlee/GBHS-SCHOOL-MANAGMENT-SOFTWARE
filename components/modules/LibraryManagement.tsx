
import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { type Book, type BookIssueRecord } from '../../types';
import Button from '../common/Button';

const AddBookModal: React.FC<{ onClose: () => void; onAdd: (book: Omit<Book, 'id' | 'availableCopies'>) => void; }> = ({ onClose, onAdd }) => {
    const [formState, setFormState] = useState({ title: '', author: '', isbn: '', totalCopies: 1 });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormState(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({ ...formState, totalCopies: Number(formState.totalCopies) });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 relative w-full max-w-md">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"><span className="material-icons-sharp">close</span></button>
                <h2 className="text-2xl font-bold mb-4">Add New Book</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="title" value={formState.title} onChange={handleChange} placeholder="Book Title" className="p-2 w-full border rounded-md dark:bg-gray-700 dark:border-gray-600" required />
                    <input name="author" value={formState.author} onChange={handleChange} placeholder="Author" className="p-2 w-full border rounded-md dark:bg-gray-700 dark:border-gray-600" required />
                    <input name="isbn" value={formState.isbn} onChange={handleChange} placeholder="ISBN" className="p-2 w-full border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                    <input name="totalCopies" type="number" min="1" value={formState.totalCopies} onChange={handleChange} placeholder="Total Copies" className="p-2 w-full border rounded-md dark:bg-gray-700 dark:border-gray-600" required />
                    <div className="flex justify-end pt-4"><Button type="submit" icon="add">Add Book</Button></div>
                </form>
            </div>
        </div>
    );
};

const LibraryManagement: React.FC = () => {
    const { students, books, setBooks, bookIssueRecords, setBookIssueRecords } = useApp();
    const [activeTab, setActiveTab] = useState<'inventory' | 'issue'>('inventory');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [issueStudentId, setIssueStudentId] = useState<string>('');
    const [issueBookId, setIssueBookId] = useState<string>('');
    
    const studentMap = useMemo(() => new Map(students.map(s => [s.id, s.name])), [students]);
    const bookMap = useMemo(() => new Map(books.map(b => [b.id, b.title])), [books]);

    const handleAddBook = (newBook: Omit<Book, 'id' | 'availableCopies'>) => {
        setBooks(prev => [...prev, { ...newBook, id: Date.now(), availableCopies: newBook.totalCopies }]);
    };
    
    const handleIssueBook = () => {
        if (!issueStudentId || !issueBookId) return;
        const bookId = Number(issueBookId);
        
        setBookIssueRecords(prev => [...prev, {
            id: Date.now(),
            bookId,
            studentId: Number(issueStudentId),
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days due
            returnDate: null
        }]);

        setBooks(prev => prev.map(b => b.id === bookId ? {...b, availableCopies: b.availableCopies - 1} : b));
        setIssueBookId('');
        setIssueStudentId('');
    };

    const handleReturnBook = (recordId: number, bookId: number) => {
        setBookIssueRecords(prev => prev.map(rec => rec.id === recordId ? {...rec, returnDate: new Date().toISOString().split('T')[0]} : rec));
        setBooks(prev => prev.map(b => b.id === bookId ? {...b, availableCopies: b.availableCopies + 1} : b));
    };

    const TabButton: React.FC<{tabId: 'inventory' | 'issue', title: string}> = ({ tabId, title }) => (
        <button onClick={() => setActiveTab(tabId)} className={`px-4 py-2 text-sm font-semibold rounded-md ${activeTab === tabId ? 'text-white' : 'dark:text-gray-300'}`}
        style={activeTab === tabId ? {backgroundColor: useApp().schoolSettings.primaryColor} : {}}>
            {title}
        </button>
    );
    
    const activeIssues = bookIssueRecords.filter(r => r.returnDate === null);
    
    return (
        <div className="space-y-6">
            {isModalOpen && <AddBookModal onClose={() => setIsModalOpen(false)} onAdd={handleAddBook} />}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Library Management</h1>
                {activeTab === 'inventory' && <Button icon="add" onClick={() => setIsModalOpen(true)}>Add New Book</Button>}
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md self-start inline-flex space-x-2">
                <TabButton tabId="inventory" title="Book Inventory" />
                <TabButton tabId="issue" title="Issue / Return" />
            </div>

            {activeTab === 'inventory' && (
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                    {books.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {books.map(book => (
                                <div key={book.id} className="p-4 border dark:border-gray-700 rounded-lg">
                                    <h3 className="font-bold">{book.title}</h3>
                                    <p className="text-sm text-gray-500">{book.author}</p>
                                    <p className="text-xs mt-2">ISBN: {book.isbn}</p>
                                    <p className="text-sm font-semibold mt-2">Available: {book.availableCopies} / {book.totalCopies}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <div className="text-center py-12">
                            <span className="material-icons-sharp text-6xl text-gray-400">local_library</span>
                            <h3 className="mt-2 text-xl font-semibold">No Books in Inventory</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by adding your first book.</p>
                            <Button className="mt-6" onClick={() => setIsModalOpen(true)}>Add Book</Button>
                        </div>
                    )}
                 </div>
            )}
            {activeTab === 'issue' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md self-start">
                        <h2 className="text-xl font-bold mb-4">Issue a Book</h2>
                        <div className="space-y-4">
                            <select value={issueStudentId} onChange={e => setIssueStudentId(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"><option value="">Select Student</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
                            <select value={issueBookId} onChange={e => setIssueBookId(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"><option value="">Select Book</option>{books.filter(b=>b.availableCopies > 0).map(b=><option key={b.id} value={b.id}>{b.title}</option>)}</select>
                            <Button className="w-full" onClick={handleIssueBook} disabled={!issueStudentId || !issueBookId}>Issue Book</Button>
                        </div>
                    </div>
                     <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-bold mb-4">Issued Books ({activeIssues.length})</h2>
                        <div className="overflow-auto max-h-96">
                            {activeIssues.length > 0 ? (
                                <table className="w-full text-left text-sm">
                                    <thead><tr className="border-b dark:border-gray-700"><th>Book</th><th>Student</th><th>Due Date</th><th></th></tr></thead>
                                    <tbody>
                                        {activeIssues.map(rec => (
                                            <tr key={rec.id} className="border-b dark:border-gray-700">
                                                <td className="p-2 font-semibold">{bookMap.get(rec.bookId)}</td>
                                                <td className="p-2">{studentMap.get(rec.studentId)}</td>
                                                <td className="p-2">{rec.dueDate}</td>
                                                <td className="p-2 text-right"><Button className="text-xs py-1 px-2" onClick={() => handleReturnBook(rec.id, rec.bookId)}>Return</Button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : <p className="text-center text-gray-500 py-8">No books currently issued.</p>}
                        </div>
                     </div>
                </div>
            )}
        </div>
    );
};

export default LibraryManagement;
