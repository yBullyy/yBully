import React, { useEffect, useState } from 'react';
import { goTo } from '../../../node_modules/react-chrome-extension-router/dist/index';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../background';
import { saveUserToFirestore } from '../helpers/firebase';
import Home from '../home/Home';
import Options from '../options/Options';

const Popup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(async () => {
        const { user } = await chrome.storage.local.get(['email', 'user']);
        if (user && user.uid) {
            goTo(Home, { user });
        }
    }, []);

    const validate = (email, password, username) => {
        if (!email || !password || !username) {
            return false;
        }
        return true;
    }

    const authHandler = async (isSignup) => {
        const email2 = document.querySelector('#email2').value;
        const password2 = document.querySelector('#pass2').value;
        const username2 = document.querySelector('#username2').value;
        try {
            if (isSignup) {
                if (validate(email2, password2, username2))
                    await createUserWithEmailAndPassword(auth, email2, password2);
                else throw new Error('Please fill in all fields');
            } else {
                if (validate(email, password, "sample")) {
                    await signInWithEmailAndPassword(auth, email, password);
                    alert('User signed in successfully');
                }
                else throw new Error('Please fill in all fields');
            }
        } catch (error) {
            alert(error.message);
            console.log({ error });
            return {};
        }
        return auth.currentUser;
    }

    const onClickHandler = async (isSignup) => {
        const user = await authHandler(isSignup);
        if (user?.uid) {
            if (isSignup) {
                let username = document.querySelector('#username2').value;
                let isSuccess = await saveUserToFirestore({ email: user.email, username, uid: user.uid });
                if (isSuccess)
                    alert('User created successfully');
                else
                    alert('User creation failed');
            }
            await chrome.storage.local.set({ email: user.email, user: user, isOn: true, action: 'blur' });
            goTo(Home, { user });
        }
    }


    return (
        <div className="login-wrap">
            <div className="login-html">
                <div className='login-div-title' >
                    <h1>Welcome to yBully</h1>
                </div>
                <input id="tab-1" type="radio" name="tab" className="sign-in" checked onChange={() => { }} />
                <label htmlFor="tab-1" className="tab" style={{ cursor: "pointer" }}>Sign In</label>

                <input id="tab-2" type="radio" name="tab" className="sign-up" />
                <label htmlFor="tab-2" className="tab" style={{ cursor: "pointer" }}>Sign Up</label>

                <div className="login-form">
                    <div className="sign-in-htm">
                        <div className="group">
                            <label htmlFor="email" className="label">Email</label>
                            <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="group">
                            <label htmlFor="pass" className="label">Password</label>
                            <input id="pass" type="password" className="input" data-type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div className="group">
                            <button type="submit" className="button" onClick={() => onClickHandler(false)} style={{ cursor: "pointer" }} >Sign In</button>
                        </div>
                        <div className="hr"></div>
                        <div className="foot-lnk">
                            <a onClick={() => goTo(Options)} href="#forgot">Forgot Password?</a>
                        </div>
                    </div>
                    <div className="sign-up-htm">
                        <div className="group">
                            <label htmlFor="email2" className="label">Email</label>
                            <input id="email2" type="email" className="input" />
                        </div>
                        <div className="group">
                            <label htmlFor="username2" className="label">Username</label>
                            <input id="username2" type="text" className="input" />
                        </div>
                        <div className="group">
                            <label htmlFor="pass2" className="label">Password</label>
                            <input id="pass2" type="password" className="input" data-type="password" />
                        </div>
                        <div className="group">
                            <button type="submit" className="button" onClick={() => onClickHandler(true)} style={{ cursor: "pointer" }} >
                                Sign Up
                            </button>
                        </div>
                        <div className="hr"></div>
                        <div className="foot-lnk">
                            <label style={{ cursor: "pointer" }} htmlFor="tab-1">Already Member?</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Popup
