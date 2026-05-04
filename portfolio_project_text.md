# Central Europe Employment SDI WebGIS: A Spatial Data Infrastructure-Based Dashboard for Comparative Employment Analysis

## Project Overview

Central Europe Employment SDI WebGIS is a professional WebGIS application developed to demonstrate Spatial Data Infrastructure principles through a comparative employment analysis for Austria and neighbouring Central European countries. The application integrates country boundary data with employment statistics and publishes the result as an interactive browser-based geospatial dashboard.

The project was designed as more than a simple web map. It includes a structured user interface, data query controls, advanced cartographic styling options, interactive map layers, analytical charts, an attribute table, metadata documentation and CSV export. It therefore reflects the wider SDI workflow of organising spatial data, connecting it with attribute information, documenting it, and making it accessible through a web-based platform.

## Aim

The aim of the project is to create a professional SDI-style WebGIS application that allows users to explore and compare employment indicators between Austria and neighbouring countries using interactive geovisualisation methods.

## Objectives

The project objectives are to:

- integrate spatial boundary data and employment statistics into a browser-based WebGIS application;
- provide user controls for selecting reporting year, employment indicator and comparison country;
- visualise employment indicators using choropleth mapping;
- provide cartographic options such as classification method and colour scheme;
- support Austria-versus-country comparison through KPI cards and charts;
- document the dataset, structure and application workflow;
- publish the application using a GitHub Pages-ready static structure.

## Data and Technologies

The project uses country boundary data in GeoJSON format and employment statistics in JSON format. The application was developed with HTML, CSS, JavaScript, Leaflet and Chart.js. These technologies make the project suitable for GitHub Pages because the application can run as a static web project without a backend server.

## WebGIS and SDI Components

The application demonstrates several important SDI components. The GeoJSON file represents the spatial data layer, while the employment statistics JSON file represents the attribute data layer. Metadata and application documentation are included in the `docs` folder. The interface provides access to map-based analysis, chart-based interpretation, data inspection and CSV export. This makes the project a compact example of geospatial data publication, access and reuse.

## Cartographic Design

The application applies advanced cartographic design principles through choropleth mapping, sequential and diverging colour schemes, dynamic legends, quantile and equal-interval classification, country labels, highlighted comparison countries, interactive tooltips and popups. These features improve readability and allow users to understand spatial differences in employment indicators across the study region.

## Main Application Features

The WebGIS includes a professional dashboard layout with a control panel, central map area and analytical panel. Users can select a year, choose an employment indicator, compare Austria with another country, search for countries, change the classification method and switch colour schemes. The map updates dynamically based on these selections.

The analytical section includes KPI cards, an Austria-versus-comparison chart, a time-series trend chart, country ranking chart, automated interpretation text and an attribute table. Users can also export the currently selected data as CSV.

## Skills Demonstrated

This project demonstrates skills in Spatial Data Infrastructure design, WebGIS development, geovisualization, advanced cartography, JavaScript programming, Leaflet mapping, Chart.js visualisation, GeoJSON handling, metadata documentation, responsive interface design and GitHub Pages deployment.

## Reflection

This project helped transform a basic employment dashboard into a professional SDI-oriented WebGIS application. The refinement process improved the visual design, map usability, analytical capability and documentation quality. It also showed how spatial and statistical data can be organised into a reusable and accessible web platform using open web standards.
