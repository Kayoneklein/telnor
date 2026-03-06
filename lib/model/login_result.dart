import 'package:telnor/model/pcrypt_key.dart';
import 'package:telnor/model/user.dart';

///Result of the first login step
class Login1Result {
  const Login1Result({
    required this.email,
    required this.pincode,
    required this.srpSalt,
    required this.srpb,
    required this.salt,
    this.type2fa,
  });

  final String email;
  final bool pincode;
  final String srpSalt;
  final String srpb;
  final String salt;
  final dynamic type2fa;

  static Login1Result fromJson(Map<String, dynamic> data) => Login1Result(
    email: data['email'],
    pincode: data['pincode'],
    srpSalt: data['srpsalt'],
    srpb: data['srpb'],
    salt: data['salt'],
    type2fa: data['type2fa'],
  );

  Map<String, dynamic> toJson() => <String, dynamic>{
    'email': email,
    'pincode': pincode,
    'case': false,
    'srpsalt': srpSalt,
    'srpb': srpb,
    'salt': salt,
    'type2fa': type2fa,
  };
}

///Result of the second login step
class Login2Result {
  const Login2Result({
    required this.user,
    required this.authId,
    required this.authSession,
    required this.srpM2,
    required this.salt,
    required this.srpSalt,
    required this.publicKey,
    required this.privateKey,
  });

  final String authId;
  final String authSession;
  final String srpM2;
  final String salt;
  final String srpSalt;
  final PCryptKey publicKey;
  final PCryptKey privateKey;
  final User user;

  static Login2Result fromJson(Map<String, dynamic> data) => Login2Result(
    user: User.fromJson(data),
    authId: data['authid'],
    authSession: data['authsession'],
    srpM2: data['srpM2'],
    salt: data['salt'],
    srpSalt: data['srpsalt'],
    publicKey: PCryptKey.fromJson(data['publickey']),
    privateKey: PCryptKey.fromJson(data['privatekey']),
  );

  Map<String, dynamic> toJson() => <String, dynamic>{
    'email': user.email,
    'userid': user.id,
    'name': user.name,
    'department': user.department,
    'premium': user.isPremium ? 1 : 0,
    'trialpremium': user.isPremiumTrial ? 1 : 0,
    'emailconfirm': user.isEmailVerified ? 1 : 0,
    'authid': authId,
    'authsession': authSession,
    'srpM2': srpM2,
    'salt': salt,
    'srpsalt': srpSalt,
    'publickey': publicKey.toJson(),
    'privatekey': privateKey.toJson(),
  };
}
