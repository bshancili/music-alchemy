import React from "react";
import useAuthStore from "../stores/authStore";
const HomePage = () => {
  const { customToken, userID } = useAuthStore();
  console.log(customToken, userID);
  return <div>HomePage</div>;
};

export default HomePage;
