import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { Box, Button, Image, Text } from "@chakra-ui/react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { fetchUserByID } from "../api/api";
import ChatBox from "../components/ChatBox";

const ChatPage = () => {
  const userID = localStorage.getItem("userID");
  const [friends, setFriends] = useState([]);
  const [isChatboxVisible, setIsChatboxVisible] = useState(false);
  const [selectedFriendID, setSelectedFriendID] = useState();

  const fetchFriends = async () => {
    try {
      const userDocRef = doc(db, "Users", userID);
      const userSnap = await getDoc(userDocRef);
      if (userSnap) {
        const userData = userSnap.data();
        //console.log(userData);
        const friends = userData.friends_list;
        const friendsPromises = friends.map(async (friendId) => {
          return await fetchUserByID(friendId);
        });

        // Wait for all friends data to be fetched
        const friendsData = await Promise.all(friendsPromises);

        // Filter out any null values (friends not found)
        const validFriendsData = friendsData.filter(
          (friend) => friend !== null
        );

        // Set the friends state with the valid friends data
        setFriends(validFriendsData);
        console.log(friends);
      }
    } catch (error) {}
  };
  const handleOnFriendClick = async (friendID) => {
    setIsChatboxVisible(true);
    setSelectedFriendID(friendID);
  };
  useEffect(() => {
    fetchFriends();
    console.log(friends);
  }, [userID]);

  return (
    <Box height={"100vh"} bg="#1D2123" display="flex" flexDirection="column">
      <Header />
      <Box
        display="flex"
        justifyContent="space-between"
        minW={150}
        maxH={500}
        minH={250}
        p="10px 100px"
      >
        <Box overflowY={"overlay"} display="flex" flexDirection="column">
          {friends.map((friend, index) => (
            <Button
              key={index}
              bgColor="yellow.600"
              display="flex"
              alignItems="center"
              justifyContent="left"
              mb="10px"
              borderRadius={10}
              w={250}
              h={"100%"}
              p={2}
              onClick={() => handleOnFriendClick(`${friend.id}`)}
            >
              <Box
                w="60px" // Adjusted the width
                h="60px" // Adjusted the height
                borderRadius="50%"
                overflow="hidden"
                mr="2"
              >
                <Image
                  src={friend.profile_picture_url}
                  alt={friend.username}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                />
              </Box>
              <Text fontSize="lg" color="white">
                {friend.username}
              </Text>
            </Button>
          ))}
        </Box>
        {isChatboxVisible && (
          <ChatBox id={selectedFriendID} fetchChat={setSelectedFriendID} />
        )}
      </Box>
    </Box>
  );
};

export default ChatPage;
