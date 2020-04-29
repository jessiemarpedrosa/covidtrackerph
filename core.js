var apiURL = 'https://coronavirus-ph-api.herokuapp.com';
var data;

function getTotalCases() {	
	$.getJSON( apiURL + '/total', function (d) {
		return d.data.cases;
	});
}

function getTotalPerBrgy() {	
	$.getJSON( apiURL + '/doh-data-drop', function (d) {
		//console.log( d.data[2843].region_res );
	});
}
getTotalPerBrgy();


/*** Leaftlet & Map Script **/
var map = L.map('map').setView([10.351, 123.939], 13.6);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
	maxZoom: 18,
	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
		'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
		'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	id: 'mapbox/light-v9',
	tileSize: 512,
	zoomOffset: -1
}).addTo(map);


// control that shows state info on hover
var info = L.control();

info.onAdd = function (map) {
	this._div = L.DomUtil.create('div', 'info');
	this.update();
	return this._div;
};

info.update = function (props) {
	this._div.innerHTML = '<h5>Mandaue City - Covid Map Tracker</h5>' + (props ?
		'<p class="mb-2">' + props.name + '</p>' + props.density + ' people</sup>'
		: 'Hover over a barangay');
};

info.addTo(map);


// get color depending on population density value
function getColor(d) {
	return  d > 25000 ? '#800026' :
			d > 20000  ? '#BD0026' :
			d > 15000  ? '#E31A1C' :
			d > 10000  ? '#FC4E2A' :
			d > 8000   ? '#FD8D3C' :
			d > 5000   ? '#FEB24C' :
			d > 1000   ? '#FED976' :
						'#FFEDA0';
}

function style(feature) {
	return {
		weight: 2,
		opacity: 1,
		color: 'white',
		dashArray: '3',
		fillOpacity: 0.7,
		fillColor: getColor(feature.properties.density)
	};
}

function highlightFeature(e) {
	var layer = e.target;

	layer.setStyle({
		weight: 3,
		color: '#000',
		dashArray: '',
		fillOpacity: 0.8
	});

	if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
		layer.bringToFront();
	}

	info.update(layer.feature.properties);
	
}

var geojson;

function resetHighlight(e) {
	geojson.resetStyle(e.target);
	info.update();
}

function zoomToFeature(e) {
	map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
	layer.on({
		mouseover: highlightFeature,
		mouseout: resetHighlight,
		//click: zoomToFeature
		click: function(){ layer.closeTooltip() }
	});
			
	layer.bindPopup( "<h5>" + feature.properties.name + "</h5>");
	layer.bindTooltip(feature.properties.name);
	
	if (L.Browser.touch)
		layer.unbindTooltip();
		
}

geojson = L.geoJson(mandaueBrgyCoords, {
	style: style,
	coordsToLatLng: function (coords) {
		return new L.LatLng(coords[0], coords[1]);
	},
	onEachFeature: onEachFeature,
}).addTo(map);
	
map.attributionControl.addAttribution('Mandaue City Covid Tracker v1.0');


var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

	var div = L.DomUtil.create('div', 'info legend'),
		grades = [1000, 5000, 5000, 8000, 10000, 15000, 20000, 25000],
		labels = [],
		from, to;

	for (var i = 0; i < grades.length; i++) {
		from = grades[i];
		to = grades[i + 1];

		labels.push(
			'<i style="background:' + getColor(from + 1) + '"></i> ' +
			from + (to ? '&ndash;' + to : '+'));
	}

	div.innerHTML = labels.join('<br>');
	return div;
};

legend.addTo(map);


// ************************ jQuery Script ************************ /
$.getJSON( apiURL + '/total', function (data) {

	// <!-- L.geoJson(geojson, { -->
	// <!-- onEachFeature: function (feature, layer) { -->
	  // <!-- layer.bindPopup(feature.properties.name); -->
	// <!-- } -->
	// <!-- }).addTo(map); -->
	//var total = data.data.cases;

	$('.topTotalCases').append( data.data.cases + ' (' + data.data.cases_today + '+)' );

	var userDate = data.data.last_update;
	var date_string = moment(userDate, "YYYY-MM-DD").format("MMMM DD, YYYY");
	$('.topLastUpdate').append( date_string );
	
	$('.topDeaths').append( data.data.deaths + ' (' + data.data.deaths_today + '+)' );
	$('.topRecoveries').append( data.data.recoveries + ' (' + data.data.recoveries_today + '+)' );
	
});

$.getJSON( apiURL + '/doh-data-drop', function (data) {

	var data = data.data;
	var mandaue = "Mandaue City";
	var cebu = "Cebu City (Capital)";
	var talisay = "City of Talisay";
	var mandaueCases = 0, cebuCases = 0, talisayCases = 0;
	
	$.each(data, function(i, item) {
		if ( item.prov_city_res.toLowerCase() === mandaue.toLowerCase() ){ mandaueCases++; }
		if ( item.prov_city_res.toLowerCase() === cebu.toLowerCase() ){ cebuCases++; }
		if ( item.prov_city_res.toLowerCase() === talisay.toLowerCase() ){ talisayCases++; }
	});
	
	$('.mandaueCases').append( mandaueCases );
	$('.cebuCases').append( cebuCases );
	$('.talisayCases').append( talisayCases );
	
	console.log(data);
	
});

$(function(){
	
	$('[data-toggle="tooltip"]').tooltip()
	
	$('#main-nav a.nav-link').on('click', function(){
		$('#main-nav a.nav-link').removeClass('active');
		$(this).addClass('active');
	});
});
