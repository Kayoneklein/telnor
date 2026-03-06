import 'dart:async';
import 'dart:io';
import 'dart:typed_data';

import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:image/image.dart';
import 'package:image_picker/image_picker.dart';
import 'package:telnor/authentication/bloc/authentication_bloc.dart';
import 'package:telnor/authentication/bloc/authentication_event.dart';
import 'package:telnor/constants/assets.dart';
import 'package:telnor/constants/colors.dart';
import 'package:telnor/delete_account/index.dart';
import 'package:telnor/model/user.dart';
import 'package:telnor/util/settings.dart';
import 'package:telnor/util/strings.dart';
import 'package:telnor/web/server_adapter.dart';
import 'package:telnor/widget/custom_widgets.dart';

part 'bloc/user_info_bloc.dart';

part 'bloc/user_info_event.dart';

part 'bloc/user_info_state.dart';

part 'presentation/user_info_screen.dart';
