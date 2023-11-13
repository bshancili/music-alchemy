// Import necessary Chakra UI components
import React from "react";
import styled from "styled-components";

import {
  ChakraProvider,
  Box,
  Flex,
  Heading,
  Text,
  extendTheme,
  Link,
  CSSReset,
  Tooltip,
} from "@chakra-ui/react";
// Import your image files
import homeIcon from "./images/home.svg";
import musicIcon from "./images/music.svg";
import penIcon from "./images/pen.svg";
import envelopeIcon from "./images/envelope.svg";
import userIcon from "./images/user.svg";

// Extend the theme if needed
const theme = extendTheme(/* Your theme configurations here */);
// Header component with custom images as icons
const Header = () => (
  <Flex
    as="header"
    align="center"
    justify="space-between"
    p="35"
    bg="#1A1E1F"
    color="white"
  >
    <Flex align="center">
      {/* Home Link */}
      <Link
        mt="64px"
        mr="12px"
        ml="138px"
        href="/"
        borderRadius="15px"
        width="64px"
        height="64px"
        bg="#33373B5E"
        _hover={{ bg: "#FFFFFF" }}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Tooltip label="Home" placement="bottom">
          <img src={homeIcon} alt="Home" style={{ width: "100%" }} />
        </Tooltip>
      </Link>

      {/* Recommend a Song Link */}
      <Link
        mt="64px"
        href="/recommend"
        borderRadius="15px"
        width="64px"
        height="64px"
        bg="#33373B5E"
        _hover={{ bg: "#FFFFFF" }}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Tooltip label="Recommend a Song" placement="bottom">
          <img src={musicIcon} alt="Music" style={{ width: "100%" }} />
        </Tooltip>
      </Link>

      {/* Search Bar */}
      <Box flex="1" display="flex" alignItems="center" justifyContent="center">
        <Link
          mt="64px"
          ml="12px"
          mr="12px"
          href="/search"
          borderRadius="15px"
          width="785px"
          height="64px"
          bg="#33373B5E"
          _hover={{ bg: "#FFFFFF" }}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Tooltip label="Search" placement="bottom">
            <div
              style={{
                width: "0px",
                height: "40px",
                backgroundColor: "#33373B5E",
              }}
            />
          </Tooltip>
        </Link>
      </Box>

      {/* Create Song Link */}
      <Link
        mr="12px"
        mt="64px"
        href="/create"
        borderRadius="15px"
        width="64px"
        height="64px"
        bg="#33373B5E"
        _hover={{ bg: "#FFFFFF" }}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Tooltip label="Create Song" placement="bottom">
          <img src={penIcon} alt="Pen" style={{ width: "100%" }} />
        </Tooltip>
      </Link>

      {/* Direct Message Link */}
      <Link
        mt="64px"
        mr="12px"
        href="/messages"
        borderRadius="15px"
        width="64px"
        height="64px"
        bg="#33373B5E"
        _hover={{ bg: "#FFFFFF" }}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Tooltip label="Direct Message" placement="bottom">
          <img src={envelopeIcon} alt="Envelope" style={{ width: "100%" }} />
        </Tooltip>
      </Link>

      {/* My Profile Link */}
      <Link
        mt="64px"
        mr="137px"
        href="/profile"
        borderRadius="15px"
        width="64px"
        height="64px"
        bg="#33373B5E"
        _hover={{ bg: "#FFFFFF" }}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Tooltip label="My Profile" placement="bottom">
          <img src={userIcon} alt="User" style={{ width: "100%" }} />
        </Tooltip>
      </Link>
    </Flex>
  </Flex>
);
const MainSection = () => (
  <Flex
    as="main"
    align="center"
    justify="center"
    p="4"
    style={{
      backgroundColor: "#1A1E1F",
    }}
  >
    {/* Name-Surname */}
    <Box
      style={{
        width: "349px",
        height: "58px",
        fontFamily: "Quicksand",
        fontSize: "48px",
        fontWeight: 400,
        lineHeight: "58px",
        letterSpacing: "0em",
        textAlign: "left",
        color: "#FFFFFF",
        position: "absolute",
        left: "419px",
        top: "192px",
      }}
    >
      Name-Surname
    </Box>

    {/* Username */}
    <Box
      style={{
        width: "135px",
        height: "29px",
        opacity: 0.5,
        fontFamily: "Quicksand",
        fontSize: "24px",
        fontWeight: 400,
        lineHeight: "29px",
        letterSpacing: "0em",
        textAlign: "left",
        color: "#FFFFFF",
        position: "absolute",
        left: "418px",
        top: "250px",
      }}
    >
      username
    </Box>

    {/* Profile Photo */}
    <Box
      style={{
        width: "256px",
        height: "256px",
        top: "192px",
        left: "138px",
        borderRadius: "8.53px",
        position: "absolute",
      }}
    >
      {/* Add content for the profile photo if needed */}
    </Box>
  </Flex>
);

// Footer component
const Footer = () => (
  <Flex
    as="footer"
    align="center"
    justify="center"
    p="4"
    bg="#1A1E1F"
    color="white"
    style={{
      width: "1165px",
      height: "236px",
      top: "606px",
      left: "138px",
      padding: "0px 0px 2px 0px",
      position: "absolute",
    }}
  >
    <Text
      style={{
        width: "64px",
        height: "29px",

        fontFamily: "Quicksand",
        fontSize: "24px",
        fontWeight: 700,
        lineHeight: "29px",
        letterSpacing: "0em",
        textAlign: "left-bottom",
        color: "#EFEEE0",
      }}
    >
      Music
    </Text>

    <Flex
      style={{
        width: "100%",
        justifyContent: "space-between",
        gap: "5px",
        position: "absolute",
        top: "41px",
      }}
    >
      {/* Replace this with your list of songs */}
      {[1, 2, 3, 4].map((songIndex) => (
        <Box
          key={songIndex}
          style={{
            width: "153px",
            height: "193px",
            gap: "5px",
          }}
        >
          {/* Add content for each song as needed */}
        </Box>
      ))}
    </Flex>
  </Flex>
);

// Homepage component
const Homepage = () => (
  <ChakraProvider theme={theme}>
    <CSSReset />
    <Box minH="100vh" bg="#1A1E1F">
      {" "}
      {/* Updated background color */}
      <Header />
      <MainSection />
      <Footer />
    </Box>
  </ChakraProvider>
);

export default Homepage;
