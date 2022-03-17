import React,{useState,useEffect} from 'react';
import { goTo } from '../../../node_modules/react-chrome-extension-router/dist/index';
import { auth } from '../../background';
import Popup from '../popup/Popup.js';
import Options from '../options/Options';
import browser from 'webextension-polyfill';

const Home = () => {

   const [isChecked,setChecked] = useState(false);

   const handleChange = async () => {
	   const data = {isOn:!isChecked};
           await browser.storage.local.set(data);
	   setChecked(!isChecked);
   }

    useEffect(async () => {
	   const {isOn} = await browser.storage.local.get(['isOn'])
	    console.log(isOn);
	   setChecked(isOn);
    }, []);

    return (
        <div className="main-container">
            {/* <button onClick={() => goTo(Popup)}>Go to Login</button> */}
	    <div className="header">
	    	<div className="logo">
	    		<img src={"../images/icon48.png"} style={{width:'30px',height:'30px'}} />
	    		<div>yBully</div>
	    	</div>
	    	<div onClick={() => {goTo(Options);}}>
	    		<img className={"settings-icon"} src="https://cdn-icons-png.flaticon.com/512/126/126472.png" />
	    	</div>
	    </div>
	    <div className="switch">
		<input id="chck" type="checkbox" onChange={handleChange} checked={isChecked} />
		<label for="chck" class="check-trail">
		  <span class="check-handler"></span>
		</label>
	    </div>
            <button onClick={async () => {
                await chrome.storage.local.clear();
                await auth.signOut();
                goTo(Popup);
            }}>Signout</button>
        </div>
    );
}

export default Home;
