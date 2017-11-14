
var map, markerLayer, vectorLayer;
var fromProjection, toProjection;
var markerList = [];
var labelList = [];
var WStimerID=0;
var ladenFlarmPositiesTimerID = 0;

function InitializeKaart()
{
	fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
	toProjection   = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection
	  
	var bounds = new OpenLayers.Bounds(5.85, 52.04, 5.97, 52.075);
	bounds.transform(fromProjection, toProjection);
	 
	var options = {
		projection: toProjection,
		restrictedExtent: bounds,

		layers: 
		[
			new OpenLayers.Layer.OSM("OSM Landscape",
			[
				"http://a.tile3.opencyclemap.org/landscape/${z}/${x}/${y}.png", 
				"http://b.tile3.opencyclemap.org/landscape/${z}/${x}/${y}.png", 
				"http://c.tile3.opencyclemap.org/landscape/${z}/${x}/${y}.png"
			])
		]
	};
	 
	map = new OpenLayers.Map('map',options);

	map.isValidZoomLevel = function(zoomLevel) 
	{
	   return ( (zoomLevel != null) &&
		  (zoomLevel >= 14) && 
		  (zoomLevel <= 16) );
	}

	var position = new OpenLayers.LonLat(5.92, 52.060).transform(fromProjection,toProjection);
	map.setCenter(position, 15);	
	
	var context = {
		getFillColor: function(feature) 
		{
			if (feature.NODATA == true) 
				return "red";
				
			if (feature.ROC < -0.5)
				return "#808000";
			else if (feature.ROC > 0.5)
				return "#31FFFD"
			else
				return "#ffcc66"
		},
		getLineColor: function(feature) 
		{
			if (feature.NODATA == true) 
				return "red";
				
			return "#ff9933"
		},
		getCallSign: function(feature) 
		{
			return feature.CALLSIGN;
		},
		getNoData: function(feature) 
		{
			if (feature.NODATA == true) 
				return "x";
				
			return "circle";
		}
	};
	
	var template = 
	{
		pointRadius: "5", 
		strokeColor: "${getLineColor}",
		strokeWidth: 2,		
		fillColor: "${getFillColor}", // using context.getFillColor(feature)
		label : "${getCallSign}",
		graphicName: "${getNoData}",
		fontColor: "black",
		fontSize: "10px",
		fontFamily: "Courier New, monospace",
		fontWeight: "bold",
		labelXOffset: "10",
		labelYOffset: "10",
		labelOutlineColor: "white",
		labelOutlineWidth: 1		
	};
			
	var vectorStyles = new OpenLayers.Style(template, {context: context});
	
	vectorLayer = new OpenLayers.Layer.Vector("Vliegtuigen", {styleMap: vectorStyles, rendererOptions: {zIndexing: true} });
	map.addLayer(vectorLayer);

	// Kaart is geladen nu data stroom openen
	
	WebSocketReceive();
}        

function ResizeKaart()
{
	map.updateSize();
}


function showMarker(name, lat, lon, roc, label)
{
	var position = new OpenLayers.LonLat(lon, lat).transform(fromProjection,toProjection);
		
	if (name in markerList)
	{
		markerList[name].move(position);
		markerList[name].ROC = roc;
		markerList[name].NODATA = false;
	}
	else
	{
		vliegtuig = new OpenLayers.Feature.Vector (new OpenLayers.Geometry.Point(lon, lat).transform(fromProjection,toProjection));
		vliegtuig.ROC = roc;
		vliegtuig.CALLSIGN = label;
		vliegtuig.NODATA = false;
		vectorLayer.addFeatures(vliegtuig);
		markerList[name] = vliegtuig;		
	}
	labelList[name] = label;
}

function deleteMarker(name)
{
	vectorLayer.removeFeatures(markerList[name]);
	delete markerList[name];
}

function squareMarker(name)
{
	if (name in markerList)
	{
		markerList[name].NODATA = true;
		vectorLayer.redraw();
	}
}

function ClearMarkers()
{
	vectorLayer.destroyFeatures();
	markerList = [];
}

function WebSocketReceive()
{
	if ("WebSocket" in window)
	{
		var ws = new WebSocket("ws://localhost:8181/echo");
		ws.onmessage = function (evt) 
		{ 				
			var ss =evt.data.substring(0, 7);		
			if (ss == "DELETE:")
			{
				var s = evt.data.split(":");
				deleteMarker(s[1]);
			}
			else if (ss == "NODATA:")
			{
				var s = evt.data.split(":");
				squareMarker(s[1]);
			}
			else
			{
				var record = JSON.parse(evt.data);

				var Onderdrukken = Ext.getCmp('FilterOnderdrukKistenOpdeGrond');
				
				if ((Onderdrukken.pressed == false) || (record.VLIEGT == true))
					showMarker(record.FLARM_CODE, record.LATITUDE, record.LONGITUDE, record.ROC, record.CALLSIGN);
			}
		};
		ws.onopen = function()
		{
			if(window.timerID)
			{ 
				window.clearInterval(window.WStimerID);
				window.WStimerID=0;
			}
			setTimeout(function() 
			{
				var store = Ext.data.StoreManager.lookup('FlarmPosities_Store');	
				store.load({
					params: 
					{
						'Push':true
					}
				})
			}, 100);
			
			window.ladenFlarmPositiesTimerID = setTimeout(ladenFlarmPosities,3 * 1000);
		};
		ws.onclose = function()
		{ 
			if(!window.timerID)
			{ 
				window.WStimerID=setInterval(WebSocketReceive(), 5000);
			}
		};
	}
	else
	{
		// The browser doesn't support WebSocket
		alert("WebSocket NOT supported by your Browser!");
	}
}

function ladenFlarmPosities()
{
	if(window.ladenFlarmPositiesTimerID)
	{ 
		window.clearInterval(window.ladenFlarmPositiesTimerID);
		window.ladenFlarmPositiesTimerID=0;
	}			
	var store = Ext.data.StoreManager.lookup('FlarmPosities_Store');	
	store.load();
	
	window.ladenFlarmPositiesTimerID = setTimeout(ladenFlarmPosities,3 * 1000);
}


