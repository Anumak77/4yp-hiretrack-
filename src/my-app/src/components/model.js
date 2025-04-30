import React from 'react';

const Modal = ({ title, message, buttonText, onClose }) => {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>{title}</h2>
        <p style={styles.message}>{message}</p>
        <button style={styles.button} onClick={onClose}>
          {buttonText}
        </button>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    background: '#fff',
    padding: '30px',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
    width: '90%',
    maxWidth: '400px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '10px'
  },
  message: {
    fontSize: '16px',
    marginBottom: '20px'
  },
  button: {
    backgroundColor: '#2F5D36',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
};

export default Modal;
