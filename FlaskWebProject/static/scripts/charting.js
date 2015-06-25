var chart = null;

function drawChart(data) {
    var series = [];
    for (docid in data) {
        series.push({
            type: "line",
            name: docid,
            id: docid,
            data: parseCharcountsForCharting(data[docid].charcounts)
        });
    }

    if (!chart) {
        chart = new Highcharts.StockChart({
            chart: {
                renderTo: 'chartContainer'
            },
            series: series
        });
    } else {
        for (var i = 0; i < series.length; ++i) {
            chart.get(series[i].id).setData(series[i].data);
        }
    }
}

function parseCharcountsForCharting(charcounts) {
    for (var i = 0; i < charcounts.length; ++i) {
        if (typeof charcounts[i][0] === "string") {
            charcounts[i][0] = Date.parse(charcounts[i][0]);
        } else if (charcounts[i][0].getTime) {
            charcounts[i][0] = charcounts[i][0].getTime();
        }
    }
    return charcounts;
}

//var data = JSON.parse("[[\"2015-06-25T20:55:30.911Z\",3],[\"2015-06-25T20:55:35.845Z\",14],[\"2015-06-25T20:56:00.646Z\",29],[\"2015-06-25T20:56:05.658Z\",29],[\"2015-06-25T20:56:10.640Z\",29],[\"2015-06-25T20:56:15.659Z\",29],[1435265776000,29],[\"2015-06-25T20:57:21.846Z\",29],[\"2015-06-25T20:57:24.381Z\",51],[\"2015-06-25T20:57:29.360Z\",99],[\"2015-06-25T20:57:34.364Z\",114]]");
//data = {
//    "somedocid": {
//        "charcounts": data
//    }
//};
//$(document).ready(function () { drawChart(data); });