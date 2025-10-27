# Changelog

## 1.2.1

### Added
- Cross-device sync (Experimental)
- Generate address using keyboard shortcut (Alt+Shift+Q)
- Sign up page
- Search & filter addresses and notes
- Account nickname customization

### Improved
- UI enhancements and redesigned settings page
- Performance optimizations with session storage caching (20x faster reads)
- Gzip compression for 3-5x storage capacity
- Timestamp-based conflict resolution for sync
- Enter key for saving notes
- Auto-focus on note editing

## 1.2.0

### Added
- Clear all addresses button
- Menu for switching between multiple accounts
- Permissions section in the settings
- Toggle controls for optional permissions

### Changed
- Remove extra spaces when pasting during login
- Remove special characters and spaces in the login input

### Improved
- Various UI enhancements
- Enhanced privacy by limiting permissions in the manifest file to only required domains
- Updated manifest to explicitly declare all required permissions for better transparency
- Added secure defaults for optional permissions

### Fixed
- Popup closes in Firefox when trying to import backup address, by making it uses paste the address instead

## 1.1.0

### Added
- Multiple accounts support
- System color theme detection
- Notes for each generated address
- Auto-save website domain in notes when generating address from context menu
- Address deletion functionality
- Export/import functionality (CSV & JSON) for backing up generated addresses with notes
- Confirmation dialogs before logout and address deletion
- Build number management
- Changelog popup and menu entry

### Fixed
- Various bug fixes and code improvements

## 1.0.1

### Changed
- Added cross-browser support 
- Updated build configuration

## 1.0.0
- Initial release of the extension
