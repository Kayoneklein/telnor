///Generic encrypted data
class Encrypted {
  const Encrypted({
    required this.info,
    required this.type,
    required this.version,
    required this.encoding,
    required this.compression,
    required this.algorithm,
    required this.iv,
    required this.data,
    this.tag,
    this.hash,
  });

  final String info;
  final String type;
  final int version;
  final String encoding;
  final String compression;
  final String algorithm;
  final String iv;
  final String data;
  final String? tag;
  final String? hash;

  static Encrypted fromJson(Map<String, dynamic> data) => Encrypted(
        info: data['info'] ?? '',
        type: data['type'] ?? '',
        version: data['ver'] ?? 0,
        encoding: data['enc'] ?? '',
        compression: data['comp'] ?? '',
        algorithm: data['algo'] ?? '',
        iv: data['iv'] ?? '',
        tag: data['tag'],
        data: data['data'] ?? '',
        hash: data['hash'],
      );

  Map<String, dynamic> toJson() {
    if (algorithm == 'AES-CTR') {
      return <String, dynamic>{
        'info': info,
        'type': type,
        'ver': version,
        'enc': encoding,
        'comp': compression,
        'algo': algorithm,
        if (hash != null) 'hash': hash,
        'iv': iv,
        if (tag != null) 'tag': tag,
        'data': data,
      };
    }
    return <String, dynamic>{
      'info': info,
      'type': type,
      'ver': version,
      'enc': encoding,
      'comp': compression,
      'algo': algorithm,
      'iv': iv,
      if (tag != null) 'tag': tag,
      'data': data,
      if (hash != null) 'hash': hash,
    };
  }
}
