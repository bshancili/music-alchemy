import { Grid, GridItem, Button, Box } from "@chakra-ui/react";
import React, { useEffect } from "react";
import MusicListItem from "./MusicListItem";

const ProfileMusicList = ({ tracks }) => {
  return (
    <Box bg="#1D2123" padding="10px 96px">
      <Button
        bg="#FACD66"
        color="#1D2123"
        mb={4}
        borderRadius="27px"
        width="90px"
      >
        Collection
      </Button>
      <Grid templateColumns="repeat(5, 1fr)" gap={4}>
        {tracks.map((track) => (
          <GridItem key={track.id}>
            <MusicListItem track={track} />
          </GridItem>
        ))}
      </Grid>
    </Box>
  );
};

export default ProfileMusicList;
