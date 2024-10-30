import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MyGames from './pages/MyGames';
import BorrowGames from './pages/BorrowGames';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Users from './pages/Users';
import Groups from './pages/Groups';
import GroupInvite from './pages/GroupInvite';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { currentUser, loading, isAdmin } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!currentUser || !isAdmin) {
    return <Navigate to="/my-games" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
          <Navbar />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <main className="py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/my-games" element={
                  <RequireAuth>
                    <MyGames />
                  </RequireAuth>
                } />
                <Route path="/borrow" element={
                  <RequireAuth>
                    <BorrowGames />
                  </RequireAuth>
                } />
                <Route path="/users" element={
                  <RequireAdmin>
                    <Users />
                  </RequireAdmin>
                } />
                <Route path="/groups" element={
                  <RequireAuth>
                    <Groups />
                  </RequireAuth>
                } />
                <Route path="/groups/invite/:inviteId" element={<GroupInvite />} />
                <Route path="/login" element={<Login />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;