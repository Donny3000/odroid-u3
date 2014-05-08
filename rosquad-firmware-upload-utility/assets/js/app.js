var dropbox     = $("#dropbox");
var form        = $("#form-upload");
var progress    = $("#progress");
var results     = $("#results");
var actions     = $("#actions");
var msgbox      = $("#msgbox");
var fileinput   = $("#file-input");
var progressBar = document.querySelector(".bar");
var reader;
var fileName;

function show_page() {
    "use strict";

    form.hide();
    progress.hide();
    results.hide();
    actions.hide();
    msgbox.hide();

    for (var i = 0; i < arguments.length; i++)
        arguments[i].show();
}

// Open file dialog 
$("#select-btn").click(function (e) {
    "use strict";
    
    e.preventDefault();
    fileinput.click();
});

// Restart face detection
$("#restart-btn").bind("click", function (e) {
    "use strict";
    
    e.preventDefault();
    show_page(form);
});

function show_message(msg, success) {
	msgbox
		.removeClass("alert-error")
		.removeClass("alert-success")
		.addClass(success ? "alert-success" : "alert-error")
		.find("p").text(msg).end()
		.show();
}

function setupReader() {
    reader = new FileReader();
    
    reader.onerror     = errorHandler;
    reader.onprogress  = updateProgress;
    reader.onabort     = function ( e ) {
        show_message("Upload cancelled", true);
    };
    reader.onloadstart = function ( e ) {
        // Show the progress bar before the reading occurrs
        show_page( progress );
    };
    reader.onload      = function( e ) {
        // TODO: Send the binary to the PHP script
        var xhr = new XMLHttpRequest();

        if ( !xhr.upload ) {
            show_message("Your browser does not support XMLHttpRequest.upload. Please upgrade your browser.", false);
            return;
        }

        xhr.onreadystatechange = function(e) {
            if (xhr.readyState == 4 && xhr.status == 200) {
                parse_response( xhr.response );
            }
        }

        // method: POST | action: uploader.php
        xhr.open(form.attr("method"), form.attr("action"), true);
        xhr.setRequestHeader("X_FILENAME", fileName);
        xhr.send( e.target.result );
        
        // Ensure that the progress bar displays 100% at the end.
        progressBar.style.width = '100%';
        progressBar.textContent = '100%';
        setTimeout("progress.hide();", 2000);
    };
}

function abortRead() {
    reader.abort();
}

function errorHandler(evt) {
    switch( evt.target.error.code ) {
        case evt.target.error.NOT_FOUND_ERR:
            show_message('File Not Found!', false);
            break;
            
        case evt.target.error.NOT_READABLE_ERR:
            show_message('File is not readable', false);
            break;
            
        case evt.target.error.ABORT_ERR:
            break; // noop
            
        default:
            show_message('An error occurred reading this file.', false);
    };
}

function init() {
	dropbox.bind("dragover",  fileDragHover);
	dropbox.bind("dragleave", fileDragHover);
	dropbox.bind("drop",      fileSelectHandler);
	fileinput.bind("change",  fileSelectHandler);
}

function updateProgress ( evt ) {
    // evt is an ProgressEvent.
    if ( evt.lengthComputable ) {
        var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
        // Increase the progress bar length.
        if (percentLoaded < 100) {
            progressBar.style.width = percentLoaded + '%';
            progressBar.textContent = percentLoaded + '%';
        }
    }
}

function fileDragHover( e ) {
	e.stopPropagation();
	e.preventDefault();
	dropbox.removeClass("hover").addClass(e.type == "dragover" ? "hover" : "");
}

function fileSelectHandler( e ) {
	fileDragHover( e );
    
    // Reset progress indicator on new file selection.
    progressBar.style.width = '0%';
    progressBar.textContent = '0%';
    
	var files = e.originalEvent.target.files || e.originalEvent.dataTransfer.files;
	var file = files[0];
    fileName = file.name;
    
    if(file.size > 1000000) {
        show_message("Maximum file size is 1 MB!", false);
        return;
    }
    
    // Setup the reader callbacks
    setupReader();
    
    // Read the HEX binary as a binary string
    reader.readAsArrayBuffer( file );
}

function parse_response( res ) {
	var data = jQuery.parseJSON( res );

	if (data.success == false) {
		show_page( form );
		show_message(data.msg, data.success);
		return;
	}
    
    results.find(".detected-faces").html("").append("<p>Upload Success!</p>");
    show_page(results, actions);
    show_message(data.msg, data.success);
}

if(window.File && window.FileList && window.FileReader && window.Blob) {
	init();
} else {
    show_message("The File APIs are not supported in this browser.", false);
}
