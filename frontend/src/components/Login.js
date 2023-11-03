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
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

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
      const auth = getAuth();
      const response = await signInWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );
      const uid = response.user.uid;
      const token = response._tokenResponse.idToken;
      login(userData, uid, token);
      navigate("/aa");
      // TODO: edit /aa with actual landing / home page dont forget to update index.js as well
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
        <FormLabel>Email</FormLabel>
        <Input
          type="text"
          border
          value={formData.email}
          onChange={(e) => handleInputChange(e, "email")}
          placeholder="Email"
          colorScheme="blue"
          bg="purple.100"
        />
      </FormControl>

      <FormControl isRequired mt="20px">
        <FormLabel>Password</FormLabel>
        <Input
          type="password"
          value={formData.password}
          onChange={(e) => handleInputChange(e, "password")}
          placeholder="Password"
          bg="purple.100"
        />
      </FormControl>
      <Button
        mb="30"
        width="80%"
        colorScheme="purple"
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
