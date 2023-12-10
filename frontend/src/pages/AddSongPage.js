import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import React from "react";
import Header from "../components/Header";
import AddSong from "../components/AddSong";
import UploadFile from "../components/UploadFile";

const AddSongPage = () => {
  return (
    <Box height="100vh" bg="#1D2123" display="flex" flexDirection="column">
      <Header />
      <Tabs
        variant="soft-rounded"
        colorScheme="yellow"
        align="center"
        mx="auto"
      >
        <TabList>
          <Tab>Add Song</Tab>
          <Tab>Upload File</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <AddSong />
          </TabPanel>
          <TabPanel>
            <UploadFile />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default AddSongPage;
