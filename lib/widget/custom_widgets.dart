import 'package:flutter/material.dart';
import 'package:telnor/home/index.dart';
import 'package:telnor/util/strings.dart';

///Widget for grey backgrounds with border
class GreyBorderContainer extends Container {
  GreyBorderContainer({super.key, super.child})
    : super(
        width: double.infinity,
        padding: const EdgeInsets.only(
          left: 16.0,
          right: 16.0,
          top: 12.0,
          bottom: 12.0,
        ),
        decoration: BoxDecoration(
          color: Colors.grey[200],
          border: Border.all(color: Colors.grey[300]!),
          borderRadius: const BorderRadius.all(Radius.circular(8.0)),
        ),
      );
}

///Non-focusable IconButton with decreased padding
class SmallIconButton extends StatelessWidget {
  const SmallIconButton({
    super.key,
    required Icon icon,
    required Color color,
    required String tooltip,
    required Function() onPressed,
  }) : _color = color,
       _tooltip = tooltip,
       _icon = icon,
       _onPressed = onPressed;

  final Icon _icon;
  final Color _color;
  final Function() _onPressed;
  final String _tooltip;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: Tooltip(
        message: _tooltip,
        child: InkWell(
          borderRadius: const BorderRadius.all(Radius.circular(16.0)),
          onTap: _onPressed,
          child: Padding(
            padding: const EdgeInsets.all(4.0),
            child: Icon(_icon.icon, size: 24.0, color: _color),
          ),
        ),
      ),
    );
  }
}

/// Material button with rounded corners, white text and accent background
class RoundedInverseButton extends ElevatedButton {
  RoundedInverseButton(
    BuildContext context, {
    super.key,
    required String title,
    required Function() onPressed,
    double borderRadius = 24.0,
    uppcaseTransform = true,
  }) : super(
         style: ButtonStyle(
           backgroundColor: WidgetStateProperty.all(
             Theme.of(context).primaryColor,
           ),
           shape: WidgetStateProperty.all(
             RoundedRectangleBorder(
               borderRadius: BorderRadius.all(Radius.circular(borderRadius)),
             ),
           ),
           foregroundColor: WidgetStateProperty.all(
             Theme.of(context).primaryTextTheme.bodyLarge?.color,
           ),
         ),
         child: Padding(
           padding: const EdgeInsets.only(top: 12.0, bottom: 12.0),
           child: Text(
             uppcaseTransform ? title.toUpperCase() : title,
             style: const TextStyle(fontWeight: FontWeight.bold),
           ),
         ),
         onPressed: onPressed,
       );
}

/// Material button with rounded corners, white text, white outline and transparent background
class RoundedOutlineButton extends TextButton {
  RoundedOutlineButton(
    BuildContext context, {
    super.key,
    required String title,
    required Function() onPressed,
    Color? borderColor,
    Color? textColor,
  }) : super(
         style: ButtonStyle(
           backgroundColor: WidgetStateProperty.all(Colors.transparent),
           shape: WidgetStateProperty.all(
             RoundedRectangleBorder(
               side: BorderSide(
                 color:
                     borderColor ??
                     Theme.of(context).primaryTextTheme.bodyLarge!.color!,
               ),
               borderRadius: const BorderRadius.all(Radius.circular(50.0)),
             ),
           ),
           foregroundColor: WidgetStateProperty.all(
             Theme.of(context).primaryTextTheme.bodyLarge?.color,
           ),
         ),
         child: Padding(
           padding: const EdgeInsets.only(top: 12.0, bottom: 12.0),
           child: Text(
             title.toUpperCase(),
             style: TextStyle(fontWeight: FontWeight.bold, color: textColor),
           ),
         ),
         onPressed: onPressed,
       );
}

/// ScrollBehavior with disabled (overscroll) edge effect (Android-specific)
class NoEdgeEffectScrollBehavior extends ScrollBehavior {
  @override
  Widget buildViewportChrome(
    BuildContext context,
    Widget child,
    AxisDirection axisDirection,
  ) {
    return child;
  }
}

/// Underline to be used in [DropDownButton]s
class DropdownUnderline extends StatelessWidget {
  const DropdownUnderline({super.key, Color? color})
    : _color = color ?? Colors.grey;

  final Color _color;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 1.0,
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: _color, width: 1.0)),
      ),
    );
  }
}

//----------------------------------------------------------------------------------------------------------------------

///Widget for empty data (appears with animation)
class NoDataAvailable extends StatefulWidget {
  const NoDataAvailable({
    super.key,
    required this.icon,
    required this.title,
    required this.message,
  });

  final IconData icon;
  final String title;
  final String message;

  @override
  State<StatefulWidget> createState() => _NoDataAvailableState();
}

class _NoDataAvailableState extends State<NoDataAvailable>
    with SingleTickerProviderStateMixin {
  late final Animation<double> _animation;
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 1),
      vsync: this,
    );
    _animation = Tween<double>(begin: 0.0, end: 1.0).animate(_controller)
      ..addListener(() => setState(() {}));
    _controller.forward();
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Opacity(
        opacity: _animation.value,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Icon(
              widget.icon,
              size: 64.0,
              color: Theme.of(context).iconTheme.color,
            ),
            const SizedBox(height: 8.0),
            Text(
              widget.title,
              style: Theme.of(
                context,
              ).textTheme.bodyLarge?.apply(fontWeightDelta: 2),
            ),
            const SizedBox(height: 8.0),
            Text(
              widget.message,
              style: const TextStyle(
                color: Colors.black,
                fontSize: 16.0,
                height: 1.2,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 48.0),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}

//----------------------------------------------------------------------------------------------------------------------

///Show dialog for entering non-empty text in the fields
///
/// Returns null if dialog was canceled
Future<String?> showEditTextDialog(
  BuildContext context, {
  String? title,
  String? initialText,
  TextInputType? keyboardType,
  String? hint,
  String? emptyMessage,
  String? positiveTitle,
  String? cancelTitle,
}) async {
  final formKey = GlobalKey<FormState>();
  final textController = TextEditingController();
  textController.text = initialText ?? '';
  final result = await showDialog<String>(
    context: context,
    builder: (context) {
      return AlertDialog(
        title: Text(title ?? ''),
        content: Form(
          key: formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: textController,
                autofocus: true,
                validator: (text) =>
                    text?.isNotEmpty == true ? null : (emptyMessage ?? ''),
                keyboardType: keyboardType,
                decoration: InputDecoration(labelText: hint ?? ''),
                style: Theme.of(context).textTheme.bodyMedium,
                maxLines: 1,
              ),
            ],
          ),
        ),
        actions: <Widget>[
          TextButton(
            child: Text(cancelTitle?.toUpperCase() ?? ''),
            onPressed: () {
              FocusScope.of(context).unfocus();
              Navigator.of(context).pop();
            },
          ),
          TextButton(
            child: Text(positiveTitle?.toUpperCase() ?? ''),
            onPressed: () {
              if (formKey.currentState?.validate() == true) {
                FocusScope.of(context).unfocus();
                Navigator.of(context).pop(textController.text);
              }
            },
          ),
        ],
      );
    },
  );
  Future.delayed(const Duration(milliseconds: 500), () {
    textController.dispose();
  });
  return result;
}

/// Show dialog about functionality restrictions for non-premium users
Future<void> showPremiumRestrictionsDialog(BuildContext context) async {
  final bool upgrade =
      await showDialog<bool>(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: Text(Strings.premiumRequiredTitle),
            content: Text(Strings.premiumRequiredMessage),
            actions: [
              TextButton(
                child: Text(Strings.actionOk.toUpperCase()),
                onPressed: () {
                  Navigator.of(context).pop(false);
                },
              ),
            ],
          );
        },
      ) ??
      false;
  if (upgrade) {
    Navigator.of(
      context,
    ).push(MaterialPageRoute<void>(builder: (context) => UpgradeScreen()));
  }
}

void connectionError(BuildContext context, String message) {
  ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(SnackBar(content: Text(message)));
}
