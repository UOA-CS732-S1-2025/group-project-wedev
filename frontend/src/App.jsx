import React from 'react'
import { Box, VStack, } from "@chakra-ui/react"
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/Homepage'
import BookingPage from './pages/Bookingpage'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import UserProfilePage from './pages/UserProfilePage'

import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import OrderManagement from './pages/admin/OrderManagement';
import TransactionHistory from './pages/admin/TransactionHistory';
import CustomerReports from './pages/admin/CustomerReports';

const App = () => {
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
        <Route path='/admin' element={<AdminDashboard />} />
        <Route path='/admin/users' element={<UserManagement />} />
        <Route path='/admin/orders' element={<OrderManagement />} />
        <Route path='/admin/transactions' element={<TransactionHistory />} />
        <Route path='/admin/reports' element={<CustomerReports />} />
      </Routes>
    </Box>
    
  )
}

export default App