

/// Class that represents one file attached to the password
class Attachment {
  Attachment(this.id, this.name, this.type);

  final String id;
  final String name;
  final String type;

  static Attachment fromJson(Map<String, dynamic> data) => Attachment(
        data['fileid'],
        data['name'],
        data['filetype'],
      );

  Map<String, dynamic> toJson() => <String, dynamic>{
        'fileid': id,
        'name': name,
        'filetype': type,
      };
}

/// Class that represents old Attachment structure
class OldAttachment {
  OldAttachment(this.name, this.data);

  final String name;
  final dynamic data;

  static OldAttachment fromJson(Map<String, dynamic> data) => OldAttachment(
        data['name'],
        data['data'],
      );

  Map<String, dynamic> toJson() => <String, dynamic>{
        'name': name,
        'data': data,
      };
}
