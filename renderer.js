const { ipcRenderer } = require('electron');

function addDownloadButton() {
    // Avoid duplicate buttons.
    if (document.getElementById('downloadPdfBtn')) return;

    // Create the button element.
    const downloadBtn = document.createElement('button');
    downloadBtn.id = 'downloadPdfBtn';
    downloadBtn.innerText = 'Download as PDF';
    downloadBtn.style.position = 'fixed';
    downloadBtn.style.top = '10px';
    downloadBtn.style.right = '10px';
    downloadBtn.style.zIndex = '9999';
    downloadBtn.style.padding = '10px 15px';
    downloadBtn.style.background = '#ff4500';
    downloadBtn.style.color = 'white';
    downloadBtn.style.border = 'none';
    downloadBtn.style.cursor = 'pointer';

    // When clicked, send an IPC message to the main process.
    downloadBtn.addEventListener('click', () => {
        console.log("Download button clicked! Sending event to main process.");
        ipcRenderer.send('download-pdf');
    });

    // Append the button to the document body.
    document.body.appendChild(downloadBtn);
}

// Re-inject the button every 2 seconds in case the page reloads or its content is dynamically updated.
setInterval(addDownloadButton, 2000);
