import React, { useEffect } from "react";
import useAuthStore from "../stores/authStore";
import { Box, Heading, Text, Button, Stack, Center } from "@chakra-ui/react";
import { Outlet, Navigate } from "react-router-dom";
import Header from "../components/Header";
const HomePage = () => {
  return <Header />;
};

export default HomePage;
