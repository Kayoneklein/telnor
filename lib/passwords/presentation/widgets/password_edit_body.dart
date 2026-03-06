import 'package:built_collection/built_collection.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:telnor/config/configuration_bloc.dart';
import 'package:telnor/model/attachment.dart';
import 'package:telnor/model/group.dart';
import 'package:telnor/model/location.dart';
import 'package:telnor/model/password.dart';
import 'package:telnor/passwords/bloc/password_edit_bloc.dart';
import 'package:telnor/passwords/bloc/password_edit_event.dart';
import 'package:telnor/passwords/bloc/password_edit_state.dart';
import 'package:telnor/passwords/index.dart';
import 'package:telnor/util/formatters.dart';
import 'package:telnor/util/strings.dart';
import 'package:telnor/widget/custom_widgets.dart';

class PasswordEditBody extends StatelessWidget {
  const PasswordEditBody({
    required this.state,
    required this.nameController,
    required this.usernameController,
    required this.urlController,
    required this.passwordController,
    required this.notesController,
    required this.scaffoldKey,
    super.key,
  });

  final PasswordEditState state;
  final TextEditingController nameController;
  final TextEditingController usernameController;
  final TextEditingController urlController;
  final TextEditingController passwordController;
  final TextEditingController notesController;
  final GlobalKey<ScaffoldState> scaffoldKey;

  // final _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context) {
    final remoteConfig = BlocProvider.of<ConfigurationBloc>(
      context,
    ).state.configuration;
    return SingleChildScrollView(
      scrollDirection: Axis.vertical,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                '* ' + Strings.passwordName,
                style: Theme.of(context).textTheme.bodySmall,
              ),
              TextFormField(
                controller: nameController,
                style: Theme.of(context).textTheme.headlineSmall,
                autovalidateMode: AutovalidateMode.always,
                validator: (_) =>
                    state.isNameValid ? null : Strings.passwordNameEmpty,
                textInputAction: TextInputAction.next,
                textCapitalization: TextCapitalization.words,
                onFieldSubmitted: (v) {
                  FocusScope.of(context).nextFocus();
                },
              ),
              const SizedBox(height: 24.0),
              Text(
                Strings.passwordUsername,
                style: Theme.of(context).textTheme.bodySmall,
              ),
              TextFormField(
                controller: usernameController,
                style: Theme.of(context).textTheme.headlineSmall,
                autovalidateMode: AutovalidateMode.always,
                validator: (_) => state.isUsernameValid
                    ? null
                    : Strings.passwordUsernameEmpty,
                textInputAction: TextInputAction.next,
                onFieldSubmitted: (v) {
                  FocusScope.of(context).nextFocus();
                },
              ),
              const SizedBox(height: 24.0),
              Text(
                Strings.passwordPassword,
                style: Theme.of(context).textTheme.bodySmall,
              ),
              TextFormField(
                controller: passwordController,
                style: Theme.of(context).textTheme.headlineSmall,
                autovalidateMode: AutovalidateMode.always,
                validator: (_) => state.isPasswordValid
                    ? null
                    : Strings.passwordPasswordEmpty,
                textInputAction: TextInputAction.next,
                onFieldSubmitted: (v) {
                  FocusScope.of(context).nextFocus();
                },
              ),
              const SizedBox(height: 24.0),
              Text(
                Strings.passwordUrl,
                style: Theme.of(context).textTheme.bodySmall,
              ),
              TextFormField(
                controller: urlController,
                style: Theme.of(context).textTheme.bodyMedium,
                autovalidateMode: AutovalidateMode.always,
                validator: (_) =>
                    state.isUrlValid ? null : Strings.passwordUrlInvalid,
                textInputAction: TextInputAction.next,
                keyboardType: TextInputType.url,
                onFieldSubmitted: (v) {
                  FocusScope.of(context).nextFocus();
                },
              ),
              const SizedBox(height: 24.0),
              Text(
                Strings.passwordNotes,
                style: Theme.of(context).textTheme.bodySmall,
              ),
              TextFormField(
                controller: notesController,
                style: Theme.of(context).textTheme.bodyMedium,
                maxLines: null,
                keyboardType: TextInputType.multiline,
                textInputAction: TextInputAction.newline,
              ),
              const SizedBox(height: 24.0),
              Text(
                Strings.passwordTags,
                style: Theme.of(context).textTheme.bodySmall,
              ),
              const SizedBox(height: 12.0),
              _buildTagsList(context, state.tags),
              TextButton(
                child: Text(
                  Strings.passwordSetTags,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.secondary,
                  ),
                ),
                onPressed: () {
                  FocusScope.of(context).unfocus();
                  scaffoldKey.currentState?.openEndDrawer();
                  BlocProvider.of<PasswordEditBloc>(
                    context,
                  ).add(SelectTagsPressed());
                },
              ),
              const SizedBox(height: 24.0),
              remoteConfig.disableGeolocations
                  ? const SizedBox()
                  : _LocationSection(state: state, scaffoldKey: scaffoldKey),
              remoteConfig.disableFiles
                  ? const SizedBox()
                  : Column(
                      mainAxisAlignment: MainAxisAlignment.start,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          Strings.passwordAttachments,
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                        const SizedBox(height: 12.0),
                        _buildFilesList(
                          context,
                          state.files,
                          state.uploadingFilesCount,
                        ),
                        TextButton(
                          child: Text(
                            Strings.passwordUploadFile,
                            style: Theme.of(context).textTheme.bodyMedium
                                ?.copyWith(
                                  color: Theme.of(
                                    context,
                                  ).colorScheme.secondary,
                                ),
                          ),
                          onPressed: () {
                            FocusScope.of(context).unfocus();
                            scaffoldKey.currentState?.closeEndDrawer();
                            BlocProvider.of<PasswordEditBloc>(
                              context,
                            ).add(FileUploadPressed());
                          },
                          // onPressed: () => _onFileUploadPressed(context),
                        ),
                        const SizedBox(height: 30.0),
                      ],
                    ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Build list of tags
Widget _buildTagsList(BuildContext context, BuiltList<Group> tags) {
  if (tags.isEmpty) {
    return GreyBorderContainer(child: const SizedBox(height: 8.0));
  }
  final rows = <Widget>[];
  for (int position = 0; position < tags.length; position++) {
    final tag = tags[position];
    rows.add(
      Row(
        children: [
          Expanded(
            child: Text(
              tag.name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ),
          SmallIconButton(
            icon: const Icon(Icons.delete),
            color: Theme.of(context).colorScheme.secondary,
            tooltip: Strings.actionDelete,
            onPressed: () {
              BlocProvider.of<PasswordEditBloc>(
                context,
              ).add(TagDeletePressed(tagId: tag.id));
            },
          ),
        ],
      ),
    );
  }
  return GreyBorderContainer(
    child: Column(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: rows,
    ),
  );
}

class _LocationSection extends StatelessWidget {
  const _LocationSection({required this.state, required this.scaffoldKey});

  final PasswordEditState state;
  final GlobalKey<ScaffoldState> scaffoldKey;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          Strings.passwordLocations,
          style: Theme.of(context).textTheme.bodySmall,
        ),
        const SizedBox(height: 12.0),
        _buildLocationsList(context, state.locations, scaffoldKey),
        Row(
          children: <Widget>[
            TextButton(
              child: Text(
                Strings.passwordAddLocation,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Theme.of(context).colorScheme.secondary,
                ),
              ),
              // onPressed: _onLocationAddPressed,
              onPressed: () {
                FocusScope.of(context).unfocus();
                scaffoldKey.currentState?.openEndDrawer();
                BlocProvider.of<PasswordEditBloc>(
                  context,
                ).add(LocationAddPressed());
              },
            ),
            const Expanded(child: SizedBox()),
            TextButton(
              child: Text(
                Strings.passwordShowAllLocations,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Theme.of(context).colorScheme.secondary,
                ),
              ),
              onPressed: () {
                if (state.locations.isNotEmpty) {
                  FocusScope.of(context).unfocus();
                  Navigator.push(
                    context,
                    MaterialPageRoute<void>(
                      builder: (context) => LocationViewerScreen(
                        title: state.name,
                        locations: state.locations.toList(),
                      ),
                    ),
                  );
                }
              },
            ),
          ],
        ),
        const SizedBox(height: 24.0),
      ],
    );
  }
}

Widget _buildLocationsList(
  BuildContext context,
  BuiltList<Location> locations,
  GlobalKey<ScaffoldState> scaffoldKey,
) {
  if (locations.isEmpty) {
    return GreyBorderContainer(child: const SizedBox(height: 8.0));
  }
  final rows = <Widget>[];
  for (int position = 0; position < locations.length; position++) {
    final Location location = locations[position];
    final title = location.title.isNotEmpty
        ? location.title
        : formatGeoLocation(location.latitude, location.longitude);
    rows.add(
      Row(
        children: [
          Text(
            '${position + 1}. ',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          Expanded(
            child: GestureDetector(
              child: Text(
                title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Theme.of(context).colorScheme.secondary,
                  decoration: TextDecoration.underline,
                ),
              ),
              // onTap: () => _launchGeo(context, title, location),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute<void>(
                    builder: (context) => LocationViewerScreen(
                      title: title,
                      locations: [location],
                    ),
                  ),
                );
              },
            ),
          ),
          SmallIconButton(
            icon: const Icon(Icons.edit),
            color: Theme.of(context).colorScheme.secondary,
            tooltip: Strings.actionEdit,
            onPressed: () {
              // _onLocationEditPressed(position);
              FocusScope.of(context).unfocus();
              scaffoldKey.currentState?.openEndDrawer();
              BlocProvider.of<PasswordEditBloc>(
                context,
              ).add(LocationEditPressed(position: position));
            },
          ),
          const SizedBox(width: 8.0),
          SmallIconButton(
            icon: const Icon(Icons.delete),
            color: Theme.of(context).colorScheme.secondary,
            tooltip: Strings.actionDelete,
            onPressed: () {
              // _onLocationDeletePressed(position);
              BlocProvider.of<PasswordEditBloc>(
                context,
              ).add(LocationDeletePressed(position: position));
            },
          ),
        ],
      ),
    );
  }
  return GreyBorderContainer(
    child: Column(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: rows,
    ),
  );
}

Widget _buildFilesList(
  BuildContext context,
  BuiltList<Attachment> files,
  int uploadingFilesCount,
) {
  if (files.isEmpty && uploadingFilesCount == 0) {
    return GreyBorderContainer(child: const SizedBox(height: 8.0));
  }
  final rows = <Widget>[];
  for (int position = 0; position < files.length; position++) {
    final file = files[position];
    rows.add(
      Row(
        children: [
          Text(
            '${position + 1}. ',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          Expanded(
            child: GestureDetector(
              child: Text(
                file.name,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Theme.of(context).colorScheme.secondary,
                  decoration: TextDecoration.underline,
                ),
              ),
              onTap: () {
                // _launchAttachment(context, file);
                Navigator.of(context).push(
                  MaterialPageRoute<Password>(
                    builder: (context) => FileViewerScreen(file),
                  ),
                );
              },
            ),
          ),
          SmallIconButton(
            icon: const Icon(Icons.delete),
            color: Theme.of(context).colorScheme.secondary,
            tooltip: Strings.actionDelete,
            onPressed: () {
              // _onFileDeletePressed(position);
              BlocProvider.of<PasswordEditBloc>(
                context,
              ).add(FileDeletePressed(position: position));
            },
          ),
        ],
      ),
    );
  }
  for (int i = 0; i < uploadingFilesCount; i++) {
    rows.add(
      Row(
        children: [
          Text(
            '${files.length + i + 1}. ',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const Expanded(
            child: Padding(
              padding: EdgeInsets.only(
                left: 4.0,
                right: 8.0,
                top: 10.0,
                bottom: 12.0,
              ),
              child: LinearProgressIndicator(),
            ),
          ),
        ],
      ),
    );
  }
  return GreyBorderContainer(
    child: Column(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: rows,
    ),
  );
}
