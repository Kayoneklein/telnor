part of '../../index.dart';

/// Screen to display notification details
class NotificationDetailsScreen extends StatelessWidget {
  const NotificationDetailsScreen(this.message);

  final GlobalMessage message;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(automaticallyImplyLeading: true),
      body: _buildBody(context),
    );
  }

  Widget _buildBody(BuildContext context) {
    return Scrollbar(
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.only(
                left: 16.0,
                right: 16.0,
                top: 16.0,
              ),
              child: Text(
                Strings.notificationTopic,
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                message.topic,
                style: Theme.of(context).textTheme.headlineSmall,
              ),
            ),
            const Divider(height: 1.0),
            Padding(
              padding: const EdgeInsets.only(
                left: 16.0,
                right: 16.0,
                top: 16.0,
              ),
              child: Text(
                Strings.notificationContent,
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(
                left: 16.0,
                right: 16.0,
                top: 16.0,
              ),
              child: Text(
                message.content,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ),
            Container(
              padding: const EdgeInsets.all(16.0),
              alignment: Alignment.centerRight,
              child: Text(
                Strings.notificationCreated +
                    formatCreatedDate(message.createdAt),
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
