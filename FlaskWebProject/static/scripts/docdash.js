﻿function write(myText) {
    document.getElementById("debug").innerHTML += "<BR>" + myText;
}

// constants

var MIN_POST_INTERVAL = 1000; // the minimum time between Post calls to the server

// objects

var clientid = null;

var displayedDocsData = {};

function DisplayDocData() {
    this.name = null;
    this.charcounts = [];
    this.timeCreated = null;
}

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
        recordingPeriod: 5100, // 5 seconds
        displayPeriod: 4900,
        displayedDocsIds: [],
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
        Office.context.document.settings.saveAsync();
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
                myDoc.data.timeCreated = d;
            }
            myDoc.recordNextStats();
        }
        return result;
    },
    
    recordNextStats: function(){
        // first load text

        /* failed attempt at using new APIs. 3 hrs. damn.
        var ctx = new Word.WordClientContext();
        ctx.customData = OfficeExtension.Constants.iterativeExecutor;
        var text = ctx.document.body.text;
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
        */
        Office.context.document.getFileAsync("text", myDoc.gotFullText);
        
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
                    myDoc.data.stats.charcount = result2.value.data.length - 3;
                    // for some reason an empty doc returns 3
                    myDoc.data.charcounts.push([d, myDoc.data.stats.charcount]);

                    // save the data in this doc as one of the docs
                    displayedDocsData[myDoc.data.docid] = myDoc.data;

                    //send to server
                    post();

                    myFile.closeAsync(function (result) {
                        if (result.status == "succeeded") {
                            // file closed successfully
                        }
                    });
                }
            );

        }
        else{
            write("Error: " + result.error.message);
        }
        
        
    },

    postCallback: function(result){


        myDoc.data.docid = result.docid;
        //write("docid from server is: " + myDoc.data.docid);
        if(typeof(Storage) !== "undefined" && !clientid) {
            localStorage.setItem("clientid",result.clientid);
            clientid = result.clientid;
        }
        else {
            //write("Error: no local storage.");
        }

        myDoc.saveStateToFile();
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
        //get updates values from the server
        write("about to get updates");
        get();

        // now trigger the next recording, if necessary
        if (myDoc.isDisplaying) {
            myDoc.displayingTimeout = setTimeout(
                myDoc.displayNextStats,
                myDoc.data.displayPeriod
            );
        }
        
    },

    getCallback: function (result) {
        write("receiving " + JSON.stringify(result));

        for (var idKey in result.docs) {
            if (idKey == myDoc.data.docid) {
                fillMissingData(result.docs[idKey].charcounts,myDoc.data.charcounts);
            }
            else {
                
                if (!displayedDocsData[idKey]) {
                    displayedDocsData[idKey] = new DisplayDocData();
                    if (!document.getElementById(idKey)) {
                        document.body.innerHTML += "<div class='friendstats'><span class='statsTitle'>Friend: </span><span class='smalltext'>" + idKey + "</span><br /><span>Characters: <span class='statsTitle' id='" + idKey + "'>0</span></span></div>";

                    }
                } 
                //fillMissingData(result.docs[idKey].charcounts, displayedDocsData[idKey].charcounts);
                displayedDocsData[idKey]["charcounts"] = result.docs[idKey].charcounts;
            }
        }

        updateVisualization();

    }
    
};

function updateVisualization() {
    // mayank's hook

    document.getElementById("myDocId").innerHTML = myDoc.data.docid;
    document.getElementById("docstats").style.visibility = "visible";
    document.getElementById("enterDoc").style.visibility = "visible";
    document.getElementById("addDoc").style.visibility = "visible";
    document.getElementById("myChars").innerHTML = myDoc.data.charcounts[myDoc.data.charcounts.length - 1][1];
    for (var i = 0; i < myDoc.data.displayedDocsIds.length; ++i) {
        if (myDoc.data.docid != myDoc.data.displayedDocsIds[i]) {
            var id = myDoc.data.displayedDocsIds[i];
            if (displayedDocsData[id] && displayedDocsData[id].charcounts.length && document.getElementById(id)) {
                document.getElementById(id).innerHTML = displayedDocsData[id].charcounts[displayedDocsData[id].charcounts.length - 1][1];
            }
        }
    }


    var data = {};
    data[myDoc.data.docid] = {
        charcounts: myDoc.data.charcounts,
        isMine: true
    };

    for (var i = 0; i < myDoc.data.displayedDocsIds.length; ++i) {
        data[myDoc.data.displayedDocsIds[i]] = {
            charcounts: displayedDocsData[myDoc.data.displayedDocsIds[i]].charcounts
        };
    }

    drawChart(data);

    /*

    // first, this doc
    document.getElementById("displayList").innerHTML = "<li>myDoc " + myDoc.data.docid.substring(0,6) + " chars: " + myDoc.data.charcounts[myDoc.data.charcounts.length - 1][1] + "</li>";

    // then, other docs
    for (var i = 0; i < myDoc.data.displayedDocsIds.length; i++) {
        var id = myDoc.data.displayedDocsIds[i];
        document.getElementById("displayList").innerHTML += "<li>o Doc" + id.substring(0, 6) + " chars: " + displayedDocsData[id].charcounts[displayedDocsData[id].charcounts.length - 1][1] + "</li>";
    }
    */

}

function fillMissingData(serverDateArray, localDateArray) {
    // the localDataArray could have older data than what the serverDateArray has, but there could be overlapping data
    // so we need to take the union of both for the localDateArray
    // they're both ordered

    for (var i = 0; i < serverDateArray.length; i++) {
        // is this date after all the client ones?
        if (!localDateArray.length || Date.parse(serverDateArray[i][0]) > Date.parse(localDateArray[localDateArray.length - 1][0])) {
            localDateArray.push(serverDateArray[i]);
        }
    }

}


function test() {
    var ctx = new Word.WordClientContext();
    var text = ctx.document.body.text;
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
    document.getElementById("mybutton").style.backgroundColor = "rgb(99,99,99)";
}

function post() {
    

    var d = new Date();
    if (!myDoc.lastPostTime || d - myDoc.lastPostTime >= MIN_POST_INTERVAL) {
        // then enough time has passed that we can give more info to the server
        var mystats = JSON.stringify(myDoc.data.stats);

        write("sending " + mystats);

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
    if(!myDoc.data.docid){
        return;
    }
    
    var docs = {};

    var myTimesAfter = null;
    if (myDoc.data.charcounts.length) {
        myTimesAfter = myDoc.data.charcounts[myDoc.data.charcounts.length - 1][0];
    }
    
    docs[myDoc.data.docid] = {
        ismine: true,
        timesafter: myTimesAfter
    }

    // now add all the other necessary documents to docs
    for (var i = 0; i < myDoc.data.displayedDocsIds.length; i++)
    {
        if (myDoc.data.displayedDocsIds[i] != myDoc.data.docid) {
            var timesAfter = null;
            if(displayedDocsData[myDoc.data.displayedDocsIds[i]] && displayedDocsData[myDoc.data.displayedDocsIds[i]].charcounts.length){
                timesAfter = displayedDocsData[myDoc.data.displayedDocsIds[i]].charcounts[displayedDocsData[myDoc.data.displayedDocsIds[i]].charcounts.length - 1][0];
            }

            docs[myDoc.data.displayedDocsIds[i]] = {
                ismine: false,
                timesafter: timesAfter
            };
        }
    }

    docs = JSON.stringify(docs);
    write("will show docs:");
    write(docs);

    $.ajax({
        type: "GET",
        url: "/api/get",
        data: {
            clientid: clientid,
            docs: docs
        },
        success: myDoc.getCallback,
    });
}

function loadClientid() {
    if (typeof (Storage) !== "undefined" && !clientid) {
        clientid = localStorage.getItem("clientid");
    }
    else {
        write("Error: no local storage.");
    }
}

function addDoc() {
    var newDocIdValue = document.getElementById("enterDoc").value
    myDoc.data.displayedDocsIds.push(newDocIdValue);
    document.body.innerHTML += "<div class='friendstats'><span class='statsTitle'>Friend: </span><span class='smalltext'>" + newDocIdValue + "</span><br /><span>Characters: <span class='statsTitle' id='" + newDocIdValue + "'>0</span></span></div>";
}



Office.initialize = function (reason) {

    $(document).ready(function () {

        myDoc.setName("myDocument");
        loadClientid();
        myDoc.loadStateFromFile();

    });
} 

