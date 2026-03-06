import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:telnor/authentication/bloc/authentication_bloc.dart';
import 'package:telnor/authentication/bloc/authentication_event.dart';
import 'package:telnor/model/global_message.dart';
import 'package:telnor/notifications/bloc/notifications_bloc.dart';
import 'package:telnor/notifications/bloc/notifications_state.dart';
import 'package:telnor/notifications/bloc/notifications_event.dart';
import 'package:telnor/notifications/presentation/widgets/notifications_list.dart';
import 'package:telnor/util/formatters.dart';
import 'package:telnor/util/strings.dart';
import 'package:telnor/widget/custom_widgets.dart';

part 'presentation/screens/notifications_screen.dart';
part 'presentation/screens/notification_details_screen.dart';
