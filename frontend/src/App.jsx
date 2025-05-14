import React, {useEffect} from 'react'
import { Box} from "@chakra-ui/react"
import { Toaster} from "@/components/ui/toaster"
import { Routes, Route ,useNavigate } from 'react-router-dom'
import HomePage from './pages/Homepage'
import BookingPage from './pages/Bookingpage'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import UserProfilePage from './pages/UserProfilePage'
import useAuthStore, { initAuthSync } from "./store/authStore";
import ProtectedRoute from './components/ProtectedRoute';
import ProviderDetailPage from './pages/ProviderDetailPage';
import PaymentPage from './pages/PaymentPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
} from "@chakra-ui/react"
import { APIProvider } from "@vis.gl/react-google-maps";

const config = defineConfig({
  globalCss: {
    "html, body": {
      overscrollBehaviorY: 'none',
    },
  },
})

const system = createSystem(defaultConfig, config)



const App = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const fetchUser = useAuthStore.getState().fetchCurrentUser;
    fetchUser(); // 首次加载拉取用户
    initAuthSync(fetchUser); // 跨标签页同步登录/登出
  }, []);


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
    <ChakraProvider value={system}>

      <APIProvider apiKey={"AIzaSyDoqQIS7SoRqv-mCcaid5cIxk7jdw2u_OE"} libraries={['places']} language="en">
        <Box minH="100vh" >
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/booking" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/signup' element={<SignupPage />} />
            <Route path='/inbox' element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
            <Route path='/profile' element={<ProtectedRoute><UserProfilePage defaultTab="profile" /></ProtectedRoute>} />
             <Route path='/providerDetail/:id' element={<ProtectedRoute><ProviderDetailPage /></ProtectedRoute>} />
             <Route path="/payment/:bookingId" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
             <Route path="/verify-email" element={<VerifyEmailPage />} />
          </Routes>
          <Toaster />


        </Box>
      </APIProvider>
    </ChakraProvider>
  )
}

export default App
