function write(myText) {
    document.body.innerHTML += "<BR>" + myText;
}


Office.initialize = function (reason) {

    

    $(document).ready(function () {

        $("#mybutton").click(function () {


            
            Office.context.document.setSelectedDataAsync("Hello World!",
                function (asyncResult) {
                    var error = asyncResult.error;
                    if (asyncResult.status === "failed") {
                        write(error.name + ": " + error.message);
                    }
                }
            );
            
        });

        document.body.innerHTML += "foom";
        
        Office.context.document.setSelectedDataAsync("Hello World!",
                function (asyncResult) {
                    var error = asyncResult.error;
                    if (asyncResult.status === "failed") {
                        write(error.name + ": " + error.message);
                    }
                    else{
                        write("success!");
                    }
                }
            );

    });
} 

