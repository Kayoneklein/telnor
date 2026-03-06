

/// Constants for location types returned by geocode script
enum GeocodeLocationType {
  rooftop,
  approximate,
}

/// Latitude and longitude for single location
class GeocodeLocation {
  const GeocodeLocation({
    required this.latitude,
    required this.longitude,
  });

  final double latitude;
  final double longitude;

  static GeocodeLocation fromJson(Map<String, dynamic> data) => GeocodeLocation(
        latitude: data['lat'],
        longitude: data['lng'],
      );
}

/// Geometry object returned
class GeocodeGeometry {
  const GeocodeGeometry({
    required this.locationType,
    required this.location,
    required this.boundsNorthEast,
    required this.boundsSouthWest,
    required this.viewportNorthEast,
    required this.viewportSouthWest,
  });

  final GeocodeLocationType locationType;
  final GeocodeLocation location;
  final GeocodeLocation? boundsNorthEast;
  final GeocodeLocation? boundsSouthWest;
  final GeocodeLocation viewportNorthEast;
  final GeocodeLocation viewportSouthWest;

  static GeocodeGeometry fromJson(Map<String, dynamic> data) => GeocodeGeometry(
        locationType: _parseLocationType(data['location_type']),
        location: GeocodeLocation.fromJson(data['location']),
        boundsNorthEast: data['bounds'] != null ? GeocodeLocation.fromJson(data['bounds']['northeast']) : null,
        boundsSouthWest: data['bounds'] != null ? GeocodeLocation.fromJson(data['bounds']['southwest']) : null,
        viewportNorthEast: GeocodeLocation.fromJson(data['viewport']['northeast']),
        viewportSouthWest: GeocodeLocation.fromJson(data['viewport']['southwest']),
      );
}

/// Result returned by geocode script
class GeocodeResult {
  const GeocodeResult({
    required this.placeId,
    required this.formattedAddress,
    required this.geometry,
  });

  final String placeId;
  final String formattedAddress;
  final GeocodeGeometry geometry;

  static GeocodeResult fromJson(Map<String, dynamic> data) => GeocodeResult(
      placeId: data['place_id'],
      formattedAddress: data['formatted_address'],
      geometry: GeocodeGeometry.fromJson(data['geometry']),
    );
}

/// Parser for [GeocodeLocationType] constants
GeocodeLocationType _parseLocationType(String type) {
  switch (type) {
    case 'ROOFTOP':
      return GeocodeLocationType.rooftop;
    case 'APPROXIMATE':
      return GeocodeLocationType.approximate;
  }
  return GeocodeLocationType.approximate;
}
