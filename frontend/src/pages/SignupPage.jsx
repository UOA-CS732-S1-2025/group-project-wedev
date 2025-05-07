import React, { useState } from 'react';
import { Box, Input, Button, VStack, Heading, Text, Image, Field, defineStyle } from '@chakra-ui/react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from "../store/authStore";
import toast, { Toaster } from 'react-hot-toast';







const floatingStyles = defineStyle({
      pos: "absolute",
      bg: "bg",
      px: "0.5",
      top: "-3",
      insetStart: "2",
      fontWeight: "normal",
      pointerEvents: "none",
      transition: "position",
      _peerPlaceholderShown: {
        color: "fg.muted",
        top: "2.5",
        insetStart: "3",
      },
      _peerFocusVisible: {
        color: "fg",
        top: "-3",
        insetStart: "2",
      },
    })

const SignupPage = () => {
  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ comtent: ''});
  const { register } = useAuthStore();
  const navigate = useNavigate();
  const notify = () => toast('Please check your email to verify.', {
    duration: 4000,
    icon: '📧',
  });
  
  const handleSignup = async (e) => {
    e.preventDefault();
    const newErrors = { comtent: ''};
    setErrors(newErrors); //reset
    if (!firstname) {
      newErrors.comtent = 'Please enter your first name.';
      setErrors(newErrors);
      return;
    } 
    if (!lastname) {
      newErrors.comtent = 'Please enter your last name.';
      setErrors(newErrors);
      return;
    }
    if (!email) {
      newErrors.comtent = 'Please enter your email.';
      setErrors(newErrors);
      return;
    } 
    if (!password) {
      newErrors.comtent = 'Please enter your password.';
      setErrors(newErrors);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.comtent = 'Invalid email format';
      setErrors(newErrors);
      return;
    }
    if (password.length <= 8) {
      newErrors.comtent = 'Password must be 8+ characters';
      setErrors(newErrors);
      return;
    }
    if (!/[A-Z]/.test(password)) {
      newErrors.comtent = 'Password must include uppercase';
      setErrors(newErrors);
      return;
    }
    if (!/[a-z]/.test(password)) {
      newErrors.comtent = 'Password must include lowercase';
      setErrors(newErrors);
      return;
    }
    if (!/[0-9]/.test(password)) {
      newErrors.comtent = 'Password must include number';
      setErrors(newErrors);
      return;
    }
  
    
  
    if (newErrors.comtent) {
      newErrors.comtent = 'Some Wrong? Contact Servise Team!';
      setErrors(newErrors);
      return;
    }

    const result = await register({
      firstName: firstname,
      lastName: lastname,
      email,
      password,
    });

    if (result.success) {
      notify();
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } else {
      setErrors({ comtent: result.message });
    }
  };
  return (

    
    <Box
      position="relative"
      minH="90vh"
      bgGradient="linear(to-br, green.100, green.50)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
      overflow="hidden"
    >
      {/* Decorative SVG Background */}
      <Box position="absolute" top="-80px" left="-100px" zIndex={0} opacity={0.15}>
        <svg width="500" height="500" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="#68D391" d="M50.4,-61.2C65.5,-49.7,77.7,-32.4,77.6,-16.1C77.6,0.2,65.3,15.7,54.4,31.6C43.4,47.5,33.8,63.8,20.2,66.2C6.5,68.5,-11.2,56.9,-27.2,46.1C-43.3,35.2,-57.8,25.1,-66.7,9.5C-75.5,-6.1,-78.6,-28.1,-68.3,-42.6C-58,-57.1,-34.2,-64,-12.4,-61.6C9.4,-59.2,18.8,-47.7,50.4,-61.2Z" transform="translate(100 100)" />
        </svg>
      </Box>

      {/* Signup Card */}
      <Box
        zIndex={1}
        w="100%"
        maxW="400px"
        p={8}
        bg="white"
        borderRadius="2xl"
        boxShadow="xl"
      >
        {/* Logo */}
        <Box textAlign="center" mb={4}>
          <Image
            src="https://cdn-icons-png.flaticon.com/512/809/809957.png"
            alt="Urban Ease Logo"
            boxSize="60px"
            mx="auto"
            mb={2}
          />
          <Heading size="md" color="green.600">Urban Ease</Heading>
        </Box>

        {/* Signup Form */}
        <form onSubmit={handleSignup}>
        <Toaster />
          <VStack spacing={4}>
          <Field.Root w="100%" mb={3}>
            <Input 
            className="peer" 
            placeholder="" 
            type="text"
            value={firstname}
            onChange={(e) => {
              const lettersOnly = e.target.value.replace(/[^a-zA-Z]/g, '');
              setFirstName(lettersOnly);
            }}
            />
            <Field.Label css={floatingStyles}>First Name</Field.Label>
            
          </Field.Root>
          
          
          <Field.Root w="100%" mb={3}>
            <Input 
            className="peer" 
            placeholder="" 
            type="text"
            value={lastname}
            onChange={(e) => {
              const lettersOnly = e.target.value.replace(/[^a-zA-Z]/g, '');
              setLastName(lettersOnly);
            }}
            />
            <Field.Label css={floatingStyles}>Last Name</Field.Label>
            
          </Field.Root>
            <Field.Root w="100%" mb={3}>
            <Input 
            className="peer" 
            placeholder="" 
            type="text"//Don't use email, HTML5 features will affect the display
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />
            <Field.Label css={floatingStyles}>Email</Field.Label>
            
          </Field.Root>
          
          <Field.Root w="100%" mb={3}>
            <Input 
            className="peer" 
            placeholder="" 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            />
            <Field.Label css={floatingStyles}>Password</Field.Label>
            
          </Field.Root>
          <Field.Root w="100%" mb={1} visibility={errors.comtent ? "visible" : "hidden"}>
            <Text mt={1} fontSize="sm" color="red.500">
              {errors.comtent || "space"} 
            </Text>
          </Field.Root>

            <Button colorScheme="green" type="submit" width="100%">
              Signup
            </Button>
            
            <Text fontSize="sm" textAlign="center">
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#2F855A', fontWeight: 'bold' }}>
                Login
              </Link>
            </Text>
          </VStack>
        </form>
        
      </Box>
    </Box>
    
  );
};

export default SignupPage;
