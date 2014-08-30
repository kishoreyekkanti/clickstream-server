function generateHeatMap(allPoints) {
    var heatMapPoints = [];
    var pointArray = allPoints.split(",");
    var heatmap = h337.create({
        container: document.getElementById('heatmapContainer'),
        maxOpacity: 0.9,
        radius: 30
    });

    $.each(pointArray, function (index, element) {
        if (index != 0 && index % 2 == 0) {
            var point = {x: pointArray[index - 2]*1 - 50, y: pointArray[index - 1], value: 1};
            heatMapPoints.push(point);
        }
    });
    heatmap.addData(heatMapPoints);
}
$(document).ready(function () {
    $(".available-pages").change(function () {
        $("#webPageFrame").attr('src', $(".available-pages :selected").text());
        $(".heatmap-body").show();
        var path = $(".available-pages :selected").val();
        $.getJSON("http://localhost:3000/heatpoints/"+path+"/click?apiToken=!abcd1234", function (data) {
            generateHeatMap(data.points);
        });

    });

});