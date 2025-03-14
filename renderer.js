const { ipcRenderer } = require("electron");

function addDownloadButton() {
  if (document.getElementById("downloadPdfBtn")) return;

  const downloadBtn = document.createElement("button");
  downloadBtn.id = "downloadPdfBtn";
  downloadBtn.innerText = "Download as PDF";
  Object.assign(downloadBtn.style, {
    position: "fixed",
    top: "10px",
    right: "10px",
    zIndex: "9999",
    padding: "10px 15px",
    background: "#ff4500",
    color: "white",
    border: "none",
    cursor: "pointer",
  });

  downloadBtn.addEventListener("click", () => {
    ipcRenderer.send("download-pdf");
  });

  document.body.appendChild(downloadBtn);
}

setInterval(addDownloadButton, 2000);
