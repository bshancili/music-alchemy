import React from "react";
import useAuthStore from "../stores/authStore";
const HomePage = () => {
  const { token, userID } = useAuthStore();
  return <div>HomePage</div>;
};

export default HomePage;
