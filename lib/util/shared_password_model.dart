import 'package:telnor/model/password.dart';

class SharedPasswordModel {
  const SharedPasswordModel({
    required this.userSharedPasswords,
    required this.teamSharedPasswords,
  });

  final List<Password> userSharedPasswords;
  final List<Password> teamSharedPasswords;
}
