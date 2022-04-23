import React, { useState, useEffect } from 'react';
import { useDocument } from 'react-firebase-hooks/firestore';
import { doc } from 'firebase/firestore';

import { goTo } from '../../../node_modules/react-chrome-extension-router/dist/index';
import { auth, db } from '../../background';
import Popup from '../popup/Popup.js';
import Options from '../options/Options';
import StatBox from './StatBox'

const Home = (props) => {
  const [isChecked, setChecked] = useState(true);
  const [value] = useDocument(doc(db, 'users', props.user.uid), { snapshotListenOptions: { includeMetadataChanges: true } });

  const [stats, setStats] = useState({});

  useEffect(() => {
    if (value) {
      setStats(value.data());
    }
  }, [value]);


  const handleChange = async () => {
    const data = { isOn: !isChecked };
    await chrome.storage.local.set(data);
    console.log("isOn: ", data.isOn);
    await chrome.runtime.sendMessage({ type: "reloadTabs" });
    setChecked(!isChecked);
  }

  const onLogoutHandler = async () => {
    await chrome.storage.local.clear();
    await auth.signOut();
    goTo(Popup);
  }

  useEffect(async () => {
    const { isOn } = await chrome.storage.local.get(['isOn']);
    setChecked(isOn);
  }, []);

  return (
      <div className="main-container">
        <div className="header">
          <div className="logo">
            <img src={"../images/icon48.png"} style={{ width: '30px', height: '30px' }} />
            <div>yBully</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
            <img onClick={() => { goTo(Options); }} className={"settings-icon"} src="https://cdn-icons-png.flaticon.com/512/126/126472.png" />
            <img onClick={onLogoutHandler} className={"logout-icon"} src="https://cdn-icons-png.flaticon.com/512/126/126467.png" />
          </div>
        </div>
        <div className="switch">
          <input id="chck" type="checkbox" onChange={handleChange} checked={isChecked} />
          <label htmlFor="chck" className="check-trail">
            <span className="check-handler"></span>
          </label>
        </div>
        <div className="p-4 text-black" style={{ background: 'white', borderRadius: '5px' }}>
          <div className="text-center">Welcome, {stats.name}</div>
          <hr />
          <div className="flex flex-column mt-4 gap-4" style={{ gap: '20px' }}>
            {/* <div>Scanned Tweets:<span className="text-green-500" style={{ color: 'green' }}> 100</span> </div> */}
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <StatBox statName="Scanned Tweets" statNumber={stats.totalScannedTweets} gradient="purple-gradient" />
              <StatBox statName="Bullied Tweets" statNumber={stats.totalBullyTweets} gradient="yellow-gradient" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <StatBox statName="Reported Tweets" statNumber={stats.totalReportedTweets} gradient="green-gradient" />
              <StatBox statName="Approved Tweets" statNumber={stats.totalApprovedTweets} gradient="lightblue-gradient" />
            </div>
          </div>
        </div>
      </div >
  );
}

export default Home;
