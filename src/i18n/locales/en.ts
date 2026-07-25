export const en = {
  // Language / locale
  'locale.tag': 'en-US',
  'language.en': 'English',
  'language.es': 'Español',

  // Shared
  'common.cancel': 'Cancel',
  'common.confirm': 'Confirm',
  'common.save': 'Save',
  'common.clear': 'Clear',
  'common.close': 'Close',
  'common.delete': 'Delete',
  'common.done': 'Done',
  'common.ok': 'OK',
  'common.gotIt': 'Got it',
  'common.back': 'Back',
  'common.backToDashboard': 'Back to Dashboard',
  'common.copied': 'Copied!',
  'common.failedToCopy': 'Failed to copy',
  'common.current': '(current)',
  'common.unknownError': 'Unknown error',

  // Header
  'header.switchAccount': 'Switch account',
  'header.addAccount': 'Add account',
  'header.myAccount': 'My account',
  'header.settings': 'Settings',
  'header.whatsNew': "What's new?",
  'header.about': 'About',
  'header.logout': 'Log out',
  'header.logoutConfirmTitle': 'Confirm logout',
  'header.logoutConfirmMessage': 'Are you sure you want to log out?',
  'header.nicknameTitle': 'Edit account nickname',
  'header.nicknameSubtitle': 'Set a custom nickname for {username}',
  'header.nicknamePlaceholder': 'Enter nickname (optional)',
  'header.support': 'Support the project',
  'header.openInWindow': 'Open in a new window',
  'header.menu': 'Menu',

  // Login
  'login.message': 'Login to manage your {duck} addresses',
  'login.placeholder': 'Enter duck username',
  'login.sending': 'Sending...',
  'login.continue': 'Continue',
  'login.alreadyLoggedIn': 'This account is already logged in',
  'login.noAccount': "Don't have one?",
  'login.createNow': 'Create now',
  'login.signupTitle': 'Create a duck address',
  'login.signupMessage':
    "You'll be redirected to DuckDuckGo to create your @duck.com address. Once you complete the signup, you'll be automatically logged in.",
  'login.signupConfirm': 'Continue to DuckDuckGo',

  // Auto-login (from signup)
  'autoLogin.successTitle': 'Logged in successfully',
  'autoLogin.successMessage': 'Automatically logged in as {username}@duck.com',
  'autoLogin.failedTitle': 'Auto-login failed',
  'autoLogin.dashboardFailed': 'Failed to load dashboard data. Please log in manually.',
  'autoLogin.invalidResponse': 'Invalid response from server. Please log in manually.',
  'autoLogin.noUsername': 'Could not determine username. Please log in manually.',
  'autoLogin.generic': 'Auto-login failed. Please log in manually.',
  'autoLogin.alreadyLoggedIn': 'Already logged in.',
  'autoLogin.invalidToken': 'Invalid token',
  'autoLogin.invalidUsername': 'Invalid username',
  'autoLogin.invalidCredentials': 'Invalid credentials',

  // OTP
  'otp.backToLogin': 'Back to login',
  'otp.loggedInAs': 'Logged in as {username}@duck.com',
  'otp.message': 'One-time passphrase sent to your email',
  'otp.placeholder': 'e.g. morality landless proved paprika',
  'otp.verifying': 'Verifying...',
  'otp.verify': 'Verify OTP',
  'otp.resend': 'Resend passphrase',
  'otp.resendSuccess': 'A new passphrase has been sent to your email.',
  'otp.resendFailed': 'Failed to resend passphrase.',
  'otp.switchFailed': 'Failed to switch to new account',
  'otp.userDataFailed': 'Failed to get user data',
  'otp.verifyFailed': 'Failed to verify OTP',
  'otp.genericError': 'An error occurred. Please try again.',
  'otp.troubleToggle': 'Having trouble logging in?',
  'otp.hint':
    "Didn't receive it? Check your spam or junk folder. Some email providers (like ProtonMail) may delay or filter messages from DuckDuckGo.",

  // Dashboard
  'dashboard.tabGenerate': 'Generate',
  'dashboard.tabSend': 'Send',
  'dashboard.generating': 'Generating...',
  'dashboard.generate': 'Generate new address',
  'dashboard.loadFailed': 'Failed to load data',
  'dashboard.generateFailed': 'Failed to generate address',
  'dashboard.hideInstructions': 'Hide',
  'dashboard.howToUse': 'How to use',
  'dashboard.step1': "Enter recipient's email & click <b>Convert</b>",
  'dashboard.step2': 'Paste the result as <b>To</b> in your email client',
  'dashboard.step3': 'Send from the email linked to your DDG account',
  'dashboard.learnMore': 'Learn more',
  'dashboard.from': 'From:',
  'dashboard.recipientPlaceholder': 'someone@email.com',
  'dashboard.convert': 'Convert',
  'dashboard.sendFrom': 'Send from',
  'dashboard.closePicker': 'Close picker',
  'dashboard.searchAddresses': 'Search addresses...',
  'dashboard.personalAddress': 'Personal address',

  // Generated address list
  'list.generated.title': 'Generated addresses',
  'list.generated.itemsLabel': 'addresses',
  'list.generated.emptyTitle': 'No addresses yet',
  'list.generated.emptySubtitle': 'Click the button above to generate your first address',
  'list.generated.searchPlaceholder': 'Search addresses or notes...',
  'list.generated.deleteTitle': 'Delete address',
  'list.generated.deleteMessage': 'Are you sure you want to delete this address\n({key}@duck.com)?',
  'list.generated.clearTitle': 'Clear all addresses',
  'list.generated.clearMessage':
    'Are you sure you want to clear all addresses?\n\nThis action cannot be undone.',

  // Reverse alias list
  'list.send.title': 'History',
  'list.send.itemsLabel': 'aliases',
  'list.send.emptyTitle': 'No history yet',
  'list.send.emptySubtitle': 'Convert a recipient email above to get started',
  'list.send.searchPlaceholder': 'Search emails or notes...',
  'list.send.deleteTitle': 'Delete reverse alias',
  'list.send.deleteMessage': 'Are you sure you want to delete the reverse alias for\n{key}?',
  'list.send.clearTitle': 'Clear all history',
  'list.send.clearMessage':
    'Are you sure you want to clear all reverse alias history?\n\nThis action cannot be undone.',

  // List UI (shared by both lists)
  'list.copyItem': 'Copy {value}',
  'list.copyReverseAlias': 'Copy reverse alias for {value}',
  'list.removeTag': 'Remove tag {tag}',
  'list.addTagPlaceholder': 'Add tag...',
  'list.addTag': 'Add tag',
  'list.closeTagInput': 'Close tag input',
  'list.notesPlaceholder': 'Add notes...',
  'list.editNotes': 'Edit notes',
  'list.saveNotes': 'Save notes',
  'list.cancelEditing': 'Cancel editing',
  'list.editTags': 'Edit tags',
  'list.untagged': 'Untagged',
  'list.sortNewest': 'Newest',
  'list.sortOldest': 'Oldest',
  'list.sortBy': 'Sort by {order}',
  'list.noResultsTitle': 'No results found',
  'list.noResultsSubtitle': 'Try adjusting your search or filter',
  'list.clearAllItems': 'Clear all {items}',
  'list.showItems': 'Show {items}',
  'list.hideItems': 'Hide {items}',
  'list.searchItems': 'Search {items}',
  'list.clearSearch': 'Clear search',
  'list.groupByTag': 'Group by tag',
  'list.group': 'Group',
  'list.filterAll': 'All',
  'list.showingCount': 'Showing {shown} of {total} {items}',
  'list.clearAll': 'Clear all',

  // User info card
  'userInfo.title': 'My account',
  'userInfo.show': 'Show user information',
  'userInfo.hide': 'Hide user information',
  'userInfo.username': 'Duck username',
  'userInfo.email': 'Forwarding email',
  'userInfo.totalGenerated': 'Total generated',
  'userInfo.invites': 'Invites',

  // My account page
  'myAccount.manage': 'Manage your duck account',
  'myAccount.removing': 'Removing...',
  'myAccount.remove': 'Remove account local data',
  'myAccount.removeTitle': 'Remove account local data',
  'myAccount.removeMessage':
    "You're about to remove {account} along with its {data} from this device and from sync. Your DuckDuckGo account itself is not affected. This cannot be undone.",
  'myAccount.thisAccount': 'this account',
  'myAccount.savedAddresses': '{count} saved addresses',
  'myAccount.savedAddresses_one': '{count} saved address',
  'myAccount.savedAddresses_other': '{count} saved addresses',
  'myAccount.reverseAliases': '{count} reverse aliases',
  'myAccount.reverseAliases_one': '{count} reverse alias',
  'myAccount.reverseAliases_other': '{count} reverse aliases',
  'myAccount.addressesAndAliases': '{addresses} and {aliases}',
  'myAccount.removeFailed': 'Failed to remove account',
  'myAccount.noAccountSelected': 'No account is currently selected',

  // About page
  'about.support': 'Support the project',
  'about.github': 'GitHub repository',
  'about.firefoxStore': 'Firefox add-ons',
  'about.chromeStore': 'Chrome web store',

  // Changelog page
  'changelog.loading': 'Loading changelog...',
  'changelog.error': 'Could not load changelog. Please try again later.',
  'changelog.loadFailed': 'Failed to load changelog',
  'changelog.heading': "What's new?",

  // Settings — appearance
  'settings.appearance': 'Appearance',
  'settings.theme': 'Theme',
  'settings.themeLight': 'Light',
  'settings.themeDark': 'Dark',
  'settings.themeSystem': 'System',
  'settings.language': 'Language',
  'settings.timeFormat24h': '24-hour time',

  // Settings — permissions
  'settings.permissions': 'Permissions & features',

  // Settings — sync
  'settings.sync': 'Sync',
  'settings.syncOptions': 'Sync options',
  'settings.syncAddresses': 'Addresses',
  'settings.syncReverseAliases': 'Reverse Aliases',
  'settings.syncSessionData': 'Session Data',
  'settings.syncSessionHint': '(login data & settings)',
  'settings.syncTokenWarningFirefox':
    'Session data includes your access tokens. They are encrypted by Firefox during sync but stored in your Mozilla account.',
  'settings.syncTokenWarningChrome':
    'Session data includes your access tokens. They are encrypted by Chrome during sync but stored in your Google account.',
  'settings.syncStatus': 'Status:',
  'settings.syncLastSynced': 'Last synced {date}',
  'settings.syncNever': 'Never synced',
  'settings.syncRefresh': 'Refresh',
  'settings.syncStorageUsed': 'Storage used:',
  'settings.syncAutoDisabled': 'Sync was automatically disabled because storage quota was exceeded.',
  'settings.allAccounts': 'All accounts',
  'settings.selectAccounts': 'Select accounts...',
  'settings.accountsSelected': '{count} accounts selected',

  // Settings — backup & restore
  'settings.backup': 'Backup & restore',
  'settings.exporting': 'Exporting...',
  'settings.exportBackup': 'Export backup',
  'settings.importing': 'Importing...',
  'settings.importBackup': 'Import backup',
  'settings.importHint':
    'Import accepts a Qwacky backup (.json), or a plain .txt list of existing duck.com addresses — one per line.',
  'settings.exportOptions': 'Export options',
  'settings.includeSession': 'Include session',
  'settings.exportFailed': 'Failed to export backup',
  'settings.importFailedInvalidFile': 'Import failed, invalid file',
  'settings.importFailed': 'Import failed',
  'settings.importFailedWithReason': 'Import failed: {reason}',
  'settings.unrecognizedFormat': 'Unrecognized file format',

  // Settings — import result summaries
  'settings.importDuplicates': '{count} duplicates skipped',
  'settings.importDuplicates_one': '{count} duplicate skipped',
  'settings.importDuplicates_other': '{count} duplicates skipped',
  'settings.importInvalid': '{count} ignored (not a duck.com address)',
  'settings.importNothingNew': 'No new addresses to import.',
  'settings.importedCount': 'Imported {count} addresses',
  'settings.importedCount_one': 'Imported {count} address',
  'settings.importedCount_other': 'Imported {count} addresses',
  'settings.importedCountWithNotes': '{imported} — {notes}',

  // Settings — backup summary dialog
  'settings.summaryAccounts': 'Accounts: {accounts}',
  'settings.summaryAddresses': 'Addresses: {count}',
  'settings.summaryReverseAliases': 'Reverse aliases: {count}',
  'settings.summarySessionIncluded': 'Session data: included',
  'settings.summarySessionRestored': 'Session data: restored',
  'settings.summaryNewAccounts': 'New accounts added: {count}',
  'settings.summaryAddressCount': '{count} addresses',
  'settings.summaryAliasCount': '{count} reverse aliases',
  'settings.summaryAccountLine': '{account}@duck.com: +{parts}',
  'settings.summarySkipped': 'Skipped (already exist): {parts}',
  'settings.summaryUpToDate': 'Everything was already up to date.',
  'settings.exportComplete': 'Export complete',
  'settings.importComplete': 'Import complete',

  // Settings — dialogs
  'settings.popoutTitle': 'Open in new window',
  'settings.popoutMessage':
    "Firefox doesn't allow file selection from the popup. The extension will open in a new window where you can import your backup normally.",
  'settings.popoutConfirm': 'Open window',
  'settings.exportWarningTitle': 'Security warning',
  'settings.exportWarningMessage':
    'The exported file will contain your access token and login credentials. Keep this file secure and do not share it. Anyone with this file can access your DuckDuckGo Email account.',
  'settings.exportWarningConfirm': 'Export anyway',
  'settings.importConfirmTitle': 'Import backup',
  'settings.importConfirmMessage':
    'This backup contains session data. Importing it will add the accounts and their data to your extension. Are you sure?',
  'settings.importConfirmButton': 'Import',

  // Sync session restore prompt
  'sync.foundTitle': 'Synced accounts found',
  'sync.foundMessage':
    'Found {count} synced accounts: {accounts}. Would you like to restore them?',
  'sync.foundMessage_one':
    'Found {count} synced account: {accounts}. Would you like to restore them?',
  'sync.foundMessage_other':
    'Found {count} synced accounts: {accounts}. Would you like to restore them?',
  'sync.restore': 'Restore',
  'sync.dataTooLarge': 'Data too large ({size}KB). Maximum is 8KB per account.',
  'sync.addressCount': '{count} addresses',
  'sync.aliasCount': '{count} reverse aliases',
  'sync.sessionData': 'session data',
  'sync.syncedParts': 'Successfully synced {parts}',
  'sync.migrationFailed': 'Migration failed',
  'sync.pullFailed': 'Failed to pull from sync',
  'sync.noSyncedData': 'No synced data found',
  'sync.quotaExceededDisabled': 'Sync quota exceeded. Sync has been disabled.',
  'sync.disabled': 'Sync disabled',
  'sync.notEnabled': 'Sync is not enabled',
  'sync.noUser': 'No user logged in',
  'sync.nothingToMigrate': 'No data to migrate',
  'sync.quotaExceeded': 'Storage quota exceeded. Try reducing the amount of synced data.',

  // Permissions
  'permission.storage.name': 'Storage',
  'permission.storage.description':
    '`storage`\nRequired for the extension to function properly, to store and retrieve data locally',
  'permission.contextMenu.name': 'Context menu',
  'permission.contextMenu.description':
    "`contextMenus`\nFirefox requires this permission to be listed in the manifest's permissions block at install time, [Read More](https://github.com/Lanshuns/Qwacky?tab=readme-ov-file#browser-specific-permission-handling-and-limitations)",
  'permission.autofill.name': 'Autofill',
  'permission.autofill.descriptionFirefox':
    '`activeTab`, `clipboardWrite` and `scripting`\nEnables the Qwacky options in the context menu, to generate a duck address or convert a recipient into a send address',
  'permission.autofill.descriptionChrome':
    '`contextMenus`, `activeTab`, `clipboardWrite` and `scripting`\nEnables the Qwacky options in the context menu, to generate a duck address or convert a recipient into a send address',

  // Permission toggle
  'permissionToggle.denied': 'Permission request was denied',
  'permissionToggle.reloading': 'Reloading to apply changes...',
  'permissionToggle.enableFailed': 'Failed to enable feature',
  'permissionToggle.disabling': 'Disabling {name}...',
  'permissionToggle.disableFailed': 'Failed to disable feature',
  'permissionToggle.error': 'An error occurred',
  'permissionToggle.noticeTitle': 'Permissions notice',
  'permissionToggle.tooltip':
    'Browser additional permissions request will only appear once if not already granted.',
  'permissionToggle.readMore': 'Read More',
  'permissionToggle.firefox1': 'To enable this feature:',
  'permissionToggle.firefox2': "1. Firefox will show a permissions request - click 'Allow'",
  'permissionToggle.firefox3': '2. Return to the extension and toggle the feature again',
  'permissionToggle.firefox4': 'You can disable this feature anytime later.',
  'permissionToggle.chrome1': 'Chrome handles permissions differently than Firefox.',
  'permissionToggle.chrome2':
    "To enable this feature, Chrome will show a permission request once. After clicking 'Done', a permissions dialog may appear.",
  'permissionToggle.chrome3':
    "If you see a permissions dialog, click 'Allow' then return to the extension and toggle the feature again.",
  'permissionToggle.chrome4': 'For more details, see:',
  'permissionToggle.chromeLink': 'Browser-Specific Permission Handling and Limitations',

  // Error boundary
  'errorBoundary.title': 'Something went wrong',
  'errorBoundary.message': 'The extension encountered an unexpected error.',
  'errorBoundary.reload': 'Reload Extension',

  // Context menu (background)
  'contextMenu.parent': 'Qwacky',
  'contextMenu.generate': 'Autofill duck address',
  'contextMenu.convert': 'Convert to send address',

  // Content script notifications
  'notify.loginFirst': 'You need to login first',
  'notify.selectRecipient': 'Select a recipient email to convert',
  'notify.generateFailed': 'Failed to generate address. Login required?',
  'notify.fillFailedCopied': 'Could not fill input, address copied to clipboard',
  'notify.fillFailedNotCopied':
    'Could not fill input or copy to clipboard. Please check permissions in settings.',
  'notify.filledAndCopied': 'Address filled and copied to clipboard',
  'notify.filledNotCopied':
    'Address filled but could not copy to clipboard. Please check permissions in settings.',
  'notify.replaceFailedCopied': 'Could not replace selection, address copied to clipboard',
  'notify.replaceFailedNotCopied':
    'Could not replace selection or copy to clipboard. Please check permissions in settings.',
  'notify.convertedAndCopied': 'Converted and copied to clipboard',
  'notify.convertedNotCopied':
    'Converted, but could not copy to clipboard. Please check permissions in settings.',

  // Service errors
  'error.usernameRequired': 'Username is required',
  'error.otpRequired': 'OTP is required',
  'error.notAuthenticated': 'You need to login first',
  'error.invalidUserData': 'Invalid user data. Please log in again.',
  'error.noAddressReturned': 'No address returned from the server',
  'error.otpSent': 'OTP sent to your email!',
  'error.tooManyRequests': 'Too many requests. Please wait a moment before trying again.',
  'error.otpSendFailed': 'Failed to send OTP. Please try again later.',
  'error.network': 'Network error. Please check your internet connection.',
  'error.loginFailed': 'Login failed. Please try again.',
  'error.invalidServerResponse': 'Invalid response from server.',
  'error.dashboardFailed': 'Failed to load dashboard data.',
  'error.loginSuccessful': 'Login successful!',
  'error.invalidPassphrase':
    'Invalid passphrase. Please check the passphrase in your email and try again.',
  'error.generateFailed': 'Failed to generate address',
  'error.invalidResponseFormat': 'Invalid response format',
  'error.unexpectedLogin': 'An unexpected error occurred during login',
  'error.unexpectedVerify': 'An unexpected error occurred during verification',
  'error.unknownGenerate': 'Unknown error generating address',
  'error.unknownDeleteAccount': 'Unknown error deleting account',
  'error.unknownLogout': 'Unknown error during logout',
  'error.unknownImportAddresses': 'Unknown error importing addresses',
  'error.unknownImportBackup': 'Unknown error importing backup',
  'error.exportBackupFailed': 'Failed to export backup',
  'error.importDataEmpty': 'Import data is empty or invalid',
  'error.importMissingAddresses': 'Invalid format: missing addresses array',
  'error.importInvalidJson': 'Invalid JSON format',
  'error.importNoAddresses': 'No addresses found in file',
  'error.importNoValidAddresses': 'No valid duck.com addresses found.',
  'error.importAllExist': 'No new addresses to import. All addresses already exist.',
  'error.importStorage': 'Storage error: {reason}',
  'error.importSaveFailed': 'Failed to save imported addresses',
  'error.deleteAccountFailed': 'Failed to delete account',
  'error.userDataNotFoundLogin': 'User data not found. Please log in again.',
  'error.userDataNotFoundLoginFirst': 'User data not found. Please log in first.',
  'error.invalidBackupFormat': 'Invalid backup file format',
  'error.notQwackyBackup': 'Not a valid Qwacky backup file',
  'error.accountNotInSession': 'Current account not found in session data',
} as const

export type TranslationKey = keyof typeof en
export type Translations = Record<TranslationKey, string>
