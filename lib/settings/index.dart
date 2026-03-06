import 'dart:io' show Platform;

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_autofill_service/flutter_autofill_service.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:telnor/authentication/bloc/authentication_bloc.dart';
import 'package:telnor/authentication/bloc/authentication_event.dart';
import 'package:telnor/home/index.dart';
import 'package:telnor/model/language.dart';
import 'package:telnor/settings/bloc/account_info_bloc.dart';
import 'package:telnor/settings/bloc/account_info_event.dart';
import 'package:telnor/settings/bloc/account_info_state.dart';
import 'package:telnor/settings/bloc/settings.dart' as settings;
import 'package:telnor/util/strings.dart';
import 'package:telnor/widget/custom_widgets.dart';

part 'presentation/settings_screen.dart';
part 'presentation/choose_language_screen.dart';
part 'presentation/account_info_screen.dart';
