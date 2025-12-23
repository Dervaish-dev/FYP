import React from 'react';
import { Navigate } from 'react-router-dom';

const CaregiverProtectedRoute = ({ children }) => {
  const caregiverToken = localStorage.getItem('caregiverToken');

  if (!caregiverToken) {
    return <Navigate to="/caregiver/login" replace />;
  }

  return children;
};

export default CaregiverProtectedRoute;
