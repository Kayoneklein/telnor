import 'package:telnor/model/password.dart';
import 'package:telnor/model/user.dart' show User;

class LocalDBModel {
  const LocalDBModel({
    this.user,
    this.passwords = const [],
    //  this.messages,
  });

  final User? user;
  final List<Password> passwords;
  // final List<Message> messages;
}
