# Prognose von Transportzeiten (Machine Learning Projekt)

Ein Projekt zur Vorhersage von Transport-Lieferzeiten basierend auf historischen Daten mittels eines Regressionsmodells. Das Modell wird über eine interaktive Web-App (via Gradio) für Batch-Vorhersagen bereitgestellt.

## 🎯 Projektziel

Das Ziel dieses Projekts ist die Entwicklung eines Machine-Learning-Modells, das die Transportzeit (in Tagen) für die Lieferung von Materialien und Produkten zwischen verschiedenen Standorten vorhersagt. 

Auf Basis der folgenden 10 Merkmale wird die Lieferzeit (`delivery_time_days`) prognostiziert:
* Materialart
* Menge
* Lieferantenstandort
* Kundenstandort
* Distanz
* Transportart
* Routentyp
* Datum
* Wetter
* Ferienzeit

## 🚀 Modell-Leistung

Das trainierte Modell (ein `RandomForestRegressor` innerhalb einer Scikit-learn-Pipeline) erzielt auf den Testdaten eine hervorragende Genauigkeit:

* **R-squared (R²): ~0.98** (Das Modell erklärt 98% der Varianz in den Transportzeiten).
* **Root Mean Squared Error (RMSE): ~3.82 Tage** (Der durchschnittliche Vorhersagefehler des Modells).

## 🛠️ Technologie-Stack

* **Datenanalyse & -verarbeitung:** Pandas, NumPy
* **Visualisierung:** Altair
* **Machine Learning:** Scikit-learn (Pipeline, RandomForestRegressor, ColumnTransformer, StandardScaler, OneHotEncoder)
* **Modell-Speicherung:** Joblib
* **Web-App:** Gradio

---

## 🏃‍♀️ Anwendung starten (Gradio Web-App)

Um die Web-App lokal zu starten, folgen Sie diesen Schritten.

### 1. Klonen & Installieren

Klonen Sie das Repository und installieren Sie die notwendigen Abhängigkeiten:

```bash
# Klonen Sie Ihr Repository
git clone [IHRE-REPO-URL]
cd [IHR-REPO-NAME]

# Erstellen Sie eine 'requirements.txt' mit dem u.g. Inhalt
# und installieren Sie die Pakete
pip install -r requirements.txt