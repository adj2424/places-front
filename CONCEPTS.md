# Concepts

Shared domain vocabulary for this project — entities, named processes, and status concepts with project-specific meaning. Seeded with core domain vocabulary, then accretes as ce-compound and ce-compound-refresh process learnings; direct edits are fine. Glossary only, not a spec or catch-all.

## Nearby search

### Origin
The geographic center of a nearby search: a latitude/longitude used to draw and fit the search area on the map. It may be known immediately from a coordinates search, or resolved later by geocoding an address. Coordinate search also sends that same center to places; address search sends the address string to places and uses the geocoded origin only for the map. Until an origin exists, the map has nothing to fit or outline.

### Search area
The disk around the origin defined by the search radius. The map shows it as a circle and should fit the viewport to that disk; the radius is the same value sent with the places request.

### Nearby place
A place returned for the current origin and search area. The list is a result of the search, not the source of the map’s center or radius.
