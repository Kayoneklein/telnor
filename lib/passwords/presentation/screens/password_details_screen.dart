part of '../../index.dart';

///Screen for displaying password details
class PasswordDetailsScreen extends StatefulWidget {
  const PasswordDetailsScreen(this.password, {this.totalFilesAttached = 0});

  final Password password;
  final int totalFilesAttached;

  @override
  State createState() => _PasswordDetailsScreenState();
}

class _PasswordDetailsScreenState extends State<PasswordDetailsScreen> {
  late Password password;

  @override
  void initState() {
    super.initState();
    password = widget.password;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: true,
        title: Text(password.name),
        actions: [
          if (!widget.password.isShared)
            IconButton(
              icon: Icon(
                Icons.edit,
                color: Theme.of(context).primaryIconTheme.color,
              ),
              tooltip: Strings.actionEdit,
              onPressed: () async {
                final readOnly = await Preferences().readonlyMode;
                if (readOnly == true) {
                  Fluttertoast.showToast(msg: Strings.readOnlyToastAlert);
                  return;
                }

                final result = await Navigator.push(
                  context,
                  MaterialPageRoute<Password>(
                    builder: (context) => PasswordEditScreen(
                      password: password,
                      totalFilesAttached: widget.totalFilesAttached,
                    ),
                  ),
                );
                if (result != null) {
                  setState(() {
                    password = result;
                    Navigator.of(context).pop(result);
                  });
                }
              },
            ),
        ],
      ),
      body: PasswordDetails(password),
    );
  }
}
//--------------------------------------------------------------------------------------------------------------------

///Widget to display details for specific password
class PasswordDetails extends StatefulWidget {
  const PasswordDetails(this.password);

  final Password password;

  @override
  State createState() => PasswordDetailsState();
}

///State for [PasswordDetails] widget
class PasswordDetailsState extends State<PasswordDetails> {
  bool _showPassword = false;
  final Map<int, String> _addresses = {};

  @override
  void initState() {
    super.initState();
    _loadLocationNames();
  }

  @override
  Widget build(BuildContext context) {
    final remoteConfig = BlocProvider.of<ConfigurationBloc>(
      context,
    ).state.configuration;
    return Scrollbar(
      child: SingleChildScrollView(
        scrollDirection: Axis.vertical,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                Strings.passwordName,
                style: Theme.of(context).textTheme.bodySmall,
              ),
              const SizedBox(height: 12.0),
              Text(
                widget.password.name,
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 24.0),
              Text(
                Strings.passwordUsername,
                style: Theme.of(context).textTheme.bodySmall,
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: <Widget>[
                  Expanded(
                    child: Text(
                      widget.password.user,
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.content_copy),
                    color: Theme.of(context).colorScheme.secondary,
                    tooltip: Strings.actionCopy,
                    onPressed: () {
                      Clipboard.setData(
                        ClipboardData(text: widget.password.user),
                      );
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          duration: const Duration(seconds: 1),
                          content: Text(Strings.passwordCopied),
                        ),
                      );
                    },
                  ),
                ],
              ),
              const SizedBox(height: 24.0),
              Text(
                Strings.passwordPassword,
                style: Theme.of(context).textTheme.bodySmall,
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Expanded(
                    child: Text(
                      _showPassword ? widget.password.password : '•••••••',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                  ),
                  if (!widget.password.isHidden)
                    IconButton(
                      icon: Icon(
                        _showPassword ? Icons.visibility_off : Icons.visibility,
                      ),
                      color: Theme.of(context).colorScheme.secondary,
                      tooltip: _showPassword
                          ? Strings.actionHidePassword
                          : Strings.actionViewPassword,
                      onPressed: () => setState(() {
                        _showPassword = !_showPassword;
                      }),
                    ),
                  IgnorePointer(
                    ignoring: widget.password.isHidden,
                    child: Opacity(
                      opacity: widget.password.isHidden ? 0.0 : 1.0,
                      child: IconButton(
                        icon: const Icon(Icons.content_copy),
                        color: Theme.of(context).colorScheme.secondary,
                        tooltip: Strings.actionCopy,
                        onPressed: () {
                          Clipboard.setData(
                            ClipboardData(text: widget.password.password),
                          );
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              duration: const Duration(seconds: 1),
                              content: Text(Strings.passwordCopied),
                            ),
                          );
                        },
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8.0),
              Text(
                Strings.passwordUrl,
                style: Theme.of(context).textTheme.bodySmall,
              ),
              const SizedBox(height: 8.0),
              GestureDetector(
                child: Text(
                  widget.password.url,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    decoration: TextDecoration.underline,
                    color: Theme.of(context).colorScheme.secondary,
                  ),
                ),
                onTap: () => _launchUrl(widget.password.url),
              ),
              const SizedBox(height: 24.0),
              Text(
                Strings.passwordNotes,
                style: Theme.of(context).textTheme.bodySmall,
              ),
              const SizedBox(height: 8.0),
              Text(
                widget.password.note,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 24.0),
              Text(
                Strings.passwordTags,
                style: Theme.of(context).textTheme.bodySmall,
              ),
              const SizedBox(height: 8.0),
              widget.password.tags.isNotEmpty
                  ? Wrap(
                      direction: Axis.horizontal,
                      spacing: 8.0,
                      children: widget.password.tags
                          .map((t) => Chip(label: Text(t.name)))
                          .toList(),
                    )
                  : const SizedBox(height: 12.0),
              const SizedBox(height: 24.0),
              remoteConfig.disableGeolocations
                  ? const SizedBox()
                  : _buildLocationSection(),
              remoteConfig.disableFiles
                  ? const SizedBox()
                  : _buildAttachmentSection(),
            ],
          ),
        ),
      ),
    );
  }

  /// Build list of locations for password
  Widget _buildLocationsList(List<Location> locations) {
    if (locations.isEmpty) {
      return GreyBorderContainer(child: const SizedBox(height: 8.0));
    }
    final rows = <Widget>[];
    rows.add(const SizedBox(height: 4.0));
    for (int position = 0; position < locations.length; position++) {
      final Location location = locations[position];
      final title = location.title.isNotEmpty
          ? location.title
          : _addresses.containsKey(position)
          ? _addresses[position]!
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
                onTap: () => _launchGeo(context, title, [location]),
              ),
            ),
          ],
        ),
      );
      if (position < locations.length - 1) {
        rows.add(const SizedBox(height: 12.0));
      }
    }
    rows.add(const SizedBox(height: 4.0));
    return GreyBorderContainer(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: rows,
      ),
    );
  }

  /// Build list of files for password
  Widget _buildFilesList(List<Attachment> files) {
    if (files.isEmpty) {
      return GreyBorderContainer(child: const SizedBox(height: 8.0));
    }
    final rows = <Widget>[];
    rows.add(const SizedBox(height: 4.0));
    for (int position = 0; position < files.length; position++) {
      final Attachment file = widget.password.files[position];
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
                  _launchAttachment(context, file);
                },
              ),
            ),
          ],
        ),
      );
      if (position < files.length - 1) {
        rows.add(const SizedBox(height: 12.0));
      }
    }
    rows.add(const SizedBox(height: 4.0));
    return GreyBorderContainer(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: rows,
      ),
    );
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Open URL in external browser
  Future<void> _launchUrl(String url) async {
    if (url.isNotEmpty) {
      await http.launchUrl(
        Uri.parse(url),
        mode: http.LaunchMode.externalApplication,
      );
    }
  }

  //Open geo coordinates in external map application (or browser)
  Future<void> _launchGeo(
    BuildContext context,
    String title,
    List<Location> locations,
  ) async {
    Navigator.push(
      context,
      MaterialPageRoute<void>(
        builder: (context) =>
            LocationViewerScreen(title: title, locations: locations),
      ),
    );
  }

  //Open file in embedded view
  void _launchAttachment(BuildContext context, Attachment file) {
    Navigator.of(context).push(
      MaterialPageRoute<Password>(
        builder: (context) {
          if (widget.password.isShared) {
            if (widget.password.isSharedByTeam) {
              return FileViewerScreen(
                file,
                teamId: widget.password.creator!.teamId,
                teamKey: widget.password.teamKey,
              );
            } else {
              return FileViewerScreen(
                file,
                ownerId: widget.password.creator!.userId,
                publicKey: widget.password.creator!.publicKey,
              );
            }
          } else {
            return FileViewerScreen(file);
          }
        },
      ),
    );
  }

  /// Finds local addresses for locations (if possible)
  Future<void> _loadLocationNames() async {
    for (int i = 0; i < widget.password.locations.length; i++) {
      try {
        final location = widget.password.locations[i];
        final address = await LocationService.get.getAddressForCoordinates(
          location.latitude,
          location.longitude,
        );
        if (address.isNotEmpty) {
          _addresses[i] = address;
          setState(() {});
        }
      } catch (error) {
        continue;
      }
    }
  }

  Column _buildLocationSection() {
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
        _buildLocationsList(widget.password.locations),
        (widget.password.locations.isNotEmpty)
            ? Row(
                children: <Widget>[
                  const Expanded(child: SizedBox()),
                  TextButton(
                    child: Text(
                      Strings.passwordShowAllLocations,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Theme.of(context).colorScheme.secondary,
                      ),
                    ),
                    onPressed: () => _launchGeo(
                      context,
                      widget.password.name,
                      widget.password.locations,
                    ),
                  ),
                ],
              )
            : const SizedBox(height: 24.0),
      ],
    );
  }

  Column _buildAttachmentSection() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          Strings.passwordAttachments,
          style: Theme.of(context).textTheme.bodySmall,
        ),
        const SizedBox(height: 12.0),
        _buildFilesList(widget.password.files),
        const SizedBox(height: 24.0),
        Row(
          children: [
            Expanded(
              child: Text(
                Strings.passwordCreated +
                    formatCreatedDate(widget.password.createdAt),
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ),
            Text(
              Strings.passwordUpdated +
                  formatCreatedDate(widget.password.updatedAt),
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
      ],
    );
  }
}
