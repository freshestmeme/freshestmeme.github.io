var t2c;
$.getScript("https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.3.6/socket.io.min.js", function () {
    $.getScript("http://localhost:8080/resources/tab2compute_client.js", function () {
        t2c = new Tab2ComputeClient("http://localhost:5000");
    });
});