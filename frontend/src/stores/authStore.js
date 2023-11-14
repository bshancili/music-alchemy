import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null, // Initialize user to null
  isAuthenticated: false, // Initialize authentication status to false
  token: null,
  userID: "",

  // Method to log in
  login: (userData, uid, token) => {
    set((state) => ({
      user: userData,
      isAuthenticated: true,
      userID: uid,
      token: token,
    }));
  },

  // Method to log out
  signout: () => {
    set(() => ({
      user: null,
      isAuthenticated: false,
      token: null,
      userID: null,
    }));
  },

  signup: (userData, uid, token) => {
    set((state) => ({
      user: userData,
      userID: uid,
      isAuthenticated: true,
      token: token,
    }));
  },
}));

export default useAuthStore;
