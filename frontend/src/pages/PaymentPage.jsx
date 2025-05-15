"use client";
import {
  Box,
  Heading,
  Button,
  Stack,
  Input,
  Field,
  Text,
  Group,
  InputGroup,
  NumberInput,
  RadioCard,
  Container,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../lib/api";
import useAuthStore from "../store/authStore";
import { RiPaypalFill, RiBankCardFill, RiMastercardLine , RiVisaLine   } from "react-icons/ri";
import { SiAmericanexpress    } from "react-icons/si";
import { toaster } from "@/components/ui/toaster";

const PaymentPage = () => {
  const { bookingId } = useParams();
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const [method, setMethod] = useState("");
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const res = await api.get(`/api/payments/booking/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPaymentInfo(res.data);
      } catch (err) {
        console.error("Failed to fetch payment info:", err);
        toaster.create({
          title: "Error",
          description: "Failed to fetch payment information",
        });
      }
    };
    fetchPayment();
  }, [bookingId, token]);

  const handleCancel = () => {
    navigate("/profile?tab=orders");
  };

  const handleSubmit = async () => {
    if (!method) {
      toaster.create({
        title: "Payment Method Required",
        description: "Please select a payment method",
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      // 1. Update the payment record
      const paymentRes = await api.get(`/api/payments/booking/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const payment = paymentRes.data;
      
      if (!payment || !payment._id) {
        throw new Error("No payment record found for this booking.");
      }
      
      // 2. Update payment status
      await api.patch(
        `/api/payments/${payment._id}`,
        {
          status: "paid",
          paidAt: new Date().toISOString(),
          method: method,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // 3. Update booking payment details
      const bookingUpdateRes = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}/payment`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentStatus: "succeeded",
          paymentMethod: method,
          paidAmount: payment.amount,
          paymentDate: new Date().toISOString(),
        }),
      });
      
      if (!bookingUpdateRes.ok) {
        throw new Error("Failed to update booking payment status");
      }
      
      toaster.create({
        title: "Payment Successful",
        description: "Your payment has been processed successfully",
      });
      
      // Redirect to profile page with orders tab selected
      navigate("/profile?tab=orders");
    } catch (err) {
      console.error("Failed to update payment:", err);
      toaster.create({
        title: "Payment Failed",
        description: err.message || "Failed to process payment",
      });
      // Still redirect to orders tab even if payment fails
      navigate("/profile?tab=orders");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
      <Container maxW="lg" py={8}>
  {/* 成功提示区域 */}
  <Box
    bg="gray.50"
    border="1px solid"
    borderColor="gray.200"
    rounded="md"
    p={5}
    mb={6}
    display="flex"
    alignItems="center"
  >
    
    <Box>
      <Text fontWeight="bold">Your order has been submitted successfully!</Text>
      <Text fontWeight="bold">Please complete the payment as soon as possible.</Text>
      <Text mt={1}>
        Total Amount: <Text as="span" color="red.500" fontSize="xl" fontWeight="bold">
          {paymentInfo ? `$${paymentInfo.amount.toFixed(2)}` : "Loading..."}
          </Text>
      </Text>
    </Box>
  </Box>

  {/* 支付方式选择区域 */}
  <Box mb={6}>
    <Text fontWeight="bold" mb={3}>Please select a payment method</Text>
    <RadioCard.Root type="single" 
    onValueChange={(v)  =>
    setMethod(typeof v === "string" ? v : v?.value)
  }>
      <Group gap="4">
      <RadioCard.Item value="credit_card">
      <RadioCard.ItemHiddenInput />
      <RadioCard.ItemControl
        w="200px"
        h="50px"
        px={3}
        justifyContent="flex-start"
      >
        <Stack direction="row" align="center" spacing={2} w="full">
          <Box as={RiBankCardFill} boxSize="5" flexShrink={0} />
          <RadioCard.ItemText
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            Credit Card
          </RadioCard.ItemText>
        </Stack>
      </RadioCard.ItemControl>
    </RadioCard.Item>
    
        <RadioCard.Item value="paypal">
      <RadioCard.ItemHiddenInput />
      <RadioCard.ItemControl
        w="200px"
        h="50px"
        px={3}
        justifyContent="flex-start"
      >
        <Stack direction="row" align="center" spacing={2} w="full">
          <Box as={RiPaypalFill} boxSize="5" flexShrink={0} />
          <RadioCard.ItemText
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            Paypal
          </RadioCard.ItemText>
        </Stack>
      </RadioCard.ItemControl>
    </RadioCard.Item>
      </Group>

      <Group gap="4">
      <RadioCard.Item value="bank_transfer">
      <RadioCard.ItemHiddenInput />
      <RadioCard.ItemControl
        w="200px"
        h="50px"
        px={3}
        justifyContent="flex-start"
      >
        <Stack direction="row" align="center" spacing={2} w="full">
          <Box as={RiBankCardFill} boxSize="5" flexShrink={0} />
          <RadioCard.ItemText
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            Bank Transfer
          </RadioCard.ItemText>
        </Stack>
      </RadioCard.ItemControl>
    </RadioCard.Item>
    
        <RadioCard.Item value="mastercard">
      <RadioCard.ItemHiddenInput />
      <RadioCard.ItemControl
        w="200px"
        h="50px"
        px={3}
        justifyContent="flex-start"
      >
        <Stack direction="row" align="center" spacing={2} w="full">
          <Box as={RiMastercardLine } boxSize="5" flexShrink={0} />
          <RadioCard.ItemText
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            Mastercard
          </RadioCard.ItemText>
        </Stack>
      </RadioCard.ItemControl>
    </RadioCard.Item>
      </Group>

      <Group gap="4">
      <RadioCard.Item value="visa">
      <RadioCard.ItemHiddenInput />
      <RadioCard.ItemControl
        w="200px"
        h="50px"
        px={3}
        justifyContent="flex-start"
      >
        <Stack direction="row" align="center" spacing={2} w="full">
          <Box as={RiVisaLine} boxSize="5" flexShrink={0} />
          <RadioCard.ItemText
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            Visa
          </RadioCard.ItemText>
        </Stack>
      </RadioCard.ItemControl>
    </RadioCard.Item>
    
        <RadioCard.Item value="american_express">
      <RadioCard.ItemHiddenInput />
      <RadioCard.ItemControl
        w="200px"
        h="50px"
        px={3}
        justifyContent="flex-start"
      >
        <Stack direction="row" align="center" spacing={2} w="full">
          <Box as={SiAmericanexpress} boxSize="5" flexShrink={0} />
          <RadioCard.ItemText
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            American Express
          </RadioCard.ItemText>
        </Stack>
      </RadioCard.ItemControl>
    </RadioCard.Item>
      </Group>
    </RadioCard.Root>
    <Box mt={6}>
  {method === "credit_card" && (
    <Stack spacing={4}>
      <Heading size="sm">Credit Card Info</Heading>
      <Input placeholder="Card Number"  />
      <Stack direction="row" spacing={4}>
        <Input placeholder="MM/YY"  />
        <Input placeholder="CVC"  />
      </Stack>
    </Stack>
  )}

  {method === "paypal" && (
    <Stack spacing={4}>
      <Heading size="sm">PayPal Account</Heading>
      <Input placeholder="PayPal Email" />
    </Stack>
  )}

  {method === "bank_transfer" && (
    <Stack spacing={4}>
      <Heading size="sm">Bank Transfer Info</Heading>
      <Input placeholder="Bank Name" />
      <Input placeholder="Reference Code" />
    </Stack>
  )}

  {method === "mastercard" && (
    <Stack spacing={4}>
      <Heading size="sm">Mastercard Info</Heading>
      <Input placeholder="Mastercard Number" />
      <Input placeholder="Expiry Date" />
      <Input placeholder="Security Code" />
    </Stack>
  )}

  {method === "visa" && (
    <Stack spacing={4}>
      <Heading size="sm">Visa Card Info</Heading>
      <Input placeholder="Visa Number" />
      <Input placeholder="Expiry Date" />
      <Input placeholder="CVV" />
    </Stack>
  )}

  {method === "american_express" && (
    <Stack spacing={4}>
      <Heading size="sm">American Express Info</Heading>
      <Input placeholder="Card Number" />
      <Input placeholder="Expiration" />
      <Input placeholder="4-digit CVC" />
    </Stack>
  )}
</Box>

  </Box>

  {/* 操作按钮区域 */}
  <Stack direction="row" spacing={4} mt={4}>
  <Button
    colorScheme="blue"
    size="lg"
    w="220px" 
    onClick={handleSubmit}
    isLoading={isProcessing}
    loadingText="Processing"
  >
    Pay Now
  </Button>
  <Button
    variant="outline"
    size="lg"
    w="220px" 
    onClick={handleCancel}
  >
    Cancel
  </Button>
</Stack>
</Container>

  );
};

export default PaymentPage;



