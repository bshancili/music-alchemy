import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Input,
  Button,
  useToast,
  Avatar,
  HStack,
} from "@chakra-ui/react";
import { db } from "../firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
const Comments = ({ track }) => {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const toast = useToast();
  const userID = localStorage.getItem("userID");
  const [username, setUsername] = useState("");
  const [pp, setPP] = useState("");
  const navigate = useNavigate();
  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const fetchUserInfoForComment = async () => {
    try {
      const userRef = doc(db, "Users", userID);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      setUsername(userData.username);
      setPP(userData.profile_picture_url);
    } catch (error) {}
  };
  const handleSubmitComment = async () => {
    if (comment.length < 5) {
      toast({
        title: "Not a valid comment",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    try {
      const userRef = doc(db, "Users", userID);
      const userDoc = await getDoc(userRef);
      const commentsArray = userDoc.data().comments;
      const trackDocRef = doc(db, "Tracks", track.id);
      const commentsRef = collection(userRef, "comments");
      const timestamp = new Date();
      const commentObject = {
        text: comment,
        timestamp: timestamp,
        username: username,
        userProfilePic: pp,
        userId: userID,
      };
      const newCommentRef = await addDoc(commentsRef, commentObject);
      const commentID = newCommentRef.id;
      commentObject.commentID = commentID;

      await updateDoc(trackDocRef, {
        comments: arrayUnion(commentObject),
      });
      await updateDoc(userRef, {
        comments: arrayUnion(commentObject),
      });
      setComments((prevComments) => [commentObject, ...prevComments]);
    } catch {}
    setComment("");
  };

  const fetchComments = async () => {
    try {
      const trackDocRef = doc(db, "Tracks", track.id);
      const trackDocSnapshot = await getDoc(trackDocRef);
      const trackData = trackDocSnapshot.data();
      if (trackData.comments) {
        const cmts = trackData.comments;
        const sortedComments = cmts.sort((a, b) => b.timestamp - a.timestamp);
        setComments(sortedComments);
      } else {
        await updateDoc(trackDocRef, {
          comments: [],
        });
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchUserInfoForComment();
    fetchComments();
  }, []);

  return (
    <Box padding="10px 100px" backgroundColor="#1D2123">
      <Text
        fontSize="35px"
        fontWeight="semibold"
        color="#fff"
        lineHeight="120%"
      >
        Comments
      </Text>

      <Input
        type="text"
        placeholder="Write your comment here..."
        value={comment}
        color="white"
        onChange={handleCommentChange}
        my={4} // Add margin to the input
      />

      <Button colorScheme="teal" onClick={handleSubmitComment}>
        Submit Comment
      </Button>

      {comments.length > 0 && (
        <Box mt={4}>
          {comments.map((comment, index) => (
            <Box
              key={index}
              mt={2}
              p={2}
              backgroundColor="gray.700"
              borderRadius="md"
            >
              <HStack
                onClick={() => {
                  navigate(`/profile/${userID}`);
                }}
              >
                <Avatar
                  size="md"
                  src={comment.userProfilePic}
                  alt={comment.username}
                  _hover={{
                    cursor: "pointer",
                    transform: "scale(1.18)",
                    backgroundColor: "black",
                  }}
                  transition="transform 0.2s ease-in-out"
                />
                <Text
                  fontSize="md"
                  color="white"
                  borderRadius="6px"
                  _hover={{
                    cursor: "pointer",
                    transform: "scale(1.18)",
                    backgroundColor: "black",
                  }}
                  transition="transform 0.2s ease-in-out"
                >
                  {comment.username}
                </Text>
              </HStack>

              <Text fontSize="md" color="white" mt={2} ml={2}>
                {comment.text}
              </Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Comments;
