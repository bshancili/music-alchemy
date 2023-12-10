import { Box, Button, Input } from "@chakra-ui/react";
import React, { useState } from "react";
import axios from "axios";

const UploadFile = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    try {
      if (!file) {
        console.error("No file selected.");
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

      // Process the response from the server
      console.log(response.data);
    } catch (error) {
      console.error("Error uploading file:", error.message);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
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
      <Button mt={15} onClick={handleUpload}>
        UploadFile
      </Button>
    </Box>
  );
};

export default UploadFile;
