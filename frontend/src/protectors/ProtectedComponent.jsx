import React from 'react'
import { useAuth } from '../providers/AuthProvider'
import { Navigate } from 'react-router';

const ProtectedComponent = ({children,requiredPermission,redirect,...props}) => {
  const {user} = useAuth();
  if(user.permissions.includes(requiredPermission)){
    return <>{children}</>
  }
  else if(redirect){
    return <Navigate to={"/NotFound"} replace />
  }
  return <></>
}

export default ProtectedComponent