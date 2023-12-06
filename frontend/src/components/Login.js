import {
  FormControl,
  Input,
  FormLabel,
  Button,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import useAuthStore from "../stores/authStore";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const Login = () => {
  const { login } = useAuthStore();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const toast = useToast();
  const navigate = useNavigate();
  const handleInputChange = (e, inputName) => {
    setFormData({ ...formData, [inputName]: e.target.value });
  };
  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      toast({
        title: "Please fill required fields.",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
        colorScheme: "red",
      });
      return;
    }

    const userData = {
      email: formData.email,
      password: formData.password,
    };
    try {
      // After configuring api and sending it
      const response = await signInWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );
      const uid = response.user.uid.toString();
      const token = response._tokenResponse.idToken;
      login(userData, uid, token);
      localStorage.setItem("userID", uid);
      navigate("/home");
    } catch (error) {
      toast({
        title: "Invalid Credentials",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  return (
    <VStack spacing="5px">
      <FormControl isRequired>
        <FormLabel color="white">Email</FormLabel>
        <Input
          type="text"
          value={formData.email}
          onChange={(e) => handleInputChange(e, "email")}
          placeholder="Email"
          border="2px"
          textColor="white"
          focusBorderColor="yellow.400"
          _placeholder={{ color: "whiteAlpha.700" }}
        />
      </FormControl>

      <FormControl isRequired mt="20px">
        <FormLabel color="white">Password</FormLabel>
        <Input
          type="password"
          value={formData.password}
          border="2px"
          onChange={(e) => handleInputChange(e, "password")}
          placeholder="Password"
          textColor="white"
          focusBorderColor="yellow.400"
          _placeholder={{ color: "whiteAlpha.700" }}
        />
      </FormControl>
      <Button
        mb="30"
        width="80%"
        colorScheme="yellow"
        border="none"
        onClick={handleLogin}
        style={{
          marginTop: "40px",
        }}
      >
        Login
      </Button>
    </VStack>
  );
};

export default Login;
