import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:privacy_screen/privacy_screen.dart';
import 'package:telnor/authentication/bloc/authentication_bloc.dart';
import 'package:telnor/authentication/bloc/authentication_event.dart';
import 'package:telnor/authentication/bloc/authentication_state.dart';
import 'package:telnor/constants/global_variables.dart';
import 'package:telnor/constants/routes.dart';
import 'package:telnor/constants/theme.dart';
import 'package:telnor/home/index.dart';
import 'package:telnor/login/index.dart';
import 'package:telnor/util/biometrics.dart';
import 'package:telnor/util/settings.dart';
import 'package:telnor/util/strings.dart';
import 'package:telnor/widget/lifecycle_manager.dart';

class PCryptApp extends StatefulWidget {
  const PCryptApp({super.key});

  @override
  State<PCryptApp> createState() => _PCryptAppState();
}

class _PCryptAppState extends State<PCryptApp> with WidgetsBindingObserver {
  bool _bioAuthCausedLogoutDialogShowing = false;

  @override
  Widget build(BuildContext context) {
    final OverlayEntry biometricsOverlay = OverlayEntry(
      builder: (context) =>
          Container(color: Theme.of(context).colorScheme.secondary),
    );

    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitDown,
      DeviceOrientation.portraitUp,
    ]);
    return LifeCycleManager(
      onStateChanged: (state) => _onStateChanged(context, state),
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        title: appName,
        theme: buildThemeData(context),
        builder: (_, child) {
          return PrivacyGate(child: child);
        },
        home: BlocListener<AuthenticationBloc, AuthenticationState>(
          listener: (context, state) async {
            if (state is ShowUnverifiedEmailDialog) {
              showDialog<void>(
                context: context,
                builder: (BuildContext context) {
                  return AlertDialog(
                    title: Text(Strings.unverifiedEmailTitle),
                    content: Text(Strings.unverifiedEmailMessage),
                    actions: [
                      TextButton(
                        child: Text(Strings.actionOk.toUpperCase()),
                        onPressed: () {
                          Navigator.of(context).pop(false);
                        },
                      ),
                    ],
                  );
                },
              );
            } else if (state is ShowAuthenticationDialog) {
              BlocProvider.of<AuthenticationBloc>(
                context,
              ).add(SignedOutEvent());
              _showDialogForLoggedOut(context);
            }
            if (state is SessionExpired) {
              await showDialog<void>(
                context: context,
                builder: (context) {
                  return PopScope(
                    canPop: false,
                    onPopInvokedWithResult: (bool? pop, result) {},
                    child: AlertDialog(
                      title: Text(Strings.sessionExpiredTitle),
                      content: Text(Strings.sessionExpiredMessage),
                      actions: <Widget>[
                        TextButton(
                          child: Text(Strings.actionOk.toUpperCase()),
                          onPressed: () => Navigator.of(context).pop(),
                        ),
                      ],
                    ),
                  );
                },
              );
              Navigator.of(context).popUntil(ModalRoute.withName(Routes.home));
              BlocProvider.of<AuthenticationBloc>(
                context,
              ).add(SignedOutEvent());
            } else if (state is BiometricLock) {
              Overlay.of(context).insert(biometricsOverlay);
              await Future<void>.delayed(const Duration(milliseconds: 100));
              final authorized = await BiometricsService.get.authorize();
              biometricsOverlay.remove();
              BlocProvider.of<AuthenticationBloc>(
                context,
              ).add(BiometricInputEvent(authorized: authorized));
            }
          },
          child: BlocBuilder<AuthenticationBloc, AuthenticationState>(
            builder: (context, state) {
              Widget widget;
              SystemUiOverlayStyle overlayStyle;
              if (state is Uninitialized) {
                widget = SplashScreen();
                overlayStyle = SystemUiOverlayStyle.dark.copyWith(
                  systemNavigationBarColor: Theme.of(context).primaryColor,
                  systemNavigationBarIconBrightness: Brightness.light,
                  statusBarIconBrightness: Brightness.light,
                );
              } else if (state is StartupGuide) {
                widget = GuideScreen();
                overlayStyle = SystemUiOverlayStyle.dark.copyWith(
                  systemNavigationBarColor: Colors.blue[900],
                  systemNavigationBarIconBrightness: Brightness.light,
                  statusBarIconBrightness: Brightness.light,
                );
              } else if (state is Authenticated ||
                  state is ShowPremiumFeaturesDialog ||
                  state is ShowUnverifiedEmailDialog ||
                  state is BiometricLock ||
                  state is SessionExpired) {
                overlayStyle = SystemUiOverlayStyle.dark.copyWith(
                  systemNavigationBarColor: Theme.of(context).primaryColor,
                  systemNavigationBarIconBrightness: Brightness.light,
                  statusBarIconBrightness: Brightness.light,
                );
                widget = HomeScreen();
                overlayStyle = SystemUiOverlayStyle.light.copyWith(
                  systemNavigationBarColor: Colors.grey[50],
                  systemNavigationBarIconBrightness: Brightness.dark,
                  statusBarIconBrightness: Brightness.dark,
                );
              } else if (state is SigningUp) {
                widget = SignUpScreen();
                overlayStyle = SystemUiOverlayStyle.light.copyWith(
                  systemNavigationBarColor: Colors.white,
                  systemNavigationBarIconBrightness: Brightness.dark,
                  statusBarIconBrightness: Brightness.dark,
                );
              } else {
                widget = LoginScreen();
                _showDialogForLoggedOut(context);
                overlayStyle = SystemUiOverlayStyle.light.copyWith(
                  systemNavigationBarColor: Colors.white,
                  systemNavigationBarIconBrightness: Brightness.dark,
                  statusBarIconBrightness: Brightness.dark,
                );
              }
              return AnnotatedRegion<SystemUiOverlayStyle>(
                value: overlayStyle,
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 500),
                  child: widget,
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  Future<void> _showDialogForLoggedOut([BuildContext? ctx]) async {
    final Settings settings = Settings.get;

    final bioAuthCausedLogout =
        await settings.getString(Settings.LOGOUT_DUE_TO_BIO_AUTH) == 'true';
    if (bioAuthCausedLogout && !_bioAuthCausedLogoutDialogShowing) {
      _bioAuthCausedLogoutDialogShowing = true;
      showDialog<void>(
        context: ctx ?? context,
        barrierDismissible: false,
        builder: (BuildContext context) {
          return AlertDialog(
            title: const Text('User Logged Out'),
            content: Text(
              bioAuthCausedLogout ? Strings.messageBioAuthCancelled : '',
            ),
            actions: [
              TextButton(
                child: Text(Strings.actionOk.toUpperCase()),
                onPressed: () {
                  _bioAuthCausedLogoutDialogShowing = false;
                  Navigator.of(context).pop(false);
                },
              ),
            ],
          );
        },
      );
    }
  }

  void _onStateChanged(BuildContext context, AppLifecycleState state) {
    switch (state) {
      case AppLifecycleState.paused:
        BlocProvider.of<AuthenticationBloc>(context).add(AppPausedEvent());
        break;
      case AppLifecycleState.resumed:
        BlocProvider.of<AuthenticationBloc>(context).add(AppResumedEvent());
        break;
      case AppLifecycleState.detached:

        ///THIS IS NOT CALLED WHEN THE APP IS CLOSED IMMEDIATELY
        BlocProvider.of<AuthenticationBloc>(context).add(SignedOutEvent());
        break;
      default:
        break;
    }
  }
}
