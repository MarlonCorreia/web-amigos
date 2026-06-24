import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './app/home/page'
import CoursesPage from './app/courses/page'
import LoginPage from './app/login/page'
import RegisterPage from './app/register/page'
import PaymentPage from './app/payment/page'
import CourseDetailsPage from './app/courseDetails/page'
import MyCoursesPage from './app/my-courses/page'

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/courseDetails/:id" element={<CourseDetailsPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/payment/:transactionID" element={<PaymentPage />} />
        <Route path="/my-courses" element={<MyCoursesPage />} />
      </Routes>
    </>
  )
}

export default App
