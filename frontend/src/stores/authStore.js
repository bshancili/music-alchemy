import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null, // Initialize user to null
  isAuthenticated: false, // Initialize authentication status to false
  customToken: null,
  userID: null,

  // Method to log in
  login: (userData, uid, token) => {
    set((state) => ({
      user: userData,
      userID: uid,
      customToken: token,
      isAuthenticated: true,
    }));
  },

  // Method to log out
  logout: () => {
    set((state) => ({
      user: null,
      isAuthenticated: false,
    }));
  },

  signup: (userData, uid) => {
    set((state) => ({
      user: userData,
      userID: uid,
      isAuthenticated: true,
    }));
  },
}));

export default useAuthStore;
