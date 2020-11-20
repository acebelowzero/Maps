import { Deck } from '@deck.gl/core';
import { GeoJsonLayer, ArcLayer, IconLayer } from '@deck.gl/layers';
import mapboxgl from 'mapbox-gl';
import axios from 'axios'
import * as d3 from "d3";
import destinationPoint from "./destinationPoint";

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const AIR_PORTS =
    'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

// How the map looks at start
const INITIAL_VIEW_STATE = {
    latitude: 51.47,
    longitude: 0.45,
    zoom: 4,
    bearing: 0,
    pitch: 30
};



// a style for the map
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';

var plane;

// Use this fetch data
    async function fetchData() {
    const data = await d3.json('https://opensky-network.org/api/states/all')
    const plane = data.states.map(d => ({
        icao: d[0],
        callsign: d[1],
        origin_country: d[2],
        time_position: d[3],
        last_contact: d[4],
        longitude: d[5],
        latitude: d[6],
        altitude: d[7],
        on_ground: d[8],
        velocity: d[9],
        true_track: d[10],
    }))
    setTimeout(fetchData(), 60000)
    return plane
}
    plane = fetchData();

    const map = new mapboxgl.Map({
        container: 'map',
        style: MAP_STYLE,
        // Note: deck.gl will be in charge of interaction and event handling
        interactive: false,
        center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
        zoom: INITIAL_VIEW_STATE.zoom,
        bearing: INITIAL_VIEW_STATE.bearing,
        pitch: INITIAL_VIEW_STATE.pitch
    });

    const deck = new Deck({
        canvas: 'deck-canvas',
        width: '100%',
        height: '100%',
        initialViewState: INITIAL_VIEW_STATE,
        controller: true,
        onViewStateChange: ({ viewState }) => {
            map.jumpTo({
                center: [viewState.longitude, viewState.latitude],
                zoom: viewState.zoom,
                bearing: viewState.bearing,
                pitch: viewState.pitch
            });
        },
        layers: [
            new GeoJsonLayer({
                id: 'airports',
                data: AIR_PORTS,
                // Styles
                filled: true,
                pointRadiusMinPixels: 2,
                pointRadiusScale: 2000,
                getRadius: f => 11 - f.properties.scalerank,
                getFillColor: [200, 0, 80, 180],
                // Interactive props
                pickable: true,
                autoHighlight: true,
                onClick: info =>
                    // eslint-disable-next-line
                    info.object && alert(`${info.object.properties.name} (${info.object.properties.abbrev})`)
            }),
            new IconLayer({
                id: 'planes',
                data: plane,
                pickable: false,
                iconAtlas: 'https://lh3.googleusercontent.com/proxy/1ht-M_tdpsR8ScDL1gdSHBZctnJJWRuA7FsESQK0ULVwvTc4AXXOzcSOlqHXRqNL3RL9shhVJmNZKIakXB1M9hNSkAhBWGcFikVDTO4ncQ',
                iconMapping: {
                    airplane: {
                        x: 0,
                        y: 0,
                        width: 512,
                        height: 512,
                    }
                },
                sizeScale: 20,
                getPosition: d => [d.longitude, d.latitude],
                //getSize: d => .10,
                getColor: d => [Math.sqrt(d.exits), 140, 0],
                getIcon: d => "airplane",
            })
        ]
    });



