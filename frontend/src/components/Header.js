import {
  ChakraProvider,
  Box,
  Flex,
  Button,
  Input,
  IconButton,
  Image,
  Divider,
  Spacer,
} from "@chakra-ui/react";
import { SearchIcon, AddIcon, BellIcon, SettingsIcon } from "@chakra-ui/icons";
import home from "../utils/home.svg";
import fire from "../utils/fire.svg";
import add from "../utils/add.svg";
import profile from "../utils/profile.svg";
import chat from "../utils/chat.svg";

const Header = () => {
  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      padding="40px"
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
          w="48px"
          h="48px"
          icon={<Image src={home} />}
        />
        <IconButton
          bg="#33373B5E"
          _hover={{ bg: "#000" }}
          color="#FFFFFF"
          w="48px"
          h="48px"
          icon={<Image src={fire} />}
        />
      </Flex>

      {/* Center of the header with a search bar */}
      <Box flex="1" ml="4">
        <Flex align="center" bg="#33373B5E" h="40px" borderRadius="full">
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
            w="48px"
            h="48px"
            icon={<Image src={fire} />}
          />
        </Flex>
      </Box>

      {/* Right side of the header with three buttons */}
      <Flex align="center" gap="10px">
        <IconButton
          bg="#33373B5E"
          _hover={{ bg: "#000" }}
          color="#FFFFFF"
          w="48px"
          h="48px"
          icon={<Image src={add} />}
        />
        <IconButton
          bg="#33373B5E"
          _hover={{ bg: "#000" }}
          color="#FFFFFF"
          w="48px"
          h="48px"
          icon={<Image src={chat} />}
        />
        <IconButton
          bg="#33373B5E"
          _hover={{ bg: "#000" }}
          color="#FFFFFF"
          w="48px"
          h="48px"
          icon={<Image src={profile} />}
        />
      </Flex>
    </Flex>
  );
};

export default Header;
