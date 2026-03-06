part of '../index.dart';

/// Screen for resetting password
class ForgotPasswordScreen extends StatelessWidget {
  const ForgotPasswordScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(Strings.forgotPasswordTitle)),
      body: const Center(
        child: Text('Not yet implemented'), //TODO implement
      ),
    );
  }
}
