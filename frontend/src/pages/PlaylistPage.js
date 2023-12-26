import React, { useMemo, useState } from "react";
import { Box } from "@chakra-ui/react";
import Header from "../components/Header";
import PlaylistHeader from "../components/PlaylistHeader";
import { useLocation } from "react-router-dom";
import PlaylistTracks from "../components/PlaylistTracks";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { fetchTrackDetails } from "../api/api";
import { useEffect } from "react";
const PlaylistPage = () => {
  const [tracks, setTracks] = useState([]);
  const [playlist, setPlaylist] = useState();
  const location = useLocation();
  const playlistID = useMemo(
    () => location.state?.playlistData || {},
    [location.state?.playlistData]
  );

  const fetchTracksFromPlaylist = async () => {
    try {
      const playlistRef = doc(db, "Playlists", playlistID.id);
      const playlistDoc = await getDoc(playlistRef);
      const songs = Object.keys(playlistDoc.data().songs);
      setPlaylist(playlistDoc.data());
      const tracksDetails = await Promise.all(
        songs.map((trackId) => fetchTrackDetails(trackId))
      );
      setTracks(tracksDetails);
      console.log(tracksDetails);
    } catch (error) {}
  };
  useEffect(() => {
    fetchTracksFromPlaylist();
    console.log(playlist);
    console.log(tracks);
  }, []);

  return (
    <Box display="flex" flexDir="column" h="100vh" bg="#1D2123">
      <Header />
      <PlaylistHeader playlist={playlistID} />
      <PlaylistTracks playlist={tracks} />
    </Box>
  );
};
export default PlaylistPage;
