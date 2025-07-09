import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Signup from "./components/Signup";
import Login from "./components/Login";


const router = createBrowserRouter([
    { path: '', element: <App/> },
    { path: 'signup/', element: <Signup/> },
    { path: 'login', element: <Login/> },
]);
export default router;