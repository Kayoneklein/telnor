import 'dart:convert';

class SecurityUser {
  const SecurityUser({this.name, this.email, this.id});

  factory SecurityUser.fromJson(json) {
    return SecurityUser(
      name: json['name'],
      email: json['email'],
      id: json['id'],
    );
  }

  final String? name;
  final String? email;
  final int? id;

  Map<String, dynamic> toJson() {
    final data = <String, dynamic>{};

    data['name'] = name;
    data['email'] = email;
    data['id'] = id;
    return data;
  }
}

class EncryptData {
  const EncryptData({
    this.userId,
    this.serverUrl,
    this.deviceId,
    this.publicKey,
    this.isMobileDevice,
    this.deviceToken,
    this.serverId,
    this.timestamp,
  });

  factory EncryptData.fromJson(Map json) {
    return EncryptData(
      userId: json['user_id'],
      serverUrl: json['server_url'],
      deviceId: json['device_id'],
      publicKey: json['public_key'],
      deviceToken: json['device_token'],
      isMobileDevice: json['is_mobile_device'] == 1,
      serverId: json['server_id'],
      timestamp: DateTime.tryParse(json['timestamp']),
    );
  }

  final String? publicKey;
  final String? serverUrl;
  final String? deviceId;
  final int? userId;
  final bool? isMobileDevice;
  final String? deviceToken;
  final String? serverId;
  final DateTime? timestamp;

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {};
    data['user_id'] = userId;
    data['server_url'] = serverUrl;
    data['device_id'] = deviceId;
    data['public_key'] = publicKey;
    data['is_mobile_device'] = (isMobileDevice ?? true) ? 1 : 0;
    data['device_token'] = deviceToken;
    data['server_id'] = serverId;
    data['timestamp'] = timestamp?.toString();

    return data;
  }
}

class TwoFAModel extends EncryptData {
  const TwoFAModel({
    this.id,
    this.newDeviceDetected,
    this.newDeviceId,
    super.serverId,
    super.timestamp,
    super.deviceId,
    super.publicKey,
    super.serverUrl,
    super.userId,
    super.deviceToken,
    super.isMobileDevice,
  }) : super();

  factory TwoFAModel.fromJson(Map json) {
    return TwoFAModel(
      id: json['id'],
      serverUrl: json['server_url'],
      deviceId: json['device_id'],
      publicKey: json['public_key'],
      serverId: json['server_id'],
      timestamp: json['timestamp'],
      deviceToken: json['device_token'],
      isMobileDevice: json['is_mobile_device'] == 1,
      newDeviceDetected: json['new_device_detected'] == 1,
      newDeviceId: json['new_device_id'],
    );
  }

  final int? id;
  final bool? newDeviceDetected;
  final String? newDeviceId;

  @override
  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = super.toJson();
    data['id'] = id;
    data['new_device_detected'] = newDeviceDetected;
    data['new_device_id'] = newDeviceId;

    return data;
  }

  String serialize() {
    final Map<String, dynamic> data = toJson();
    return json.encode(data);
  }

  static EncryptData deserialize(String data) {
    final Map decoded = json.decode(data);
    return EncryptData.fromJson(decoded);
  }
}
