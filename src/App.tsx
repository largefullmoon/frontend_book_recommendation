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
          <div className="container mx-auto flex items-center">
            <img src={Logo} alt="JustBookify Logo" className="h-8 w-8 brand-blue-text mr-2" />
            <h1 className="text-xl font-bold brand-blue-text">JustBookify</h1>
          </div>
        </header>

        <main className="container mx-auto p-4 flex-grow">
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
              path="/admin/*"
              element={
                <AdminLayout>
                  <Routes>
                    <Route path="books" element={<BookList />} />
                    <Route path="recommendations" element={<RecommendationManager />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="*" element={<Navigate to="/admin/books" replace />} />
                  </Routes>
                </AdminLayout>
              }
            />
          </Routes>
        </main>

        <footer className="p-4 brand-green-bg text-white text-center mt-8">
          <div className="container mx-auto">
            <p className="text-sm">© {new Date().getFullYear()} JustBookify. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;