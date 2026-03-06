import 'package:flutter/material.dart';

void displaySnackBar({required String message, required BuildContext context}) {
  final snackBar = SnackBar(
    content: Text(message),
  );

  ScaffoldMessenger.of(context).showSnackBar(snackBar);
}
