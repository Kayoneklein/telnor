part of '../../index.dart';

///Widget which displays circular dot indicator for current page
class PageIndicator extends StatefulWidget {
  const PageIndicator({
    super.key,
    required this.pageCount,
    required this.animation,
    Color? dotColor,
    Size? dotSize,
    EdgeInsets? padding,
    double? dotSpacing,
  }) : dotColor = dotColor ?? const Color.fromARGB(200, 255, 255, 255),
       dotSize = dotSize ?? const Size(8.0, 8.0),
       padding = padding ?? EdgeInsets.zero,
       dotSpacing = dotSpacing ?? 8.0;

  final ValueNotifier<int> animation;

  final int pageCount;

  final Color dotColor;
  final EdgeInsets padding;
  final Size dotSize;
  final double dotSpacing;

  @override
  State<PageIndicator> createState() => _PageIndicatorState();
}

class _PageIndicatorState extends State<PageIndicator> {
  final list = <int>[];

  @override
  void initState() {
    for (int index = 0; index < widget.pageCount; index++) {
      list.add(index);
    }
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: widget.padding,
      child: Padding(
        padding: EdgeInsets.zero,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [...list].map((index) {
            return _BuildIndicator(
              dotColor: widget.dotColor,
              index: index,
              dotSize: widget.dotSize,
              animation: widget.animation,
              dotSpacing: widget.dotSpacing,
            );
          }).toList(),
        ),
      ),
    );
  }
}

class _BuildIndicator extends StatelessWidget {
  const _BuildIndicator({
    required this.dotSize,
    required this.dotColor,
    required this.index,
    required this.animation,
    required this.dotSpacing,
  });

  final Size dotSize;
  final Color dotColor;
  final double dotSpacing;

  final int index;
  final ValueNotifier<int> animation;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: dotSize.width,
          height: dotSize.height,
          decoration: BoxDecoration(
            border: Border.all(color: dotColor),
            color: animation.value == index ? dotColor : null,
            borderRadius: BorderRadius.circular(dotSize.height),
          ),
        ),
        SizedBox(width: dotSpacing),
      ],
    );
  }
}
