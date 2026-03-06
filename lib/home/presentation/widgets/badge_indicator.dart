part of '../../index.dart';

/// Indicator that shows some number in a circle
class BadgeIndicator extends StatelessWidget {
  const BadgeIndicator({super.key, required this.value, this.maxValue = 99});

  final int value;
  final int maxValue;

  @override
  Widget build(BuildContext context) {
    return value > 0
        ? Positioned(
            right: 0.0,
            child: Container(
              padding: const EdgeInsets.all(2.0),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: Theme.of(context).primaryColor,
                borderRadius: BorderRadius.circular(8),
              ),
              constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
              child: Text(
                value > maxValue ? '$maxValue+' : value.toString(),
                style: Theme.of(
                  context,
                ).primaryTextTheme.bodyMedium?.copyWith(fontSize: 10),
                textAlign: TextAlign.center,
              ),
            ),
          )
        : const SizedBox();
  }
}
