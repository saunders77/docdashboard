﻿var chart = null;
Highcharts.setOptions({
    global: {
        timezoneOffset: 420
    }
});

function createChartWithSeries(series) {
    chart = new Highcharts.StockChart({
        chart: {
            renderTo: 'chartContainer'
        },
        navigator: {
            enabled: false
        },
        scrollbar: {
            enabled: false
        },
        yAxis: {
            floor: 0
        },
        rangeSelector: {
            buttons: [{
                type: 'minute',
                count: 1,
                text: '1m'
            }, {
                type: 'minute',
                count: 15,
                text: '15m'
            }, {
                type: 'minute',
                count: 30,
                text: '30m'
            }, {
                type: 'minute',
                count: 45,
                text: '45m'
            }, {
                type: 'minute',
                count: 60,
                text: '1h'
            }, {
                type: 'all',
                text: 'All'
            }]
        },
        series: series
    });
}
function drawChart(data) {
    var colors = ['#2b579a', '#a4373a', '#217346'];
    var series = [];
    for (docid in data) {
        if (data[docid].isMine) {
            var color = colors[0];
        } else {
            color = null;
        }
        series.push({
            type: "line",
            name: docid,
            id: docid,
            data: parseCharcountsForCharting(data[docid].charcounts),
            color: color
        });
    }

    if (!chart) {
        createChartWithSeries(series);
    } else {
        for (var i = 0; i < series.length; ++i) {
            var existingSeries = chart.get(series[i].id);
            if (!existingSeries) {
                createChartWithSeries(series);
            } else {
                existingSeries.setData(series[i].data);
            }
        }
    }
}

function parseCharcountsForCharting(charcounts) {
    var response = [];
    for (var i = 0; i < charcounts.length; ++i) {
        if (typeof charcounts[i][0] === "string") {
            charcounts[i][0] = Date.parse(charcounts[i][0]);
        } else if (charcounts[i][0].getTime) {
            charcounts[i][0] = charcounts[i][0].getTime();
        }
        response.push([charcounts[i][0], charcounts[i][1]]);
    }
    return response;
}

//var data = JSON.parse("[[\"2015-06-25T20:55:30.911Z\",3],[\"2015-06-25T20:55:35.845Z\",14],[\"2015-06-25T20:56:00.646Z\",29],[\"2015-06-25T20:56:05.658Z\",29],[\"2015-06-25T20:56:10.640Z\",29],[\"2015-06-25T20:56:15.659Z\",29],[1435265776000,29],[\"2015-06-25T20:57:21.846Z\",29],[\"2015-06-25T20:57:24.381Z\",51],[\"2015-06-25T20:57:29.360Z\",99],[\"2015-06-25T20:57:34.364Z\",114]]");
//data = {
//    "somedocid": {
//        "charcounts": data
//    }
//};
//$(document).ready(function () { drawChart(data); });