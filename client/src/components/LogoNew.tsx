import React from 'react';
import styles from '../styles/LogoNew.module.css';

interface LogoNewProps {
  onAddClick: () => void;
  disabled?: boolean;
}

export default function LogoNew({ onAddClick, disabled = false }: LogoNewProps) {
  return (
    <div className={styles.LogoNew_207_3282}>
      <div className={styles.Group_2_94_1059}>
        <svg width="100%" height="100%" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_94_1059)">
            <rect x="-32.3286" y="107.58" width="131.434" height="17.1429" rx="8.57143" transform="rotate(-45 -32.3286 107.58)" fill="white" />
            <rect x="-27.8765" y="135.266" width="191.295" height="17.1429" rx="8.57143" transform="rotate(-45 -27.8765 135.266)" fill="white" />
            <path d="M101.215 115.196C101.215 117.711 99.1761 119.75 96.6611 119.75H87.5537C85.0388 119.75 83 117.711 83 115.196V115.196C83 112.681 85.0388 110.643 87.5537 110.643H96.6611C99.1761 110.643 101.215 112.681 101.215 115.196V115.196ZM119.429 115.196C119.429 117.711 117.39 119.75 114.875 119.75V119.75C112.361 119.75 110.322 117.711 110.322 115.196V115.196C110.322 112.682 112.361 110.643 114.875 110.643V110.643C117.39 110.643 119.429 112.682 119.429 115.196V115.196ZM101.0 98.6786C101.0 101.193 98.9612 103.232 96.4463 103.232H87.3388C84.8239 103.232 82.7851 101.193 82.7851 98.6786V98.6786C82.7851 96.1637 84.8239 94.1249 87.3388 94.1249H96.4463C98.9612 94.1249 101.0 96.1637 101.0 98.6786V98.6786ZM119.429 98.6786C119.429 101.193 117.39 103.232 114.875 103.232V103.232C112.361 103.232 110.322 101.193 110.322 98.6786V98.6786C110.322 96.1637 112.361 94.1249 114.875 94.1249V94.1249C117.39 94.1249 119.429 96.1637 119.429 98.6786V98.6786Z" fill="white" />
            <path d="M83 82.1607C83 84.6756 85.0388 86.7144 87.5537 86.7144H96.6611C99.1761 86.7144 101.215 84.6756 101.215 82.1607V82.1607C101.215 79.6458 99.1761 77.607 96.6611 77.607H87.5537C85.0388 77.607 83 79.6458 83 82.1607V82.1607ZM110.322 82.1607C110.322 84.6756 112.361 86.7144 114.875 86.7144V86.7144C117.39 86.7144 119.429 84.6756 119.429 82.1607V82.1607C119.429 79.6458 117.39 77.607 114.875 77.607V77.607C112.361 77.607 110.322 79.6458 110.322 82.1607V82.1607Z" fill="white" />
          </g>
          <defs>
            <clipPath id="clip0_94_1059">
              <rect width="120" height="120" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </div>
      <button 
        className={styles.AddButton_101_1186} 
        onClick={onAddClick}
        disabled={disabled}
      >
        <div className={styles.Plus_131_1399}>
          <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.50016 3.33333V12.6667M3.8335 7.99999H13.1668" stroke="#F5F5F5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        Add New Item
      </button>
    </div>
  );
}