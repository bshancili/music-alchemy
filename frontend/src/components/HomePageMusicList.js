import { Grid, GridItem, Button, Box, Text } from "@chakra-ui/react";
import React from "react";
import AlbumCardItem from "./AlbumCardItem";
import MusicListItem from "./MusicListItem";

const HomePageMusicList = ({ allTracks }) => {
  return (
    <Box bg="#1D2123" padding="50px 96px" flexDirection={"column"}>
      <Text
        bottom="12px"
        left="3"
        fontSize="md"
        color="white"
        fontWeight="bold"
        lineHeight={1.3}
        mb={1.5}
      >
        Music
      </Text>
      <Grid templateColumns="repeat(6, 1fr)" gap={6}>
        {allTracks.map((track) => (
          <GridItem key={track.id}>
            <AlbumCardItem track={track} />
          </GridItem>
        ))}
      </Grid>
    </Box>
  );
};

export default HomePageMusicList;
