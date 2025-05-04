import React from 'react'
import { Box, VStack, } from "@chakra-ui/react"
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/Homepage'
import BookingPage from './pages/Bookingpage'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
const App = () => {
  return (
    
    <Box minH="100vh" >
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/signup' element={<SignupPage />} />

      </Routes>
    </Box>
    
  )
}

export default App