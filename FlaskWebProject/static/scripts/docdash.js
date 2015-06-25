function write(myText) {
    document.getElementById("debug").innerHTML += "<BR>" + myText;
}

// constants

var MIN_POST_INTERVAL = 1000; // the minimum time between Post calls to the server

// objects

var clientid = null;

var displayedDocs = {};

var myDoc = {
    
    lastPostTime: null,
    isRecording: false,
    isDisplaying: false,
    recordingTimeout: null,
    displayingTimeout: null,
    
    //settings variables which should be saved in the document
    data: {
        docid: null,
        name: null,
        recordingPeriod: 15000, // 15 seconds
        displayPeriod: 15000,
        timeCreated: null,
        charcounts: [], // the array of counts and times
        stats: { // variables which will be sent ot the server     
            charcount: null // the latest count
        }
    },
    
    setName: function(myName){
        myDoc.data.name = myName;
    },

    loadStateFromFile: function(){
        // pull in data from the document, if any
        var result = false;
        if(Office.context.document.settings.get("data")){
            myDoc.data = Office.context.document.settings.get("data");

            // create a document identifier

            result = true;
        }
        return result;
    },
    
    saveStateToFile: function(){
        Office.context.document.settings.set("data", myDoc.data);
        Office.context.document.settings.saveAsync("data", myDoc.data);
    },
    
    startRecording: function(){
        var result = true;
        if (myDoc.isRecording) {
            // then you can't start it if it's already started
            result = false;
        }
        else{
            myDoc.isRecording = true;
            if (!myDoc.data.timeCreated) {
                // then this is the first time recording has ever happened in this doc
                var d = new Date();
                myDoc.data.timeCreated = d.getTime();
            }
            myDoc.recordNextStats();
        }
        return result;
    },
    
    recordNextStats: function(){
        // first load text
        var ctx = new Word.WordClientContext();
        ctx.customData = OfficeExtension.Constants.iterativeExecutor;
        var text = ctx.document.body.getText();
        ctx.load(text);

        ctx.executeAsync().then(
            function () {
                write("Document Text:" + text);
            },
            function (result) {
                write("Failed: ErrorCode=" + result.errorCode + ", ErrorMessage=" + result.errorMessage);
                write(result.traceMessages);
            }
        );

        //Office.context.document.getFileAsync("text", myDoc.gotFullText);
        
        // now trigger the next recording, if necessary
        if (myDoc.isRecording) {
            myDoc.recordingTimeout = setTimeout(
                myDoc.recordNextStats,
                myDoc.data.recordingPeriod
            );
        }
        
    },
    
    gotFullText: function(result){
        if (result.status == "succeeded") {
            var myFile = result.value;
            myFile.getSliceAsync(
                0,
                function(result2){
                    var d = new Date();
                    myDoc.data.stats.charcount = result2.value.data.length;
                    myDoc.data.charcounts.push([d.getDate(), myDoc.data.stats.charcount]);

                    // save the data in this doc as one of the docs
                    displayedDocs[myDoc.data.docid] = myDoc.data;

                    //send to server
                    post();
                }
            );

        }
        else{
            write("Error: " + result.error.message);
        }
        
        myDoc.saveStateToFile();
    },

    postCallback: function(result){
        myDoc.data.docid = result.docid;
        write("docid from server is: " + docid);
        if(typeof(Storage) !== "undefined" && !clientid) {
            localStorage.setItem("clientid",result.clientid);
            clientid = result.clientid;
        }
        else {
            write("Error: no local storage.");
        }


    },
    
    startDisplaying: function(){
        var result = true;
        if (myDoc.isDisplaying) {
            // then you can't start it if it's already started
            result = false;
        }
        else{
            myDoc.isDisplaying = true;
            myDoc.displayNextStats();
        }
        return result;
    },
    
    displayNextStats: function(){
        
        write("Characters: " + myDoc.data.stats.charcount);
        
        // now trigger the next recording, if necessary
        if (myDoc.isDisplaying) {
            myDoc.displayingTimeout = setTimeout(
                myDoc.displayNextStats,
                myDoc.data.displayPeriod
            );
        }
        
    },
    
};

function test() {
    var ctx = new Word.WordClientContext();
    var text = ctx.document.body.getText();
    ctx.load(text);

    ctx.executeAsync().then(
        function () {
            write("Document Text:" + text);
        },
        function (result) {
            write("Failed: ErrorCode=" + result.errorCode + ", ErrorMessage=" + result.errorMessage);
            write(result.traceMessages);
        }
    );
}

function mybuttonClick() {
    myDoc.startRecording();
    myDoc.startDisplaying();
}

function post() {
    var d = new Date();
    if (!myDoc.lastPostTime || d.getDate - myDoc.lastPostTime >= MIN_POST_INTERVAL) {
        // then enough time has passed that we can give more info to the server
        var mystats = JSON.stringify(myDoc.data.stats);

        $.ajax({
            type: "POST",
            url: "/api/put",
            data: {
                clientid: clientid,
                docid: myDoc.data.docid,
                stats: mystats
            },
            success: myDoc.postCallback,
        });
    }
   
}

function get() {
    var d = new Date();
    n = d.getDate();
    
    var docs = {
        123456789: {
            ismine: true,
            timesafter: n
        },
        987654321:{
            ismine: false,
            timesafter: n
        }

    };
    docs = JSON.stringify(docs);
    write(docs);

    $.ajax({
        type: "GET",
        url: "/api/get",
        data: {
            clientid:,
            docs: docs
        },
        success: getCallback,
    });
}

function getCallback(result){
    for(var id in result.docs){
        write(result.id.charcounts[0][1]);
    }
}

function loadClientid() {
    if (typeof (Storage) !== "undefined" && !clientid) {
        clientid = localStorage.getItem("clientid");
    }
    else {
        write("Error: no local storage.");
    }
}



Office.initialize = function (reason) {

    $(document).ready(function () {

        myDoc.setName("myDocument");
        loadClientid();
        myDoc.loadStateFromFile();

        document.body.innerHTML += "foomp";

    });
} 

