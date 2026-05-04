# Application Overview

## Title

Central Europe Employment SDI WebGIS

## Purpose

The application supports comparative visual analysis of employment rates in Austria and neighbouring countries. It is designed as an SDI-oriented WebGIS application that integrates spatial boundaries, statistical attributes, metadata, web cartography and downloadable results.

## Application Layout

The interface contains three main areas:

1. **SDI Control Centre**: filters, classification controls, colour scheme selection, labels, table visibility and export.
2. **Interactive Map**: Leaflet choropleth map with basemap options, legend, labels, popups and selected-country highlighting.
3. **Analytics Panel**: KPI cards, charts, automated interpretation and country ranking.

## Main Functions

- Select reporting year
- Select mapped indicator
- Compare Austria with a neighbouring country
- Search for a country
- Change choropleth classification method
- Change colour scheme
- Toggle labels and highlights
- Inspect country values through popups and tooltips
- Export selected data as CSV
- Print a simplified map/report view

## Cartographic Methods

The application uses choropleth mapping to communicate country-level employment indicators. It supports quantile and equal-interval classification and includes multiple colour schemes. The gender gap indicator can be mapped using a diverging-style palette.

## Deployment

The project is static and can be deployed directly through GitHub Pages. The only requirement is that `index.html` remains in the repository root.
