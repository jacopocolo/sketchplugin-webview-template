//Let's import the library that allows us to talk with the UI
@import "MochaJSDelegate.js";

// let's get a hold on the Sketch API
const sketch = require('sketch')
//let's expose these globally
var document;
var page;

//the main function we run when we execute the plugin. It creates the webview and hooks
function onRun(context) {
  document = sketch.fromNative(context.document)
  page = document.selectedPage;

  var userDefaults = NSUserDefaults.standardUserDefaults();

	// Create a window
  var title = "webview-template";
  var identifier = "com.jacopocolo.webviewtemplate";
  var threadDictionary = NSThread.mainThread().threadDictionary();

  if (threadDictionary[identifier]) {
        return;
  }

  var windowWidth = 600,
        windowHeight = 450;
    var webViewWindow = NSPanel.alloc().init();
    webViewWindow.setFrame_display(NSMakeRect(0, 0, windowWidth, windowHeight), true);
    webViewWindow.setStyleMask(NSTexturedBackgroundWindowMask | NSTitledWindowMask | NSClosableWindowMask | NSResizableWindowMask);

    //Uncomment the following line to define the app bar color with an NSColor
    //webViewWindow.setBackgroundColor(NSColor.whiteColor());
    webViewWindow.standardWindowButton(NSWindowMiniaturizeButton).setHidden(true);
    webViewWindow.standardWindowButton(NSWindowZoomButton).setHidden(true);
    webViewWindow.setTitle(title);
    webViewWindow.setTitlebarAppearsTransparent(true);
    webViewWindow.becomeKeyWindow();
    webViewWindow.setLevel(NSFloatingWindowLevel);
    threadDictionary[identifier] = webViewWindow;
    COScript.currentCOScript().setShouldKeepAround_(true);

    //Add Web View to window
      var webView = WebView.alloc().initWithFrame(NSMakeRect(0, 0, windowWidth, windowHeight - 24));
      webView.setAutoresizingMask(NSViewWidthSizable|NSViewHeightSizable);
      var windowObject = webView.windowScriptObject();
      var delegate = new MochaJSDelegate({

          "webView:didFinishLoadForFrame:" : (function(webView, webFrame) {
              //We call this function when we know that the webview has finished loading
              //It's a function in the UI and we run it with a return coming from the artboardCount
              windowObject.evaluateWebScript("updateInput("+artboardsCount()+")");
          }),

          //To get commands from the webView we observe the location hash: if it changes, we do something
          "webView:didChangeLocationWithinPageForFrame:" : (function(webView, webFrame) {
              var locationHash = windowObject.evaluateWebScript("window.location.hash");
              //The hash object exposes commands and parameters
              //In example, if you send updateHash('add','artboardName','Mark')
              //You’ll be able to use hash.artboardName to return 'Mark'
              var hash = parseHash(locationHash);
              //We parse the location hash and check for the command we are sending from the UI
              //If the command exist we run the following code
              if (hash.hasOwnProperty('update')) {
                //In example updating the artboard count based on the current contex.
                //The evaluateWebScript function allows us to call a function from the UI.html with parameters
                //coming from Sketch
                windowObject.evaluateWebScript("updateInput("+artboardsCount()+");");

              } else if (hash.hasOwnProperty('addArtboard')) {
                //If you are sending arguments from the UI
                //You can simply grab them from the hash object
                var artboardName = hash.artboardName;
                //And then use them in your functions: in example adding an artboard
                const layer = new sketch.Artboard({
                parent: page,
                name: artboardName,
                });

              } else if (hash.hasOwnProperty('close')) {
                //We can also call commands on the window itself, like closing the window
                //This can be run aftr other commands, obviously
                threadDictionary.removeObjectForKey(identifier);
                webViewWindow.close();
              }

          })
      });

      webView.setFrameLoadDelegate_(delegate.getClassInstance());
      webView.setMainFrameURL_(context.plugin.urlForResourceNamed("ui.html").path());
      webViewWindow.contentView().addSubview(webView);
      webViewWindow.center();
      webViewWindow.makeKeyAndOrderFront(nil);
      // Define the close window behaviour on the standard red traffic light button
      var closeButton = webViewWindow.standardWindowButton(NSWindowCloseButton);
      closeButton.setCOSJSTargetFunction(function(sender) {
          COScript.currentCOScript().setShouldKeepAround(false);
          threadDictionary.removeObjectForKey(identifier);
          webViewWindow.close();
      });
      closeButton.setAction("callAction:");
  };

  //A couple of functions used in the plugin:
  //A function to count the number of artboards in the page
  function artboardsCount() {
    var artboardCount = 0;
      for (x=0;x<page.layers.length;x++) {
        if (page.layers[x].type == 'Artboard') {
          artboardCount = artboardCount+1;
        }
      }
      return artboardCount;
  }

  //A function to parse the hash we get back from the webview
  function parseHash(aURL) {
  	aURL = aURL;
  	var vars = {};
  	var hashes = aURL.slice(aURL.indexOf('#') + 1).split('&');

      for(var i = 0; i < hashes.length; i++) {
         var hash = hashes[i].split('=');

         if(hash.length > 1) {
      	   vars[hash[0].toString()] = hash[1];
         } else {
       	  vars[hash[0].toString()] = null;
         }
      }

      return vars;
  }

//The whole function above is run here
onRun(context);
