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
            this.data = Office.context.document.settings.get("data");
            result = true;
        }
        return result;
    },
    
    saveStateToFile: function(){
        Office.context.document.settings.set("data",this.data);
        Office.context.document.settings.saveAsync("data",this.data);
    },
    
    startRecording: function(){
        //write("started recording");
        var result = true;
        if (this.isRecording) {
            // then you can't start it if it's already started
            result = false;
        }
        else{
            //write("hasn't started yet");
            this.isRecording = true;
            //write("hasn't started yet2");
            if (!this.data.stats.timeCreated) {
                // then this is the first time recording has ever happened in this doc
                var d = new Date();
                this.data.stats.timeCreated = d.getTime();
            }
            //write("hasn't started yet3");
            this.recordNextStats();
        }
        return result;
    },
    
    recordNextStats: function(){
        write("recording next stats");
        Office.context.document.getFileAsync("text",this.gotFullText);
        
        // now trigger the next recording, if necessary
        if (this.isRecording) {
            this.recordingTimeout = setTimeout(
                recordNextStats,
                this.data.recordingPeriod
            );
        }
        
    },
    
    gotFullText: function(result){
        write("returned from getting text");
        if (result.status == "succeeded") {
            var d = new Date();
            write("length: " + result.value.length);
            this.data.stats.charCount = result.value.length;
            this.data.stats.charCounts.push([d.getDate(),this.data.stats.charCount]);
        }
        else{
            write("Error:", result.error.message);
        }
        
        this.saveStateToFile();
    },
    
    startDisplaying: function(){
        var result = true;
        write("start?  displaying");
        if (this.isDisplaying) {
            // then you can't start it if it's already started
            result = false;
        }
        else{
            write("yes, we can start displaying");
            this.isDisplaying = true;
            this.displayNextStats();
        }
        return result;
    },
    
    displayNextStats: function(){
        
        write("Characters: " + this.data.stats.charCount);
        
        // now trigger the next recording, if necessary
        if (this.isDisplaying) {
            this.displayingTimeout = setTimeout(
                displayNextStats,
                this.data.displayingPeriod
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

