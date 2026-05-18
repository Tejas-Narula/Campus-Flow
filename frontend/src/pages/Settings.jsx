import React, { useContext } from 'react';
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';

function Settings() {
  const { institutions, activeInstitution, switchInstitution, fetchInstitutions } = useContext(AuthContext);
  const navigate = useNavigate();

  const activeInst = institutions.find(i => i._id === activeInstitution);

  async function handleDeletion() {
    if (!activeInstitution) return;
    if (!window.confirm(`Are you sure you want to delete "${activeInst?.name || 'this institution'}"? This will remove all associated data.`)) return;

    try {
      await axios.delete(`/api/institutions/${activeInstitution}`);
      alert('Institution deleted successfully');

      // Refresh the list of institutions
      const updatedInstitutions = await fetchInstitutions();

      if (updatedInstitutions.length > 0) {
        // Switch to the first available institution
        switchInstitution(updatedInstitutions[0]._id);
      } else {
        // No institutions left
        localStorage.removeItem('activeInstitution');
        // Redirect to dashboard

      }
      navigate('/');
      window.location.reload();
    } catch (err) {
      console.error('Error deleting institution:', err);
      alert('Failed to delete institution: ' + (err.response?.data?.message || err.message));
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Settings</h1>
        <p className="text-gray-500 mb-8">Manage your account and institution preferences.</p>

        <div className="border-t border-gray-100 pt-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-1">Danger Zone</h2>
              <p className="text-gray-600">
                Permanently delete the current institution: <span className="font-semibold text-gray-900">{activeInst?.name || 'None Selected'}</span>
              </p>
            </div>

            <button
              disabled={!activeInstitution}
              className={`px-6 py-3 rounded-xl font-medium transition-all border ${activeInstitution
                  ? "bg-red-50 hover:bg-red-100 text-red-600 border-red-100 cursor-pointer"
                  : "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed"
                }`}
              onClick={handleDeletion}
            >
              Delete Institution
            </button>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Deleting an institution will permanently remove all associated students, tests, and historical data. This action cannot be reversed.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Settings;