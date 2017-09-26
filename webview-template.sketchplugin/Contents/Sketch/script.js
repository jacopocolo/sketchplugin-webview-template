//Let's import the library that allows this
@import "MochaJSDelegate.js";

function onRun(context) {
  //You do what you want with the context, I expose these
  doc = context.document;
  selection = context.selection;
  page = [doc currentPage];
  view = [doc currentView];
  artboards = [[doc currentPage] artboards];

  var userDefaults = NSUserDefaults.standardUserDefaults();

	// create a window
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
    //Uncomment the next line to define the app bar color with an NSColor
    //webViewWindow.setBackgroundColor(NSColor.whiteColor());
    webViewWindow.standardWindowButton(NSWindowMiniaturizeButton).setHidden(true);
    webViewWindow.standardWindowButton(NSWindowZoomButton).setHidden(true);
    webViewWindow.setTitle(title);
    webViewWindow.setTitlebarAppearsTransparent(true);
    webViewWindow.becomeKeyWindow();
    webViewWindow.setLevel(NSFloatingWindowLevel);
    threadDictionary[identifier] = webViewWindow;
    COScript.currentCOScript().setShouldKeepAround_(true);

    // Add Web View to window
      var webView = WebView.alloc().initWithFrame(NSMakeRect(0, 0, windowWidth, windowHeight - 24));
      webView.setAutoresizingMask(NSViewWidthSizable|NSViewHeightSizable);
      var windowObject = webView.windowScriptObject();
      var delegate = new MochaJSDelegate({

          "webView:didFinishLoadForFrame:" : (function(webView, webFrame) {
              //We call this function when we know that the webview has finished loading
              var count = [artboards count];
              windowObject.evaluateWebScript("updateInput("+count+")");
          }),

          //To get commands from the webView we observe the location hash: if it changes, we do something
          "webView:didChangeLocationWithinPageForFrame:" : (function(webView, webFrame) {
              var locationHash = windowObject.evaluateWebScript("window.location.hash");

              //With a regular expression we check if the hash contains one of the strings we are sending from the UI
              //We can't use a simple == because we are also sending a timestamp from the UI to make sure
              //the hash update is registered by the plugin even if we are pressing the same button twice
              if (/#close/.test(locationHash)) {
                  //we perform whatever we want: in this case we perform some cleaning and close the window
                  threadDictionary.removeObjectForKey(identifier);
                  webViewWindow.close();

              } else if (/#update/.test(locationHash)) {
                //Or we can do something more interesting…

                //We force an context update to update what we are selecting
                //it may be useful for you or not according to what you are developing
                var count = updateContext();
                windowObject.evaluateWebScript("updateInput"+count+";");
              }

          })
      });

      webView.setFrameLoadDelegate_(delegate.getClassInstance());
      webView.setMainFrameURL_(context.plugin.urlForResourceNamed("ui.html").path());

      webViewWindow.contentView().addSubview(webView);
      webViewWindow.center();
      webViewWindow.makeKeyAndOrderFront(nil);

      // Close Window
      var closeButton = webViewWindow.standardWindowButton(NSWindowCloseButton);
      closeButton.setCOSJSTargetFunction(function(sender) {
          COScript.currentCOScript().setShouldKeepAround(false);
          threadDictionary.removeObjectForKey(identifier);
          webViewWindow.close();
      });
      closeButton.setAction("callAction:");
  };

  function getTitleFromHandler(handler) {
      for (var i = 0; i < swatches.length; i++) {
          if (swatches[i].handler == handler) {
              return swatches[i].title;
          }
      }
  }

  //Update the context as needed
  function updateContext() {
      var doc = NSDocumentController.sharedDocumentController().currentDocument();
      var artboards = doc.currentPage().artboards();
      return [artboards count]

      //Use the following code if you need to update the current selection
      // if (MSApplicationMetadata.metadata().appVersion > 41.2) {
      //     var selection = doc.selectedLayers().layers();
      // } else {
      //     var selection = doc.selectedLayers();
      // }
};
