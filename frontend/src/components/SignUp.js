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
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
const SignUp = () => {
  const { signup } = useAuthStore();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    checkPassword: "",
  });
  const [pic, setPic] = useState();

  const navigate = useNavigate();
  const toast = useToast();

  const postDetails = (pic) => {
    setLoading(true);
    if (pic === undefined) {
      toast({
        title: "Please select an image.",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    if (pic.type === "image/png" || pic.type === "image/jpeg") {
      const data = new FormData();
      data.append("file", pic);
      data.append("upload_preset", "music_alchemy");
      data.append("cloud_name", "ddjyxzbjg");
      fetch("https://api.cloudinary.com/v1_1/ddjyxzbjg/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString());
          console.log(data.url.toString());
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
        });
    } else {
      toast({
        title: "Please select png or jpeg",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  const handleClick = () => setShow(!show);

  const handleInputChange = (e, inputName) => {
    setFormData({ ...formData, [inputName]: e.target.value });
  };

  const passwordCheck = (password) => {
    // Check if the password meets the criteria
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&=+#.,]).{8,}$/;

    if (!regex.test(password)) {
      toast({
        title:
          "Password must be at least 8 characters long, with at least one lowercase letter, one uppercase letter, and one special character (@$!%*?&=+#.,)",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return false;
    }

    return true;
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
      // Password check failed, return without signing up
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
      const userID = response.user.uid.toString();
      const token = response._tokenResponse.idToken;
      const userDocData = {
        username: formData.username,
        profile_picture_url:
          pic ||
          "https://static.vecteezy.com/system/resources/previews/005/129/844/non_2x/profile-user-icon-isolated-on-white-background-eps10-free-vector.jpg", // Set to the URL of the picture or an empty string
        liked_song_list: [],
        friends_list: [],
        comments: [],
        uid: userID,
      };
      const userDocRef = doc(db, "Users", response.user.uid);
      await setDoc(userDocRef, userDocData);

      signup(userData, userID, token);
      localStorage.setItem("userID", userID);

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
        <FormLabel color="white">Username</FormLabel>
        <Input
          border="2px"
          textColor="white"
          focusBorderColor="yellow.400"
          _placeholder={{ color: "whiteAlpha.700" }}
          placeholder="Enter your name"
          onChange={(e) => handleInputChange(e, "username")}
        />
      </FormControl>
      <FormControl id="email" isRequired>
        <FormLabel color="white">Email</FormLabel>
        <Input
          border="2px"
          textColor="white"
          focusBorderColor="yellow.400"
          _placeholder={{ color: "whiteAlpha.700" }}
          placeholder="Enter your email"
          onChange={(e) => handleInputChange(e, "email")}
        />
      </FormControl>
      <FormControl id="password" isRequired>
        <FormLabel color="white">Password</FormLabel>
        <InputGroup>
          <Input
            border="2px"
            textColor="white"
            focusBorderColor="yellow.400"
            _placeholder={{ color: "whiteAlpha.700" }}
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
        <FormLabel color="white">Confirm Password</FormLabel>
        <InputGroup>
          <Input
            border="2px"
            textColor="white"
            focusBorderColor="yellow.400"
            _placeholder={{ color: "whiteAlpha.700" }}
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

      <FormControl id="pic">
        <FormLabel color="white">Upload your Picture</FormLabel>
        <InputGroup>
          <Input
            border="2px"
            textColor="white"
            focusBorderColor="yellow.400"
            _placeholder={{ color: "whiteAlpha.700" }}
            p={1.5}
            type="file"
            accept="image/*"
            onChange={(e) => {
              postDetails(e.target.files[0]);
            }}
          />
        </InputGroup>
      </FormControl>

      <Button
        colorScheme="yellow"
        width="60%"
        style={{ marginTop: "40px" }}
        onClick={handleSignUp}
        isLoading={loading}
      >
        Sign Up
      </Button>
    </VStack>
  );
};

export default SignUp;
