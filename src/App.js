import React from "react";
import { Provider } from "react-redux";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import "./App.css";
import store from "./utils/store";
import Body from "./Components/Body";
import Login from "./Components/Login";
import SignUp from "./Components/SignUp";
import CreateProfile from "./Components/CreateProfile";
import Profile from "./Components/ProfilePage";
import Navbar from "./Components/Navbar";
import Reels from "./Components/Reels";
import Searchbar from "./Components/Searchbar";
import UserProfile from "./Components/UserProfile";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token");
  return isAuthenticated ? children : <Navigate to="/" />;
};

const ProtectedLayout = ({ children }) => (
  <div className="flex">
    <Navbar />
    <div className="ml-96">{children}</div>
  </div>
);

const appRouter = createBrowserRouter([
  { path: "/", element: <Login /> },
  { path: "/sign-up", element: <SignUp /> },
  { path: "/create-profile", element: <CreateProfile /> },
  {
    path: "/browse",
    element: (
      <ProtectedRoute>
        <Body />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <ProtectedLayout>
          <Profile />
        </ProtectedLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/reels",
    element: (
      <ProtectedRoute>
        <ProtectedLayout>
          <Reels />
        </ProtectedLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/search",
    element: (
      <ProtectedRoute>
        <ProtectedLayout>
          <Searchbar />
        </ProtectedLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/user/:userId",
    element: (
      <ProtectedRoute>
        <ProtectedLayout>
          <UserProfile />
        </ProtectedLayout>
      </ProtectedRoute>
    ),
  },
]);

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={appRouter} />
    </Provider>
  );
}

export default App;
