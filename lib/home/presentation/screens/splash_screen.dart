part of '../../index.dart';

///Screen for displaying splash screen
class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // final remoteConfig =
    //     BlocProvider.of<ConfigurationBloc>(context).state.configuration;
    return Scaffold(
      backgroundColor: Theme.of(context).primaryColor,
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Row(
              children: <Widget>[
                Container(
                  width: 96.0,
                  height: 96.0,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    image: const DecorationImage(
                      image: AssetImage(PImages.logoWhite),
                    ),
                  ),
                ),
                const SizedBox(width: 16.0),
                Expanded(
                  child: Column(
                    children: <Widget>[
                      const Align(
                        alignment: Alignment.centerLeft,
                        child: AutoSizeText(
                          // remoteConfig.productName.isNotEmpty
                          //     ? remoteConfig.productName
                          //     : appName,
                          appName,
                          maxLines: 2,
                          maxFontSize: 28,
                          textAlign: TextAlign.left,
                          style: TextStyle(
                            color: Colors.white,
                            inherit: false,
                            fontSize: 28.0,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                      const SizedBox(height: 8.0),
                      SizedBox(
                        child: LinearProgressIndicator(
                          valueColor: AlwaysStoppedAnimation(
                            Theme.of(context).primaryIconTheme.color,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
