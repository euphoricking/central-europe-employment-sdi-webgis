# Central Europe Employment SDI WebGIS

A professional Spatial Data Infrastructure (SDI)-oriented WebGIS application for comparing employment rates in Austria and neighbouring Central European countries.

The application combines country boundary data in GeoJSON format with employment statistics in JSON format and presents them through an interactive Leaflet choropleth map, dashboard indicators, Chart.js visualisations, metadata documentation, an attribute table and CSV export.

## Live Application

After publishing with GitHub Pages, the application can be launched from:

```text
https://YOUR-GITHUB-USERNAME.github.io/central-europe-employment-sdi-webgis/
```

## Key Features

- Professional responsive WebGIS layout
- Leaflet choropleth map with multiple basemap options
- Austria versus neighbouring country comparison
- Filters for reporting year, employment indicator and comparison country
- Country search
- Quantile and equal-interval classification options
- Multiple colour schemes for cartographic styling
- Country labels and pair highlighting
- Dynamic map legend
- Interactive country popups and tooltips
- KPI cards for Austria, comparison country, difference and regional average
- Automated interpretation text
- Stable Chart.js panels for:
  - Austria vs comparison by sex
  - employment trend over time
  - country ranking
- Attribute table
- CSV export
- Print-friendly layout
- Metadata and documentation files
- GitHub Pages-compatible static structure

## Why this is an SDI Project

The project demonstrates core SDI principles in a compact web application:

1. **Spatial data layer**: country boundary data stored as GeoJSON.
2. **Attribute data layer**: employment statistics stored as JSON.
3. **Metadata**: documentation describing data, structure and usage.
4. **Interoperability**: open web formats including HTML, CSS, JavaScript, JSON and GeoJSON.
5. **Web publication**: static deployment through GitHub Pages.
6. **User access**: browser-based interaction, filtering, analysis and export.

## Project Structure

```text
central-europe-employment-sdi-webgis/
│
├── index.html
├── README.md
├── portfolio_project_text.md
├── GITHUB_UPLOAD_GUIDE.md
│
├── css/
│   └── style.css
│
├── js/
│   └── app.js
│
├── data/
│   ├── countries.geojson
│   └── employment_data.json
│
├── docs/
│   ├── metadata.md
│   └── application_overview.md
│
└── assets/
```

## How to Run Locally

Because the application uses `fetch()` to load local JSON and GeoJSON files, run it through a local server.

### Option 1: Python local server

Open the project folder in a terminal and run:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

### Option 2: VS Code Live Server

1. Open the project folder in Visual Studio Code.
2. Install the Live Server extension if it is not already installed.
3. Right-click `index.html`.
4. Select **Open with Live Server**.

## GitHub Pages Deployment

1. Create a public GitHub repository.
2. Upload the files so that `index.html` is in the repository root.
3. Go to **Settings > Pages**.
4. Set source to **Deploy from a branch**.
5. Choose the `main` branch and `/root` folder.
6. Save and wait for GitHub Pages to publish the site.

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Leaflet
- Chart.js
- GeoJSON
- JSON
- GitHub Pages

## Portfolio Context

This project was refined for the Spatial Data Infrastructure course and demonstrates the ability to design, document and publish a geospatial web application using open web technologies.

## Author

Ekata Leo Oni  
MSc Applied Geoinformatics
