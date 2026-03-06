import 'package:equatable/equatable.dart';

/// Language used in various places throughout the app
class Language implements Equatable {
  const Language({
    required this.code,
    required this.name,
  });

  final String code;
  final String name;

  bool get isUndefined => code.isEmpty;

  Map<String, dynamic> toJson() => <String, dynamic>{
        'code': code,
        'name': name,
      };

  static Language fromJson(Map<String, dynamic> data) => Language(
        code: data['code'],
        name: data['name'],
      );

  static const undefined = Language(
    code: '',
    name: '',
  );

  static const def = Language(
    code: 'en',
    name: 'English',
  );

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Language && runtimeType == other.runtimeType && code == other.code && name == other.name;

  @override
  int get hashCode => code.hashCode ^ name.hashCode;

  @override
  List<Object> get props => [code, name];

  @override
  bool get stringify => true;
}
