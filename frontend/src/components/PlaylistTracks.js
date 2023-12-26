import React, { useState } from "react";
import MusicListItem from "./MusicListItem";
import { Grid, GridItem } from "@chakra-ui/react";
const PlaylistTracks = ({ playlist }) => {
  return (
    <div>
      <Grid
        templateColumns="repeat(5, 1fr)"
        gap={4}
        padding="10px 100px"
        bg="#1D2123"
      >
        {playlist.map((track) => (
          <GridItem key={track.id}>
            <MusicListItem track={track} />
          </GridItem>
        ))}
      </Grid>
    </div>
  );
};

export default PlaylistTracks;
