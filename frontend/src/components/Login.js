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

const Login = () => {
  const { login } = useAuthStore();

  const [formData, setFormData] = useState({ username: "", password: "" });
  const toast = useToast();
  const navigate = useNavigate();
  const handleInputChange = (e, inputName) => {
    setFormData({ ...formData, [inputName]: e.target.value });
  };
  const handleLogin = () => {
    if (!formData.username || !formData.password) {
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
    const userData = formData;
    console.log(userData);
    try {
      // After configuring api and sending it
      login(userData);

      // TODO: edit /aa with actual landing / home page dont forget to update index.js as well
      navigate("/aa");
    } catch (error) {}
  };

  return (
    <VStack spacing="5px">
      <FormControl isRequired>
        <FormLabel>Username</FormLabel>
        <Input
          type="text"
          border
          value={formData.username}
          onChange={(e) => handleInputChange(e, "username")}
          placeholder="Username"
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
