const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
let win;

function createWindow() {
    win = new BrowserWindow({
        icon: 'icon.ico',
        width: 700,
        height: 500,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        autoHideMenuBar: true,
    });

    win.loadFile('index.html');

    win.on('closed', () => {
        win = null;
    });
}



app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});



ipcMain.handle('open-file-dialog', async () => {
    const result = await dialog.showOpenDialog(win, {
        properties: ['openFile']
    });
    return result.filePaths;
});

ipcMain.handle('combine-files', async (event, file1, file2) => {
    try {
        const activity1 = fs.readFileSync(file1, 'utf-8');
        const activity2 = fs.readFileSync(file2, 'utf-8');
    
        const lignes1 = activity1.split('\n');
        const lignes2 = activity2.split('\n');
    
        // <Creator xsi:type
        const index1 = lignes1.findIndex(ligne => ligne.includes('<Creator xsi:type'));
        const part1 = index1 !== -1 ? lignes1.slice(0, index1) : lignes1;
    
        // <Lap StartTime 
        const index2 = lignes2.findIndex(ligne => ligne.includes('<Lap StartTime'));
        const part2 = index2 !== -1 ? lignes2.slice(index2) : [];
    
        const combinedContent = [
            ...part1,
            ...part2,
        ].join('\n');

        const { filePath, canceled } = await dialog.showSaveDialog(win, {
            title: 'Save your new activity',
            defaultPath: 'new_activity.tcx',
            filters: [{ name: 'tcx files', extensions: ['tcx'] }]
        });

        if (canceled || !filePath) {
            return null;
        }

        fs.writeFileSync(filePath, combinedContent);
        return filePath;

    } catch (error) {
        console.error("Error when creating the activity:", error);
        throw error;
    }
});

