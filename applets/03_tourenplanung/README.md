# Multi-Stop Tourenplanung

Diese Applikation löst das Traveling Salesman Problem (TSP) für eine optimale Routenplanung durch Berlin. Die Anwendung zeigt echte Sehenswürdigkeiten auf einer interaktiven Karte und ermöglicht es, die Reihenfolge der Stopps per Drag & Drop zu ändern. Ein intelligenter Optimierungsalgorithmus findet automatisch die kürzeste Route.

## Funktionen

### Fullscreen-Karte (Google Maps Style)
- **Vollbildmodus**: Karte füllt den gesamten Bildschirm als Basislayer
- **Leaflet & OpenStreetMap**: Echte Karte von Berlin mit 12 bekannten Sehenswürdigkeiten
- **Nummerierte Marker**: Jeder Stopp ist deutlich nummeriert und zeigt seine Position in der Route
- **Routenvisualisierung**: Die aktuelle Route wird als farbige Linie auf der Karte dargestellt

### Drag & Drop Stopps
- **Kompaktes Overlay-Panel (links)**: Schmales Panel (280px) schwebt über der Karte
- **Integrierte Steuerung**: Alle Bedienelemente im Panel (Optimierung, Reset, Modus-Umschaltung)
- **Einfaches Umordnen**: Ziehen Sie Stopps per Drag & Drop in eine neue Reihenfolge
- **Live-Updates**: Karte und Statistiken aktualisieren sich automatisch bei Änderungen
- **Distanzanzeige**: Zeigt die Entfernung zum nächsten Stopp für jeden Punkt

### Berechnungsmodi
- **Luftlinie (Haversine)**: Schnelle Berechnung der direkten Entfernung zwischen Punkten
- **Fahrstrecke (OSRM)**: Realistische Fahrdistanzen über das Straßennetz mit OpenStreetMap-Routing
- **Umschaltbar**: Wechseln Sie jederzeit zwischen den Modi

### TSP-Optimierung
- **Nearest Neighbor**: Greedy-Algorithmus für eine schnelle Ausgangslösung
- **2-opt Optimierung**: Lokale Suche zur Verbesserung der Route
- **Web Worker**: Optimierung läuft im Hintergrund ohne UI-Blockierung
- **Verbesserungsanzeige**: Zeigt prozentuale Verbesserung nach Optimierung

### Kompakte Statistik (oben rechts)
- **Minimales Overlay-Panel**: Kleine, semi-transparente Box in der oberen rechten Ecke
- **Gesamtstrecke**: Summe aller Distanzen in Kilometern
- **Gesamtzeit**: Geschätzte Fahrzeit in Minuten (basierend auf 30 km/h Durchschnitt)
- **Verbesserungs-Badge**: Zeigt prozentuale Optimierung nach TSP-Berechnung

## Berliner Sehenswürdigkeiten

Die App enthält folgende reale Stopps in Berlin:
1. Brandenburger Tor
2. Alexanderplatz
3. Reichstagsgebäude
4. Berliner Dom
5. Potsdamer Platz
6. Checkpoint Charlie
7. Gendarmenmarkt
8. Museumsinsel
9. East Side Gallery
10. Kurfürstendamm
11. Fernsehturm
12. Charlottenburg Schloss

## Technologie

- **React 19** mit TypeScript
- **Material UI 7** für moderne UI-Komponenten
- **Leaflet & react-leaflet** für Kartenvisualisierung
- **@dnd-kit** für Drag & Drop-Funktionalität
- **OSRM API** für reale Routing-Berechnungen
- **Web Workers** für performante Hintergrund-Optimierung
- **i18next** für deutsche Lokalisierung
- **Vite** als Build-Tool

## Algorithmen

### Haversine-Formel
Berechnet die Luftlinien-Entfernung zwischen zwei GPS-Koordinaten auf der Erdkugel.

### Traveling Salesman Problem (TSP)
1. **Nearest Neighbor**: Startet beim ersten Stopp und wählt immer den nächstgelegenen unbesuchten Stopp
2. **2-opt Optimierung**: Verbessert die Route durch iteratives Vertauschen von Kanten
3. **Kombinierter Ansatz**: Verwendet Nearest Neighbor für Initialisierung, dann 2-opt zur Verfeinerung

## Ausführung

### Lokal entwickeln
```bash
npm install
npm run dev
```
Die App läuft dann auf http://localhost:5173

### Produktions-Build
```bash
npm run build
npm run preview
```

### Docker
```bash
docker build -t tourenplanung .
docker run -p 80:80 tourenplanung
```

## Bedienung

1. **Stopps umsortieren**: Klicken und ziehen Sie Stopps in der linken Liste (Drag & Drop)
2. **Modus wechseln**: Toggle-Button im linken Panel zwischen Luftlinie und Fahrstrecke
3. **Optimieren**: "Route optimieren" Button im linken Panel für die beste Lösung
4. **Zurücksetzen**: Reset-Button (Pfeil-Icon) stellt die ursprüngliche Reihenfolge wieder her

## Besonderheiten

### UI/UX Design
- **Fullscreen Map**: Karte nutzt den gesamten Bildschirm (100vw x 100vh)
- **Floating Panels**: Overlay-Panels schweben über der Karte mit Transparenz & Blur
- **Kompaktes Layout**: Linkes Panel nur 280px breit für maximale Kartenansicht
- **Google Maps Style**: Moderne Overlay-basierte Benutzeroberfläche

### Technische Features
- Automatische Karten-Zentrierung auf alle sichtbaren Stopps
- Semi-transparente Overlays (95% Opazität + 8px Backdrop-Blur)
- Sanfte Animationen beim Drag & Drop
- Fehlerbehandlung mit Fallback auf Luftlinie bei API-Problemen
- Web Worker für nicht-blockierende Optimierung
