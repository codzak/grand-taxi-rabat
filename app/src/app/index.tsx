import { Camera, GeoJSONSource, Layer, Map } from '@maplibre/maplibre-react-native';
import { StyleSheet, View } from 'react-native';

// ponytail: copy of data/stations.geojson (Metro can't see outside app/). Keep in sync until Step 2 bundling.
import stations from '../../assets/data/stations.json';

// OpenFreeMap: free vector tiles, no API key (see docs/ARCHITECTURE.md)
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

// Rabat center, [lng, lat] order (MapLibre always wants longitude first)
const RABAT_CENTER: [number, number] = [-6.84, 34.0];

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Map style={styles.map} mapStyle={MAP_STYLE}>
        <Camera initialViewState={{ center: RABAT_CENTER, zoom: 12 }} />
        <GeoJSONSource id="stations" data={stations as GeoJSON.FeatureCollection}>
          <Layer
            id="stations-pins"
            type="circle"
            paint={{
              'circle-radius': 8,
              'circle-color': '#0E5A4A',
              'circle-stroke-width': 2,
              'circle-stroke-color': '#FFFFFF',
            }}
          />
        </GeoJSONSource>
      </Map>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
