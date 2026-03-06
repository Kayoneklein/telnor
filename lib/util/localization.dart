import 'dart:convert';
import 'dart:math';
import 'dart:ui';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:telnor/model/language.dart';
import 'package:telnor/web/web.dart';

/// Shortcut method for quick localization
String l10n(String section, String key) =>
    Localization.get.localize(section, key);

/// Class used for localization
///
/// External classes may get [currentLanguage] or list of [allLanguages]
/// In order to localize the string, [localize] method should be called specifying needed [section] and [key]
/// Alternatively, shortcut (static) method [ln10] may be used
class Localization {
  Localization._() {
    initialization = _initialize();
  }

  static final Localization get = Localization._();

  late final Future<WebError?> initialization;

  Language get currentLanguage => _currentLanguage;

  List<Language> get allLanguages => List.from(_allLanguages);

  final WebProvider _web = WebProvider.get;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  final String _defaultString = '<MISSING STRING>';

  Language _currentLanguage = Language.undefined;
  List<Language> _allLanguages = [];
  _LocalizationData _localizations = _LocalizationData.empty;

  /// Initialize localization service
  Future<WebError?> _initialize() async {
    await _web.initialization;
    //Load list of available languages
    final result = await _loadRemoteLanguages();
    if (result.hasError) {
      await _configureLocalLanguage();
      _localizations = await _getLocalData();
      return result.error;
    } else if (result.data is! List<Language>) {
      _allLanguages = await _getLocalLanguages();
    } else {
      _allLanguages = result.data!;
      await _setLocalLanguages(_allLanguages);
    }
    //Define current language
    await _configureLocalLanguage();
    //Load (and update, if needed) localization
    final remoteVersion = await _loadRemoteVersion(_currentLanguage);
    final localVersion = await _getLocalVersion();
    if (localVersion < remoteVersion) {
      final data = await _loadRemoteData(_currentLanguage);
      if (data.isNotEmpty) {
        _localizations = data;
        await _setLocalData(data);
        await _setLocalVersion(remoteVersion);
      }
    } else {
      _localizations = await _getLocalData();
    }
    return null;
  }

  Future<void> _configureLocalLanguage() async {
    _currentLanguage = await _getLocalLanguage();
    if (_currentLanguage.isUndefined) {
      final String language = window.locale.languageCode;
      final int index = _allLanguages.indexWhere((l) => l.code == language);
      if (index > -1) {
        _currentLanguage = _allLanguages[index];
      } else {
        _currentLanguage = Language.def;
      }
      await _setLocalLanguage(_currentLanguage);
    }
  }

  /// Reset current language settings and re-initialize the service
  Future<WebError?> reiniFtialize() async {
    await _setLocalData(_LocalizationData.empty);
    await _setLocalLanguage(Language.undefined);
    await _setLocalLanguages([]);
    await _setLocalVersion(-1);
    final result = await _initialize();
    return result;
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Search for the string to localize
  String localize(String section, String key) {
    try {
      return _localizations.get(section, key)?.replaceAll(r'\n', '\n') ??
          _defaultString;
      //final String _tmp = _localizations.get(section, key)?.replaceAll(r'\n', '\n') ?? _defaultString;
      //remoteConfig.disableFiles ? const SizedBox() : _buildAttachmentSection(),
      //final remoteConfig = BlocProvider.of<ConfigurationBloc>(context).state.configuration;
      //return _tmp.replaceAll('[productname]', '') ?? _tmp;
    } catch (error) {
      return _defaultString;
    }
  }

  /// Attempt to change current language to specified [language]
  ///
  /// Implies loading language data from the server. Resolves to *true* in case of success.
  /// May return *false* in case of errors. In this case data is reverted back to original values.
  Future<bool> changeLanguage(Language language) async {
    final oldLanguage = _currentLanguage;
    final oldLocalizations = _localizations;
    final oldVersion = await _getLocalVersion();
    try {
      final version = await _loadRemoteVersion(language);
      if (version < 0) {
        throw 'error';
      }
      final data = await _loadRemoteData(language);
      if (data.isEmpty) {
        throw 'error';
      }
      await _setLocalData(data);
      await _setLocalVersion(version);
      await _setLocalLanguage(language);
      _localizations = data;
      _currentLanguage = language;
      return true;
    } catch (error) {
      _currentLanguage = oldLanguage;
      _localizations = oldLocalizations;
      _setLocalLanguage(oldLanguage);
      _setLocalData(oldLocalizations);
      _setLocalVersion(oldVersion);
      return false;
    }
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Get stored current language
  Future<Language> _getLocalLanguage() async {
    try {
      return Language.fromJson(
        jsonDecode(await _storage.read(key: 'l10n_current') ?? ''),
      );
    } catch (error) {
      return Language.undefined;
    }
  }

  /// Store current language
  Future<void> _setLocalLanguage(Language language) async {
    if (language != Language.undefined) {
      await _storage.write(
        key: 'l10n_current',
        value: jsonEncode(language.toJson()),
      );
    } else {
      await _storage.delete(key: 'l10n_current');
    }
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Load remote list of languages
  Future<WebResult> _loadRemoteLanguages() async {
    final result = await _web.getLocalizationLanguages();
    return result;
  }

  /// Get stored list of languages
  Future<List<Language>> _getLocalLanguages() async {
    try {
      return List<Language>.from(
        jsonDecode(
          await _storage.read(key: 'l10n_languages') ?? '',
        ).map((dynamic e) => Language.fromJson(e)),
      );
    } catch (error) {
      return [Language.def];
    }
  }

  /// Store list of languages
  Future<void> _setLocalLanguages(List<Language> languages) async {
    if (languages.isNotEmpty) {
      await _storage.write(key: 'l10n_languages', value: jsonEncode(languages));
    } else {
      await _storage.delete(key: 'l10n_languages');
    }
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Load remote localization data
  Future<_LocalizationData> _loadRemoteData(Language language) async {
    final result = await _web.getLocalizationData(language);
    if (result.hasError) {
      return _LocalizationData.empty;
    }
    return _LocalizationData.fromJson(result.data!);
  }

  /// Get stored localization data
  Future<_LocalizationData> _getLocalData() async {
    try {
      return _LocalizationData.fromJson(
        jsonDecode(await _storage.read(key: 'l10n_data') ?? ''),
      );
    } catch (error) {
      return _LocalizationData.empty;
    }
  }

  /// Store current localization data
  Future<void> _setLocalData(_LocalizationData data) async {
    if (data.isNotEmpty) {
      await _storage.write(key: 'l10n_data', value: jsonEncode(data.toJson()));
    } else {
      await _storage.delete(key: 'l10n_data');
    }
  }

  //--------------------------------------------------------------------------------------------------------------------

  /// Load remote version of localized strings from the server
  Future<int> _loadRemoteVersion(Language language) async {
    final result = await _web.getLocalizationVersion(language);
    if (result.hasError) {
      return -1;
    }
    return result.data!;
  }

  /// Get stored current version of localized strings
  Future<int> _getLocalVersion() async {
    try {
      return int.parse(await _storage.read(key: 'l10n_version') ?? '-1');
    } catch (error) {
      return -1;
    }
  }

  /// Store current version of localized strings
  Future<void> _setLocalVersion(int version) async {
    if (version > -1) {
      await _storage.write(key: 'l10n_version', value: version.toString());
    } else {
      await _storage.delete(key: 'l10n_version');
    }
  }
}

//======================================================================================================================

/// Class used to store data for localized strings
class _LocalizationData {
  const _LocalizationData._(this._data);

  static const _LocalizationData empty = _LocalizationData._({});

  //--------------------------------------------------------------------------------------------------------------------

  final Map<String, Map<String, String>> _data;

  bool get isEmpty => _data.isEmpty;

  bool get isNotEmpty => _data.isNotEmpty;

  /// Get localized value for specific [section] and [key]
  String? get(String section, String key) => _data[section]?[key];

  //--------------------------------------------------------------------------------------------------------------------

  static _LocalizationData fromJson(Map<String, dynamic> json) =>
      _LocalizationData._(
        json.map(
          (k, dynamic v) => MapEntry<String, Map<String, String>>(
            k,
            Map<String, String>.from(v),
          ),
        ),
      );

  Map<String, dynamic> toJson() => _data;
}
