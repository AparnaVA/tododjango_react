import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Create from "./components/Create";
import Retrieve from "./components/Retrieve";
import Edit from "./components/Edit";


const router = createBrowserRouter([
    { path: '', element: <App/> },
    { path: 'signup/', element: <Signup/> },
    { path: 'login', element: <Login/> },

    { path: 'todolist/create', element: <Create/> },
    { path: 'todolist/all/:userId/', element: <Retrieve/> },
    { path: 'todolist/:userId/edit/:todolistId/', element: <Edit/> }

]);
export default router;