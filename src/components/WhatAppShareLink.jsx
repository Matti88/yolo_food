import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import "../style/WhatAppShareLink.css";

const WhatsAppShareLink = ({ text }) => {
  if (!text || text.trim() === '') {
    return null; // Return null if text is empty or only contains whitespace
  }

  const encodedText = encodeURIComponent(text);
  const link = `https://api.whatsapp.com/send/?text=${encodedText}&type=custom_url&app_absent=0`;

  const iconStyle = {
    fontSize: '24px', // Adjust the size as desired
  };

  return (
    <a href={link} target="_blank" rel="noopener noreferrer" className="whatsapp-button">
      <span className="whatsapp-text">Share Your Grocery on Whatsapp   </span>
      <FontAwesomeIcon icon={faWhatsapp} style={iconStyle} />
    </a>
  );
};

export default WhatsAppShareLink;
