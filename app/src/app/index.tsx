import { Camera, Map } from '@maplibre/maplibre-react-native';
import { StyleSheet, View } from 'react-native';

// OpenFreeMap: free vector tiles, no API key (see docs/ARCHITECTURE.md)
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

// Rabat center, [lng, lat] order (MapLibre always wants longitude first)
const RABAT_CENTER: [number, number] = [-6.84, 34.0];

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Map style={styles.map} mapStyle={MAP_STYLE}>
        <Camera initialViewState={{ center: RABAT_CENTER, zoom: 12 }} />
      </Map>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
