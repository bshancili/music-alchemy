import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  VStack,
  Radio,
  RadioGroup,
} from "@chakra-ui/react";
import { useState } from "react";

const AddSongModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const onClose = () => setIsOpen(false);
  const onOpen = () => setIsOpen(true);
  const [songInfo, setSongInfo] = useState({
    songName: "",
    artistNames: {},
    albumName: "",
    rating: 1,
  });

  const handleInputChange = (e, inputName) => {
    setSongInfo({ ...songInfo, [inputName]: e.target.value });
  };

  const handleRatingChange = (value) => {
    setSongInfo({ ...songInfo, rating: value });
  };

  const handleAdd = () => {
    // TODO: Implement API
  };
  return (
    <>
      <Button
        colorScheme="yellow"
        size="lg"
        onClick={onOpen}
        border="1px solid black"
      >
        Add Song
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add a Song</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Song Name</FormLabel>
              <Input
                type="text"
                onChange={(e) => handleInputChange(e, "songName")}
              />
              <FormLabel>Artist Name(s)</FormLabel>
              <Input
                type="text"
                onChange={(e) => handleInputChange(e, "artistsName")}
              />
              <FormLabel>Album Name</FormLabel>
              <Input
                type="text"
                onChange={(e) => handleInputChange(e, "albumName")}
              />
              <VStack align="start" spacing={4}>
                <FormLabel>Rate Song out of 10</FormLabel>
                <RadioGroup
                  defaultValue="1"
                  value={songInfo.rating}
                  onChange={(value) => handleRatingChange(value)}
                  isInline
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                    <Radio key={value} value={String(value)} name="rating">
                      {value}
                    </Radio>
                  ))}
                </RadioGroup>
              </VStack>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="orange"
              onClick={() => {
                onClose();
                handleAdd();
              }}
            >
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddSongModal;
