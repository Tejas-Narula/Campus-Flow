import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Ensure axios always sends cookies
axios.defaults.withCredentials = true;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [teacher, setTeacher] = useState(null);
  const [activeInstitution, setActiveInstitution] = useState(localStorage.getItem('activeInstitution') || null);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);

  if (activeInstitution) {
    axios.defaults.headers.common['x-institution-id'] = activeInstitution;
  } else {
    delete axios.defaults.headers.common['x-institution-id'];
  }

  const fetchInstitutions = async () => {
    try {
      const instRes = await axios.get('http://localhost:5000/api/institutions');
      setInstitutions(instRes.data);
      return instRes.data;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/me');
        setTeacher(res.data);
        
        const institutionsData = await fetchInstitutions();
        
        // Set active institution if not already set, or if it doesn't match any of the fetched ones
        if (!activeInstitution && institutionsData.length > 0) {
          setActiveInstitution(institutionsData[0]._id);
          localStorage.setItem('activeInstitution', institutionsData[0]._id);
        }
      } catch (err) {
        // If 401, it means no valid cookie, just clear teacher
        setTeacher(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  const login = (userData) => {
    setTeacher(userData.teacher);
    // Default active institution handling happens via a page reload or subsequent logic usually,
    // but we can just reload the page to cleanly fetch everything since we are using cookies now
    window.location.href = '/tests';
  };

  const register = (userData) => {
    setTeacher(userData.teacher);
    if (userData.defaultInstitution) {
      setActiveInstitution(userData.defaultInstitution);
      localStorage.setItem('activeInstitution', userData.defaultInstitution);
    }
    window.location.href = '/tests';
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout');
    } catch (err) {
      console.error('Logout failed', err);
    }
    setTeacher(null);
    setActiveInstitution(null);
    setInstitutions([]);
    localStorage.removeItem('activeInstitution');
    window.location.href = '/login';
  };

  const switchInstitution = (institutionId) => {
    setActiveInstitution(institutionId);
    localStorage.setItem('activeInstitution', institutionId);
    // Reload page to refetch everything is a simple way to ensure context changes everywhere
    window.location.reload(); 
  };

  return (
    <AuthContext.Provider value={{ teacher, activeInstitution, institutions, loading, login, register, logout, switchInstitution, fetchInstitutions }}>
      {children}
    </AuthContext.Provider>
  );
};
