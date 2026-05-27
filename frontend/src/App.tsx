import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './app/home/page'
import CoursesPage from './app/courses/page'
import LoginPage from './app/login/page'
import RegisterPage from './app/register/page'

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </>
  )
}

export default App
