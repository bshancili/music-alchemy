import React, { useState } from "react";
import {
  FormControl,
  FormLabel,
  Input,
  VStack,
  InputRightElement,
  Button,
  InputGroup,
  useToast,
} from "@chakra-ui/react";
import useAuthStore from "../stores/authStore";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
const SignUp = () => {
  const { signup } = useAuthStore();
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    checkPassword: "",
  });

  const navigate = useNavigate();
  const toast = useToast();

  const handleClick = () => setShow(!show);

  const handleInputChange = (e, inputName) => {
    setFormData({ ...formData, [inputName]: e.target.value });
  };

  const passwordCheck = (password) => {
    // returns true or false
    if (password.lenght < 8) {
      return false;
    }
  };

  const handleSignUp = async () => {
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.checkPassword
    ) {
      toast({
        title: "Please fill required fields.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    if (formData.password !== formData.checkPassword) {
      toast({
        title: "Passwords do not match",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    if (!passwordCheck(formData.password)) {
      // throw toast and return
      return;
    }
    const userData = {
      email: formData.email,
      username: formData.username,
    };

    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      console.log(response);
      const userID = response.user.uid;
      const token = response._tokenResponse.idToken;

      signup(userData, userID, token);
      navigate("/home");
    } catch (error) {
      toast({
        title: error.message,
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
        <FormLabel>Username</FormLabel>
        <Input
          _placeholder={{ opacity: 0.8, color: "black" }}
          focusBorderColor="purple"
          backgroundColor="purple.100"
          placeholder="Enter your name"
          onChange={(e) => handleInputChange(e, "username")}
        />
      </FormControl>
      <FormControl id="email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          _placeholder={{ opacity: 0.8, color: "black" }}
          focusBorderColor="lime."
          bg="purple.100"
          placeholder="Enter your email"
          onChange={(e) => handleInputChange(e, "email")}
        />
      </FormControl>
      <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            _placeholder={{ opacity: 0.8, color: "black" }}
            focusBorderColor="lime."
            bg="purple.100"
            placeholder="Enter your password"
            type={show ? "text" : "password"}
            onChange={(e) => handleInputChange(e, "password")}
          />
          <InputRightElement width="4.5rem">
            <Button
              h="1.75rem"
              size="sm"
              onClick={handleClick}
              colorScheme="yellow"
            >
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl id="confirm-password" isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup>
          <Input
            _placeholder={{ opacity: 0.8, color: "black" }}
            focusBorderColor="lime."
            bg="purple.100"
            placeholder="Confirm your password"
            type={show ? "text" : "password"}
            onChange={(e) => handleInputChange(e, "checkPassword")}
          />
          <InputRightElement width="4.5rem">
            <Button
              h="1.75rem"
              size="sm"
              colorScheme="yellow"
              onClick={handleClick}
            >
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <Button
        colorScheme="purple"
        width="60%"
        style={{ marginTop: "40px" }}
        onClick={handleSignUp}
      >
        Sign Up
      </Button>
    </VStack>
  );
};

export default SignUp;
