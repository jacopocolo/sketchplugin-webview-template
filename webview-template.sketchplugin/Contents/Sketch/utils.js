
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
