import 'package:telnor/model/manual.dart';

class RemoteConfiguration {
  RemoteConfiguration({
    required this.productName,
    required this.apiToken,
    required this.dataSizeLimit,
    required this.avatarSizeLimit,
    required this.disableCreateConfirmationEmail,
    required this.disableExport,
    required this.enableEmergencyMail,
    required this.emergencyMailDays,
    required this.enableExtensionLog,
    required this.extensionLogAll,
    required this.allowExtension2Fanegation,
    required this.twoFAClientCheck,
    required this.twoFAClientCheckDays,
    required this.disableFiles,
    required this.disableFooter,
    required this.disableForum,
    required this.disableGeolocations,
    required this.disableInfoPage,
    required this.disableManual,
    required this.disableMessages,
    required this.disablePasswords,
    required this.disablePrivacyPage,
    required this.disableTeamAdmins,
    required this.disableTeamCreate,
    required this.disableEmailShare,
    required this.disableTeamShare,
    required this.disableUserShare,
    required this.disableUserShareEmail,
    required this.disableTeamShareEmail,
    required this.disableTeams,
    required this.disableUserCreate,
    required this.disableConfigServer,
    required this.disableUserDefaultTeams,
    required this.disableUserDelete,
    required this.disableUserSetInfo,
    required this.disableWelcomeMail,
    required this.enableLiveChat,
    required this.enableUpgrade,
    required this.forceHttps,
    required this.force2fa,
    required this.globalPremium,
    required this.loginNeedConfirmation,
    required this.loginSecondStepDelete,
    required this.merchantNumber,
    required this.serviceDeskInfo,
    required this.userEmailInReply,
    required this.version,
    required this.iconRefresh,
    required this.iconSize,
    required this.iconMaxSize,
    required this.haveIBeenPwnedApiKey,
    required this.honeyPotApiKey,
    required this.honeyPotThreatLevel,
    required this.ldapIntegration,
    required this.ldapProtocol,
    required this.ldapHost,
    required this.ldapUser,
    required this.ldapPass,
    required this.ldapTree,
    required this.ldapFilter,
    required this.ldapValueToVerify,
    required this.ldapGroup,
    required this.ldapUserIsEmail,
    required this.ldapStaticDomain,
    required this.ldapLoginCompleteEmail,
    required this.ldapCreateLoginRequired,
    required this.ldapNameSync,
    required this.ldapDepartmentSync,
    required this.ldapAvatarSync,
    required this.manualUrl,
    required this.manualAppUrl,
    required this.manualMailUrl,
  });

  final String productName;
  final String apiToken;
  final int dataSizeLimit;
  final int avatarSizeLimit;
  final bool disableCreateConfirmationEmail;
  final bool disableExport;
  final bool enableEmergencyMail;
  final int emergencyMailDays;
  final bool enableExtensionLog;
  final bool extensionLogAll;
  final bool allowExtension2Fanegation;
  final bool twoFAClientCheck;
  final int twoFAClientCheckDays;
  final bool disableFiles;
  final bool disableFooter;
  final bool disableForum;
  final bool disableGeolocations;
  final bool disableInfoPage;
  final bool disableManual;
  final bool disableMessages;
  final bool disablePasswords;
  final bool disablePrivacyPage;
  final bool disableTeamAdmins;
  final bool disableTeamCreate;
  final bool disableEmailShare;
  final bool disableTeamShare;
  final bool disableUserShare;
  final bool disableUserShareEmail;
  final bool disableTeamShareEmail;
  final bool disableTeams;
  final bool disableUserCreate;
  final bool disableConfigServer;
  final bool disableUserDefaultTeams;
  final bool disableUserDelete;
  final bool disableUserSetInfo;
  final bool disableWelcomeMail;
  final String enableLiveChat;
  final bool enableUpgrade;
  final bool forceHttps;
  final bool force2fa;
  final bool globalPremium;
  final bool loginNeedConfirmation;
  final bool loginSecondStepDelete;
  final dynamic merchantNumber;
  final String serviceDeskInfo;
  final bool userEmailInReply;
  final String version;
  final int iconRefresh;
  final int iconSize;
  final int iconMaxSize;
  final String haveIBeenPwnedApiKey;
  final String honeyPotApiKey;
  final int honeyPotThreatLevel;
  final bool ldapIntegration;
  final String ldapProtocol;
  final String ldapHost;
  final String ldapUser;
  final String ldapPass;
  final String ldapTree;
  final String ldapFilter;
  final String ldapValueToVerify;
  final String ldapGroup;
  final bool ldapUserIsEmail;
  final String ldapStaticDomain;
  final String ldapLoginCompleteEmail;
  final bool ldapCreateLoginRequired;
  final bool ldapNameSync;
  final bool ldapDepartmentSync;
  final bool ldapAvatarSync;
  final ManualList? manualUrl;
  final ManualList? manualAppUrl;
  final ManualList? manualMailUrl;

  static final initial = RemoteConfiguration.fromJson(<String, dynamic>{});

  static RemoteConfiguration fromJson(Map<String, dynamic> data) {
    return RemoteConfiguration(
      productName: data['productname'] ?? '',
      apiToken: _parseSpecialString(data['apitoken']) ?? '',
      dataSizeLimit: data['datasizelimit'] ?? 0,
      avatarSizeLimit: data['avatarsizelimit'] ?? 0,
      disableCreateConfirmationEmail:
          data['disablecreateconfirmationemail'] ?? true,
      disableExport: data['disableexport'] ?? false,
      enableEmergencyMail: data['enableemergencymail'] ?? false,
      emergencyMailDays: data['emergencymaildays'] ?? 10,
      enableExtensionLog: data['enableextensionlog'] ?? false,
      extensionLogAll: data['extensionlogall'] ?? false,
      allowExtension2Fanegation: data['allowextension2fanegation'] ?? false,
      twoFAClientCheck: data['2faclientcheck'] ?? false,
      twoFAClientCheckDays: _parseSpecialInt(data['2faclientcheckdays']) ?? -1,
      disableFiles: data['disablefiles'] ?? false,
      disableFooter: data['disablefooter'] ?? false,
      disableForum: data['disableforum'] ?? false,
      disableGeolocations: data['disablegeolocations'] ?? false,
      disableInfoPage: data['disableinfopage'] ?? false,
      disableManual: data['disablemanual'] ?? false,
      disableMessages: data['disablemessages'] ?? false,
      disablePasswords: data['disablepasswords'] ?? false,
      disablePrivacyPage: data['disableprivacypage'] ?? false,
      disableTeamAdmins: data['disableteamadmins'] ?? false,
      disableTeamCreate: data['disableteamcreate'] ?? false,
      disableEmailShare: data['disableemailshare'] ?? false,
      disableTeamShare: data['disableteamshare'] ?? false,
      disableUserShare: data['disableusershare'] ?? false,
      disableUserShareEmail: data['disableusershareemail'] ?? false,
      disableTeamShareEmail: data['disableteamshareemail'] ?? false,
      disableTeams: data['disableteams'] ?? false,
      disableUserCreate: data['disableusercreate'] ?? false,
      disableConfigServer: data['disableconfigserver'] ?? false,
      disableUserDefaultTeams: data['disableuserdefaultteams'] ?? false,
      disableUserDelete: data['disableuserdelete'] ?? false,
      disableUserSetInfo: data['disableusersetinfo'] ?? false,
      disableWelcomeMail: data['disablewelcomemail'] ?? false,
      enableLiveChat: _parseSpecialString(data['enablelivechat']) ?? '',
      enableUpgrade: data['enableupgrade'] ?? false,
      forceHttps: data['forcehttps'] ?? false,
      force2fa: data['force2fa'] ?? false,
      globalPremium: data['globalpremium'] ?? false,
      loginNeedConfirmation: data['loginneedconfirmation'] ?? false,
      loginSecondStepDelete: data['loginsecondstepdelete'] ?? false,
      merchantNumber: _parseSpecialInt(data['merchantnumber']),
      serviceDeskInfo: _parseSpecialString(data['servicedeskinfo']) ?? '',
      userEmailInReply: data['useremailinreply'] ?? false,
      version: data['version'] ?? '',
      iconRefresh: data['iconrefresh'] ?? 30,
      iconSize: data['iconsize'] ?? 48,
      iconMaxSize: data['iconmaxsize'] ?? 200,
      haveIBeenPwnedApiKey:
          _parseSpecialString(data['haveibeenpwnedapikey']) ?? '',
      honeyPotApiKey: _parseSpecialString(data['honeypotapikey']) ?? '',
      honeyPotThreatLevel: data['honeypotthreatlevel'] ?? 50,
      ldapIntegration: data['ldapintegration'] ?? false,
      ldapProtocol: _parseSpecialString(data['LDAP_protocol']) ?? '',
      ldapHost: data['LDAP_host'] ?? '',
      ldapUser: data['LDAP_user'] ?? '',
      ldapPass: data['LDAP_pass'] ?? '',
      ldapTree: data['LDAP_tree'] ?? '',
      ldapFilter: data['LDAP_filter'] ?? '',
      ldapValueToVerify: data['LDAP_valuetoverify'] ?? '',
      ldapGroup: _parseSpecialString(data['LDAP_group']) ?? '',
      ldapUserIsEmail: data['LDAP_userisemail'] ?? false,
      ldapStaticDomain: data['LDAP_staticdomain'] ?? '',
      ldapLoginCompleteEmail:
          _parseSpecialString(data['LDAP_logincompleteemail']) ?? '',
      ldapCreateLoginRequired: data['LDAP_createloginrequired'] ?? false,
      ldapNameSync: data['LDAP_namesync'] ?? false,
      ldapDepartmentSync: data['LDAP_departmentsync'] ?? false,
      ldapAvatarSync: data['LDAP_avatarsync'] ?? false,
      manualUrl: data['manualurl'] != null
          ? ManualList.fromJson(data['manualurl'])
          : null,
      manualAppUrl: data['manualappurl'] != null
          ? ManualList.fromJson(data['manualappurl'])
          : null,
      manualMailUrl: data['manualmailurl'] != null
          ? ManualList.fromJson(data['manualmailurl'])
          : null,
    );
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
    'productname': productName,
    'apitoken': _formatSpecialString(apiToken),
    'datasizelimit': dataSizeLimit,
    'avatarsizelimit': avatarSizeLimit,
    'disablecreateconfirmationemail': disableCreateConfirmationEmail,
    'disableexport': disableExport,
    'enableemergencymail': enableEmergencyMail,
    'emergencymaildays': emergencyMailDays,
    'enableextensionlog': enableExtensionLog,
    'extensionlogall': extensionLogAll,
    'allowextension2fanegation': allowExtension2Fanegation,
    '2faclientcheck': twoFAClientCheck,
    '2faclientcheckdays': _formatSpecialInt(twoFAClientCheckDays),
    'disablefiles': disableFiles,
    'disablefooter': disableFooter,
    'disableforum': disableForum,
    'disablegeolocations': disableGeolocations,
    'disableinfopage': disableInfoPage,
    'disablemanual': disableManual,
    'disablemessages': disableMessages,
    'disablepasswords': disablePasswords,
    'disableprivacypage': disablePrivacyPage,
    'disableteamadmins': disableTeamAdmins,
    'disableteamcreate': disableTeamCreate,
    'disableemailshare': disableEmailShare,
    'disableteamshare': disableTeamShare,
    'disableusershare': disableUserShare,
    'disableusershareemail': disableUserShareEmail,
    'disableteamshareemail': disableTeamShareEmail,
    'disableteams': disableTeams,
    'disableusercreate': disableUserCreate,
    'disableconfigserver': disableConfigServer,
    'disableuserdefaultteams': disableUserDefaultTeams,
    'disableuserdelete': disableUserDelete,
    'disableusersetinfo': disableUserSetInfo,
    'disablewelcomemail': disableWelcomeMail,
    'enablelivechat': _formatSpecialString(enableLiveChat),
    'enableupgrade': enableUpgrade,
    'forcehttps': forceHttps,
    'force2fa': force2fa,
    'globalpremium': globalPremium,
    'loginneedconfirmation': loginNeedConfirmation,
    'loginsecondstepdelete': loginSecondStepDelete,
    'merchantnumber': _formatSpecialInt(merchantNumber),
    'servicedeskinfo': _formatSpecialString(serviceDeskInfo),
    'useremailinreply': userEmailInReply,
    'version': version,
    'iconrefresh': iconRefresh,
    'iconsize': iconSize,
    'iconmaxsize': iconMaxSize,
    'haveibeenpwnedapikey': _formatSpecialString(haveIBeenPwnedApiKey),
    'honeypotapikey': _formatSpecialString(honeyPotApiKey),
    'honeypotthreatlevel': honeyPotThreatLevel,
    'ldapintegration': ldapIntegration,
    'LDAP_protocol': _formatSpecialString(ldapProtocol),
    'LDAP_host': ldapHost,
    'LDAP_user': ldapUser,
    'LDAP_pass': ldapPass,
    'LDAP_tree': ldapTree,
    'LDAP_filter': ldapFilter,
    'LDAP_valuetoverify': ldapValueToVerify,
    'LDAP_group': _formatSpecialString(ldapGroup),
    'LDAP_userisemail': ldapUserIsEmail,
    'LDAP_staticdomain': ldapStaticDomain,
    'LDAP_logincompleteemail': _formatSpecialString(ldapLoginCompleteEmail),
    'LDAP_createloginrequired': ldapCreateLoginRequired,
    'LDAP_namesync': ldapNameSync,
    'LDAP_departmentsync': ldapDepartmentSync,
    'LDAP_avatarsync': ldapAvatarSync,
    'manualurl': manualUrl?.toJson(),
    'manualappurl': manualAppUrl?.toJson(),
    'manualmailurl': manualMailUrl?.toJson(),
  };

  static String? _parseSpecialString(dynamic value) => value == null
      ? null
      : value == false
      ? ''
      : value.toString();

  static dynamic _formatSpecialString(String? string) => string == null
      ? null
      : string.isEmpty
      ? false
      : string;

  static dynamic _parseSpecialInt(dynamic value) => value == null
      ? null
      : value == false
      ? -1
      : value;

  static dynamic _formatSpecialInt(dynamic value) => value == null
      ? null
      : value == -1
      ? false
      : value;
}
