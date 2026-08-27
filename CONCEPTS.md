# Concepts

Shared domain vocabulary for this project — entities, named processes, and status concepts with project-specific meaning. Seeded with core domain vocabulary, then accretes as ce-compound and ce-compound-refresh process learnings; direct edits are fine. Glossary only, not a spec or catch-all.

## Layout

### Living docs

The current product and layout contract for humans and agents: README (how to run), AGENTS.md (commands, recipe, working rules), docs/architecture.md (live folders), and this glossary. On conflict with older plans or past solution writeups, living docs plus the live tree win. Code plus package scripts win for runtime behavior.
_Avoid:_ treating historical plans as the operating recipe; copying Places JSON field tables into README or architecture

### Snapshot

A past plan or documented solution kept for history. It is not the current layout contract unless a dedicated refresh updates it.
_Avoid:_ copying snapshot recipes or test-first plan units into a new change unless this request asked for tests

## Nearby search

### Origin
The geographic center of a nearby search: a latitude/longitude used to draw and fit the search area on the map. It may be known immediately from a coordinates search, or resolved later by geocoding an address. Coordinate search also sends that same center to places; address search sends the address string to places and uses the geocoded origin only for the map. Until an origin exists, the map has nothing to fit or outline.

### Search area
The disk around the origin defined by the search radius. The map shows it as a circle and should fit the viewport to that disk; the radius is the same value sent with the places request.

### Nearby place
A place returned for the current origin and search area. The list is a result of the search, not the source of the map’s center or radius.

### Invalid search
Places rejected the search because it could not use the request, typically an address it cannot geocode. Distinct from too many types, retryable failure, and a successful empty list. Distinct from form `SearchRequestError` (empty address, invalid radius, missing coordinates). The list tells the explorer to change the address; it does not mean Places or the network failed to run, and it does not mean the category set overflowed Google’s type cap.

### Too many types
Places rejected the search because the selected category keys expand past Google’s included-primary-types cap. Distinct from invalid search and from retryable failure. Distinct from form `SearchRequestError`. The list tells the explorer to deselect some categories and search again; it does not mean the address was unusable or that Places was down. The cap is on expanded Google types, not on how many category checkboxes exist.

### Retryable failure
Places or the network could not complete a search that the UI already treated as valid to send. Distinct from invalid search, too many types, and a successful empty list. The list tells the explorer to wait and submit again; it does not mean the address was unusable or that too many categories were selected.
