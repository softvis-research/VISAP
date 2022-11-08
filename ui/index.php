<!DOCTYPE html>

<!-- pass url parameters to javascript variables -->
<?php

$srcDir = "data";
if (isset($_GET["srcDir"])) {
    $srcDir = $_GET["srcDir"];
}

$setupUrl = "setups/web/default.js";
if (isset($_GET["setup"])) {
    $setupUrl = "setups/" . $_GET["setup"] . ".js";
}

$modelUrl = "data/City/model";
if (isset($_GET["model"])) {
    $modelUrl = $srcDir . "/" . $_GET["model"] . "/model";
} else {
    if (!isset($_GET["setup"])) {
        $setupUrl = "setups/web/City bank.js";
    }
}

$metaDataJsonUrl = $modelUrl . "/metaData.json";

$stateHashcode = "";
if (isset($_GET["state"])) {
    $stateHashcode = $_GET["state"];
    $metaStateJsonUrl = "state.php?hash=" . $stateHashcode;
} else {
    $metaStateJsonUrl = "state.php?hash=";
}

$lazyLoadingEnabled = false;
if (isset($_GET["lazy"])) {
    $lazyLoadingEnabled = $_GET["lazy"];
}

?>


<script type="text/javascript">
    var modelUrl = "<?php echo $modelUrl; ?>";
    var stateHashcode = "<?php echo $stateHashcode; ?>";
    var metaStateJsonUrl = "<?php echo $metaStateJsonUrl; ?>";
    var metaDataJsonUrl = "<?php echo $metaDataJsonUrl; ?>";
    var lazyLoadingEnabled = "<?php echo $lazyLoadingEnabled; ?>" === 'true';

    var canvasId = "aframe-canvas";
    var visMode = "aframe";
</script>

<html>
<title>Getaviz</title>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
<link rel="icon" type="image/vnd.microsoft.icon" href="favicon.ico">

<!--Main-->
<script type="text/javascript" src="node_modules/jquery/dist/jquery.min.js"></script>
<script src="https://aframe.io/releases/1.0.4/aframe.min.js"></script>

<!--jqwidgets-->
<script type="text/javascript" src="node_modules/jqwidgets-scripts/jqwidgets/jqxcore.js"></script>
<script type="text/javascript" src="node_modules/jqwidgets-scripts/jqwidgets/jqxbuttons.js"></script>
<script type="text/javascript" src="node_modules/jqwidgets-scripts/jqwidgets/jqxsplitter.js"></script>

<!-- orbitcam -->

<script type="text/javascript" src="scripts/ABAP/aframe-orbit-camera-component.js"></script>

<!-- controller -->
<script type="text/javascript" src="scripts/CanvasFilter/CanvasFilterController.js"></script>
<script type="text/javascript" src="scripts/CanvasMark/CanvasMarkController.js"></script>
<script type="text/javascript" src="scripts/CanvasHover/AframeCanvasHoverController.js"></script>
<script type="text/javascript" src="scripts/CanvasFlyTo/CanvasFlyToController.js"></script>
<script type="text/javascript" src="scripts/CanvasSelect/CanvasSelectController.js"></script>
<script type="text/javascript" src="scripts/CanvasResetView/CanvasResetViewController.js"></script>
<script type="text/javascript" src="scripts/CanvasGrid/CanvasGridController.js"></script>

<!--user interface-->
<script type="text/javascript" src="scripts/DefaultLogger.js"></script>
<script type="text/javascript" src="scripts/Model.js"></script>
<script type="text/javascript" src="scripts/Events.js"></script>
<script type="text/javascript" src="scripts/AframeCanvasManipulator.js"></script>
<script type="text/javascript" src="scripts/AframeActionController.js"></script>
<script type="text/javascript" src="scripts/ModelLoader.js"></script>

<script type="text/javascript" src="scripts/Application.js"></script>
<link rel="stylesheet" href="Style.css" type="text/css"/>

<!--setup-->
<script type="text/javascript" src="<?php echo $setupUrl; ?>"></script>

</head>
<body>
<div id="canvas">
    <script>
        $(function(){
            if (!lazyLoadingEnabled) {
                $("#canvas").load(encodeURI(modelUrl + "/model.html"));
            } else {
                // add an empty scene that we can fill later
                $('#canvas').append(`<a-scene id="${canvasId}" cursor="rayOrigin: mouse" embedded="true" renderer="logarithmicDepthBuffer: true;">
    <a-assets>
        <img id="sky" crossorigin="anonymous" src="assets/sky_pano.jpg">
        <img id="sea" crossorigin="anonymous" src="assets/pool-water.jpg">
        <img id="ground" crossorigin="anonymous" src="assets/ground.jpg">
        <a-asset-item id="mountain" src="assets/polyMountain_new_Color.glb"></a-asset-item>
        <a-asset-item id="cloud_black" src="assets/cloud_black.glb"></a-asset-item>
    </a-assets>
    <a-sky src="#sky" radius="7000"></a-sky>
    <a-plane src="#ground" height="5000" width="5000" rotation="-90 0 0" position="0 0 0" repeat="30 30"></a-plane>
    <a-entity id="camera" camera="fov: 80; zoom: 1;"
        position="-20 140 -20"
        rotation="0 -90 0"
        orbit-camera="
            target: 80 0.0 80;
            enableDamping: true;
            dampingFactor: 0.25;
            rotateSpeed: 0.25;
            panSpeed: 0.25;
            invertZoom: true;
            logPosition: false;
            minDistance:0;
            maxDistance:1000;
            "
        mouse-cursor="">
    </a-entity>
 </a-scene>`);
            }
        });
        var globalCamera;
    </script>
</div>
</body>
</html>
