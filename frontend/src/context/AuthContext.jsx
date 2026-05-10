import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [teacher, setTeacher] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [activeInstitution, setActiveInstitution] = useState(localStorage.getItem('activeInstitution') || null);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Set default auth header for axios
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

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
      if (token) {
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
          console.error(err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchTeacherData();
  }, [token]);

  const login = (userData) => {
    setToken(userData.token);
    setTeacher(userData);
    localStorage.setItem('token', userData.token);
    
    // Default active institution handling happens in useEffect on token change
  };

  const register = (userData) => {
    setToken(userData.token);
    setTeacher(userData);
    localStorage.setItem('token', userData.token);
    if (userData.defaultInstitution) {
      setActiveInstitution(userData.defaultInstitution);
      localStorage.setItem('activeInstitution', userData.defaultInstitution);
    }
  };

  const logout = () => {
    setToken(null);
    setTeacher(null);
    setActiveInstitution(null);
    setInstitutions([]);
    localStorage.removeItem('token');
    localStorage.removeItem('activeInstitution');
  };

  const switchInstitution = (institutionId) => {
    setActiveInstitution(institutionId);
    localStorage.setItem('activeInstitution', institutionId);
    // Reload page to refetch everything is a simple way to ensure context changes everywhere
    window.location.reload(); 
  };

  return (
    <AuthContext.Provider value={{ teacher, token, activeInstitution, institutions, loading, login, register, logout, switchInstitution, fetchInstitutions }}>
      {children}
    </AuthContext.Provider>
  );
};
