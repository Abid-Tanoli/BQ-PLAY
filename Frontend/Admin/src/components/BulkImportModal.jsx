import React, { useState } from "react";
import * as XLSX from "xlsx";
import api from "../services/api";

export default function BulkImportModal({ type, onClose, onSuccess }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const jsonData = XLSX.utils.sheet_to_json(ws);
      setData(jsonData);
    };

    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    setLoading(true);
    try {
      const endpoint = type === "players" ? "/bulk-import/players" : "/bulk-import/teams";
      const payload = type === "players" ? { players: data } : { teams: data };
      
      const res = await api.post(endpoint, payload);
      alert(res.data.message);
      onSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Import failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const res = await api.get(`/bulk-import/template/${type}`);
      const ws = XLSX.utils.json_to_sheet(res.data.template);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template");
      XLSX.writeFile(wb, `${type}_template.xlsx`);
    } catch (err) {
      alert("Failed to download template");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Bulk Import {type}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <button
              onClick={downloadTemplate}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg"
            >
              Download Template
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Upload Excel File
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          {data.length > 0 && (
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm text-slate-600">
                {data.length} {type} ready to import
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={loading || data.length === 0}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? "Importing..." : "Import"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}