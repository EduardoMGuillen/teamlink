import React, { createContext, useState, useContext } from 'react';

const AppStateContext = createContext();

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
};

export const AppStateProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState({
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'employee',
    department: 'Operations',
  });

  const [notifications, setNotifications] = useState([]);

  return (
    <AppStateContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        notifications,
        setNotifications,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

