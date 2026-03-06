import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:telnor/model/password.dart';
import 'package:telnor/passwords/bloc/passwords_bloc.dart';
import 'package:telnor/passwords/bloc/passwords_state.dart';
import 'package:telnor/util/strings.dart';
import 'package:telnor/widget/custom_widgets.dart';

class PasswordsShareInfoDrawer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocBuilder<PasswordsBloc, PasswordsState>(
      builder: (context, state) {
        final info = state.currentShareInfo;
        final localizedText = info?.type == PasswordType.teamShare
            ? Strings.passwordsShareInfoWithTeams
            : Strings.passwordsShareInfoThroughTeams;
        final Widget content = (info != null)
            ? ScrollConfiguration(
                behavior: NoEdgeEffectScrollBehavior(),
                child: Scrollbar(
                  child: Padding(
                    padding: const EdgeInsets.only(left: 24.0, right: 16.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.start,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children:
                          [
                            Text(
                              Strings.passwordsShareInfoUser + ':',
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                            const SizedBox(height: 12.0),
                            if (info.username.isNotEmpty)
                              Text(
                                info.username,
                                style: Theme.of(context).textTheme.bodyMedium
                                    ?.apply(fontWeightDelta: 1),
                              ),
                            if (info.username.isNotEmpty)
                              const SizedBox(height: 8.0),
                            Text(
                              info.email,
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                            const SizedBox(height: 32.0),
                            Text(
                              localizedText + ':',
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                            const SizedBox(height: 8.0),
                          ] +
                          info.teams
                              .map<Widget>(
                                (t) => Padding(
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 4.0,
                                  ),
                                  child: Text(
                                    t,
                                    style: Theme.of(
                                      context,
                                    ).textTheme.bodyMedium,
                                  ),
                                ),
                              )
                              .toList(),
                    ),
                  ),
                ),
              )
            : const SizedBox();
        return SafeArea(
          child: ClipRRect(
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(8.0),
            ),
            child: Drawer(
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
                            Strings.passwordsShareInfoTitle,
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
                            Navigator.of(context).pop();
                          },
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24.0),
                  Expanded(child: content),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
