# Multi-Produkt Absatzprognose

Diese Applikation prognostiziert gleichzeitig die Nachfrage für mehrere Produktvarianten und berücksichtigt dabei Korrelationen zwischen Produkten. KI erkennt Substitutionseffekte (wenn ein Produkt ausverkauft ist, steigt die Nachfrage nach Alternativen) und Komplementärbeziehungen (wenn Kunden Produkte zusammen kaufen). Die Matrix-Visualisierung zeigt Abhängigkeiten zwischen Produkten und hilft bei ganzheitlicher Bestandsplanung.

## Eingabeparameter

| Parameter | Beschreibung | Standardwert | Bereich |
|-----------|--------------|--------------|---------|
| Anzahl Produkte | Wie viele Produkte gleichzeitig analysieren | 5 | 2-20 |
| Korrelationsanalyse | Produktbeziehungen berücksichtigen | Aktiviert | An/Aus |
| Prognosehorizont | Tage in die Zukunft | 14 Tage | 7-60 Tage |
| Cross-Selling-Effekte | Gemeinsame Käufe erkennen | Aktiviert | An/Aus |
| Kannibalisierung | Substitution zwischen Produkten | Aktiviert | An/Aus |
| Mindestkorrelation | Schwellenwert für relevante Beziehungen | 0.5 | 0.1-0.9 |

## Weitere Informationen

- **Technologie**: React 19, TypeScript, Material UI 7, Recharts für Multi-Line-Charts, Heatmap für Korrelationsmatrix
- **KI-Methode**: Vektorielle Autoregression (VAR), Korrelationsanalyse, Assoziationsregeln
- **Ausführung lokal**:
  ```bash
  npm install
  npm run dev
  ```
- **Docker**:
  ```bash
  docker build -t multi-produkt-prognose .
  docker run -p 80:80 multi-produkt-prognose
  ```
- **Besonderheiten**: Interaktive Korrelationsmatrix mit Hover-Effekten, Export aller Prognosen als Excel-Datei, Warnung bei erkannten Kannibalisierungseffekten
