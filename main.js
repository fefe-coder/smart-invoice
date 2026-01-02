const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "SmartInvoice Offline",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Povolenie načítania lokálnych zdrojov
      allowRunningInsecureContent: true
    }
  });

  // --- SPUSTENIE BACKENDU ---
  try {
    // Používame path.join pre správne cesty na Macu aj Windowse
    require(path.join(__dirname, 'smart-invoice/src/server.js'));
    console.log("Backend server úspešne inicializovaný.");
  } catch (err) {
    console.error("Kritická chyba pri spúšťaní backendu:", err);
  }

  // --- NAČÍTANIE FRONTENDU ---
  const isDev = !app.isPackaged;

  if (isDev) {
    // Počas vývoja (npm run dev na porte 5173 alebo 3000)
    mainWindow.loadURL('http://localhost:5173');
  } else {
    // V ZABALENEJ APLIKÁCII (.exe / .app)
    // Cesta musí presne zodpovedať štruktúre tvojho projektu
const indexPath = path.join(__dirname, 'smart-invoice-web/dist/index.html');
mainWindow.loadFile(indexPath);
    
    mainWindow.loadFile(indexPath).catch(err => {
      console.error("Nepodarilo sa načítať index.html:", err);
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});