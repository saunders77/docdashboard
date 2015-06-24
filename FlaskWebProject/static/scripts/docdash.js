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
        recordingPeriod: 15000, // 15 seconds
        displayPeriod: 15000,
        stats: {
            timeCreated: null,        
            charCounts: [], // the array of counts and times
            charCount: null // the latest count
            
            
        }
    },
    
    loadStateFromFile: function(){
        // pull in data from the document, if any
        var result = false;
        if(Office.context.document.settings.get("data")){
            myDoc.data = Office.context.document.settings.get("data");
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
            if (!myDoc.data.stats.timeCreated) {
                // then this is the first time recording has ever happened in this doc
                var d = new Date();
                myDoc.data.stats.timeCreated = d.getTime();
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

Office.initialize = function (reason) {

    $(document).ready(function () {


        document.body.innerHTML += "foomp";

        

    });
} 

