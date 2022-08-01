const {contextBridge} = require('electron')
const Vue = require('vue/dist/vue.js')
const _ = require('lodash')
const {ipcRenderer} = require('electron')
const emoji = require('node-emoji')

contextBridge.exposeInMainWorld('lodashObj', _)
contextBridge.exposeInMainWorld('ipcRendererObj', ipcRenderer)
contextBridge.exposeInMainWorld('emojiObj', emoji)
contextBridge.exposeInMainWorld('electronAPI', {
        emojiInitialize: (callback) => ipcRenderer.on('emojiInitialize', callback),
        slackContent: (callback) => ipcRenderer.on('slackContent', callback),
    }
)
