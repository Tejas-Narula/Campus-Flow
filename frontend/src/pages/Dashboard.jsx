import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Users, BookOpen, Calendar, ClipboardList } from 'lucide-react';

const Dashboard = () => {
  const { user, activeInstitution } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!activeInstitution) return;
      
      setLoading(true);
      try {
        if (user?.role === 'student') {
          // Fetch only tests for the student dashboard
          const testsRes = await axios.get('/api/tests');
          setTests(testsRes.data);
        } else {
          const [studentsRes, testsRes] = await Promise.all([
            axios.get('/api/students'),
            axios.get('/api/tests')
          ]);
          setStudents(studentsRes.data);
          setTests(testsRes.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [activeInstitution, user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (user?.role === 'student') {
    // Determine student's specific tests
    // A student only sees tests where their student ID is in the test's students array
    // Wait, the API returns all tests. We filter here, or we could filter in backend. Let's filter here for now.
    // user.allProfiles contains the student objects for the user across institutions
    const currentStudentProfile = user?.allProfiles?.find(p => p.institution?._id === activeInstitution || p.institution === activeInstitution);
    const myTests = currentStudentProfile ? tests.filter(t => t.students?.some(s => s.student.toString() === currentStudentProfile._id)) : [];
    
    return (
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 tracking-tight">
          {getGreeting()}, {user?.name}!
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                <ClipboardList size={24} />
              </div>
            </div>
            <h2 className="text-sm font-medium text-gray-500 mb-1">My Tests</h2>
            <p className="text-4xl font-bold text-gray-900 tracking-tight">
              {loading ? "..." : myTests.length}
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
                <Calendar size={24} />
              </div>
            </div>
            <h2 className="text-sm font-medium text-gray-500 mb-1">Ongoing Tests</h2>
            <p className="text-4xl font-bold text-gray-900 tracking-tight">
              {loading ? "..." : myTests.filter(t => t.status === 'ongoing').length}
            </p>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Tests</h2>
          {myTests.length === 0 ? (
            <p className="text-gray-500 italic">No tests found.</p>
          ) : (
            <div className="space-y-4">
              {myTests.slice(0, 5).map(test => {
                const myResult = test.students.find(s => s.student.toString() === currentStudentProfile._id);
                return (
                  <div key={test._id} className="flex justify-between items-center p-4 border border-gray-100 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{test.name}</p>
                      <p className="text-sm text-gray-500">{new Date(test.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      {test.status === 'completed' && myResult?.marksObtained != null ? (
                        <p className="text-emerald-600 font-bold">{myResult.marksObtained} / {test.totalMarks}</p>
                      ) : (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${test.status === 'completed' ? 'bg-gray-100 text-gray-800' : test.status === 'ongoing' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {test.status}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 tracking-tight">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
              <Users size={24} />
            </div>
          </div>
          <h2 className="text-sm font-medium text-gray-500 mb-1">Total Students</h2>
          <p className="text-4xl font-bold text-gray-900 tracking-tight">
            {loading ? "..." : students.length}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
              <BookOpen size={24} />
            </div>
          </div>
          <h2 className="text-sm font-medium text-gray-500 mb-1">Enrolled Students</h2>
          <p className="text-4xl font-bold text-gray-900 tracking-tight">
            {loading ? "..." : students.filter(s => s.status === 'enrolled').length}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-rose-50 p-3 rounded-xl text-rose-600">
              <Calendar size={24} />
            </div>
          </div>
          <h2 className="text-sm font-medium text-gray-500 mb-1">Ongoing Tests</h2>
          <p className="text-4xl font-bold text-gray-900 tracking-tight">
            {loading ? "..." : tests.filter(t => t.status === 'ongoing').length}
          </p>
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
