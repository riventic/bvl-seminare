# BVL Seminare - KI in Logistik & Supply Chain Management

Interaktive Beispiele (Applets) demonstrieren den Einsatz von Künstlicher Intelligenz in moderner Logistik und Supply Chain Management.

## 🚀 Live Demo

**Landing Page**: [https://<username>.github.io/bvl-seminare/](https://<username>.github.io/bvl-seminare/)

Alle Applets sind über die Landing Page zugänglich und werden automatisch bei Änderungen deployed.

## 📦 Verfügbare Applets

### Prognose
- **00** - Zeitreihenprognose mit KI
- **02** - Multi-Produkt Absatzprognose

### Routenplanung
- **03** - Multi-Stop Tourenplanung

### Produktionsplanung
- **04** - Hybrid Flowshop Scheduling

## 🛠️ Technologie-Stack

### Frontend
- **React 19** - Modern UI framework mit React Compiler
- **TypeScript 5.9** - Type-safe development
- **Material UI 7** - Component library
- **Vite 7** - Build tool und dev server
- **Konva** - 2D Canvas rendering (optional)
- **Recharts** - Datenvisualisierung

### Build & Deployment
- **GitHub Actions** - CI/CD Pipeline
- **GitHub Pages** - Hosting
- **Docker** - Containerization (optional)
- **Nginx** - Production web server (Docker)

### Design System
- Custom color palette (Purple & Orange theme)
- 8-point spacing grid
- Responsive design
- German language UI

## 📁 Projekt-Struktur

```
bvl-seminare/
├── applets/                    # Alle Applets
│   ├── 00_zeitreihenprognose/ # Applet 00
│   ├── 02_multi-produkt-prognose/ # Applet 02
│   ├── 03_tourenplanung/      # Applet 03
│   └── 04_hybrid-flowshop/    # Applet 04
├── landing-page/              # Landing Page Applikation
│   ├── src/
│   │   ├── components/        # React Komponenten
│   │   ├── theme/             # Design System
│   │   ├── App.tsx            # Haupt-Komponente
│   │   └── main.tsx           # Entry Point
│   ├── package.json
│   └── vite.config.ts
├── template/                  # Template für neue Applets
│   ├── package.json           # Dependencies
│   ├── vite.config.ts         # Vite Konfiguration
│   ├── tsconfig.json          # TypeScript Config
│   └── Dockerfile             # Docker Build
├── .github/workflows/         # GitHub Actions
│   ├── build-and-deploy.yml   # Deployment Workflow
│   └── README.md              # Workflow Dokumentation
├── applets.json               # Applet Metadaten
└── README.md                  # Diese Datei
```

## 🚀 Quick Start

### Neues Applet erstellen

1. **Kopiere das Template**:
   ```bash
   cp -r template applets/10
   cd applets/10
   ```

2. **Installiere Dependencies**:
   ```bash
   npm install
   ```

3. **Entwicklung starten**:
   ```bash
   npm run dev
   ```

4. **Applet zu `applets.json` hinzufügen**:
   ```json
   {
     "id": "10",
     "title": "Dein Applet Titel",
     "description": "Beschreibung...",
     "path": "applets/10",
     "category": "Kategorie",
     "tags": ["Tag1", "Tag2"]
   }
   ```

5. **README.md erstellen**:
   ```bash
   # Siehe andere Applets als Vorlage
   vi README.md
   ```

### Lokale Entwicklung

**Einzelnes Applet**:
```bash
cd applets/00_zeitreihenprognose
npm install
npm run dev
```

**Landing Page**:
```bash
cd landing-page
npm install
npm run dev
```

### Production Build

**Alle Applets + Landing Page bauen**:
```bash
cd landing-page
./build-all.sh

# Oder nur Landing Page bauen (kopiert existierende Applet-Builds):
./build-all.sh --landing-only
```

Das Build-Script erstellt ein `landing-page/dist` Verzeichnis mit allen Applets:
```
landing-page/dist/
├── index.html              (Landing page)
├── assets/                 (Landing page assets)
├── applets.json            (Applet metadata)
└── applets/
    ├── 00_zeitreihenprognose/
    ├── 02_multi-produkt-prognose/
    ├── 03_tourenplanung/
    └── 04_hybrid-flowshop/
```

**Lokalen Preview starten**:
```bash
cd landing-page
npx serve dist -p 8080
# Dann öffnen: http://localhost:8080/
```

**Einzelnes Applet bauen**:
```bash
cd applets/00_zeitreihenprognose
npm run build
# Output in dist/
```

**Mit Docker (einzelnes Applet)**:
```bash
cd applets/00_zeitreihenprognose
docker build -t applet-00 .
docker run -p 80:80 applet-00
# Jedes Applet hat sein eigenes Dockerfile mit Nginx-Konfiguration
```

## 🔄 Deployment

### Automatisches Deployment

Bei Push zu `master`:
1. Workflow erkennt geänderte Applets
2. Baut nur geänderte Applets
3. Deployed zu GitHub Pages
4. Behält unveränderte Applets bei

**Beispiel**:
```bash
# Ändere Applet 01
cd applets/01
# Mache Änderungen...
git add .
git commit -m "Update Applet 01"
git push
# → Nur Applet 01 wird neu gebaut und deployed
```

### Manuelles Deployment

Alle Applets neu bauen:
1. GitHub → Actions
2. "Build and Deploy to GitHub Pages"
3. "Run workflow"

### Smart Build-Strategie

| Änderung | Build-Verhalten |
|----------|-----------------|
| Einzelnes Applet | Nur dieses Applet |
| Template | ALLE Applets |
| applets.json | ALLE Applets |
| Landing Page | Nur Landing Page |
| Mehrere Applets | Nur geänderte Applets |

## 📋 Workflow

Siehe [Workflow Dokumentation](.github/workflows/README.md) für Details zu:
- Build-Prozess
- Deployment-Struktur
- Troubleshooting
- Konfiguration

## 🎨 Design System

### Farben
- **Primary**: Purple (#6C5FC7)
- **Secondary**: Orange (#FF6B35)
- **Kategorien**:
  - Prognose: Purple
  - Routenplanung: Orange
  - Flottenmanagement: Blue
  - Zustellung: Green
  - Lagerverwaltung: Amber

### Komponenten
- Standardisierte MUI-Komponenten
- Custom AppletCard für Landing Page
- Responsive Grid-Layout
- Hover-Effekte und Transitions

## 🔧 Konfiguration

### Base Path (GitHub Pages)
- Aktuell: `/bvl-seminare/`
- Ändern in:
  - `landing-page/vite.config.ts`
  - `.github/workflows/build-and-deploy.yml`
  - `landing-page/src/App.tsx`

### Environment Variables
- `VITE_BASE_PATH`: Base path für Vite build

## 📝 Konventionen

### Applet-Nummerierung
- Format: `00`, `01`, `02`, ... `09`, `10`
- Verzeichnisname: `00_zeitreihenprognose` oder `01`, `02`, etc.

### Kategorien
- Prognose
- Routenplanung
- Flottenmanagement
- Zustellung
- Lagerverwaltung

### Commits
- Deutsch oder Englisch
- Beschreibende Messages
- Ein Applet pro Commit (für smart builds)

## 🐛 Troubleshooting

### Build schlägt fehl
```bash
# Lokal testen
cd applets/XX
npm ci
npm run build
```

### Applet wird nicht deployed
1. Prüfe Actions Tab für Fehler
2. Verifiziere `applets.json` Syntax
3. Manuelles Deployment auslösen

### Landing Page zeigt Applet nicht
1. Prüfe `applets.json` path
2. Cache leeren
3. GitHub Pages braucht 1-2 Minuten

## 📚 Ressourcen

- [React 19 Docs](https://react.dev/)
- [Material UI](https://mui.com/)
- [Vite](https://vitejs.dev/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [GitHub Pages](https://pages.github.com/)

## 📄 Lizenz

Alle Rechte vorbehalten - BVL Seminare

## 🤝 Beiträge

Siehe `CLAUDE.md` für Entwicklungsrichtlinien und Design System Details.
