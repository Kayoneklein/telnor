import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:telnor/passwords/bloc/password_edit_bloc.dart';
import 'package:telnor/passwords/bloc/password_edit_event.dart';
import 'package:telnor/passwords/bloc/password_edit_state.dart';
import 'package:telnor/util/strings.dart';

class AddressEndDrawer extends StatelessWidget {
  const AddressEndDrawer({
    required this.state,
    required this.addressController,
    super.key,
  });

  final PasswordEditState state;
  final TextEditingController addressController;

  @override
  Widget build(BuildContext context) {
    if (addressController.text != state.locationAddress) {
      addressController.value = addressController.value.copyWith(
        text: state.locationAddress,
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
                    left: 6.0,
                    right: 0.0,
                    top: 24.0,
                    bottom: 0.0,
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.max,
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: <Widget>[
                      TextButton(
                        style: ButtonStyle(
                          foregroundColor: WidgetStateProperty.all(
                            Theme.of(context).colorScheme.secondary,
                          ),
                        ),
                        child: Text(Strings.actionCancel.toUpperCase()),
                        onPressed: () {
                          FocusScope.of(context).unfocus();
                          BlocProvider.of<PasswordEditBloc>(
                            context,
                          ).add(LocationAddressInputCanceled());
                        },
                      ),
                      Expanded(child: Container()),
                      // _buildGetAddressOkWidget(state.getAddressOkState),
                      if (state.getAddressOkState == ButtonState.loading)
                        Container(
                          margin: const EdgeInsets.only(
                            top: 12,
                            bottom: 12.0,
                            right: 24.0,
                          ),
                          height: 24.0,
                          width: 24.0,
                          child: const CircularProgressIndicator(),
                        ),

                      if (state.getAddressOkState == ButtonState.visible)
                        TextButton(
                          style: ButtonStyle(
                            foregroundColor: WidgetStateProperty.all(
                              Theme.of(context).colorScheme.secondary,
                            ),
                          ),
                          child: Text(Strings.actionOk.toUpperCase()),
                          onPressed: () {
                            print(addressController.text);
                            FocusScope.of(context).unfocus();
                            BlocProvider.of<PasswordEditBloc>(
                              context,
                            ).add(LocationAddressInputConfirmed());
                          },
                        ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(
                        Strings.passwordLocationEnterAddress,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      TextFormField(
                        autovalidateMode: AutovalidateMode.always,
                        controller: addressController,
                        style: Theme.of(context).textTheme.bodyMedium,
                        validator: (_) => state.isLocationAddressValid
                            ? null
                            : Strings.passwordLocationAddressError,
                        textInputAction: TextInputAction.done,
                      ),
                    ],
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
