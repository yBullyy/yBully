import React from 'react';
import { goTo } from '../../../node_modules/react-chrome-extension-router/dist/index';
import Options from '../options/Options.js';

const Popup = () => {
    return (
        <div>
            <h1>Popup Page</h1>
            <button onClick={() => goTo(Options)}>Go to Options</button>
        </div>
    )
}

export default Popup
