import React from 'react';

const Timetable = () => {
  return (
    <div className="animate-fade-in-up">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 tracking-tight">Timetable</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-indigo-200 mb-4">
          <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Timetable feature coming soon</h2>
        <p className="text-gray-500 text-center max-w-md">
          This section will display the weekly schedule for different grades and batches.
        </p>
      </div>
    </div>
  );
};

export default Timetable;
