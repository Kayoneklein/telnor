part of '../../index.dart';

/// Various message edit responses
abstract class MessageResult {}

/// Class that signals the need to delete message
class MessageDeleteResult extends MessageResult {}

/// Class that signals the need to send message
class MessageSendResult extends MessageResult {
  MessageSendResult(this.message);

  final MessageInfo message;
}

//======================================================================================================================

//Screen for editing message
class MessageEditScreen extends StatelessWidget {
  const MessageEditScreen({this.subject, this.message, this.members});

  final String? subject;
  final String? message;
  final List<TeamMember>? members;

  @override
  Widget build(BuildContext context) {
    return BlocProvider<MessageEditBloc>(
      create: (_) =>
          MessageEditBloc(subject: subject, message: message, members: members),
      child: MessageEditForm(isNew: message?.isEmpty == true),
    );
  }
}

//----------------------------------------------------------------------------------------------------------------------

///Widget to edit data of specific message
class MessageEditForm extends StatefulWidget {
  const MessageEditForm({this.isNew = false});

  final bool isNew;

  @override
  State createState() => _MessageEditFormState();
}

class _MessageEditFormState extends State<MessageEditForm> {
  late final MessageEditBloc _bloc;
  final _scaffoldKey = GlobalKey<ScaffoldState>();
  final _subjectController = TextEditingController();
  final _messageController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _bloc = BlocProvider.of<MessageEditBloc>(context);
    _subjectController.addListener(_onSubjectChanged);
    _messageController.addListener(_onMessageChanged);
    _messageController.selection = TextSelection.fromPosition(
      const TextPosition(offset: 0),
    );
  }

  @override
  void dispose() {
    _subjectController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<MessageEditBloc, MessageEditState>(
      listener: _blocCommandListener,
      child: BlocBuilder<MessageEditBloc, MessageEditState>(
        builder: (context, state) {
          if (_subjectController.text != state.subject) {
            _subjectController.value = _subjectController.value.copyWith(
              text: state.subject,
            );
          }
          if (_messageController.text != state.message) {
            _messageController.value = _messageController.value.copyWith(
              text: state.message,
            );
          }
          return PopScope(
            // canPop: false,
            onPopInvokedWithResult: (bool? pop, result) {
              _onCancelPressed();
            },
            child: Scaffold(
              key: _scaffoldKey,
              appBar: _buildAppBar(context, state),
              body: _buildBody(context, state),
            ),
          );
        },
      ),
    );
  }

  AppBar _buildAppBar(BuildContext context, MessageEditState state) {
    return AppBar(
      automaticallyImplyLeading: true,
      title: Text(Strings.messageSend),
      actions: [
        IconButton(
          icon: Icon(
            Icons.send,
            color: Theme.of(context).primaryIconTheme.color,
          ),
          tooltip: Strings.actionSend,
          onPressed: () {
            FocusScope.of(context).unfocus();
            _onSubmitPressed();
          },
        ),
      ],
    );
  }

  Widget _buildBody(BuildContext context, MessageEditState state) {
    return Form(
      child: Scrollbar(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  Strings.messageRecipient,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                const SizedBox(height: 8.0),
                state.members.isNotEmpty
                    ? Wrap(
                        direction: Axis.horizontal,
                        spacing: 8.0,
                        children: state.members
                            .map((t) => Chip(label: Text(t.nonEmptyName)))
                            .toList(),
                      )
                    : const SizedBox(height: 12.0),
                const SizedBox(height: 16.0),
                Text(
                  '* ' + Strings.messageSubject,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                TextFormField(
                  controller: _subjectController,
                  style: Theme.of(context).textTheme.headlineSmall,
                  autovalidateMode: AutovalidateMode.always,
                  maxLines: null,
                  validator: (_) =>
                      state.isSubjectValid ? null : Strings.messageSubjectEmpty,
                  textInputAction: TextInputAction.next,
                  textCapitalization: TextCapitalization.sentences,
                  onFieldSubmitted: (v) {
                    FocusScope.of(context).nextFocus();
                  },
                ),
                const SizedBox(height: 24.0),
                Text(
                  Strings.messageMessage,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                TextFormField(
                  autofocus: !widget.isNew,
                  controller: _messageController,
                  style: Theme.of(context).textTheme.bodyMedium,
                  textInputAction: TextInputAction.newline,
                  maxLines: null,
                  keyboardType: TextInputType.multiline,
                  textCapitalization: TextCapitalization.sentences,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Listener for specific Bloc states
  Future<void> _blocCommandListener(
    BuildContext context,
    MessageEditState state,
  ) async {
    if (state is FinishEditState) {
      if (state.result != null) {
        Navigator.of(context).pop(MessageSendResult(state.result!));
      } else {
        Navigator.of(context).pop();
      }
    }

    if (state is ConfirmDiscardChangesState) {
      final bool result =
          await showDialog<bool>(
            context: context,
            builder: (BuildContext context) {
              return AlertDialog(
                content: Text(Strings.messageDiscardChangesPrompt),
                actions: [
                  TextButton(
                    child: Text(Strings.actionNo.toUpperCase()),
                    onPressed: () {
                      Navigator.of(context).pop(false);
                    },
                  ),
                  TextButton(
                    child: Text(Strings.actionYes.toUpperCase()),
                    onPressed: () {
                      Navigator.of(context).pop(true);
                    },
                  ),
                ],
              );
            },
          ) ??
          false;
      _bloc.add(ConfirmationSubmitted(isConfirmed: result));
    }
  }

  void _onSubjectChanged() {
    _bloc.add(SubjectChanged(subject: _subjectController.text));
  }

  void _onMessageChanged() {
    _bloc.add(MessageChanged(message: _messageController.text));
  }

  void _onSubmitPressed() {
    FocusScope.of(context).unfocus();
    _bloc.add(FormSubmitted());
  }

  void _onCancelPressed() {
    FocusScope.of(context).unfocus();
    // _bloc.add(FormCanceled());
  }
}
