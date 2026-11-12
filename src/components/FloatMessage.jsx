import React from 'react';
import { AiOutlineMessage } from 'react-icons/ai';
import './FloatMessage.css';

const FloatMessage = () => {
    return (
        <div className="float-message">
            <AiOutlineMessage className="icon" />
            <span>Messages</span>
        </div>
    );
};

export default FloatMessage;
