const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    openFile: () => ipcRenderer.invoke('open-file-dialog'),
    combineFiles: (file1, file2) => ipcRenderer.invoke('combine-files', file1, file2)
});
