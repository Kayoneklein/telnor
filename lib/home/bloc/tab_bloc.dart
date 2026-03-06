import 'package:bloc/bloc.dart';
import 'package:telnor/home/bloc/tab_event.dart';
import 'package:telnor/home/bloc/tab_state.dart';

class TabBloc extends Bloc<TabEvent, AppTab> {
  TabBloc() : super(AppTab.passwords) {
    on<TabEvent>((event, emit) {
      if (event is UpdateTab) {
        emit(event.tab);
      }
    });
  }
}
