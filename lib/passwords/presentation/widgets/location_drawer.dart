import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:telnor/passwords/bloc/password_edit_bloc.dart';
import 'package:telnor/passwords/bloc/password_edit_event.dart';
import 'package:telnor/passwords/bloc/password_edit_state.dart';
import 'package:telnor/util/strings.dart';

class LocationEndDrawer extends StatelessWidget {
  LocationEndDrawer({
    required this.state,
    required this.isNew,
    required this.titleController,
    required this.latitudeController,
    required this.longitudeController,
    required this.accuracyController,
    required this.scaffoldKey,
    super.key,
  });

  final PasswordEditState state;
  final bool isNew;

  final TextEditingController titleController;
  final TextEditingController latitudeController;
  final TextEditingController longitudeController;
  final TextEditingController accuracyController;
  final FocusNode _locationTitleFocus = FocusNode();
  final FocusNode _locationLatitudeFocus = FocusNode();
  final FocusNode _locationLongitudeFocus = FocusNode();
  final FocusNode _locationAccuracyFocus = FocusNode();
  final GlobalKey<ScaffoldState> scaffoldKey;

  @override
  Widget build(BuildContext context) {
    final _bloc = BlocProvider.of<PasswordEditBloc>(context);

    if (titleController.text != state.locationTitle) {
      titleController.value = titleController.value.copyWith(
        text: state.locationTitle,
      );
    }
    if (latitudeController.text != state.locationLatitude) {
      latitudeController.value = latitudeController.value.copyWith(
        text: state.locationLatitude,
      );
    }
    if (longitudeController.text != state.locationLongitude) {
      longitudeController.value = longitudeController.value.copyWith(
        text: state.locationLongitude,
      );
    }
    if (accuracyController.text != state.locationAccuracy) {
      accuracyController.value = accuracyController.value.copyWith(
        text: state.locationAccuracy,
      );
    }
    return SafeArea(
      child: ClipRRect(
        borderRadius: const BorderRadius.only(topLeft: Radius.circular(8.0)),
        child: Drawer(
          child: Form(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Padding(
                  padding: const EdgeInsets.only(
                    left: 24.0,
                    right: 0.0,
                    top: 24.0,
                    bottom: 0.0,
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.max,
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: <Widget>[
                      Expanded(
                        child: Text(
                          isNew
                              ? Strings.passwordAddLocation
                              : Strings.passwordEditLocation,
                          style: Theme.of(context).textTheme.headlineSmall,
                        ),
                      ),
                      TextButton(
                        style: ButtonStyle(
                          foregroundColor: WidgetStateProperty.all(
                            Theme.of(context).colorScheme.secondary,
                          ),
                        ),
                        child: Text(Strings.actionOk.toUpperCase()),
                        onPressed: () {
                          FocusScope.of(context).unfocus();
                          scaffoldKey.currentState?.closeEndDrawer();
                          _bloc.add(LocationEditConfirmed());
                        },
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(
                      left: 24.0,
                      right: 24.0,
                      top: 24.0,
                      bottom: 24.0,
                    ),
                    child: Form(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.start,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: <Widget>[
                          Text(
                            Strings.passwordLocationTitle,
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                          TextFormField(
                            focusNode: _locationTitleFocus,
                            controller: titleController,
                            style: Theme.of(context).textTheme.bodySmall,
                            autovalidateMode: AutovalidateMode.always,
                            textInputAction: TextInputAction.next,
                            onFieldSubmitted: (v) {
                              _locationTitleFocus.unfocus();
                              FocusScope.of(
                                context,
                              ).requestFocus(_locationLatitudeFocus);
                            },
                          ),
                          const SizedBox(height: 24.0),
                          Text(
                            Strings.passwordLocationLatitude,
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                          TextFormField(
                            focusNode: _locationLatitudeFocus,
                            controller: latitudeController,
                            style: Theme.of(context).textTheme.bodySmall,
                            decoration: const InputDecoration(hintText: '0.0'),
                            autovalidateMode: AutovalidateMode.always,
                            validator: (_) => state.isLocationLatitudeValid
                                ? null
                                : Strings.passwordLocationLatitudeInvalid,
                            textInputAction: TextInputAction.next,
                            keyboardType: const TextInputType.numberWithOptions(
                              signed: true,
                              decimal: true,
                            ),
                            onFieldSubmitted: (v) {
                              _locationLatitudeFocus.unfocus();
                              FocusScope.of(
                                context,
                              ).requestFocus(_locationLongitudeFocus);
                            },
                          ),
                          const SizedBox(height: 24.0),
                          Text(
                            Strings.passwordLocationLongitude,
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                          TextFormField(
                            focusNode: _locationLongitudeFocus,
                            controller: longitudeController,
                            style: Theme.of(context).textTheme.bodySmall,
                            decoration: const InputDecoration(hintText: '0.0'),
                            autovalidateMode: AutovalidateMode.always,
                            validator: (_) => state.isLocationLongitudeValid
                                ? null
                                : Strings.passwordLocationLongitudeInvalid,
                            keyboardType: const TextInputType.numberWithOptions(
                              signed: true,
                              decimal: true,
                            ),
                            textInputAction: TextInputAction.next,
                            onFieldSubmitted: (v) {
                              _locationLongitudeFocus.unfocus();
                              FocusScope.of(
                                context,
                              ).requestFocus(_locationAccuracyFocus);
                            },
                          ),
                          const SizedBox(height: 24.0),
                          Text(
                            Strings.passwordLocationAccuracy,
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                          TextFormField(
                            focusNode: _locationAccuracyFocus,
                            controller: accuracyController,
                            style: Theme.of(context).textTheme.bodySmall,
                            decoration: const InputDecoration(hintText: '0'),
                            autovalidateMode: AutovalidateMode.always,
                            validator: (_) => state.isLocationAccuracyValid
                                ? null
                                : Strings.passwordLocationAccuracyInvalid,
                            textInputAction: TextInputAction.done,
                            inputFormatters: [
                              FilteringTextInputFormatter.allow('[0-9]'),
                            ],
                            keyboardType: const TextInputType.numberWithOptions(
                              signed: false,
                              decimal: false,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                Align(
                  alignment: Alignment.centerRight,
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      mainAxisSize: MainAxisSize.min,
                      children: <Widget>[
                        TextButton(
                          style: ButtonStyle(
                            foregroundColor: WidgetStateProperty.all(
                              Theme.of(context).colorScheme.secondary,
                            ),
                          ),
                          child: Text(
                            Strings.passwordLocationGetAddress.toUpperCase(),
                          ),
                          onPressed: () {
                            FocusScope.of(context).unfocus();
                            _bloc.add(LocationFromAddressPressed());
                          },
                        ),
                        // _buildMyLocationWidget(state.myLocationState),
                        if (state.myLocationState == ButtonState.loading)
                          Container(
                            margin: const EdgeInsets.only(
                              top: 12.0,
                              bottom: 12.0,
                              right: 24.0,
                            ),
                            height: 24.0,
                            width: 24.0,
                            child: const CircularProgressIndicator(),
                          ),
                        if (state.myLocationState == ButtonState.visible)
                          TextButton(
                            style: ButtonStyle(
                              foregroundColor: WidgetStateProperty.all(
                                Theme.of(context).colorScheme.secondary,
                              ),
                            ),
                            child: Text(
                              Strings.passwordLocationGetCurrent.toUpperCase(),
                            ),
                            onPressed: () {
                              _bloc.add(GetCurrentLocationPressed());
                            },
                          ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
