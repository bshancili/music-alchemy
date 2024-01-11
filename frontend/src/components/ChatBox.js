import React from "react";
import { Box, VStack, Text } from "@chakra-ui/react";
import SingleChat from "./SingleChat";
const ChatBox = ({ id, fetchChat }) => {
  return (
    <Box
      minW={1050}
      maxH={500}
      borderRadius="20px"
      backgroundColor="#1A1E1F"
      display="flex"
      p="0px 30px"
      alignItems="center"
      overflowY="scroll"
    >
      {/* Your chatbox content goes here */}
      <VStack spacing={4} maxH="100%" w="100%">
        <SingleChat id={id} fetchAgain={fetchChat} />
      </VStack>
    </Box>
  );
};

export default ChatBox;
