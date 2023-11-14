import { Grid, GridItem, Button, Box, Text } from "@chakra-ui/react";
import React from "react";
import AlbumCardItem from "./AlbumCardItem";

const HomePageMusicList = () => {
  const tracks = [
    {
      album_images: {
        height: 640,
        url: "https://i.scdn.co/image/ab67616d0000b273904445d70d04eb24d6bb79ac",
        width: 640,
      },
      album_name: "1989 (Taylor's Version)",
      artists: ["Taylor Swift"],
      track_name: "Out Of The Woods (Taylor's Version)",
      spotify_track_id: "64LU4c1nfjz1t4VnGhagcg",
    },
    {
      album_images: {
        height: 640,
        url: "https://i.scdn.co/image/ab67616d0000b273904445d70d04eb24d6bb79ac",
        width: 640,
      },
      album_name: "1989 (Taylor's Version)",
      artists: ["Taylor Swift"],
      track_name: "Out Of The Woods (Taylor's Version)",
      spotify_track_id: "64LU4c1nfjz1t4VnGhagcg",
    },
    {
      album_images: {
        height: 640,
        url: "https://i.scdn.co/image/ab67616d0000b273904445d70d04eb24d6bb79ac",
        width: 640,
      },
      album_name: "1989 (Taylor's Version)",
      artists: ["Taylor Swift"],
      track_name: "Out Of The Woods (Taylor's Version)",
      spotify_track_id: "64LU4c1nfsjz1t4VnGhagcg",
    },
    {
      album_images: {
        height: 640,
        url: "https://i.scdn.co/image/ab67616d0000b273904445d70d04eb24d6bb79ac",
        width: 640,
      },
      album_name: "1989 (Taylor's Version)",
      artists: ["Taylor Swift"],
      track_name: "Out Of The Woods (Taylor's Version)",
      spotify_track_id: "64LU4c1nfjz1t4VnGhagcg",
    },
    {
      album_images: {
        height: 640,
        url: "https://i.scdn.co/image/ab67616d0000b273904445d70d04eb24d6bb79ac",
        width: 640,
      },
      album_name: "1989 (Taylor's Version)",
      artists: ["Taylor Swift"],
      track_name: "Out Of The Woods (Taylor's Version)",
      spotify_track_id: "64LU4c1nfjz1t4VnGhagcg",
    },
    {
      album_images: {
        height: 640,
        url: "https://i.scdn.co/image/ab67616d0000b273904445d70d04eb24d6bb79ac",
        width: 640,
      },
      album_name: "1989 (Taylor's Version)",
      artists: ["Taylor Swift"],
      track_name: "Out Of The Woods (Taylor's Version)",
      spotify_track_id: "64LU4c1nfjz1t4VnGhagcg",
    },
  ];
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
      <Grid templateColumns="repeat(6, 1fr)" gap={4}>
        {tracks.map((track) => (
          <GridItem key={track.spotify_track_id}>
            <AlbumCardItem track={track} />
          </GridItem>
        ))}
      </Grid>
    </Box>
  );
};

export default HomePageMusicList;
