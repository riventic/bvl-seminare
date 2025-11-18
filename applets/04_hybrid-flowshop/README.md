# Hybrid Flowshop Scheduling

**2-Stufen-Maschinenbelegungsplanung mit Rüstzeitoptimierung**

Diese Applikation löst ein komplexes Hybrid-Flowshop-Scheduling-Problem für die Produktionsplanung. Das System simuliert eine 2-stufige Fertigungsumgebung mit Rüstzeit-Constraints und bietet sowohl manuelle Planung, verschiedene Scheduling-Heuristiken als auch eine genetische Algorithmus-Optimierung.

## Problemstellung

### Fertigungsumgebung

- **Stufe 1 (SMD)**: 4 parallele Maschinen
- **Stufe 2 (AOI)**: 5 parallele Maschinen
- **Jobs**: 50+ Fertigungsaufträge mit individuellen Bearbeitungszeiten und Fälligkeitsterminen

### Constraints

1. **Sequenzielle Fertigung**: Jeder Job muss zuerst Stufe 1, dann Stufe 2 durchlaufen
2. **Rüstzeitbeschränkung**:
   - Jede Maschine in Stufe 1 benötigt ein Setup-Kit (Familie)
   - Rüstzeit: 20 Minuten, wenn Familienwechsel erforderlich
   - **KRITISCH**: Es kann immer nur EIN Setup-Kit an EINER Maschine gleichzeitig sein
3. **Parallele Verarbeitung**: Mehrere Jobs können gleichzeitig auf verschiedenen Maschinen laufen
4. **FIFO für Stufe 2**: Jobs werden nach Fertigstellung in Stufe 1 in Stufe 2 eingereiht

### Zielfunktion

Minimierung von:
- **Makespan**: Gesamtdauer bis zur Fertigstellung aller Jobs
- **Verspätung**: Summe der Verspätungen gegenüber Fälligkeitsterminen

## Funktionen

### 1. Manuelle Job-Reihenfolge (Drag & Drop)

- **Interaktive Warteschlange**: Ziehen Sie Jobs per Drag & Drop, um die Reihenfolge für Stufe 1 zu ändern
- **Job-Karten**: Jede Karte zeigt:
  - Job-ID
  - Familie (Setup-Kit-Typ)
  - Bearbeitungszeiten (SMD und AOI)
  - Fälligkeitstermin
- **Echtzeit-Feedback**: Visuelle Indikatoren für Familienzugehörigkeit (Farb-Codierung)

### 2. Live-Simulation

- **Gantt-Diagramm**:
  - 2D-Canvas-Visualisierung mit Konva
  - 9 Maschinen-Zeilen (4 für Stufe 1, 5 für Stufe 2)
  - Farbcodierte Job-Blöcke nach Familie
  - Graue Setup-Blöcke für Rüstvorgänge
  - Rote Umrandung für verspätete Jobs
- **Interaktive Features**:
  - Zoom In/Out
  - Hover-Tooltips mit Job-Details
  - Zeitachse mit Minutenmarkierungen
- **Echtzeit-Statistiken**:
  - Makespan (Gesamtdauer)
  - Gesamtverspätung und Durchschnittsverspätung
  - Anzahl Rüstvorgänge
  - Maschinenauslastung pro Stufe
  - Pünktliche vs. verspätete Jobs

### 3. Scheduling-Heuristiken

Wählen Sie aus verschiedenen Planungsstrategien:

- **MANUAL**: Manuell festgelegte Reihenfolge per Drag & Drop
- **FIFO (First In First Out)**: Jobs in ursprünglicher Reihenfolge
- **EDD (Earliest Due Date)**: Sortierung nach frühestem Fälligkeitstermin
- **SPT (Shortest Processing Time)**: Kürzeste Bearbeitungszeit zuerst
- **FAMILY_GROUP**: Gruppierung nach Familien zur Minimierung von Rüstvorgängen

### 4. Genetische Optimierung

- **Automatische Optimierung**: Genetischer Algorithmus findet optimale Job-Reihenfolge
- **Parameter**:
  - Populationsgröße: 100 Individuen
  - Generationen: 500
  - Crossover-Rate: 80%
  - Mutations-Rate: 20%
  - Elite-Erhaltung: Top 10
- **Web Worker**: Optimierung läuft im Hintergrund ohne UI-Blockierung
- **Fortschrittsanzeige**:
  - Aktuelle Generation / Gesamt
  - Beste Fitness (Zielfunktionswert)
  - Ausführungszeit
- **Ergebnisanzeige**:
  - Optimierte Job-Reihenfolge
  - Verbesserung gegenüber Ausgangslösung (%)
  - Makespan und Verspätung

### 5. Constraint-Enforcement

Das System erzwingt automatisch alle Constraints:

- **Setup-Kit-Verwaltung**: Tracking welches Kit wo ist
- **Wartezeiten**: Jobs warten automatisch, wenn benötigtes Kit an anderer Maschine ist
- **Reihenfolgetreue**: Stufe 2 startet erst nach Stufe 1
- **Maschinenverfügbarkeit**: Berücksichtigung von Bearbeitungs- und Rüstzeiten

## Datenformat

### Excel-Datei: `input.xlsx`

| Spalte    | Beschreibung                        | Beispiel |
|-----------|-------------------------------------|----------|
| id        | Eindeutige Job-ID                   | 1        |
| due date  | Fälligkeitstermin (in Minuten)      | 1305     |
| family    | Familie/Setup-Kit-Typ (1-42)        | 42       |
| t_smd     | Bearbeitungszeit Stufe 1 (Minuten)  | 4        |
| t_aoi     | Bearbeitungszeit Stufe 2 (Minuten)  | 5        |

**Hinweis**: Die Datei enthält 50+ Jobs mit 7+ verschiedenen Familien.

## Technologie

### Frontend Framework
- **React 19** mit TypeScript (Strict Mode)
- **React Compiler** für automatische Optimierung
- **Material UI 7** für moderne UI-Komponenten
- **Lucide Icons** für Symbole

### Visualisierung & Interaktion
- **Konva** (10.0.9) und **react-konva** für 2D-Canvas-Rendering
- **@dnd-kit** für Drag & Drop-Funktionalität
- **Recharts** für Diagramme (optional für Fitness-Verlauf)

### Datenverarbeitung
- **xlsx** (SheetJS) für Excel-Datei-Parsing
- **Web Workers** für Hintergrund-Optimierung

### i18n & Styling
- **i18next** für deutsche Lokalisierung
- **Emotion** für CSS-in-JS Styling
- **MUI Design System** mit 8-Punkt-Grid

### Build & Deployment
- **Vite** als Build-Tool
- **Docker** mit Multi-Stage-Build
- **Nginx** für Production Serving

## Algorithmen

### 1. Discrete Event Simulation

Die Simulation basiert auf einem Event-Queue-System:

```
EVENTS:
- SETUP_START: Rüstvorgang beginnt
- SETUP_END: Rüstvorgang beendet, Job kann starten
- JOB_START: Job-Bearbeitung startet
- JOB_END: Job-Bearbeitung endet
- STAGE1_COMPLETE: Job verlässt Stufe 1, geht in Stufe 2-Queue
```

**Scheduling-Logik für Stufe 1**:
1. Für jeden Job in der Sequenz:
2. Finde frühest verfügbare Maschine
3. Prüfe Setup-Kit-Verfügbarkeit:
   - Wenn Kit bereits an Maschine: Kein Setup
   - Wenn Kit an anderer Maschine: Warten + 20 min Setup
   - Wenn Kit frei: Ggf. warten auf Maschine + 20 min Setup
4. Starte Bearbeitung nach Setup
5. Update Maschinen- und Kit-Status

**Scheduling-Logik für Stufe 2**:
1. Jobs werden in FIFO-Reihenfolge (nach Stufe-1-Fertigstellung) verarbeitet
2. Zuteilung zur frühest verfügbaren Maschine
3. Start frühestens nach Ende von Stufe 1

### 2. Genetischer Algorithmus

**Chromosomen-Codierung**: Permutation der Job-IDs (Job-Reihenfolge für Stufe 1)

**Fitness-Funktion**:
```
fitness = makespan + tardinessWeight * totalTardiness
```
(Niedrigere Werte sind besser)

**Genetische Operatoren**:

1. **Selektion**: Tournament Selection (Größe 3)
   - Wähle zufällig 3 Individuen
   - Nimm das Beste der 3

2. **Crossover**: Order Crossover (OX)
   - Kopiere Segment aus Parent 1
   - Fülle Rest in Reihenfolge aus Parent 2
   - Erhält relative Reihenfolge

3. **Mutation**: Swap Mutation
   - Vertausche zwei zufällige Positionen
   - Erhält Permutations-Eigenschaft

4. **Elitismus**: Top 10 Individuen werden direkt übernommen

**Ablauf**:
```
1. Initialisierung: Zufällige Permutationen + ggf. initiale Lösung
2. FOR Generation 1 TO 500:
   a. Evaluiere Fitness aller Individuen
   b. Sortiere Population
   c. Übernehme Elite (Top 10)
   d. WHILE Population nicht voll:
      - Selektiere 2 Parents (Tournament)
      - Crossover (80% Wahrscheinlichkeit)
      - Mutation (20% Wahrscheinlichkeit)
      - Füge Offspring hinzu
3. Rückgabe: Bestes Individuum
```

## Installation & Ausführung

### Voraussetzungen
- Node.js 20+
- npm oder yarn

### Lokal entwickeln

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Die Applikation läuft dann auf `http://localhost:5173`

### Produktions-Build

```bash
# TypeScript kompilieren und Build erstellen
npm run build

# Preview des Production-Builds
npm run preview
```

### Docker

```bash
# Image bauen
docker build -t hybrid-flowshop .

# Container starten
docker run -p 80:80 hybrid-flowshop
```

Öffnen Sie dann `http://localhost` im Browser.

## Bedienung

### Schritt 1: Daten laden
- Beim Start werden die Jobs automatisch aus `input.xlsx` geladen
- Initial wird die FIFO-Reihenfolge verwendet

### Schritt 2: Job-Reihenfolge festlegen
Wählen Sie eine Methode:
- **Manuell**: Ziehen Sie Jobs in der linken Liste per Drag & Drop
- **Heuristik**: Wählen Sie eine Strategie (FIFO, EDD, SPT, Family Group)
- **Optimierung**: Klicken Sie auf "Optimieren" für genetische Optimierung

### Schritt 3: Simulation ausführen
- Klicken Sie auf "Simulation starten"
- Das Gantt-Diagramm zeigt die resultierende Belegung
- Statistiken werden automatisch berechnet

### Schritt 4: Ergebnisse analysieren
- **Gantt-Diagramm**: Visualisiert Maschinen-Belegung über Zeit
  - Farbige Blöcke = Jobs (Farbe = Familie)
  - Graue Blöcke = Setup-Vorgänge
  - Rote Umrandung = Verspätete Jobs
- **Statistiken**: Zeigt Makespan, Verspätung, Auslastung, etc.
- **Zoom**: Nutzen Sie Zoom-Buttons für Details

### Schritt 5: Optimierung (optional)
1. Klicken Sie auf "Optimieren (Genetischer Algorithmus)"
2. Beobachten Sie den Fortschritt (Generation, beste Fitness)
3. Nach Abschluss (ca. 10-30 Sekunden):
   - Die optimierte Reihenfolge wird übernommen
   - Simulation wird automatisch ausgeführt
   - Verbesserung wird angezeigt

## Performance-Metriken

Die Applikation berechnet und zeigt folgende KPIs:

1. **Makespan**: Zeit bis zur Fertigstellung aller Jobs (Ziel: minimieren)
2. **Gesamtverspätung**: Summe aller Verspätungen (Ziel: minimieren)
3. **Durchschnittsverspätung**: Verspätung pro Job (Ziel: minimieren)
4. **Anzahl Rüstvorgänge**: Wie oft wurde umgerüstet (Ziel: minimieren)
5. **Auslastung Stufe 1**: Prozentsatz der Maschinennutzung (Ziel: maximieren)
6. **Auslastung Stufe 2**: Prozentsatz der Maschinennutzung (Ziel: maximieren)
7. **Pünktliche Jobs**: Anzahl Jobs vor/am Fälligkeitstermin (Ziel: maximieren)
8. **Verspätete Jobs**: Anzahl Jobs nach Fälligkeitstermin (Ziel: minimieren)

## Besonderheiten

### Setup-Kit-Constraint

Die wichtigste Besonderheit ist die **exklusive Setup-Kit-Nutzung**:

- Wenn Job A mit Familie 5 auf Maschine 1 läuft, kann kein anderer Job der Familie 5 auf einer anderen Maschine starten
- Jobs müssen warten, bis das Kit frei wird
- Dies führt zu komplexen Abhängigkeiten und Wartezeiten
- Der genetische Algorithmus findet Sequenzen, die diese Wartezeiten minimieren

### UI/UX Design

- **Responsive Layout**: Grid-basiertes Layout passt sich an Bildschirmgröße an
- **Farbcodierung**: Jede Familie hat eine eindeutige Farbe (12 Farben)
- **Interaktive Visualisierung**: Zoom, Hover-Tooltips, Click-Highlighting
- **Deutsche Lokalisierung**: Alle Texte in Deutsch über i18next

### Technische Features

- **TypeScript Strict Mode**: Vollständige Typsicherheit
- **React 19 Compiler**: Automatische Memoization (kein manuelles useMemo)
- **Web Worker**: Genetischer Algorithmus blockiert UI nicht
- **Konva Canvas**: Hochperformante 2D-Rendering für große Gantt-Diagramme
- **MUI Design System**: Konsistente, professionelle UI-Komponenten

## Erweiterungsmöglichkeiten

Mögliche zukünftige Erweiterungen:

1. **Mehr Stufen**: Erweitern auf 3+ Produktionsstufen
2. **Verschiedene Setup-Zeiten**: Familienabhängige Rüstzeiten
3. **Maschinenausfälle**: Simulation von Wartung und Störungen
4. **Batch-Verarbeitung**: Jobs können gruppiert werden
5. **Echtzeitdaten**: Integration mit MES-Systemen
6. **Multi-Objective-Optimierung**: Pareto-Optimierung für mehrere Ziele
7. **Machine Learning**: Prediction von Setup-Zeiten und Bearbeitungszeiten
8. **3D-Visualisierung**: Erweiterte Darstellung der Fertigung

## Lizenz

Dieses Projekt wurde für BVL Seminare entwickelt zur Demonstration von KI-gestützter Produktionsplanung.

## Kontakt

Bei Fragen oder Feedback kontaktieren Sie bitte BVL Seminare.

---

**Entwickelt mit React 19, TypeScript, Material UI 7, Konva und d**
