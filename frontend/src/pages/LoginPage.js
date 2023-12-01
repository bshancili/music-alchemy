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
  Spacer,
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
      <Flex
        as="header"
        width="90%"
        justifyContent="center"
        bg="yellow.400"
        color="purple.700"
        borderRadius="15px 0"
        mt={2}
        p={5}
      >
        <Text
          display="flex"
          flexDirection={"column"}
          alignItems="center"
          fontSize="2xl"
          fontWeight="bold"
        >
          Welcome to Music Alchemy
        </Text>
      </Flex>

      <Box
        m="40px 0"
        p={5}
        borderRadius="15px 0 15px 15px"
        borderWidth="3px"
        w="40%"
        borderColor="purple.100"
        bgColor="#FFF"
      >
        <Tabs align="center" variant="soft-rounded" colorScheme="yellow">
          <TabList mb="1em">
            <Tab width="50%">Login</Tab>
            <Tab width="50%">SignUp</Tab>
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
