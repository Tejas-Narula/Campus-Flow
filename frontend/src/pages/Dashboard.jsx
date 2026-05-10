import React from 'react';

const Dashboard = () => {
  return (
    <div className="animate-fade-in-up">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 tracking-tight">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold text-gray-600 mb-2">Total Students</h2>
          <p className="text-4xl font-bold text-indigo-600">120</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold text-gray-600 mb-2">Active Classes</h2>
          <p className="text-4xl font-bold text-emerald-500">8</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold text-gray-600 mb-2">Upcoming Tests</h2>
          <p className="text-4xl font-bold text-rose-500">3</p>
        </div>
      </div>
      
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
        <p className="text-gray-500 italic">No recent activity to show.</p>
      </div>
    </div>
  );
};

export default Dashboard;
