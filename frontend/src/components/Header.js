import { Box, Flex, Input, IconButton, Image } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import home from "../utils/home.svg";
import fire from "../utils/fire.svg";
import add from "../utils/add.svg";
import profile from "../utils/profile.svg";
import chat from "../utils/chat.svg";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";
const Header = () => {
  const { userID } = useAuthStore();
  const navigate = useNavigate();
  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      padding="40px 100px"
      bg="#1D2123"
      color="white"
      gap="10px"
    >
      {/* Left side of the header with two buttons */}
      <Flex align="center" gap="12px">
        <IconButton
          bg="#33373B5E"
          _hover={{ bg: "#000" }}
          color="#FFFFFF"
          w="64px"
          h="64px"
          icon={<Image src={home} />}
          onClick={() => {
            navigate("/home");
          }}
        />
        <IconButton
          bg="#33373B5E"
          _hover={{ bg: "#000" }}
          color="#FFFFFF"
          w="64px"
          h="64px"
          icon={<Image src={fire} />}
        />
      </Flex>

      {/* Center of the header with a search bar */}
      <Box flex="1" ml="4">
        <Flex
          flexDirection="row"
          align="center"
          bg="#33373B5E"
          h="64px"
          borderRadius="15px"
        >
          <Input
            ml={4}
            variant="unstyled"
            placeholder="Search..."
            _focus={{ outline: "none" }}
          />
          <IconButton
            bg="#33373B5E"
            _hover={{ bg: "#000" }}
            color="#FFFFFF"
            w="64px"
            h="64px"
            icon={<SearchIcon />}
          />
        </Flex>
      </Box>

      {/* Right side of the header with three buttons */}
      <Flex align="center" gap="10px">
        <IconButton
          bg="#33373B5E"
          _hover={{ bg: "#000" }}
          color="#FFFFFF"
          w="64px"
          h="64px"
          icon={<Image src={add} />}
        />
        <IconButton
          bg="#33373B5E"
          _hover={{ bg: "#000" }}
          color="#FFFFFF"
          w="64px"
          h="64px"
          icon={<Image src={chat} />}
        />
        <IconButton
          bg="#33373B5E"
          _hover={{ bg: "#000" }}
          color="#FFFFFF"
          w="64px"
          h="64px"
          icon={<Image src={profile} />}
          onClick={() => {
            navigate(`/profile/${userID}`);
          }}
        />
      </Flex>
    </Flex>
  );
};

export default Header;
