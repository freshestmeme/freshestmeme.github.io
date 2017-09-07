var t2c;
$.getScript("https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.3.6/socket.io.min.js", function () {
    $.getScript("https://tab2compute.george.moe/resources/tab2compute_client.js", function () {
        t2c = new Tab2ComputeClient("https://tab2compute.george.moe");
    });
});
