// Import necessary dependencies
import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  Heading,
  useToast,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
// Dummy user data
const initialUserData = {
  username: "exampleUser",
  email: "user@example.com",
  password: "examplePassword",
};

const SettingsPage = () => {
  // State for user data
  const [userData, setUserData] = useState(initialUserData);

  // State for form fields
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [user, setUser] = useState();
  // Toast notification
  const toast = useToast();
  const { id } = useParams();

  const fetchUser = async () => {
    const userDocRef = doc(db, "Users", id);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      setUserData((prevUserData) => ({
        ...prevUserData,
        username: userData.username,
      }));
    } else {
      console.log("User not found");
    }
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Update local state
      if (newUsername) {
        const userDocRef = doc(db, "Users", id);
        await updateDoc(userDocRef, {
          username: newUsername,
        });
      }

      setUserData({
        username: newUsername || userData.username,
        email: newEmail || userData.email,
        password: "", // You may not want to fetch or display the password
      });

      // Display success message
      toast({
        title: "Settings Updated",
        description: "Your settings have been successfully updated.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error updating user settings:", error.message);
      // Display error message
      toast({
        title: "Error",
        description: `An error occurred: ${error.message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  useEffect(() => {
    // Fetch user data from Firebase when the component mounts
    const userr = auth.currentUser;
    setUser(userr);
    fetchUser();
    setUserData((prevUserData) => ({
      ...prevUserData,
      email: user.email || "",
      password: "", // You may not want to fetch or display the password
    }));
    console.log(user.email);
  }, [user]);

  return (
    <Box p={4}>
      <Heading mb={4}>User Settings</Heading>
      <form onSubmit={handleSubmit}>
        <FormControl mb={4}>
          <FormLabel>Username</FormLabel>
          <Input
            type="text"
            placeholder={`Current: ${userData.username}`}
            onChange={(e) => setNewUsername(e.target.value)}
          />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            placeholder={`Current: ${userData.email}`}
            onChange={(e) => setNewEmail(e.target.value)}
          />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            placeholder="New Password"
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </FormControl>
        <Button type="submit" colorScheme="teal">
          Update Settings
        </Button>
      </form>
    </Box>
  );
};

export default SettingsPage;
