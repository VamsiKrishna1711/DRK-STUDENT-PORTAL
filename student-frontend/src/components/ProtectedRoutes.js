import { Navigate } from 'react-router-dom';

function ProtectedRoutes({ children }) {
  const isAuthenticated = localStorage.getItem('user');
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoutes;