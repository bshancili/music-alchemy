import { Grid, GridItem, Button, Box } from "@chakra-ui/react";
import React from "react";
import MusicListItem from "./MusicListItem";

const ProfileMusicList = () => {
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
    <Box bg="#1D2123" padding="10px 96px">
      <Button>Collection</Button>
      <Grid templateColumns="repeat(5, 1fr)" gap={4}>
        {tracks.map((track) => (
          <GridItem key={track.spotify_track_id}>
            <MusicListItem track={track} />
          </GridItem>
        ))}
      </Grid>
    </Box>
  );
};

export default ProfileMusicList;
