import React, { useState } from 'react';
import api from '../services/api';
import { useLocation } from 'react-router-dom';

const BulkImport = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('players');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const playerColumns = [
        { name: 'name', required: true, description: 'Full name of the player' },
        { name: 'role', required: true, description: 'Batsman, Bowler, All-rounder, Wicket-keeper' },
        { name: 'battingStyle', required: false, description: 'Right-hand bat, Left-hand bat' },
        { name: 'bowlingStyle', required: false, description: 'Right-arm fast, Left-arm spin, etc.' },
        { name: 'team', required: false, description: 'Team name or ID' },
        { name: 'campus', required: false, description: 'Campus location' },
        { name: 'phone', required: false, description: 'Contact number' },
        { name: 'email', required: false, description: 'Email address' },
    ];

    const teamColumns = [
        { name: 'name', required: true, description: 'Full team name' },
        { name: 'shortName', required: true, description: 'Short name or abbreviation' },
        { name: 'owner', required: false, description: 'Team owner name' },
        { name: 'logo', required: false, description: 'Logo image URL' },
        { name: 'campus', required: false, description: 'Campus location' },
    ];

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        validateAndSetFile(droppedFile);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        validateAndSetFile(selectedFile);
    };

    const validateAndSetFile = (selectedFile) => {
        setError(null);
        setResult(null);
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
        ];
        const allowedExtensions = ['.xlsx', '.xls'];
        const fileExtension = '.' + selectedFile.name.split('.').pop().toLowerCase();

        if (!allowedTypes.includes(selectedFile.type) && !allowedExtensions.includes(fileExtension)) {
            setError('Only Excel files (.xlsx, .xls) are allowed');
            return;
        }
        setFile(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setUploadProgress(0);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);

        const endpoint = activeTab === 'players' ? '/import/players' : '/import/teams';

        try {
            const res = await api.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                },
            });
            setResult(res.data);
            setFile(null);
            setUploadProgress(0);
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed. Please try again.');
        }
        setUploading(false);
    };

    const downloadTemplate = () => {
        const columns = activeTab === 'players' ? playerColumns : teamColumns;
        const headers = columns.map((col) => col.name).join(',');
        const csvContent = `data:text/csv;charset=utf-8,${headers}\n`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `${activeTab}_template.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = activeTab === 'players' ? playerColumns : teamColumns;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 p-6 lg:p-10">
            <h1 className="text-4xl lg:text-5xl font-black text-[#031d44] mb-8">Bulk Import</h1>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-6">
                <button
                    onClick={() => {
                        setActiveTab('players');
                        setFile(null);
                        setResult(null);
                        setError(null);
                    }}
                    className={`flex-1 py-4 font-black text-sm uppercase tracking-widest ${activeTab === 'players'
                            ? 'bg-[#031d44] text-white rounded-t-xl'
                            : 'bg-white text-slate-600 hover:bg-slate-100'
                        }`}
                >
                    Import Players
                </button>
                <button
                    onClick={() => {
                        setActiveTab('teams');
                        setFile(null);
                        setResult(null);
                        setError(null);
                    }}
                    className={`flex-1 py-4 font-black text-sm uppercase tracking-widest ${activeTab === 'teams'
                            ? 'bg-[#031d44] text-white rounded-t-xl'
                            : 'bg-white text-slate-600 hover:bg-slate-100'
                        }`}
                >
                    Import Teams
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6">
                {/* Download Template */}
                <div className="mb-6">
                    <button
                        onClick={downloadTemplate}
                        className="bg-[#031d44] hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-xl px-6 py-3"
                    >
                        Download {activeTab === 'players' ? 'Players' : 'Teams'} Template
                    </button>
                </div>

                {/* Format Guide */}
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-[#031d44] mb-3">Required Format</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[#031d44] text-white">
                                    <th className="px-4 py-3 text-left">Column</th>
                                    <th className="px-4 py-3 text-left">Required</th>
                                    <th className="px-4 py-3 text-left">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {columns.map((col, idx) => (
                                    <tr key={col.name} className={`border-b border-slate-200 ${idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}>
                                        <td className="px-4 py-3 font-bold text-[#031d44]">{col.name}</td>
                                        <td className="px-4 py-3">
                                            {col.required ? (
                                                <span className="text-red-600 font-bold">Yes</span>
                                            ) : (
                                                <span className="text-slate-500">No</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{col.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* File Upload */}
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${isDragging
                            ? 'border-[#031d44] bg-blue-50'
                            : 'border-slate-300 hover:border-[#031d44]'
                        }`}
                >
                    {file ? (
                        <div>
                            <p className="text-lg font-bold text-[#031d44] mb-2">{file.name}</p>
                            <p className="text-slate-500 mb-4">{(file.size / 1024).toFixed(2)} KB</p>
                            <button
                                onClick={() => setFile(null)}
                                className="text-red-600 font-bold text-sm hover:underline"
                            >
                                Remove file
                            </button>
                        </div>
                    ) : (
                        <div>
                            <p className="text-xl font-bold text-[#031d44] mb-2">
                                Drag & Drop your Excel file here
                            </p>
                            <p className="text-slate-500 mb-4">or</p>
                            <label className="bg-[#031d44] hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-xl px-6 py-3 cursor-pointer inline-block">
                                Browse Files
                                <input
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                            <p className="text-slate-400 text-sm mt-3">Only .xlsx and .xls files accepted</p>
                        </div>
                    )}
                </div>

                {/* Upload Progress */}
                {uploading && (
                    <div className="mt-6">
                        <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                            <div
                                className="bg-[#031d44] h-4 transition-all duration-300 rounded-full"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                        <p className="text-center text-slate-500 mt-2 font-bold">{uploadProgress}%</p>
                    </div>
                )}

                {/* Upload Button */}
                <div className="mt-6">
                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className={`w-full font-black text-xs uppercase tracking-widest rounded-xl px-6 py-4 ${file && !uploading
                                ? 'bg-[#031d44] hover:bg-slate-800 text-white'
                                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        {uploading ? 'Uploading...' : `Upload ${activeTab === 'players' ? 'Players' : 'Teams'}`}
                    </button>
                </div>

                {/* Success Result */}
                {result && (
                    <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
                        <h4 className="font-bold text-green-800 text-lg mb-2">Upload Successful!</h4>
                        <p className="text-green-700">
                            {result.message || `Successfully imported ${result.successCount || 0} ${activeTab}`}
                        </p>
                        {result.errors && result.errors.length > 0 && (
                            <div className="mt-3">
                                <p className="font-bold text-red-600">Errors:</p>
                                <ul className="text-red-500 text-sm list-disc list-inside">
                                    {result.errors.map((err, idx) => (
                                        <li key={idx}>{err}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
                        <h4 className="font-bold text-red-800 text-lg">Upload Failed</h4>
                        <p className="text-red-600">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BulkImport;
