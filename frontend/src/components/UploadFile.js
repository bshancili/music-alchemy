import { Box, Button, Input, useToast, Text, HStack } from "@chakra-ui/react";
import React, { useState } from "react";
import axios from "axios";

const UploadFile = () => {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [responseArray, setResponseArray] = useState([]);
  const toast = useToast();
  const [isUploaded, setIsUploaded] = useState(false);
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    try {
      if (!file) {
        toast({
          title: "Please select a file",
        });
        return;
      }
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append("file", file);

      // Send the file to the server using axios
      const response = await axios.post(
        "http://127.0.0.1:8080/process_file",
        formData
      );
      if (response) {
        const data = response.data;
        setResponseArray(data);
        setIsUploaded(true);
        console.log(responseArray);
      }
    } catch (error) {
      console.error("Error uploading file:", error.message);
      toast({
        title: "Error Uploading File",
        status: "error",
        isClosable: "true",
      });
    }
  };

  return (
    <>
      <Box
        display="flex"
        flexDirection="row"
        gap={2}
        alignItems="center"
        justifyContent="center"
      >
        <Input
          alignContent="center"
          textColor="white"
          type="file"
          border="none"
          onChange={handleFileChange}
        />

        <Button onClick={handleUpload}>Upload File</Button>
      </Box>

      {isUploaded && (
        <Box>
          <Text color="white" fontSize="lg" mt={4}>
            Uploaded Files:
          </Text>
          {responseArray.results.map((response, index) => (
            // Use a unique key for each item in the array
            <Box
              display="flex"
              bg="yellow.400"
              flexDir="row"
              mt={4}
              gap={2}
              key={index}
              alignItems="center"
              justifyContent="center"
              padding="12px 8px"
              borderRadius="4px"
            >
              <Text fontSize="2xl" fontWeight="bold">
                {response.suggested_track_name}
              </Text>
              <Text fontSize="2xl">
                {response.create_song_response.message}
              </Text>
            </Box>
          ))}
        </Box>
      )}
    </>
  );
};

export default UploadFile;
