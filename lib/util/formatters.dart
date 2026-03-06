import 'package:geocoding/geocoding.dart';
import 'package:intl/intl.dart';
import 'package:telnor/model/message.dart';

/// Format geo coordinates (locations, placemarks etc)
String formatGeoLocation(double latitude, double longitude) {
  final zeroes = RegExp(r'0+$');
  final end = RegExp(r'\.$');
  final lat = latitude
      .toStringAsFixed(6)
      .replaceAll(zeroes, '')
      .replaceAll(end, '.0');
  final lon = longitude
      .toStringAsFixed(6)
      .replaceAll(zeroes, '')
      .replaceAll(end, '.0');
  return '($lat, $lon)';
}

/// Construct address string for specific place mark
String formatAddress(Placemark placemark) {
  return <String>[
    placemark.subThoroughfare ?? '',
    placemark.thoroughfare ?? '',
    placemark.subLocality ?? '',
    placemark.locality ?? '',
    placemark.subAdministrativeArea ?? '',
    placemark.administrativeArea ?? '',
    placemark.country ?? '',
  ].where((s) => s.isNotEmpty).join(', ');
}

/// Format created/updated date
String formatCreatedDate(DateTime date) {
  return DateFormat(' MMM dd, yyyy').format(date);
}

/// Format created date for message
String formatMessageDate(DateTime date) {
  final now = DateTime.now();
  if (now.year == date.year) {
    if (now.month == date.month && now.day == date.day) {
      return DateFormat('HH:mm').format(date);
    } else {
      return DateFormat('MMM, d').format(date);
    }
  } else {
    return DateFormat('dd.MM.yyyy').format(date);
  }
}

/// Format subject for replying to message
String formatReplySubject(Message message) {
  return 'Re: ${message.subject}';
}

/// Format subject for forwarding the message
String formatForwardSubject(Message message) {
  return 'Fwd: ${message.subject}';
}

/// Format text for replying to message
String formatReplyMessage(Message message) {
  final mail = message.remoteMember.email;
  final date = DateFormat('dd/MM-yyyy HH:mm:ss').format(message.createdAt);
  return '\n\n----- $mail * $date -----\n${message.message}';
}
