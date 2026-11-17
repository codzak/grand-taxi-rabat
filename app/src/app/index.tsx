import { Camera, GeoJSONSource, Layer, Map } from '@maplibre/maplibre-react-native';
import { useMemo, useState } from 'react';
import { Keyboard, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HOURS_LABEL, type Stand, allDestinations, matches, stands, walkingNavUrl, walkingWebUrl } from '@/stands';

// OpenFreeMap: free vector tiles, no API key (see docs/ARCHITECTURE.md).
// Positron, not Liberty: 55 layers instead of 111 and no 3D buildings, so it draws fast on cheap phones.
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';

// Rabat center, [lng, lat] order (MapLibre always wants longitude first)
const RABAT_CENTER: [number, number] = [-6.84, 34.0];

// Colors from docs/SPEC.md "Design"
const GREEN = '#0E5A4A';
const INK = '#12201C';
const GREY_TEXT = '#5B6B66';
const GREY_PIN = '#9AA7A2';
const LIGHT_GREEN = '#E6F0ED';

function openWalking(s: Stand) {
  // ponytail: iOS uses the web link for now; check walking mode there when we test on iOS.
  const web = () => Linking.openURL(walkingWebUrl(s));
  if (Platform.OS === 'android') Linking.openURL(walkingNavUrl(s)).catch(web);
  else web();
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [hub, setHub] = useState<string | null>(null);
  const [pickedId, setPickedId] = useState<string | null>(null);

  // Pins carry a "match" flag so the layer can grey out the others (F2).
  const pins = useMemo<GeoJSON.FeatureCollection>(
    () => ({
      type: 'FeatureCollection',
      features: stands.map((s) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
        properties: { id: s.id, hub: s.hub, match: matches(s, query) },
      })),
    }),
    [query],
  );

  const noResult = query.trim() !== '' && !stands.some((s) => matches(s, query));
  // Stands that share a departure point show on one card (they overlap on the map).
  const hubStands = stands.filter((s) => s.hub === hub);
  const picked = hubStands.find((s) => s.id === pickedId) ?? hubStands[0];

  function openHub(name: string, tappedId: string) {
    const here = stands.filter((s) => s.hub === name);
    Keyboard.dismiss();
    setHub(name);
    // Preselect what the user searched for, else the pin they tapped.
    setPickedId(here.find((s) => query.trim() !== '' && matches(s, query))?.id ?? tappedId);
  }

  return (
    <View style={styles.container}>
      <Map style={styles.map} mapStyle={MAP_STYLE} onPress={() => setHub(null)}>
        <Camera initialViewState={{ center: RABAT_CENTER, zoom: 12 }} />
        <GeoJSONSource
          id="stations"
          data={pins}
          hitbox={{ top: 12, right: 12, bottom: 12, left: 12 }}
          onPress={(e) => {
            e.stopPropagation();
            const p = e.nativeEvent.features[0]?.properties;
            if (p) openHub(p.hub, p.id);
          }}>
          <Layer
            id="stations-pins"
            type="circle"
            paint={{
              'circle-radius': 9,
              'circle-color': ['case', ['get', 'match'], GREEN, GREY_PIN],
              'circle-stroke-width': 2,
              'circle-stroke-color': '#FFFFFF',
            }}
          />
        </GeoJSONSource>
      </Map>

      {/* Search (F2) */}
      <View style={[styles.searchBox, { top: insets.top + 8 }]}>
        <TextInput
          style={styles.input}
          placeholder="Où allez-vous ? Agdal, Kamra…"
          placeholderTextColor={GREY_TEXT}
          value={query}
          onChangeText={setQuery}
          accessibilityLabel="Destination"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {['Toutes', ...allDestinations].map((d) => {
            const on = d === 'Toutes' ? query === '' : query === d;
            return (
              <Pressable
                key={d}
                onPress={() => setQuery(d === 'Toutes' ? '' : d)}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                style={[styles.chip, on && styles.chipOn]}>
                <Text style={[styles.chipText, on && styles.chipTextOn]}>{d}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        {noResult && <Text style={styles.empty}>Aucune station connue pour cette destination.</Text>}
      </View>

      {/* Stand card (F3) */}
      {hub && picked && (
        <View style={[styles.card, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.cardHead}>
            <Text style={styles.title}>{hub}</Text>
            <Pressable onPress={() => setHub(null)} accessibilityLabel="Fermer" hitSlop={12}>
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>
          {hubStands.some((s) => !s.verified) && <Text style={styles.badge}>Non vérifiée sur place</Text>}
          <Text style={styles.label}>Choisissez votre destination</Text>
          {hubStands.map((s) => {
            const on = s.id === picked.id;
            return (
              <Pressable
                key={s.id}
                onPress={() => setPickedId(s.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                style={[styles.row, on && styles.rowOn]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTo}>{s.destinations.join(', ')}</Text>
                  <Text style={styles.rowHours}>{HOURS_LABEL[s.hours]}</Text>
                </View>
                <Text style={styles.price}>{s.price_dh} Dh</Text>
              </Pressable>
            );
          })}
          {picked.notes !== '' && <Text style={styles.note}>{picked.notes}</Text>}
          <Text style={styles.small}>
            Prix par place, information non officielle. Dernière vérification : jamais.
          </Text>
          {/* Walking directions (F4) */}
          <Pressable style={styles.button} onPress={() => openWalking(picked)} accessibilityRole="link">
            <Text style={styles.buttonText}>Y aller à pied</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  searchBox: { position: 'absolute', left: 12, right: 12 },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 16,
    color: INK,
    elevation: 3,
  },
  chips: { gap: 8, paddingVertical: 8 },
  chip: { borderWidth: 1, borderColor: '#D5DBD8', backgroundColor: '#FFFFFF', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  chipOn: { backgroundColor: GREEN, borderColor: GREEN },
  chipText: { color: INK, fontSize: 14 },
  chipTextOn: { color: '#FFFFFF' },
  empty: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, color: INK },
  card: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    gap: 8,
    elevation: 8,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 20, fontWeight: '600', color: INK },
  close: { fontSize: 18, color: GREY_TEXT },
  badge: { alignSelf: 'flex-start', backgroundColor: LIGHT_GREEN, color: GREEN, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, fontSize: 13 },
  label: { color: GREY_TEXT, fontSize: 14, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E3E8E5', borderRadius: 16, padding: 12 },
  rowOn: { borderWidth: 2, borderColor: GREEN, backgroundColor: '#F3F8F6' },
  rowTo: { fontSize: 16, fontWeight: '600', color: INK },
  rowHours: { fontSize: 13, color: GREY_TEXT },
  price: { fontSize: 16, fontWeight: '600', color: GREEN },
  note: { fontSize: 14, color: INK },
  small: { fontSize: 12, color: GREY_TEXT },
  button: { backgroundColor: GREEN, borderRadius: 999, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
