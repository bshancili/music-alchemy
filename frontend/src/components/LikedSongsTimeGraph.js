import React, { useEffect, useState } from "react";
import {
  fetchAverageRatingByTime,
  fetchLikedSongTimestamps,
  fetchCreatedSongData,
} from "../api/api";
import {
  Box,
  Text,
  UnorderedList,
  ListItem,
  Button,
  HStack,
  VStack,
} from "@chakra-ui/react";
import Chart from "./Chart";
import html2canvas from "html2canvas";

const LikedSongsTimeGraph = () => {
  const [likedSongs, setLikedSongs] = useState([]);
  const [ratedSongs, setRatedSongs] = useState([]);
  const [createdSongs, setCreatedSongs] = useState([]);

  const [pic, setPic] = useState();
  const tweetText = "Check out my awesome chart!";
  const tweetUrl =
    "https://twitter.com/intent/tweet?url=" +
    encodeURIComponent(window.location.href) +
    "&text=" +
    encodeURIComponent(tweetText);

  const userID = localStorage.getItem("userID");

  const handleShareOnTwitter = async (id) => {
    const image = document.getElementById(id);
    const canvas = await html2canvas(image);

    // Convert canvas to data URL (JPEG format)
    const imageDataUrl = canvas.toDataURL("image/jpeg");

    // Create a Blob from the data URL
    const blob = await fetch(imageDataUrl).then((res) => res.blob());

    // Create a FormData object and append the Blob
    const data = new FormData();
    data.append("file", blob);
    data.append("upload_preset", "music_alchemy");
    data.append("cloud_name", "ddjyxzbjg");

    // Upload image to Cloudinary
    fetch("https://api.cloudinary.com/v1_1/ddjyxzbjg/image/upload", {
      method: "post",
      body: data,
    })
      .then((res) => res.json())
      .then((uploadData) => {
        const imageUrl = uploadData.url.toString();
        setPic(imageUrl);
        console.log(imageUrl);

        // Share on Twitter
        const tweetText = "Check out my awesome chart!";
        const tweetUrl =
          "https://twitter.com/intent/tweet?url=" +
          encodeURIComponent(imageUrl) +
          "&text=" +
          encodeURIComponent(tweetText);

        // Open a new window or tab with the Twitter share link
        window.open(tweetUrl, "_blank");
      });
  };

  const handleDownloadImage = async (id, filename) => {
    const element = document.getElementById(id),
      canvas = await html2canvas(element),
      data = canvas.toDataURL("image/jpg"),
      link = document.createElement("a");

    link.href = data;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  useEffect(() => {
    const fetchData = async () => {
      await fetchLikedSongTimestamps(userID, setLikedSongs);
      await fetchAverageRatingByTime(userID, setRatedSongs);
      await fetchCreatedSongData(userID, setCreatedSongs);
      console.log(ratedSongs);
      console.log(likedSongs);
      console.log(createdSongs);
    };

    fetchData();
  }, [userID]);

  return (
    <Box
      width="100%"
      display="flex"
      flexDirection="column"
      alignItems="center"
      overflowY="hidden"
    >
      <HStack>
        <div id="likedSongChart">
          <Chart
            chartId="likedSongsChart"
            chartTitle="Liked Songs Over Time"
            chartData={likedSongs}
            lineProps={{
              type: "monotone",
              stroke: "rgba(75, 192, 192, 1)",
              fill: "#fff",
              dataKey: "count",
            }}
          />
        </div>
        <VStack>
          <Button
            onClick={() => {
              handleDownloadImage("likedSongChart", "liked_songs_data.jpg");
            }}
          >
            Download
          </Button>
          <Button
            onClick={() => {
              handleShareOnTwitter("likedSongChart");
            }}
          >
            Share on Twitter
          </Button>
        </VStack>
      </HStack>
      <HStack>
        <div id="averageRate">
          <Chart
            chartId="ratedSongsChart"
            chartTitle="Rated Songs Over Time"
            chartData={ratedSongs}
            lineProps={{
              type: "monotone",
              stroke: "rgba(255, 235, 59, 1)",
              fill: "#fff",
              dataKey: "averageRating",
            }}
          />
        </div>
        <VStack>
          <Button
            onClick={() => {
              handleDownloadImage("averageRate", "rates.jpg");
            }}
          >
            Download
          </Button>
          <Button
            onClick={() => {
              handleShareOnTwitter("averageRate");
            }}
          >
            Share on Twitter
          </Button>
        </VStack>
      </HStack>
      <HStack>
        <div id="createdSongChart">
          <Chart
            chartId="createdSongsChart"
            chartTitle="Created Songs Over Time"
            chartData={createdSongs}
            lineProps={{
              type: "monotone",
              stroke: "rgba(145, 29, 29, 1)",
              fill: "#fff",
              dataKey: "count",
            }}
          />
        </div>
        <VStack>
          <Button
            onClick={() => {
              handleDownloadImage("createdSongChart", "created_songs_data.jpg");
            }}
          >
            Download
          </Button>
          <Button
            onClick={() => {
              handleShareOnTwitter("createdSongChart");
            }}
          >
            Share on Twitter
          </Button>
        </VStack>
      </HStack>
    </Box>
  );
};

export default LikedSongsTimeGraph;
