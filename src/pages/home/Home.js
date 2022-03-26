import React, { useState, useEffect } from 'react';
import { goTo } from '../../../node_modules/react-chrome-extension-router/dist/index';
import { auth } from '../../background';
import Popup from '../popup/Popup.js';
import Options from '../options/Options';
import browser from 'webextension-polyfill';
import StatBox from './StatBox'

const Home = () => {

  const [isChecked, setChecked] = useState(false);

  const handleChange = async () => {
    const data = { isOn: !isChecked };
    await browser.storage.local.set(data);
    setChecked(!isChecked);
  }

  useEffect(async () => {
    const { isOn } = await browser.storage.local.get(['isOn'])
    console.log(isOn);
    setChecked(isOn);
  }, []);

  return (
    <div className="main-container">
      {/* <button onClick={() => goTo(Popup)}>Go to Login</button> */}
      <div className="header">
        <div className="logo">
          <img src={"../images/icon48.png"} style={{ width: '30px', height: '30px' }} />
          <div>yBully</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
          <img onClick={() => { goTo(Options); }} className={"settings-icon"} src="https://cdn-icons-png.flaticon.com/512/126/126472.png" />
          <img onClick={async () => {
            await chrome.storage.local.clear();
            await auth.signOut();
            goTo(Popup);
          }} className={"logout-icon"} src="https://cdn-icons-png.flaticon.com/512/126/126467.png" />
        </div>
      </div>
      <div className="switch">
        <input id="chck" type="checkbox" onChange={handleChange} checked={isChecked} />
        <label for="chck" class="check-trail">
          <span class="check-handler"></span>
        </label>
      </div>
      <div className="p-4 text-black" style={{ background: 'white', borderRadius: '5px' }}>
        <div className="text-center">Welcome Nilay</div>
        <hr />
        <div className="flex flex-column mt-4 gap-4" style={{ gap: '20px' }}>
          {/* <div>Scanned Tweets:<span className="text-green-500" style={{ color: 'green' }}> 100</span> </div> */}
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <StatBox statName="Scanned Tweets" statNumber="100" gradient="purple-gradient" />
            <StatBox statName="Bullied Tweets" statNumber="40" gradient="yellow-gradient" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <StatBox statName="Reported Tweets" statNumber="10" gradient="green-gradient" />
            <StatBox statName="Scanned Tweets" statNumber="10" gradient="lightblue-gradient" />
          </div>
        </div>
      </div>
    </div >
  );
}

export default Home;
