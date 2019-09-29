"use strict"

const electron = require('electron');
const { app, BrowserWindow, ipcMain } = electron;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let invisibleWindow, mainWindow;

function createWindow() {
  // Create the browser window.

  // 画面サイズを取得
  const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;

  invisibleWindow = new BrowserWindow({
    width,
    height,
    frame: false, //　ウィンドウフレーム非表示
    transparent: true,  //背景を透明に
    alwaysOnTop: true,  //常に最前面
    hasShadow: false
  });

  // 透明な部分のマウスのクリックを検知させない
  invisibleWindow.setIgnoreMouseEvents(true);

  invisibleWindow.loadFile('invisible.html');

  // Emitted when the window is closed.
  invisibleWindow.on('closed', function () {
    invisibleWindow = null;
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (invisibleWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.



// 透明画面にメッセージを送る
function sendToRendererContent(slackText) {
  // mainWindow.webContents.on('did-finish-load', () => {
  // レンダラー側のonが実行される前に送るとエラーで落ちるので注意
  invisibleWindow.webContents.send('slackContent', slackText)
  // });
}; 



//// Slack Outgoing Web Hook
const { RTMClient } = require('@slack/client');
const token = require('./account.json').token;

const rtm = new RTMClient(token, { logLevel: 'debug' });

rtm.start();

rtm.on('message', (event) => {
  // For structure of `event`, see https://api.slack.com/events/message

  let message = event;
  // Skip messages that are from a bot or my own user ID
  // if ((message.subtype && message.subtype === 'bot_message') ||
  //     (!message.subtype && message.user === rtm.activeUserId)) {
  //     return;
  // }

  // Log the message
  if (!message.text) {
    return;
  }
  const messageText = message.text.replace(/<.*>\s/, '');
  console.log(`(channel:${message.channel}) ${message.user} says: ${message.text}`);
  sendToRendererContent(messageText);
});

