import React from 'react'
import { Box, VStack, } from "@chakra-ui/react"
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/Homepage'
import Bookingpage from './pages/Bookingpage'
import Navbar from './components/navbar'
import ProfilePage from "./pages/ProfilePage";

const App = () => {
  return (
    
    <Box minH="100vh" >
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/booking" element={<Bookingpage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Box>
    
  )
}

export default App