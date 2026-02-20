import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../services/api";

export default function BulkImport() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || "players");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  const handleFileUpload = async (file, endpoint) => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert("Please upload an Excel file (.xlsx or .xls)");
      return;
    }

    setUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setResult({
        success: true,
        ...res.data
      });
    } catch (err) {
      console.error(err);
      setResult({
        success: false,
        message: err.response?.data?.message || "Upload failed",
        errors: err.response?.data?.errors
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = async (type) => {
    try {
      const endpoint = type === 'players'
        ? '/bulk-import/players/template'
        : '/bulk-import/teams/template';

      const res = await api.get(endpoint, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_template.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert("Failed to download template");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Bulk Import</h2>
        <p className="text-sm text-slate-600 mt-1">
          Import players and teams from Excel files
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => {
            setActiveTab("players");
            setResult(null);
          }}
          className={`px-4 py-2 font-medium ${activeTab === "players"
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-slate-600 hover:text-slate-800"
            }`}
        >
          Import Players
        </button>
        <button
          onClick={() => {
            setActiveTab("teams");
            setResult(null);
          }}
          className={`px-4 py-2 font-medium ${activeTab === "teams"
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-slate-600 hover:text-slate-800"
            }`}
        >
          Import Teams
        </button>
      </div>

      {/* Content */}
      {activeTab === "players" && (
        <PlayersImport
          onUpload={(file) => handleFileUpload(file, '/bulk-import/players')}
          onDownloadTemplate={() => downloadTemplate('players')}
          uploading={uploading}
          result={result}
        />
      )}

      {activeTab === "teams" && (
        <TeamsImport
          onUpload={(file) => handleFileUpload(file, '/bulk-import/teams')}
          onDownloadTemplate={() => downloadTemplate('teams')}
          uploading={uploading}
          result={result}
        />
      )}
    </div>
  );
}

// Players Import Component
function PlayersImport({ onUpload, onDownloadTemplate, uploading, result }) {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">How to Import Players</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
          <li>Download the Excel template</li>
          <li>Fill in player details (Name, Role, Campus, Team)</li>
          <li>Make sure team names match exactly with existing teams</li>
          <li>Save the file and upload it below</li>
        </ol>
      </div>

      {/* Template Download */}
      <div className="card">
        <h3 className="font-semibold mb-3">Step 1: Download Template</h3>
        <button
          onClick={onDownloadTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Player Template
        </button>
        <p className="text-xs text-slate-500 mt-2">
          Downloads an Excel file with the correct format and sample data
        </p>
      </div>

      {/* File Upload */}
      <div className="card">
        <h3 className="font-semibold mb-3">Step 2: Upload Filled Template</h3>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="player-file-upload"
              disabled={uploading}
            />
            <label
              htmlFor="player-file-upload"
              className="cursor-pointer"
            >
              <svg className="w-12 h-12 text-slate-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-slate-600 font-medium mb-1">
                {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
              </p>
              <p className="text-sm text-slate-500">Excel files only (.xlsx, .xls)</p>
            </label>
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-red-600 hover:text-red-700"
                disabled={uploading}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading..." : "Import Players"}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className={`card ${result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          <h3 className={`font-semibold mb-3 ${result.success ? "text-green-900" : "text-red-900"}`}>
            {result.success ? "Import Successful!" : "Import Failed"}
          </h3>
          <p className={`text-sm mb-3 ${result.success ? "text-green-800" : "text-red-800"}`}>
            {result.message}
          </p>

          {result.imported > 0 && (
            <p className="text-sm text-green-800 font-medium">
              ✓ {result.imported} players imported successfully
            </p>
          )}

          {result.errors && result.errors.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-red-900 mb-2">Errors:</p>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {result.errors.map((err, idx) => (
                  <p key={idx} className="text-xs text-red-700">
                    Row {err.row}: {err.error}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Format Guide */}
      <div className="card bg-slate-50">
        <h3 className="font-semibold mb-3">Excel Format Guide</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-200">
              <tr>
                <th className="p-2 text-left">Column</th>
                <th className="p-2 text-left">Required</th>
                <th className="p-2 text-left">Example</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-2 font-medium">Name</td>
                <td className="p-2">Yes</td>
                <td className="p-2">John Doe</td>
              </tr>
              <tr className="border-t">
                <td className="p-2 font-medium">Role</td>
                <td className="p-2">No</td>
                <td className="p-2">Batsman / Bowler / All-rounder</td>
              </tr>
              <tr className="border-t">
                <td className="p-2 font-medium">Campus</td>
                <td className="p-2">No</td>
                <td className="p-2">Campus A</td>
              </tr>
              <tr className="border-t">
                <td className="p-2 font-medium">Team</td>
                <td className="p-2">No</td>
                <td className="p-2">Team Eagles (must match existing team)</td>
              </tr>
              <tr className="border-t">
                <td className="p-2 font-medium">ImageUrl</td>
                <td className="p-2">No</td>
                <td className="p-2">https://example.com/photo.jpg</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Teams Import Component
function TeamsImport({ onUpload, onDownloadTemplate, uploading, result }) {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">How to Import Teams</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
          <li>Download the Excel template</li>
          <li>Fill in team details (Name, ShortName, Owner, Logo)</li>
          <li>Team names must be unique</li>
          <li>Save the file and upload it below</li>
        </ol>
      </div>

      {/* Template Download */}
      <div className="card">
        <h3 className="font-semibold mb-3">Step 1: Download Template</h3>
        <button
          onClick={onDownloadTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Team Template
        </button>
      </div>

      {/* File Upload */}
      <div className="card">
        <h3 className="font-semibold mb-3">Step 2: Upload Filled Template</h3>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="team-file-upload"
              disabled={uploading}
            />
            <label
              htmlFor="team-file-upload"
              className="cursor-pointer"
            >
              <svg className="w-12 h-12 text-slate-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-slate-600 font-medium mb-1">
                {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
              </p>
              <p className="text-sm text-slate-500">Excel files only (.xlsx, .xls)</p>
            </label>
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-red-600 hover:text-red-700"
                disabled={uploading}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading..." : "Import Teams"}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className={`card ${result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          <h3 className={`font-semibold mb-3 ${result.success ? "text-green-900" : "text-red-900"}`}>
            {result.success ? "Import Successful!" : "Import Failed"}
          </h3>
          <p className={`text-sm mb-3 ${result.success ? "text-green-800" : "text-red-800"}`}>
            {result.message}
          </p>

          {result.imported > 0 && (
            <p className="text-sm text-green-800 font-medium">
              ✓ {result.imported} teams imported successfully
            </p>
          )}

          {result.errors && result.errors.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-red-900 mb-2">Errors:</p>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {result.errors.map((err, idx) => (
                  <p key={idx} className="text-xs text-red-700">
                    Row {err.row}: {err.error}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Format Guide */}
      <div className="card bg-slate-50">
        <h3 className="font-semibold mb-3">Excel Format Guide</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-200">
              <tr>
                <th className="p-2 text-left">Column</th>
                <th className="p-2 text-left">Required</th>
                <th className="p-2 text-left">Example</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-2 font-medium">Name</td>
                <td className="p-2">Yes</td>
                <td className="p-2">Team Eagles</td>
              </tr>
              <tr className="border-t">
                <td className="p-2 font-medium">ShortName</td>
                <td className="p-2">No</td>
                <td className="p-2">EAG</td>
              </tr>
              <tr className="border-t">
                <td className="p-2 font-medium">Owner</td>
                <td className="p-2">No</td>
                <td className="p-2">John Doe</td>
              </tr>
              <tr className="border-t">
                <td className="p-2 font-medium">Logo</td>
                <td className="p-2">No</td>
                <td className="p-2">https://example.com/logo.png</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}