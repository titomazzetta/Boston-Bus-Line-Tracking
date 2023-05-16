mapboxgl.accessToken = 'pk.eyJ1Ijoicm9tYWZhbjg5IiwiYSI6ImNsaGphNTZjYTA1MWYzZ3BzZ2Z5NXNvYW8ifQ.T-aaKhcXyLP765CZpDN8PQ';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-71.0942, 42.3601],
    zoom: 12
});

var markers = [];
var previousMarkers = [];

async function addMarkers() {
    // get bus data
    var locations = await getBusLocations();

    // create new markers
    locations.forEach(function (bus) {
        var marker = getMarker(bus.id);
        if (marker) {
            moveMarker(marker, bus);
        } else {
            addMarker(bus);
        }
    });

    // remove previous markers
    previousMarkers.forEach(function (marker) {
        marker.remove();
    });
    previousMarkers = [];

    // timer
    console.log(new Date());
    setTimeout(addMarkers, 15000);
}

// Request bus data from MBTA
async function getBusLocations() {
    var url = 'https://api-v3.mbta.com/vehicles?api_key=ca34f7b7ac8a445287cab52fb451030a&filter[route]=1&include=trip';
    var response = await fetch(url);
    var json = await response.json();
    return json.data;
}

function addMarker(bus) {
    var el = document.createElement('div');
    el.className = 'marker';
    el.setAttribute('data-route', bus.relationships.route);
    el.setAttribute('data-direction', bus.attributes.direction_id);
    el.innerHTML = getIconMarkup(bus.attributes.direction_id);

    var marker = new mapboxgl.Marker(el)
        .setLngLat([bus.attributes.longitude, bus.attributes.latitude])
        .addTo(map);
    markers.push(marker);
}

function moveMarker(marker, bus) {
    var directionId = bus.attributes.direction_id;
    marker.getElement().setAttribute('data-direction', directionId);
    marker.getElement().innerHTML = ''; // Remove the icon

    marker.setLngLat([bus.attributes.longitude, bus.attributes.latitude]);

    // Check if marker is a previous marker
    if (marker.getElement().classList.contains('previous-marker')) {
        // Reduce size of previous marker
        marker.getElement().style.width = '30%';
        marker.getElement().style.height = '30%';
    }
}

function addPreviousMarker(marker) {
    marker.getElement().classList.add('previous-marker');
    marker.getElement().style.width = '30px';
    marker.getElement().style.height = '30px';
    previousMarkers.push(marker);
}

function getMarker(route) {
for (var i = 0; i < markers.length; i++) {
var marker = markers[i];
if (marker.getElement().getAttribute('data-route') === route) {
return marker;
}
}
return null;
}

function getIconMarkup(directionId) {
var iconName = directionId === 0 ? 'bus' : 'train';
return '<i class="fas fa-' + iconName + '"></i>';
}

window.onload = function () {
addMarkers();
};