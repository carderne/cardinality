# cardinality

Download OSM land masses from [OSM Data](https://osmdata.openstreetmap.de/data/land-polygons.html).

Raw data contains 700k+ land masses, so filter by area:
```bash
ogr2ogr land.gpkg -nln land land_raw.gpkg -dialect SQLite -sql \
  "SELECT *, ST_Area(geom) AS Area FROM land_raw WHERE area > 0.1"
```

Then manually assigned names in QGIS.

Then run the script:
```
./find_points.py land.gpkg out.geojson
```
