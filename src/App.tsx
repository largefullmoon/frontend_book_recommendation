import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QuizProvider } from './context/QuizContext';
import QuizContainer from './components/QuizContainer';
import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './components/admin/AdminLogin';
import BookList from './components/admin/BookList';
import RecommendationManager from './components/admin/RecommendationManager';
import UserManagement from './components/admin/UserManagement';
import Logo from './assets/logo.jpg';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-[#54d9ff]/10 to-[#aadb4d]/10 flex flex-col justify-between">
        <header className="p-4 bg-white shadow-sm">
          <div className="container flex items-center mx-auto">
            <img src={Logo} alt="JustBookify Logo" className="w-8 h-8 mr-2 brand-blue-text" />
            <h1 className="text-xl font-bold brand-blue-text">JustBookify</h1>
          </div>
        </header>

        <main className="container flex-grow p-4 mx-auto">
          <Routes>
            <Route
              path="/"
              element={
                <QuizProvider>
                  <QuizContainer />
                </QuizProvider>
              }
            />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/books"
              element={
                <AdminLayout>
                  <BookList />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/recommendations"
              element={
                <AdminLayout>
                  <RecommendationManager />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminLayout>
                  <UserManagement />
                </AdminLayout>
              }
            />
            <Route path="/admin/*" element={<Navigate to="/admin/books" replace />} />
          </Routes>
        </main>

        <footer className="p-4 mt-8 text-center text-white brand-green-bg">
          <div className="container mx-auto">
            <p className="text-sm">© {new Date().getFullYear()} JustBookify. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;