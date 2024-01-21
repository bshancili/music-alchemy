import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  Avatar,
  Box,
  Button,
  Image,
  List,
  ListItem,
  Text,
} from "@chakra-ui/react";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { fetchTrackDetails } from "../api/api";

const SingleChat = ({ id, fetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [senderURL, setSenderURL] = useState("");
  const [receiverURL, setReceiverURL] = useState("");
  const navigate = useNavigate();

  const handleNavigate = async (trackID) => {
    const trackDetails = await fetchTrackDetails(trackID);
    navigate(`/music/${trackID}`, {
      state: { trackData: trackDetails },
    });
  };
  const currentUserId = localStorage.getItem("userID");
  const filterMessagesByReceiver = (messages, id) => {
    return messages.filter(
      (message) => message.receiver === id || message.sender === id
    );
  };
  const fetchSenderPic = async (id) => {
    const userRef = doc(db, "Users", id);
    try {
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setSenderURL(data.profile_picture_url);
      } else {
        console.error(userSnap.id, "Track not found");
        return null;
      }
    } catch (error) {
      console.error("Error fetching track details:", error);
      return null;
    }
  };
  const fetchReceiverPic = async (id) => {
    const userRef = doc(db, "Users", id);
    try {
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setReceiverURL(data.profile_picture_url);
      } else {
        console.error(userSnap.id, "Track not found");
        return null;
      }
    } catch (error) {
      console.error("Error fetching track details:", error);
      return null;
    }
  };
  const fetchChat = async () => {
    const userDocRef = doc(db, "Users", id);
    const userSnap = await getDoc(userDocRef);
    if (userSnap) {
      const userData = userSnap.data();
      const messageArray = userData.messages || [];
      if (messageArray.length > 0) {
        const filteredMessages = filterMessagesByReceiver(messageArray, id);
        setMessages(filteredMessages);
      } else {
        setMessages([]);
      }

      console.log(messages);
    }
  };

  useEffect(() => {
    fetchChat();
    fetchSenderPic(id);
    fetchReceiverPic(currentUserId);
  }, [id, fetchAgain]);

  return (
    <List spacing={3} p={4} w="100%">
      {messages.map((message, index) => (
        <ListItem key={index}>
          <Box
            w="100%"
            textAlign={message.sender === currentUserId ? "right" : "left"}
          >
            <Box display="inline-block" textAlign="left">
              {message.sender !== currentUserId && (
                <Avatar
                  src={senderURL}
                  size="lg"
                  name={message.sender}
                  mb={2}
                />
              )}
              {message.sender !== currentUserId && (
                <Image
                  src={message.trackPic}
                  alt="Track Image"
                  objectFit="cover"
                  style={{
                    cursor: "pointer",
                    backgroundColor: "transparent",
                    padding: 0,
                    border: "none",
                  }}
                  borderRadius="10px"
                  transition="transform 0.2s ease-in-out"
                  _hover={{
                    transform: "scale(1.02)",
                  }}
                  onClick={() => handleNavigate(message.trackID)}
                />
              )}
            </Box>
            <Box display="inline-block" textAlign="right">
              {message.sender === currentUserId && (
                <Avatar
                  src={receiverURL}
                  size="lg"
                  name={message.sender}
                  mb={2}
                />
              )}
              {message.sender === currentUserId && (
                <Image
                  src={message.trackPic}
                  alt="Track Image"
                  objectFit="cover"
                  style={{
                    cursor: "pointer",
                    backgroundColor: "transparent",
                    padding: 0,
                    border: "none",
                  }}
                  borderRadius="10px"
                  transition="transform 0.2s ease-in-out"
                  _hover={{
                    transform: "scale(1.02)",
                  }}
                  onClick={() => handleNavigate(message.trackID)}
                />
              )}
            </Box>
          </Box>
        </ListItem>
      ))}
    </List>
  );
};

export default SingleChat;
