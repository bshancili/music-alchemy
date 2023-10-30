import { Box, FormControl, Input, FormLabel, Button } from "@chakra-ui/react";
import { useState } from "react";
import useAuthStore from "../stores/authStore";

const Login = () => {
  const { login } = useAuthStore();

  const [formData, setFormData] = useState({ username: "", password: "" });

  const handleUsernameChange = (e) =>
    setFormData({ ...formData, username: e.target.value });
  const handlePasswordChange = (e) =>
    setFormData({ ...formData, password: e.target.value });

  const handleLogin = () => {
    const userData = formData;
    login(userData);
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="50vh"
    >
      <Box
        maxW="850px"
        p="20px"
        border="1px solid #e2e8f0"
        borderRadius=" 0 12px"
        boxShadow="md"
        display="flex"
        flexDirection="column"
        alignItems="center"
        borderColor="#462445"
      >
        <FormControl isRequired>
          <FormLabel>Username</FormLabel>
          <Input
            minW="300px"
            type="text"
            value={formData.username}
            onChange={handleUsernameChange}
          />
        </FormControl>

        <FormControl isRequired mt="20px">
          <FormLabel>Password</FormLabel>
          <Input
            minW="300px"
            type="password"
            value={formData.password}
            onChange={handlePasswordChange}
          />
        </FormControl>
        <Button
          mt="30"
          border="none"
          colorScheme="green"
          variant="solid"
          onClick={handleLogin}
          style={{ marginTop: "40px" }}
        >
          Login
        </Button>
      </Box>
    </Box>
  );
};

export default Login;
