import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import { ChakraProvider } from "@chakra-ui/react";
import ProfilePage from "./pages/ProfilePage";
import MusicDetailPage from "./pages/MusicDetailPage";
import RecommendPage from "./pages/RecommendPage";
import AddSongPage from "./pages/AddSongPage";
import StatsPage from "./pages/StatsPage";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <ChakraProvider>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to={"login"} />} />
        <Route path="home" element={<HomePage />} />
        <Route exact path="profile/:id" element={<ProfilePage />} />
        <Route path="music/:id" element={<MusicDetailPage />} />
        <Route path="recommend_songs" element={<RecommendPage />} />
        <Route path="add_song" element={<AddSongPage />} />
        <Route path="stats/:id" element={<StatsPage />} />
      </Routes>
    </ChakraProvider>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
