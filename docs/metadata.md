# Metadata Documentation

## Dataset Title

Central Europe Employment Statistics and Country Boundary WebGIS Dataset

## Project Context

This metadata file documents the datasets used in the Central Europe Employment SDI WebGIS application. The application integrates statistical employment data with country boundary geometries in order to support comparative geospatial analysis.

## Spatial Dataset

**File:** `data/countries.geojson`

**Format:** GeoJSON

**Geometry type:** Polygon / MultiPolygon country boundaries

**Spatial coverage:** Austria and neighbouring countries used in the dashboard:

- Austria
- Germany
- Czechia
- Slovakia
- Hungary
- Slovenia
- Italy
- Switzerland

**Coordinate reference system:** WGS 84 geographic coordinate reference system, commonly used in web mapping.

**Key attribute:** `name`

The `name` attribute is used as the common join field between the spatial country boundaries and the employment statistics.

## Statistical Dataset

**File:** `data/employment_data.json`

**Format:** JSON

**Theme:** Employment rate statistics by country, year and sex.

**Main attributes:**

| Field | Description |
|---|---|
| Country | Country name |
| Year | Reporting year |
| Employment Rate | Employment rate value |
| Sex | Male, Female or Total |
| CNTR_ID | Country code |
| ISO3_CODE | ISO 3-character country code |
| Date | Standardized date field |

## Data Integration Method

The application integrates the spatial and statistical datasets in the browser using JavaScript. The country name stored in the GeoJSON boundary file is matched with the `Country` field in the employment statistics. This creates a dynamic thematic map without requiring a server-side database.

## Data Quality Notes

Some records may contain zero values or missing values, depending on data availability for specific countries and years. Within the application, zero values are treated as unavailable values where appropriate to avoid misleading map interpretation.

## SDI Relevance

The project demonstrates several SDI concepts:

- Spatial data access through web-compatible formats
- Attribute and geometry integration
- Metadata documentation
- Browser-based data publication
- Interoperable exchange formats such as GeoJSON and JSON
- Reusable project structure for GitHub Pages deployment

## Limitations

This is a static WebGIS application. It does not include a live spatial database, authentication layer, catalogue service, WMS, WFS or API endpoint. However, it represents a lightweight SDI-style implementation suitable for public portfolio demonstration and static web deployment.
