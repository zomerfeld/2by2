import React from 'react';
import styles from '../styles/LogoNew.module.css';
import newLogoPath from "@assets/newlogo_1755243319561.png";

interface LogoNewProps {
  onAddClick: () => void;
  disabled?: boolean;
}

export default function LogoNew({ onAddClick, disabled = false }: LogoNewProps) {
  return (
    <div className={styles.LogoNew_207_3282}>
      <div className={styles.Group_2_94_1059}>
        <img 
          src={newLogoPath} 
          alt="Priority Matrix Logo" 
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>
      <button 
        className={styles.AddButton_101_1186} 
        onClick={onAddClick}
        disabled={disabled}
        title="Add New Item"
      >
        <div className={styles.Plus_131_1399}>
          <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.50016 3.33333V12.6667M3.8335 7.99999H13.1668" stroke="#F5F5F5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>
    </div>
  );
}