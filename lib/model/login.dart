import 'package:telnor/model/pcrypt_key.dart';

/// Keys to use during login process
///
/// Contains AES and SRP data fields
class LoginKeys {
  const LoginKeys(this.aes, this.srp);

  final String aes;
  final String srp;

  Map<String, dynamic> toJson() => <String, dynamic>{'aes': aes, 'srp': srp};

  static LoginKeys fromJson(Map<String, dynamic> data) =>
      LoginKeys(data['aes'], data['srp']);
}

/// Credentials to use during login process
///
/// Contains A and M1 data fields
class LoginCredentials {
  const LoginCredentials(this.A, this.m1);

  final String A;
  final String m1;

  Map<String, dynamic> toJson() => <String, dynamic>{'A': A, 'M1': m1};

  static LoginCredentials fromJson(Map<String, dynamic> data) =>
      LoginCredentials(data['A'], data['M1']);
}

/// Data used for sign up process
class AccountData {
  AccountData(
    this.email,
    this.srpSalt,
    this.srpVerifier,
    this.salt,
    this.publicKey,
    this.privateKey,
  );

  final String email;
  final String srpSalt;
  final String srpVerifier;
  final String salt;
  final PCryptKey publicKey;
  final PCryptKey privateKey;

  Map<String, dynamic> toJson() => <String, dynamic>{
    'email': email,
    'srpsalt': srpSalt,
    'srpverifier': srpVerifier,
    'salt': salt,
    'keypublic': publicKey.toJson(),
    'keyprivate': privateKey.toJson(),
  };

  static AccountData fromJson(Map<String, dynamic> data) => AccountData(
    data['email'],
    data['srpsalt'],
    data['srpverifier'],
    data['salt'],
    PCryptKey.fromJson(data['keypublic']),
    PCryptKey.fromJson(data['keyprivate']),
  );
}
