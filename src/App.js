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
    path : '/create-profile',
    element : <CreateProfile />
  },
  {
    path: "/browse",
    element: (
      <ProtectedRoute>
        <Body />
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
