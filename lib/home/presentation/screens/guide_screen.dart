part of '../../index.dart';

///Screen for displaying startup guide
class GuideScreen extends StatefulWidget {
  final _guidePages = <MapEntry<String, String>>[
    MapEntry(Strings.tourGuideTitle4, Strings.tourGuideMessage4),
    MapEntry(Strings.tourGuideTitle5, Strings.tourGuideMessage5),
    MapEntry(Strings.tourGuideTitle1, Strings.tourGuideMessage1),
    MapEntry(Strings.tourGuideTitle2, Strings.tourGuideMessage2),
    MapEntry(Strings.tourGuideTitle3, Strings.tourGuideMessage3),
    // MapEntry(Strings.tourGuideTitle6, Strings.tourGuideMessage6),
  ];

  GuideScreen({super.key});

  @override
  State createState() => _GuideScreenState();
}

class _GuideScreenState extends State<GuideScreen> {
  final _notifier = ValueNotifier<int>(0);

  @override
  void dispose() {
    _notifier.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final remoteConfig = BlocProvider.of<ConfigurationBloc>(
      context,
    ).state.configuration;
    final theme = Theme.of(context);

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarIconBrightness: Brightness.light,
        systemNavigationBarColor: PColors.white,
        systemNavigationBarIconBrightness: Brightness.dark, //Android
        statusBarBrightness: Brightness.light, //iOS
        statusBarColor: PColors.darkBlue, //Android only
      ),
      child: Scaffold(
        extendBodyBehindAppBar: true,
        appBar: AppBar(toolbarHeight: 0, elevation: 0),
        body: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.only(top: 70.0, bottom: 40.0),
              child: SizedBox(
                width: 180,
                height: 180,
                child: Image.asset(PImages.logo),
              ),
            ),
            Expanded(
              child: ScrollConfiguration(
                behavior: NoEdgeEffectScrollBehavior(),
                child: NotifyingPageView(
                  notifier: _notifier,
                  onChange: (int index) {
                    _notifier.value = index;

                    setState(() {});
                  },
                  children: widget._guidePages.map((page) {
                    return GuidePage(
                      title: page.key,
                      message: page.value.contains('[productname]')
                          ? page.value.replaceAll(
                              '[productname]',
                              remoteConfig.productName,
                            )
                          : page.value,
                    );
                  }).toList(),
                ),
              ),
            ),
            PageIndicator(
              pageCount: widget._guidePages.length,
              animation: _notifier,
              dotColor: theme.colorScheme.secondary,
              dotSize: const Size(8.0, 8.0),
              dotSpacing: 12.0,
            ),
            const SizedBox(height: 24),
            Container(
              width: double.maxFinite,
              padding: const EdgeInsets.only(
                left: 24.0,
                right: 24.0,
                bottom: 50.0,
              ),
              child: RoundedOutlineButton(
                context,
                title: Strings.actionLogin.toUpperCase(),
                borderColor: theme.colorScheme.secondary,
                textColor: theme.colorScheme.secondary,
                onPressed: () {
                  BlocProvider.of<AuthenticationBloc>(
                    context,
                  ).add(LoginRequestedEvent());
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Widget to display single page of the guide
class GuidePage extends StatelessWidget {
  const GuidePage({super.key, required this.title, required this.message});

  final String title;
  final String message;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: <Widget>[
        Text(
          title,
          style: Theme.of(context).primaryTextTheme.headlineMedium?.copyWith(
            color: PColors.black,
            fontWeight: FontWeight.w700,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 12.0),
        Expanded(
          child: ScrollConfiguration(
            behavior: NoEdgeEffectScrollBehavior(),
            child: SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24.0),
                child: Text(
                  message,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).primaryTextTheme.headlineSmall
                      ?.copyWith(
                        height: 1.4,
                        color: PColors.black,
                        fontSize: 20,
                      ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
