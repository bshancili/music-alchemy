import {
  Box,
  Button,
  Grid,
  GridItem,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import MusicListItem from "./MusicListItem";

const ProfileMusicList = ({ tracks, non_rated }) => {
  return (
    <Box bg="#1D2123" padding="10px 96px">
      <Tabs colorScheme="yellow" variant="solid-rounded">
        <TabList>
          <Tab>Collection</Tab>
          <Tab>Non-Rated Songs</Tab>
        </TabList>

        <TabPanels textDecorationLine={"none"}>
          <TabPanel>
            <Grid templateColumns="repeat(5, 1fr)" gap={4}>
              {tracks.map((track) => (
                <GridItem key={track.id}>
                  <MusicListItem track={track} />
                </GridItem>
              ))}
            </Grid>
          </TabPanel>
          <TabPanel>
            <Grid templateColumns="repeat(5, 1fr)" gap={4}>
              {non_rated.map((track) => (
                <GridItem key={track.id}>
                  <MusicListItem track={track} />
                </GridItem>
              ))}
            </Grid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default ProfileMusicList;
