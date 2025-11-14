# Ziel
Im siebten Schritt soll mit Gradio eine Web-App erstellt und lokal gehostet werden. Beginne mit einer kurzen konzeptuellen Checkliste (3–7 Punkte), bevor du mit der Umsetzung fortfährst. Das zu verwendende Modell wird beim Start der Benutzeroberfläche einmalig geladen und für alle Vorhersagen im Speicher gehalten (kein erneutes Laden bei jeder Anfrage).

# Anforderungen und Funktionalitäten

## CSV-Upload
- Nutzer können eine CSV-Datei hochladen.
- Das CSV-Format muss folgende Spalten enthalten:
    - material_type (string, z. B. "Elektronik")
    - quantity (float oder int, z. B. 1000)
    - supplier_location (string, z. B. "Berlin")
    - destination_location (string, z. B. "Hamburg")
    - distance_km (float, in km, z. B. 280.0)
    - transport_mode (string, z. B. "Straße")
    - route_type (string, z. B. "domestic_germany")
    - order_date (string, ISO-Format, z. B. "2024-07-05")
    - weather_conditions (string, z. B. "Regnerisch", "Nebel")
    - holiday_season (boolean, true/false)

## Fehlerbehandlung beim Datei-Upload
- Wenn die hochgeladene CSV-Datei fehlende oder fehlerhafte Spalten bzw. Datentypen enthält, wird eine verständliche Fehlermeldung angezeigt (z.B. „Spalte 'material_type' fehlt“ oder „Ungültiges Datenformat in Spalte 'order_date'“).
- Fehlerbehandlungslogik für:
- fehlende oder falsche Spaltennamen,
- unpassende Datentypen,
- fehlerhafte Datei.

## Vorhersage
- Nach dem Upload kann der Nutzer eine Schaltfläche zur Ausführung der Vorhersage betätigen.
- Die komplette CSV-Datei wird idealerweise als Ganzes verarbeitet (keine zeilenweise Vorhersage im Interface).

## Ergebnisse
- Nach der Vorhersage erscheinen die Eingabedaten zusammen mit den zugehörigen Ausgabedaten tabellarisch in der Benutzeroberfläche.
- Optional: Download-Möglichkeit für die Ergebnistabelle als CSV.

# Struktur der Web-App (Output Format)
- Upload-Element für CSV-Datei
- Beschreibung des erwarteten CSV-Formats (mindestens: Spaltennamen, Datentypen)
- Schaltfläche zum Ausführen der Vorhersage
- Tabellarische Anzeige der kombinierten Eingabe- und Ausgabedaten nach der Vorhersage
- Option zum Download der Ergebnis-Tabelle als CSV-Datei
- Fehlerbehandlungslogik für die oben genannten Fehlerfälle
- Das Modell wird beim Start geladen und bleibt für alle Vorhersagen im Speicher

Setze nach jedem wesentlichen Schritt eine kurze Validierung (1–2 Sätze) und entscheide, ob du fortfährst oder bei Fehlern selbstständig korrigierst. Passe die interne Reasoning-Tiefe dem mittleren Komplexitätsgrad der Aufgabe an; halte Tool-Interaktionen prägnant, biete in der finalen Nutzer-Ausgabe vollständige Information.
Request changes (optional)

# Hinweis
Warte anschließend bis der Nutzer den nächsten Schritt anfordert.
