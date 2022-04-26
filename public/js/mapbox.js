/* eslint-disable */
// const locations = JSON.parse(document.getElementById('map').dataset.locations);
// console.log(locations);

export const displayMap = (locations) => {
  mapboxgl.accessToken = 
'pk.eyJ1IjoiZXJpY21ha3VhbiIsImEiOiJjbDI2MDNrbXkwMG92M2VwcjcyYzd1NjNxIn0.WdTFpMinvB4osoD_4A3TMw';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/ericmakuan/cl261xcs2000o16nvtlmqcbbo',
  scrollZoom: false//使地圖不能被滾輪滾動
  // center: [-118.113491, 34.111745],
  // zoom: 10,
  // interactive: false
}); 

const bounds = new mapboxgl.LngLatBounds(); 

locations.forEach(loc => {
  //create marker 
  const el = document.createElement('div');
  el.classname = 'marker';
  
  //add marker
  new mapboxgl.Marker({
    elment: el,
    anchor: 'bottom'//圖示的下面為點
  }).setLngLat(loc.coordinates).addTo(map);

  //add popup
  new mapboxgl.Popup({
    offset: 30
  })
  .setLngLat(loc.coordinates)
  .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
  .addTo(map);
  //extend map bounds tp include current location
  bounds.extend(loc.coordinates);

});

map.fitBounds(bounds, { 
    padding: {  //選取合適範圍
    top: 200,
    bottom: 150,
    left: 100,
    right: 100
    }
});
}

