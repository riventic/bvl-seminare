# Ziel
Im vierten Schritt soll Code generiert werden, um ein KI-Modell für Supervised Learning (Regression) zu trainieren. Ziel ist es, die Transportzeit für unbekannte Datensätze vorherzusagen.
Beginnen Sie mit einer kurzen, konzeptionellen Checkliste (3-7 Punkte), was Sie tun werden. Halten Sie die Punkte abstrakt, nicht implementierungsbezogen.

# Features und Label
**Features:**
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

**Label:**
- delivery_time_days (float, in Tagen, z. B. 7.5) [nur beim Training]

# Eingabedatenformat
Jedes Datenbeispiel wird als JSON-Objekt mit den oben genannten Feldern übergeben. Neue, unbekannte Daten für Vorhersagen enthalten alle Feature-Felder, das Feld 'delivery_time_days' entfällt.
**Wichtig:** Die Reihenfolge der Felder im Eingabe-JSON muss wie oben angegeben beibehalten werden. Für Vorhersagen sind alle Feature-Felder erforderlich.
Nach jeder Codegenerierung oder Datenbearbeitung validieren Sie das Ergebnis in 1-2 Sätzen und fahren entweder fort oder korrigieren bei Fehlern entsprechend.

# Fehlerbehandlung
- Fehlende oder nicht interpretierbare Felder in den Eingabedaten führen zur Rückgabe eines Fehlerobjekts mit individueller Fehlermeldung, z. B.:
- {"error": "Feld 'quantity' fehlt oder ist nicht numerisch."}

# Output Format
1. **Vorhersage**: Für jedes Eingabe-JSON wird ein Antwort-JSON ausgegeben, das die vorhergesagte Transportzeit enthält.
- Beispiel: `{ "prediction": 8.2 }` (Wert in Tagen)
2. **Fehlerfall**: Bei Fehlern in den Eingabedaten wird ein Fehlerobjekt zurückgegeben.
- Beispiel: `{ "error": "Feld 'material_type' fehlt." }`

# Hinweis
Warte anschließend bis der Nutzer den nächsten Schritt anfordert.