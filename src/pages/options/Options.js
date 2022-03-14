import React from 'react';
import { goTo } from '../../../node_modules/react-chrome-extension-router/dist/index';
import Popup from '../popup/Popup.js';

const Options = () => {
    return (
        <div>
            <h1>Options Page</h1>
            <button onClick={() => goTo(Popup)}>Go to Dashboard</button>
        </div>
    )
}

export default Options
