<script type='text/javascript'>
(function main(){
    var clickPoints = [];
    var mousePoints = [];

    function postClickStream(points, url) {
    var request = new XMLHttpRequest();
    request.open('POST', url, true);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send('points='+points+'&docUrl='+document.URL+'&apiToken=!abcd1234'+'&width='+document.body.clientWidth+'&height='+window.innerHeight);
    }
function observeEvents(eventName, url, pointsSource, throttleInterval) {
    var source = Rx.Observable.fromEvent(document, eventName).throttle(throttleInterval);
    source.subscribe(function (e) {
    pointsSource.push(e.pageX, e.pageY);
    if (pointsSource.length > 5) {
    var pathName = window.location.pathname.indexOf('/') >= 0 ? '/' + window.location.pathname.split('/')[1] : window.location.pathname;
    pathName = pathName === '/' ? '/'+location.hash.replace('#','') : pathName;
    pathName = pathName.indexOf('?') > 0 ? pathName.split('?')[0] : pathName
    postClickStream(pointsSource.join(), url+pathName);
    pointsSource = [];
    }
});
}
function trackUserPattern() {
    observeEvents('click', 'http://localhost:3000/click/points' , clickPoints, 100);
    observeEvents('mousemove', 'http://localhost:3000/mouseMove/points' , mousePoints, 500);
    }
function renderImage(){
    html2canvas(document.body,{onrendered: function(canvas){
    console.log(canvas.toDataURL('image/png'))
    document.body.appendChild(canvas);
    }});
}
function loadScript(url, callback)
    {
        var newScript = document.createElement('script');
        newScript.type = 'text/javascript';
        newScript.src = url;
        var firstScriptTag = document.getElementsByTagName('script');
        if(firstScriptTag){
        var existingScript = firstScriptTag[document.getElementsByTagName('script').length - 1];
        existingScript.parentNode.insertBefore(newScript, existingScript);
        }else{
    document.body.appendChild(newScript);
    }
if(callback){
    newScript.onreadystatechange = callback;
    newScript.onload = callback;
    }
}
//    loadScript('//cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min.js', renderImage);
loadScript('//cdnjs.cloudflare.com/ajax/libs/rxjs/2.3.0/rx.lite.min.js', trackUserPattern);
})();
</script>