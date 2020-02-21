import ConversationController from '../../js/conversation_controller';

/*
The reason we have window variables declared here and not global.d.ts is because we can't import custom types in global.d.ts.
Doing so will cause it to become a local module and fail to transpile.
*/

declare global {
  interface Window {
    CONSTANTS: any;
    versionInfo: any;

    Events: any;
    Lodash: any;
    deleteAllData: any;
    clearLocalData: any;
    getAccountManager: any;
    getConversations: any;
    getFriendsFromContacts: any;
    mnemonic: any;
    clipboard: any;
    attemptConnection: any;

    passwordUtil: any;
    userConfig: any;
    shortenPubkey: any;

    dcodeIO: {
      ByteBuffer: typeof ByteBuffer;
    };
    libsignal: any;
    libloki: any;
    displayNameRegex: any;

    Signal: any;
    Whisper: any;
    ConversationController: ConversationController;

    // Following function needs to be written in background.js
    // getMemberList: any;

    onLogin: any;
    setPassword: any;
    textsecure: any;
    Session: any;
    log: any;
    i18n: any;
    friends: any;
    generateID: any;
    storage: any;
    pushToast: any;

    confirmationDialog: any;
    showQRDialog: any;
    showSeedDialog: any;
    showPasswordDialog: any;
    showEditProfileDialog: any;

    deleteAccount: any;

    toggleTheme: any;
    toggleMenuBar: any;
    toggleSpellCheck: any;
    toggleLinkPreview: any;
    toggleMediaPermissions: any;

    getSettingValue: any;
    setSettingValue: any;
    lokiFeatureFlags: any;

    resetDatabase: any;

    StringView: any;
    lokiFileServerAPI: any;
  }
}
