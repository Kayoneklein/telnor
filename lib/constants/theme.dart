import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:telnor/constants/colors.dart';

/// Creates a [MaterialColor] based on the supplied [Color]
MaterialColor createMaterialColor(Color color) {
  final strengths = <double>[.05];
  final swatch = <int, Color>{};

  final argb = color.toARGB32();

  final int r = (argb >> 16) & 0xFF;
  final int g = (argb >> 8) & 0xFF;
  final int b = argb & 0xFF;

  for (var i = 1; i < 10; i++) {
    strengths.add(0.1 * i);
  }
  for (var strength in strengths) {
    final ds = 0.5 - strength;
    swatch[(strength * 1000).round()] = Color.fromRGBO(
      r + ((ds < 0 ? r : (255 - r)) * ds).round(),
      g + ((ds < 0 ? g : (255 - g)) * ds).round(),
      b + ((ds < 0 ? b : (255 - b)) * ds).round(),
      1,
    );
  }
  return MaterialColor(argb, swatch);
}

ThemeData buildThemeData(BuildContext context) {
  final textTheme = Theme.of(context).textTheme;

  return ThemeData(
    primarySwatch: createMaterialColor(PColors.green),
    primaryColor: PColors.green,
    textTheme: GoogleFonts.robotoTextTheme(textTheme).copyWith(
      bodySmall: const TextStyle(fontSize: 13.0),
      bodyMedium: const TextStyle(fontSize: 16.0),
      bodyLarge: const TextStyle(fontSize: 16.0),
    ),
    primaryTextTheme: GoogleFonts.robotoTextTheme(textTheme).copyWith(
      headlineLarge: TextStyle(
        fontSize: 26.0,
        fontWeight: FontWeight.w600,
        color: Colors.white,
      ),
      bodySmall: TextStyle(fontSize: 13.0),
      bodyMedium: TextStyle(fontSize: 16.0),
      bodyLarge: TextStyle(fontSize: 16.0),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: PColors.green,
      systemOverlayStyle: SystemUiOverlayStyle(
        statusBarIconBrightness: Brightness.light,
        systemNavigationBarColor: PColors.white,
        systemNavigationBarIconBrightness: Brightness.dark, //Android
        statusBarBrightness: Brightness.light, //iOS
        statusBarColor: PColors.darkBlue, //Android only
        systemStatusBarContrastEnforced: true,
        // systemNavigationBarContrastEnforced: true,
      ),
      //brightness: Brightness.dark,
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      selectedItemColor: PColors.green,
    ),
    floatingActionButtonTheme: const FloatingActionButtonThemeData(
      backgroundColor: PColors.green,
    ),
    useMaterial3: false,
    tabBarTheme: const TabBarThemeData(indicatorColor: PColors.green),
    primaryColorLight: PColors.green,
    chipTheme: const ChipThemeData(
      brightness: Brightness.light,
      padding: EdgeInsets.only(left: 12.0, right: 12.0, top: 4.0, bottom: 4.0),
      labelPadding: EdgeInsets.all(0.0),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(20)),
        side: BorderSide(
          color: PColors.green,
          width: 2.0,
          style: BorderStyle.solid,
        ),
      ),
      backgroundColor: Colors.transparent,
      labelStyle: TextStyle(fontSize: 14.0, color: PColors.green),
      selectedColor: PColors.green,
      secondaryLabelStyle: TextStyle(fontSize: 14.0, color: Colors.black),
      disabledColor: Colors.grey,
      secondarySelectedColor: PColors.green,
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        side: BorderSide(color: PColors.green),
        textStyle: TextStyle(color: PColors.green),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: PColors.green,
        textStyle: TextStyle(color: PColors.white),
      ),
    ),
  );
}
