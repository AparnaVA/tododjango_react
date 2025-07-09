import { useState } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import '../Signup.css';
import { useNavigate } from 'react-router-dom';

function Login() {
    var [name, setName] = useState('');
    var [password, setPassword] = useState('');
    var [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    function attemptLogin() {
        axios.post('http://127.0.0.1:8000/login/',{
            username:name,
            password:password
        }).then(response=>{
            setErrorMessage('')
            //add token and userid to local storage
            localStorage.setItem('token', response.data.token)
            localStorage.setItem('userId', response.data.user_id)
            console.log(response.data.token)
            //redirect to specific users todolist
            navigate(`/todolist/all/${response.data.user_id}/all/`);
        }).catch(error=>{
            if(error.response.data.errors){
                setErrorMessage(Object.values(error.response.data.errors).join(' '))
            }else if(error.response.data.message){
                setErrorMessage(error.response.data.message)
            }else{
                setErrorMessage('Failed to login user. Please contact admin')
            }
        })
    }
    return (<div>
        <Navbar/>
        <div className="container login">
            <div className="row">
                <div className="col-10 offset-1">
                    <h1 className="mb-3">Login</h1>
                    {errorMessage?<div className="alert alert-danger">{errorMessage}</div>:''}
                    <div className="form-group mt-5">
                        <input type="text"
                        className="form-control"
                        placeholder="Username"
                        value={name}
                        onInput={(event)=>setName(event.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <input type="password"
                        className="form-control"
                        placeholder="Password"
                        value={password}
                        onInput={(event)=>setPassword(event.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <button className="btn btn-primary btn-block float-right" onClick={attemptLogin}>Login</button>
                    </div>
                </div>
            </div>
        </div>
    </div>)
}

export default Login;