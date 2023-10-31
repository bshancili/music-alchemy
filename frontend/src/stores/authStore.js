import create from "zustand";

const useAuthStore = create((set) => ({
  user: null, // Initialize user to null
  isAuthenticated: false, // Initialize authentication status to false

  // Method to log in
  login: (userData) => {
    set((state) => ({
      user: userData,
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

  signup: (userData) => {
    set((state) => ({
      user: userData,
      isAuthenticated: true,
    }));
  },
}));

export default useAuthStore;
