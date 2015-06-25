function drawChart(data) {
    var series = [];
    for (docid in data) {
        series.push({
            type: "line",
            name: docid,
            data: parseCharcounts(data[docid].charcounts)
        });
    }
    $("#chartContainer").highcharts("StockChart", {
        series: series
    });
}

//var data = JSON.parse("[[\"2015-06-25T20:55:30.911Z\",3],[\"2015-06-25T20:55:35.845Z\",14],[\"2015-06-25T20:56:00.646Z\",29],[\"2015-06-25T20:56:05.658Z\",29],[\"2015-06-25T20:56:10.640Z\",29],[\"2015-06-25T20:56:15.659Z\",29],[1435265776000,29],[\"2015-06-25T20:57:21.846Z\",29],[\"2015-06-25T20:57:24.381Z\",51],[\"2015-06-25T20:57:29.360Z\",99],[\"2015-06-25T20:57:34.364Z\",114]]");
//data = {
//    "somedocid": {
//        "charcounts": data
//    }
//};
//$(document).ready(function () { drawChart(data); });