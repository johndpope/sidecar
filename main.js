var app = require('app');  // Electron app
var BrowserWindow = require('browser-window');  // Creating Browser Windows

var IOPubSession = require("./lib/session.js").IOPubSession;

// Parse out a kernel-####.json argument
var argv = require('minimist')(process.argv.slice(2));
var connFile = argv._[0];
var config = require(connFile);

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the side car window object
// If we don't, the window will be closed automatically when the javascript
// object is GCed.
var sideCar = null;
var session = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // Fully close up, even on OS X
  app.quit();
});


// This method will be called when Electron has done every
// initialization and is ready for creating browser windows.
app.on('ready', function() {
  // Create the browser window.
  sideCar = new BrowserWindow({
    width: 800,
    height: 800
    //frame: false
  });

  // and load the index.html of the app.
  sideCar.loadUrl('file://' + __dirname + '/index.html');
  
  sideCar.webContents.on('did-finish-load', function() {
    session = IOPubSession(config, function(msg){
      // Get display data if available
      if("content" in msg && "data" in msg.content) {
        var data = msg.content.data;
        
        var display = null;
        
        
        if("text/html" in data){
          display = data["text/html"];
        } else if ("image/png" in data) {
          display = "<img src='data:image/png;base64," + data["image/png"] + "'/>";
        } else if ("text/plain" in data) {
          display = data["text/plain"];
        } 
        
        if (display !== null){
          sideCar.webContents.send('display', display);
        }
        
        
      }
      
    });
  });
  
  // Emitted when the window is closed.
  sideCar.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    sideCar = null;
  });
});
