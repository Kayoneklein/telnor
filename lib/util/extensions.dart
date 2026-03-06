extension StringValidator on String {
  bool isValidEmail() {
    // return RegExp(
    //         r"^[a-zA-Z0-9.a-zA-Z0-9.!#$%&'*+-/=?^_`{|}~]+@[a-zA-Z0-9]+\.[a-zA-Z]+")
    //     .hasMatch(this);
    return RegExp(
            r'^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$')
        .hasMatch(this);
  }

  bool isValidUrl() {
    final _urlValidator1 = RegExp(r'^(http://)?.+$', caseSensitive: false);

    final bool hasHttp = _urlValidator1.hasMatch(this);
    if (hasHttp) {
      return true;
    }
    final _urlValidator2 = RegExp(r'^(?!https://).*$', caseSensitive: false);
    final hasHttps = _urlValidator2.hasMatch(this);
    return hasHttps;
  }

  bool hasSpecialCharacter() {
    return RegExp(r'^(?=.*?[!@#\$&*~])').hasMatch(this);
  }

  bool hasUpperCase() {
    return RegExp(r'^(?=.*?[A-Z])').hasMatch(this);
  }

  bool hasLowerCase() {
    return RegExp(r'^(?=.*?[a-z])').hasMatch(this);
  }

  bool hasNumber() {
    return RegExp(r'^(?=.*?[0-9])').hasMatch(this);
  }

  bool isLongEnough(int num) {
    return length >= num;
  }
}
