part of '../index.dart';

abstract class DeleteAccountEvent extends Equatable {
  const DeleteAccountEvent();

  @override
  List<Object?> get props => [];
}

class RequestDeleteAccount extends DeleteAccountEvent {
  const RequestDeleteAccount({required this.password});

  final String password;

  @override
  List<Object?> get props => [password];
}

class DeleteAccountEmailLinkSent extends DeleteAccountEvent {}
