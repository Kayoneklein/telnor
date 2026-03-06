import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:telnor/authentication/bloc/authentication_bloc.dart';
import 'package:telnor/authentication/bloc/authentication_event.dart';
import 'package:telnor/constants/preferences.dart';
import 'package:telnor/util/snackbar.dart';
import 'package:telnor/util/strings.dart';
import 'package:telnor/web/server_adapter.dart';
import 'package:telnor/web/web.dart';
import 'package:telnor/widget/custom_widgets.dart';

part 'presentation/delete_account.dart';

part 'bloc/delete_account_bloc.dart';

part 'bloc/delete_account_event.dart';

part 'bloc/delete_account_state.dart';
