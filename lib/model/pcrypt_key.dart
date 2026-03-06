

///Class which stores the data for various PCrypt keys (both public and private)
class PCryptKey {
  const PCryptKey({
    required this.info,
    required this.algorithm,
    required this.version,
    required this.type,
    required this.encoding,
    required this.ecdh,
    required this.ecdsa,
  });

  final String info;
  final String algorithm;
  final int version;
  final String type;
  final String encoding;
  final EllipticCurve ecdh;
  final EllipticCurve ecdsa;

  static PCryptKey fromJson(Map<String, dynamic> data) => PCryptKey(
        info: data['info'],
        algorithm: data['algo'],
        version: data['ver'],
        type: data['type'],
        encoding: data['enc'],
        ecdh: EllipticCurve.fromJson(data['ecdh']),
        ecdsa: EllipticCurve.fromJson(data['ecdsa']),
      );

  Map<String, dynamic> toJson() => <String, dynamic>{
        'info': info,
        'algo': algorithm,
        'ver': version,
        'type': type,
        'enc': encoding,
        'ecdh': ecdh.toJson(),
        'ecdsa': ecdsa.toJson(),
      };
}

///Elliptic curve algorithms
///See https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm
///See https://en.wikipedia.org/wiki/Elliptic-curve_Diffie%E2%80%93Hellman
class EllipticCurve {
  const EllipticCurve({
    required this.curve,
    required this.data,
  });

  final String curve;
  final dynamic data;

  static EllipticCurve fromJson(Map<String, dynamic> data) => EllipticCurve(
        curve: data['curve'],
        data: data['data'],
      );

  Map<String, dynamic> toJson() => <String, dynamic>{
        'curve': curve,
        'data': data,
      };
}
