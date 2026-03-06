import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:telnor/authentication/bloc/authentication_bloc.dart';
import 'package:telnor/authentication/bloc/authentication_event.dart';
import 'package:telnor/model/group.dart';
import 'package:telnor/tags/bloc/tags_bloc.dart';
import 'package:telnor/tags/bloc/tags_state.dart';
import 'package:telnor/tags/bloc/tags_event.dart';
import 'package:telnor/tags/presentation/widgets/tags_list.dart';
import 'package:telnor/util/strings.dart';
import 'package:telnor/widget/custom_widgets.dart';

part 'presentation/screens/tags_screen.dart';
