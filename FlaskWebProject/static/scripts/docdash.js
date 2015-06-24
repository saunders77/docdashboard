function write(myText) {
    document.body.innerHTML += "<BR>" + myText;
}

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


Office.initialize = function (reason) {

    

    $(document).ready(function () {

        $("#mybutton").click(function () {

            test();
            
            
            
        });

        document.body.innerHTML += "foomy";
        
        test();

    });
} 

