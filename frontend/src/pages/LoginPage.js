import {
  Container,
  TabPanel,
  TabPanels,
  Tabs,
  Tab,
  Box,
  TabList,
} from "@chakra-ui/react";
import Login from "../components/Login";
import SignUp from "../components/SignUp";

const LoginPage = () => {
  return (
    <Container maxW="xl" centerContent>
      <Box
        d="flex"
        m="120px 0 0px 0"
        w="35%"
        borderRadius="10"
        borderWidth="3px"
        bg="#FFC154"
      >
        <Tabs align="center" variant="soft-rounded">
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
