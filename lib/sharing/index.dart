import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:telnor/authentication/bloc/authentication_bloc.dart';
import 'package:telnor/authentication/bloc/authentication_event.dart';
import 'package:telnor/model/team.dart';
import 'package:telnor/sharing/bloc/member_picker.dart';
import 'package:telnor/sharing/presentation/widgets/email_list.dart';
import 'package:telnor/sharing/presentation/widgets/members_list.dart';
import 'package:telnor/sharing/presentation/widgets/team_picker.dart';
import 'package:telnor/sharing/presentation/widgets/teams_list.dart';
import 'package:telnor/util/strings.dart';
import 'package:telnor/widget/custom_widgets.dart';

part 'presentation/screens/member_picker_screen.dart';
