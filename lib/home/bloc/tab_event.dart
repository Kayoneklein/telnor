import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';
import 'package:telnor/home/bloc/tab_state.dart';

@immutable
abstract class TabEvent extends Equatable {
  const TabEvent();
}

class UpdateTab extends TabEvent {
  const UpdateTab(this.tab);

  final AppTab tab;

  @override
  List<Object> get props => [tab];
}
