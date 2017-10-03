
//Update the context as needed
function updateContext() {
    var doc = NSDocumentController.sharedDocumentController().currentDocument();

    return {
        document: doc
    }
}

function getTitleFromHandler(handler) {
    for (var i = 0; i < swatches.length; i++) {
        if (swatches[i].handler == handler) {
            return swatches[i].title;
        }
    }
}

function parseHashBangArgs(aURL) {
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
