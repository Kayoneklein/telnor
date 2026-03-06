import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:telnor/authentication/bloc/authentication_bloc.dart';
import 'package:telnor/authentication/bloc/authentication_event.dart';
import 'package:telnor/messages/bloc/message_edit_bloc.dart';
import 'package:telnor/messages/bloc/message_edit_state.dart';
import 'package:telnor/messages/bloc/messages_bloc.dart';
import 'package:telnor/messages/bloc/messages_event.dart';
import 'package:telnor/messages/bloc/messages_state.dart';
import 'package:telnor/messages/presentation/widgets/message_member.dart';
import 'package:telnor/model/message.dart';
import 'package:telnor/model/team.dart';
import 'package:telnor/sharing/index.dart';
import 'package:telnor/util/formatters.dart';
import 'package:telnor/util/strings.dart';
import 'package:telnor/widget/custom_widgets.dart';

import 'bloc/message_edit_event.dart';
import 'presentation/widgets/messages_list.dart';

part 'presentation/screens/messages_screen.dart';
part 'presentation/screens/message_edit_screen.dart';
part 'presentation/screens/message_details_screen.dart';
