import React from 'react';
import { goTo } from '../../../node_modules/react-chrome-extension-router/dist/index';
import { auth } from '../../background';
import Popup from '../popup/Popup.js';

const Home = () => {
    return (
        <div>
            {/* <button onClick={() => goTo(Popup)}>Go to Login</button> */}
            <button onClick={async () => {
                await chrome.storage.local.clear();
                await auth.signOut();
                goTo(Popup);
            }}>Signout</button>
        </div>
    );
}

export default Home;