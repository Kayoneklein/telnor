part of '../../index.dart';

class NotifyingPageView extends StatefulWidget {
  const NotifyingPageView({
    super.key,
    required this.notifier,
    required List<Widget> children,
    required this.onChange,
  }) : _pages = children;

  final ValueNotifier<int> notifier;
  final List<Widget> _pages;
  final Function(int) onChange;

  @override
  _NotifyingPageViewState createState() => _NotifyingPageViewState();
}

class _NotifyingPageViewState extends State<NotifyingPageView> {
  int previousPage = 0;
  late PageController _pageController;

  void _onScroll() {
    if ((_pageController.page?.toInt() ?? 0) == _pageController.page) {
      previousPage = _pageController.page?.toInt() ?? 0;
    }
    widget.notifier.value = _pageController.page?.toInt() ?? 0;
  }

  @override
  void initState() {
    _pageController = PageController(initialPage: 0, viewportFraction: 1)
      ..addListener(_onScroll);

    previousPage = _pageController.initialPage;
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return PageView(
      children: widget._pages,
      controller: _pageController,
      onPageChanged: (int index) {
        widget.onChange(index);
      },
    );
  }
}
