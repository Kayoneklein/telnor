import 'package:encrypt/encrypt.dart' as enc;
import 'package:flutter_dotenv/flutter_dotenv.dart';

class Encryption {
  String encrypt(String data) {
    final String openSSLKey = dotenv.env['OPEN_SSL_ENCRYPTION_KEY_32'] ?? '';
    final key = enc.Key.fromBase64(openSSLKey);
    final String base64Iv = dotenv.env['OPEN_SSL_BASE_64_IV'] ?? '';
    final iv = enc.IV.fromBase64(base64Iv);
    final encrypter = enc.Encrypter(enc.AES(key, mode: enc.AESMode.cbc));

    final encrypted = encrypter.encrypt(data, iv: iv);
    return encrypted.base64;
  }

  String decrypt(String data) {
    final String openSSLKey = dotenv.env['OPEN_SSL_ENCRYPTION_KEY_32'] ?? '';
    final key = enc.Key.fromBase64(openSSLKey);
    final String base64Iv = dotenv.env['OPEN_SSL_BASE_64_IV'] ?? '';
    final iv = enc.IV.fromBase64(base64Iv);
    final encrypter = enc.Encrypter(enc.AES(key, mode: enc.AESMode.cbc));

    final decrypted = encrypter.decrypt64(data, iv: iv);

    // final decrypted = encrypter.decrypt(encrypted, iv: iv);
    return decrypted;
  }
}
