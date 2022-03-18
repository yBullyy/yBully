import React, { useEffect, useState } from 'react';
import { goBack } from '../../../node_modules/react-chrome-extension-router/dist/index';

const Options = () => {
    const [selectedAction, setSelectedAction] = useState('blur');

    useEffect(() => {
        chrome.storage.sync.get('action', (items) => {
            setSelectedAction(items.action);
        });
    }, []);

    const selectActionHandler = (e) => {
        const action = e.target.value;
        setSelectedAction(action);
        chrome.storage.sync.set({ action: action }, () => {
            console.log('Action saved');
        });
    }

    return (
        <div className='options-container' >
            <div className='options-header'>
                <img 
                    src='https://o.remove.bg/downloads/b37ea944-5a77-4394-ba50-c16ed5da8111/computer-icons-arrow-back-removebg-preview.png' 
                    onClick={() => goBack()}
                />
                <h1>Settings</h1>
            </div>

            <div className='action-container' >
                <div className='s-title' >Select an action for bully tweets</div>
                <div onChange={selectActionHandler} className="btn-group-vertical" role="group" aria-label="Basic example">
                    <label htmlFor='blur' ><input type="radio" id='blur' value="blur" name="option" checked={selectedAction === 'blur'} />  Blur</label>
                    <label htmlFor='label' ><input type="radio" id='label' value="label" name="option" checked={selectedAction === 'label'} /> Label</label>
                    <label htmlFor='remove' ><input type="radio" id='remove' value="remove" name="option" checked={selectedAction === 'remove'} /> Remove</label>
                </div>
            </div>
        </div>
    );
}

export default Options
