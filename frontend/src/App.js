import { Navigate, Outlet } from "react-router-dom";
import "./App.css";
import useAuthStore from "./stores/authStore";

function App() {
  const { isAuthenticated } = useAuthStore();

  return <div>{isAuthenticated ? <Outlet /> : <Navigate to={"/login"} />}</div>;
}

export default App;
