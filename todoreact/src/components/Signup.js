import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import '../Signup.css';

function Signup() {
    var [name, setName] = useState('');
    var [password, setPassword] = useState('');
    var [passwordConf, setPasswordConf] = useState('');
    var [errorMessage, setErrorMessage] = useState('');
    var navigate = useNavigate();
    function registerUser(){
        var user = {
            username: name,
            password1: password,
            password2: passwordConf
        }
        axios.post('http://127.0.0.1:8000/signup/',user).then(response=>{
            setErrorMessage('');
            navigate('/login/');
        }).catch(error=>{
            if(error.response.data.errors){
                setErrorMessage(Object.values(error.response.data.errors).join(' '));
            }else{
                setErrorMessage('Failed to connect to api');
            }
        })
    }
    return <div>
       <Navbar/>
        <div className="container signup">
            <div className="row">
                <div className="col-10 offset-1 ">
                    <h1>Register</h1>
                    {errorMessage?<div className="alert alert-danger">{errorMessage}</div>:''}
                    <div className="form-group">
                    
                        <input type="text"
                        className="form-control"
                        placeholder="Name"
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
                        
                        <input type="password"
                        className="form-control"
                        placeholder="Confirm Password"
                        value={passwordConf}
                        onInput={(event)=>setPasswordConf(event.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <button className="btn btn-primary btn-block float-right" onClick={registerUser}>Submit</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
}

export default Signup;