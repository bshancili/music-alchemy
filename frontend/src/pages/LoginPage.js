import {
  Container,
  TabPanel,
  TabPanels,
  Tabs,
  Tab,
  Box,
  TabList,
  Flex,
  Text,
} from "@chakra-ui/react";
import Login from "../components/Login";
import SignUp from "../components/SignUp";

const LoginPage = () => {
  return (
    <Container
      maxW="100%"
      h="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      bg="#1D2123"
    >
      <Text
        display="flex"
        flexDirection={"column"}
        alignItems="center"
        fontSize="3xl"
        fontWeight="bold"
        color="white"
        mt={8}
      >
        Welcome to Music Alchemy
      </Text>

      <Box
        m="20px 0"
        p={5}
        borderRadius="15px 0 15px 15px"
        borderWidth="3px"
        w="40%"
        bgColor="#33373B"
      >
        <Tabs align="center" variant="soft-rounded" colorScheme="yellow">
          <TabList mb="1em">
            <Tab width="50%" color="whiteAlpha.700">
              Login
            </Tab>
            <Tab width="50%" color="whiteAlpha.700">
              SignUp
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <SignUp />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
};

export default LoginPage;
