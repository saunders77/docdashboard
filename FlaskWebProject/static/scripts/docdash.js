function write(myText) {
    document.getElementById("debug").innerHTML += "<BR>" + myText;
}

// classes

var myDoc = {
    
    isRecording: false,
    isDisplaying: false,
    recordingTimeout: null,
    displayingTimeout: null,
    
    //settings variables which should be saved in the document
    data: {
        id: null,
        recordingPeriod: 15000, // 15 seconds
        displayPeriod: 15000,
        timeCreated: null,    
        stats: {

            charCounts: [], // the array of counts and times
            charCount: null // the latest count
            
            
        }
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
        //write("started recording");
        var result = true;
        if (myDoc.isRecording) {
            // then you can't start it if it's already started
            result = false;
        }
        else{
            //write("hasn't started yet");
            myDoc.isRecording = true;
            //write("hasn't started yet2");
            if (!myDoc.data.timeCreated) {
                // then this is the first time recording has ever happened in this doc
                var d = new Date();
                myDoc.data.timeCreated = d.getTime();
            }
            //write("hasn't started yet3");
            myDoc.recordNextStats();
        }
        return result;
    },
    
    recordNextStats: function(){
        write("recording next stats");
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
        write("returned from getting text");
        if (result.status == "succeeded") {
            var d = new Date();
            write("length: " + result.value.length);
            myDoc.data.stats.charCount = result.value.length;
            myDoc.data.stats.charCounts.push([d.getDate(), myDoc.data.stats.charCount]);
        }
        else{
            write("Error:", result.error.message);
        }
        
        myDoc.saveStateToFile();
    },
    
    startDisplaying: function(){
        var result = true;
        write("start?  displaying");
        if (myDoc.isDisplaying) {
            // then you can't start it if it's already started
            result = false;
        }
        else{
            write("yes, we can start displaying");
            myDoc.isDisplaying = true;
            myDoc.displayNextStats();
        }
        return result;
    },
    
    displayNextStats: function(){
        
        write("Characters: " + myDoc.data.stats.charCount);
        
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
    Office.context.document.setSelectedDataAsync("Hello World!",
                function (asyncResult) {
                    var error = asyncResult.error;
                    if (asyncResult.status === "failed") {
                        write(error.name + ": " + error.message);
                    }
                }
            );
}

function mybuttonClick() {
    myDoc.startRecording();
    myDoc.startDisplaying();
}

function post() {
    var stats = {
        charcounts: [],
        charcount: null
    };

    stats = JSON.stringify(stats);

    $.ajax({
        type: "POST",
        url: "/api/put",
        data: {
            clientid: null,
            docid: null,
            stats: stats
        },
        success: postCallback,
    });
}

function postCallback(result){
    write("docid from Post is: " + JSON.parse(result).docid);
}

Office.initialize = function (reason) {

    $(document).ready(function () {


        document.body.innerHTML += "foomp";

        

    });
} 

