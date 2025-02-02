import React from "react";
import { Provider } from "react-redux";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
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
import Notifications from "./Components/Notifications";
import Chat from "./Components/Chat";
import MobileNav from "./Components/MobileNav";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token");
  return isAuthenticated ? children : <Navigate to="/" />;
};

const ProtectedLayout = ({ children }) => (
  <div>
    <div className="md:flex hidden">
      <Navbar />
      <div className="ml-80 w-full">{children}</div>
    </div>
    <div className="flex flex-col md:hidden">
      <MobileNav />
      <div className="w-full">{children}</div>
    </div>
  </div>
);

const appRouter = createBrowserRouter([
  { path: "/", element: <Login /> },
  { path: "/sign-up", element: <SignUp /> },
  { path: "/create-profile/:username", element: <CreateProfile /> },
  {
    path: "/browse",
    element: (
      <ProtectedRoute>
        <ProtectedLayout>
          <Body />
        </ProtectedLayout>
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
  {
    path: "/notifications",
    element: (
      <ProtectedRoute>
        <ProtectedLayout>
          <Notifications />
        </ProtectedLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/chat/:id/:profileName",
    element: (
      <ProtectedRoute>
        <ProtectedLayout>
          <Chat />
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
