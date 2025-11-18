# Zeitreihenprognose mit KI

Diese Applikation demonstriert, wie Künstliche Intelligenz historische Verkaufsdaten analysiert und zukünftige Produktnachfrage vorhersagt. Durch die Verwendung von Machine-Learning-Algorithmen zur Zeitreihenanalyse können Unternehmen ihre Lagerbestände optimieren, Überbestände vermeiden und Engpässe frühzeitig erkennen. Die interaktive Visualisierung zeigt sowohl historische Daten als auch prognostizierte Werte mit Konfidenzintervallen.

## Eingabeparameter

| Parameter | Beschreibung | Standardwert | Bereich |
|-----------|--------------|--------------|---------|
| Prognosezeitraum | Anzahl der Tage in die Zukunft | 30 Tage | 7-90 Tage |
| Historische Daten | Anzahl der vergangenen Tage | 365 Tage | 90-730 Tage |
| Konfidenzintervall | Unsicherheitsbereich der Prognose | 95% | 80-99% |
| Saisonalität | Berücksichtigung saisonaler Muster | Aktiviert | An/Aus |
| Trend | Berücksichtigung von Trends | Aktiviert | An/Aus |
| Glättungsfaktor | Stärke der Datenglättung | 0.3 | 0.1-0.9 |

## Weitere Informationen

- **Technologie**: React 19, TypeScript, Material UI 7, Recharts für Visualisierungen
- **KI-Methode**: Exponential Smoothing (Holt-Winters), Moving Average
- **Ausführung lokal**:
  ```bash
  npm install
  npm run dev
  ```
- **Docker**:
  ```bash
  docker build -t zeitreihenprognose .
  docker run -p 80:80 zeitreihenprognose
  ```
- **Besonderheiten**: Die Applikation verwendet simulierte Daten, kann aber leicht erweitert werden, um echte Verkaufsdaten zu importieren (CSV/JSON)
