const { app, BrowserWindow, ipcMain } = require('electron');
const { dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');  // for PDF manipulation

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'renderer.js')
        }
    });

    mainWindow.loadURL('https://manganato.info/');

    mainWindow.webContents.once('did-finish-load', () => {
        console.log("✅ Page fully loaded.");
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        mainWindow = new BrowserWindow({
            width: 1280,
            height: 800,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                preload: path.join(__dirname, 'renderer.js')
            }
        });
        mainWindow.loadURL('https://manganato.info/');
    }
});

// Utility function: remove first and last pages from a PDF buffer.
async function removeFirstAndLastPages(pdfBuffer) {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const totalPages = pdfDoc.getPageCount();
    if (totalPages <= 2) {
        console.log("PDF has 2 or fewer pages; not removing any pages.");
        return pdfBuffer;
    }
    // Remove the last page first, then the first page.
    pdfDoc.removePage(totalPages - 1);
    pdfDoc.removePage(0);
    return await pdfDoc.save();
}

// Handle PDF Download: print page to PDF, remove first and last pages, then prompt for saving.
ipcMain.on('download-pdf', async (event) => {
    console.log("📂 Download request received... Generating PDF in memory.");

    let pdfData;
    try {
        pdfData = await mainWindow.webContents.printToPDF({
            marginsType: 1,
            printBackground: true,
            pageSize: 'A4'
        });
    } catch (error) {
        console.error("❌ Error generating PDF:", error);
        return;
    }

    // Remove first and last pages from the generated PDF.
    try {
        pdfData = await removeFirstAndLastPages(pdfData);
        console.log("✅ Removed first and last pages from PDF.");
    } catch (error) {
        console.error("❌ Error removing pages from PDF:", error);
    }

    console.log("✅ PDF generated in memory. Opening Save Dialog.");

    const { filePath, canceled } = await dialog.showSaveDialog({
        title: 'Save PDF',
        defaultPath: path.join(app.getPath('downloads'), 'manga-page.pdf'),
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
    });

    // If the user cancels or no filePath is returned, save to the default location.
    let finalPath = filePath;
    if (canceled || !filePath) {
        finalPath = path.join(app.getPath('downloads'), 'manga-page.pdf');
        console.log("⚠️ No file selected. Saving PDF to default location:", finalPath);
    } else {
        console.log("✅ Saving PDF to:", finalPath);
    }

    fs.writeFile(finalPath, pdfData, (err) => {
        if (err) {
            console.error("❌ Error saving PDF:", err);
        } else {
            console.log("🎉 PDF saved successfully at:", finalPath);
        }
    });
});
