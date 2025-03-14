const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs");
const path = require("path");

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, "renderer.js"),
    },
  });
  mainWindow.loadURL("https://manganato.info/");
  mainWindow.on("closed", () => (mainWindow = null));
};

app.whenReady().then(() => {
  createWindow();
  mainWindow.webContents.once("did-finish-load", () => {
    console.log("✅ Page loaded.");
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (!mainWindow) createWindow();
});

ipcMain.on("download-pdf", async () => {
  let pdfData;
  try {
    pdfData = await mainWindow.webContents.printToPDF({
      marginsType: 1,
      printBackground: true,
      pageSize: "A4",
    });
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    return;
  }

  // Get the page title  and chapter
  const pageTitle = mainWindow.getTitle().toLowerCase();
  console.log("Page title:", pageTitle);

  const chapterRegex = /chapter\s*([\d]+)/i;
  let mangaName = "";
  let chapterName = "";
  const match = pageTitle.match(chapterRegex);
  if (match) {
    mangaName = pageTitle.substring(0, match.index).trim();
    chapterName = "ch" + match[1].trim();
  } else {
    mangaName = pageTitle.trim();
    chapterName = "";
  }

  // Name sanitization
  const safeMangaName = mangaName
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  let fileName = "";
  if (chapterName) {
    const safeChapterName = chapterName
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    fileName = `[MangaVerse] ${safeMangaName}-${safeChapterName}.pdf`;
  } else {
    fileName = `[MangaVerse] ${safeMangaName}.pdf`;
  }

  const { filePath, canceled } = await dialog.showSaveDialog({
    title: "Save PDF",
    defaultPath: path.join(app.getPath("downloads"), fileName),
    filters: [{ name: "PDF Files", extensions: ["pdf"] }],
  });

  const finalPath =
    canceled || !filePath
      ? path.join(app.getPath("downloads"), fileName)
      : filePath;

  fs.writeFile(finalPath, pdfData, (err) => {
    if (err) console.error("❌ Error saving PDF:", err);
    else console.log("🎉 PDF saved at:", finalPath);
  });
});
