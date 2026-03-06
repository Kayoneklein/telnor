

///Location (as in GEO-location)
class Location {
  const Location({
    required this.title,
    required this.latitude,
    required this.longitude,
    required this.accuracy,
  });

  final String title;
  final double latitude;
  final double longitude;
  final int accuracy;

  static Location fromJson(Map<String, dynamic> data) => Location(
        title: data['text'] ?? '',
        latitude: double.parse(data['lat']),
        longitude: double.parse(data['long']),
        accuracy: int.parse(data['acc']),
      );

  Map<String, dynamic> toJson() => <String, dynamic>{
        'text': title.toString(),
        'lat': latitude.toString(),
        'long': longitude.toString(),
        'acc': accuracy.toString(),
      };
}
