import React from "react";

export default function Alert({ message, onClose }) {
  return (
    <div style={styles.container}>
      <div style={styles.alert}>
        <p>{message}</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "rgba(0, 0, 0, 0.5)",
    zIndex: 9999,
  },
  alert: {
    background: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
    textAlign: "center",
  },
};
