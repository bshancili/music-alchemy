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

const SignUp = () => {
  const [show, setShow] = useState(false);

  const handleClick = () => setShow(!show);

  return (
    <VStack spacing="5px">
      <FormControl id="first-name" isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          _placeholder={{ opacity: 0.8, color: "black" }}
          borderColor="white"
          focusBorderColor="white"
          placeholder="Enter your name"
        />
      </FormControl>
      <FormControl id="email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          _placeholder={{ opacity: 0.8, color: "black" }}
          focusBorderColor="lime."
          placeholder="Enter your email"
        />
      </FormControl>
      <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            _placeholder={{ opacity: 0.8, color: "black" }}
            focusBorderColor="lime."
            placeholder="Enter your password"
            type={show ? "text" : "password"}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
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
            placeholder="Confirm your password"
            type={show ? "text" : "password"}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <Button colorScheme="green" width="100%" style={{ marginTop: 15 }}>
        Sign Up
      </Button>
    </VStack>
  );
};

export default SignUp;
