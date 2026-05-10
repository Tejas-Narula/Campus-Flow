import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, ArrowRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-4xl w-full text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Welcome to the <span className="text-indigo-600">Student Portal</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          The complete platform for managing students, timetables, and academic progress. 
          Please select how you would like to sign in.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl w-full">
        {/* Teacher Card */}
        <Link 
          to="/login"
          className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all group flex flex-col items-center text-center cursor-pointer"
        >
          <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <BookOpen className="text-indigo-600 w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Teacher Portal</h2>
          <p className="text-gray-500 mb-6 flex-1">
            Manage your students, schedules, institutions, and track academic progress across multiple classes.
          </p>
          <div className="flex items-center text-indigo-600 font-medium group-hover:translate-x-1 transition-transform">
            Sign in as Teacher <ArrowRight className="ml-2 w-5 h-5" />
          </div>
        </Link>

        {/* Student Card */}
        <div 
          className="bg-white/60 rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gray-50/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <span className="bg-white px-4 py-2 rounded-full font-semibold text-gray-800 shadow-sm border border-gray-100">
              Coming Soon
            </span>
          </div>
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
            <Users className="text-blue-600 w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Portal</h2>
          <p className="text-gray-500 mb-6 flex-1">
            Access your timetable, view study materials, and track your performance.
          </p>
          <div className="flex items-center text-gray-400 font-medium">
            Sign in as Student <ArrowRight className="ml-2 w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
