import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { useState } from "react";

const AddSongModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const onClose = () => setIsOpen(false);
  const onOpen = () => setIsOpen(true);
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
            {/* Your song adding form or content goes here */}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="orange" onClick={onClose}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddSongModal;
