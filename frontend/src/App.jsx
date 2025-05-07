import React from 'react'
import { Box, VStack, } from "@chakra-ui/react"
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import BookingPage from './pages/BookingPage'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import UserProfilePage from './pages/UserProfilePage'
import ProviderDetailPage from './pages/ProviderDetailPage'

import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
} from "@chakra-ui/react"
const config = defineConfig({
  globalCss: {
    "html, body": {
      overscrollBehaviorY: 'none',
    },
  },
})

const system = createSystem(defaultConfig, config)
const App = () => {
  return (
    <ChakraProvider value={system}>
    <Box minH="100vh" >
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/signup' element={<SignupPage />} />
        <Route path='/inbox' element={<UserProfilePage />} />
        <Route path='/profile' element={<UserProfilePage defaultTab="profile" />} />
        <Route path='/providerDetail/:id' element={<ProviderDetailPage />} />
      </Routes>
    </Box>
    </ChakraProvider>
  )
}

export default App