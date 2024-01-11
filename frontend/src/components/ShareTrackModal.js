import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  IconButton,
  Image,
} from "@chakra-ui/react";
import share from "../utils/share.svg";
import { db } from "../firebase";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { fetchUserByID } from "../api/api";

const ShareTrackModal = ({ track }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [message, setMessage] = useState({
    trackName: "",
    trackPic: "",
    timestamp: "",
    artist: "",
    sender: "",
    trackID: "",
  });
  const userID = localStorage.getItem("userID");
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState();

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
      }
    } catch (error) {}
  };
  const sendTrack = async (targetID) => {
    const senderDocRef = doc(db, "Users", userID);
    const receiverDocRef = doc(db, "Users", targetID);
    // Fetch sender's data

    const senderSnap = await getDoc(senderDocRef);
    const senderData = senderSnap.data();
    const senderMessages = senderData.messages || [];
    const receiverSnap = await getDoc(receiverDocRef);
    const receiverData = receiverSnap.data();
    const receiverMessages = receiverData.messages || [];
    console.log(message);
    const updatedSenderMessages = [...senderMessages, message];

    await updateDoc(senderDocRef, {
      messages: updatedSenderMessages,
    });
    // Update receiver's messages array
    const updatedReceiverMessages = [...receiverMessages, message];
    await updateDoc(receiverDocRef, {
      messages: updatedReceiverMessages,
    });
    onClose();
  };
  useEffect(() => {
    fetchFriends();
    setMessage({
      trackName: track.track_name,
      trackPic: track.album_images[1].url,
      timestamp: new Date().toISOString(),
      artist: track.artists[0],
      sender: userID,
      receiver: selectedFriend?.uid || "",
      trackID: track.firebase_id,
    });
  }, [userID, selectedFriend]);

  return (
    <div>
      <IconButton
        borderRadius="15px"
        w="64px"
        h="64px"
        bg="#33373b5e"
        icon={<Image src={share} />}
        _hover={{ bg: "#000" }}
        onClick={onOpen}
      />
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Send to Friend</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {friends.map((friend) => (
              <Button
                colorScheme="yellow"
                margin={1}
                key={friend.uid}
                onClick={() => {
                  setSelectedFriend(friend);
                }}
                variant={
                  selectedFriend && friend.uid === selectedFriend.uid
                    ? "solid"
                    : "outline"
                }
              >
                {friend.username}
              </Button>
            ))}
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="yellow"
              mr={3}
              onClick={() => sendTrack(selectedFriend.uid)}
            >
              Send
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ShareTrackModal;
