
NicoJS = require('nicoJS');
const { ipcRenderer } = require('electron');
const emoji = require('node-emoji');


var nico = new NicoJS({
    app: document.getElementById('app'),
    width: window.innerWidth,
    height: window.innerHeight,
    font_size: 50,     // opt
    color: '#fff'  // opt
});


// コメント待機
nico.listen();

// コメント送信
// nico.loop(['Hello World.']);

ipcRenderer.on('slackContent', (event, arg) => {
    console.log(arg) // "pong"を表示

    nico.send(emoji.emojify(arg));
});
