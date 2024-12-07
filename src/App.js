import { Provider } from "react-redux";
import "./App.css";
import store from "./utils/store";
import Body from "./Components/Body";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import Login from "./Components/Login";
import SignUp from "./Components/SignUp";
import CreateProfile from "./Components/CreateProfile";
import Profile from "./Components/ProfilePage";
import Navbar from "./Components/Navbar";
import Reels from "./Components/Reels";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token");

  return isAuthenticated ? children : <Navigate to="/" />;
};

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/sign-up",
    element: <SignUp />,
  },
  {
    path: "/create-profile",
    element: <CreateProfile />,
  },
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
        <div className="flex">
          <div>
            <Navbar />
          </div>
          <div className="ml-96">
            <Profile />
          </div>
        </div>
      </ProtectedRoute>
    ),
  },
  {
    path: "/reels",
    element: (
      <ProtectedRoute>
        <div className="flex">
          <div>
            <Navbar />
          </div>
          <div className="ml-96">
            <Reels />
          </div>
        </div>
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
