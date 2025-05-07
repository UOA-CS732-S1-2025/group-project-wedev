import React, {useEffect} from 'react'
import { Box  } from "@chakra-ui/react"
import { Routes, Route ,useNavigate } from 'react-router-dom'
import HomePage from './pages/Homepage'
import BookingPage from './pages/Bookingpage'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import UserProfilePage from './pages/UserProfilePage'
const App = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const syncLogout = (e) => {
      if (e.key === "token" && e.newValue === null) {
        navigate("/login");
      }
    };
    window.addEventListener("storage", syncLogout);
    return () => window.removeEventListener("storage", syncLogout);
  }, [navigate]);


  return (

    <Box minH="100vh" >
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/signup' element={<SignupPage />} />
        <Route path='/inbox' element={<UserProfilePage />} />
        <Route path='/profile' element={<UserProfilePage defaultTab="profile" />} />
      </Routes>
    </Box>

  )
}

export default App