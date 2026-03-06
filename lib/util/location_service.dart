import 'dart:io';
import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:geocoding/geocoding.dart';
import 'package:geolocator/geolocator.dart';
import 'package:location/location.dart' as location_service;
import 'package:telnor/model/location.dart' as pc;
import 'package:telnor/util/settings.dart';
import 'package:telnor/util/strings.dart' show Strings;
import 'package:vector_math/vector_math.dart';

import 'formatters.dart';
import 'localization.dart';

///Class which performs all locations-related functionality
class LocationService {
  LocationService._();

  static final LocationService get = LocationService._();

  //--------------------------------------------------------------------------------------------------------------------

  final _geolocator = GeolocatorPlatform.instance;
  final _settings = Settings.get;
  pc.Location? _currentLocation;

  //--------------------------------------------------------------------------------------------------------------------

  /// Returns address string for specified coordinates
  Future<String> getAddressForCoordinates(
    double latitude,
    double longitude,
  ) async {
    await setLocaleIdentifier(Localization.get.currentLanguage.code);
    final addresses = await placemarkFromCoordinates(latitude, longitude);
    if (addresses.isNotEmpty) {
      return formatAddress(addresses.first);
    } else {
      return '';
    }
  }

  /// Determine location based on the address strings
  Future<pc.Location?> getLocationFromAddress(String address) async {
    try {
      final List<Location> data = await locationFromAddress(address);
      if (data.isNotEmpty) {
        final location = data.first;
        final placemarks = await placemarkFromCoordinates(
          location.latitude,
          location.longitude,
        );
        final title = placemarks.isNotEmpty
            ? formatAddress(placemarks.first)
            : '';
        return pc.Location(
          title: title.isNotEmpty
              ? title
              : formatGeoLocation(location.latitude, location.longitude),
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: 500, //!!!location.accuracy.floor(),
        );
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Determine current location
  ///
  /// May ask for permissions to enable device location settings
  /// If successfully determined, the [onSuccess] callback is triggered, passing the location which was determined
  /// In case of failure (or in case user prohibited usage of location services), the [onFailure] callback is triggered
  Future<void> determineCurrentLocation({
    required Function(pc.Location) onSuccess,
    required Function(String? message) onFailure,
  }) async {
    if (_currentLocation != null) {
      onSuccess(_currentLocation!);
      return;
    }

    final bool serviceEnabled = await location_service.Location()
        .serviceEnabled();
    if (serviceEnabled) {
      try {
        LocationPermission locationPermission = await _geolocator
            .checkPermission();
        if (kDebugMode) {
          print('location-perm: $locationPermission');
        }

        if (locationPermission == LocationPermission.denied) {
          locationPermission = await _geolocator.requestPermission();
          if (locationPermission == LocationPermission.denied) {
            final message = Strings.messageLocationDenied;
            onFailure(message);
            return;
          }
        }

        if (locationPermission == LocationPermission.deniedForever) {
          // Permissions are denied forever, handle appropriately.

          onFailure(getMsgLocationDeniedPermanently());
          return;
        }

        final position = await _geolocator.getCurrentPosition(
          locationSettings: const LocationSettings(
            accuracy: LocationAccuracy.best,
          ),
        );
        _currentLocation = pc.Location(
          title: await getAddressForCoordinates(
            position.latitude,
            position.longitude,
          ),
          latitude: position.latitude,
          longitude: position.longitude,
          accuracy: position.accuracy.floor(),
        );
        onSuccess(_currentLocation!);
      } catch (error) {
        await _settings.setBoolean(Settings.IS_LOCATION_DENIED, true);
        onFailure(Strings.messageUnknownError);
      }
    } else {
      final bool isUserEnableService = await location_service.Location()
          .serviceEnabled();
      if (isUserEnableService) {
        determineCurrentLocation(onSuccess: onSuccess, onFailure: onFailure);
      } else {
        onFailure(null);
      }
    }
  }

  //Checks whether location services are enabled on device
  Future<bool> checkLocationServicesEnabled() async {
    final LocationPermission status = await _geolocator.checkPermission();
    if (status != LocationPermission.deniedForever) {
      final bool isLocationDenied = await _settings.getBoolean(
        Settings.IS_LOCATION_DENIED,
      );
      if (isLocationDenied) {
        if (status == LocationPermission.always ||
            status == LocationPermission.whileInUse) {
          await _settings.setBoolean(Settings.IS_LOCATION_DENIED, false);
          return true;
        }
      } else {
        return true;
      }
    }
    return false;
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Calculate distance between two locations
  double calculateDistance(double lat1, double lng1, double lat2, double lng2) {
    const RADIUS = 6371000; // Radius of the earth in meters
    final dLat = radians(lat1 - lat2);
    final dLon = radians(lng1 - lng2);
    final a =
        sin(dLat / 2) * sin(dLat / 2) +
        cos(radians(lat1)) * cos(radians(lat2)) * sin(dLon / 2) * sin(dLon / 2);
    return 2 * atan2(sqrt(a), sqrt(1 - a)) * RADIUS;
  }

  /// Test if specific location is close to current location
  bool testLocationsOverlap(pc.Location first, pc.Location second) {
    final distance = calculateDistance(
      first.latitude,
      first.longitude,
      second.latitude,
      second.longitude,
    );
    final accuracy =
        (first.accuracy <= 0 ? 100.0 : first.accuracy) +
        (second.accuracy <= 0 ? 100 : second.accuracy).toDouble();
    return accuracy >= distance;
  }

  String getMsgLocationDeniedPermanently() {
    return Platform.isIOS
        ? Strings.messageLocationDeniedPermanentlyIOS
        : Platform.isAndroid
        ? Strings.messageLocationDeniedPermanentlyAndroid
        : '';
  }
}
