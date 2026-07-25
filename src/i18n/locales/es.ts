import type { Translations } from './en'

export const es: Translations = {
  // Language / locale
  'locale.tag': 'es-ES',
  'language.en': 'English',
  'language.es': 'Español',

  // Shared
  'common.cancel': 'Cancelar',
  'common.confirm': 'Confirmar',
  'common.save': 'Guardar',
  'common.clear': 'Borrar',
  'common.close': 'Cerrar',
  'common.delete': 'Eliminar',
  'common.done': 'Listo',
  'common.ok': 'Aceptar',
  'common.gotIt': 'Entendido',
  'common.back': 'Atrás',
  'common.backToDashboard': 'Volver al panel',
  'common.copied': '¡Copiado!',
  'common.failedToCopy': 'No se pudo copiar',
  'common.current': '(actual)',
  'common.unknownError': 'Error desconocido',

  // Header
  'header.switchAccount': 'Cambiar de cuenta',
  'header.addAccount': 'Añadir cuenta',
  'header.myAccount': 'Mi cuenta',
  'header.settings': 'Ajustes',
  'header.whatsNew': '¿Qué hay de nuevo?',
  'header.about': 'Acerca de',
  'header.logout': 'Cerrar sesión',
  'header.logoutConfirmTitle': 'Confirmar cierre de sesión',
  'header.logoutConfirmMessage': '¿Seguro que quieres cerrar sesión?',
  'header.nicknameTitle': 'Editar apodo de la cuenta',
  'header.nicknameSubtitle': 'Define un apodo personalizado para {username}',
  'header.nicknamePlaceholder': 'Introduce un apodo (opcional)',
  'header.support': 'Apoya el proyecto',
  'header.openInWindow': 'Abrir en una ventana nueva',
  'header.menu': 'Menú',

  // Login
  'login.message': 'Inicia sesión para gestionar tus direcciones {duck}',
  'login.placeholder': 'Introduce tu usuario de duck',
  'login.sending': 'Enviando...',
  'login.continue': 'Continuar',
  'login.alreadyLoggedIn': 'Esta cuenta ya tiene la sesión iniciada',
  'login.noAccount': '¿No tienes una?',
  'login.createNow': 'Créala ahora',
  'login.signupTitle': 'Crear una dirección duck',
  'login.signupMessage':
    'Te redirigiremos a DuckDuckGo para crear tu dirección @duck.com. Cuando completes el registro, iniciarás sesión automáticamente.',
  'login.signupConfirm': 'Continuar a DuckDuckGo',

  // Auto-login (from signup)
  'autoLogin.successTitle': 'Sesión iniciada correctamente',
  'autoLogin.successMessage': 'Se ha iniciado sesión automáticamente como {username}@duck.com',
  'autoLogin.failedTitle': 'Error al iniciar sesión automáticamente',
  'autoLogin.dashboardFailed':
    'No se pudieron cargar los datos del panel. Inicia sesión manualmente.',
  'autoLogin.invalidResponse': 'Respuesta no válida del servidor. Inicia sesión manualmente.',
  'autoLogin.noUsername': 'No se pudo determinar el nombre de usuario. Inicia sesión manualmente.',
  'autoLogin.generic': 'Error al iniciar sesión automáticamente. Inicia sesión manualmente.',
  'autoLogin.alreadyLoggedIn': 'La sesión ya está iniciada.',
  'autoLogin.invalidToken': 'Token no válido',
  'autoLogin.invalidUsername': 'Nombre de usuario no válido',
  'autoLogin.invalidCredentials': 'Credenciales no válidas',

  // OTP
  'otp.backToLogin': 'Volver al inicio de sesión',
  'otp.loggedInAs': 'Sesión iniciada como {username}@duck.com',
  'otp.message': 'Se ha enviado una frase de acceso de un solo uso a tu correo',
  'otp.placeholder': 'p. ej. morality landless proved paprika',
  'otp.verifying': 'Verificando...',
  'otp.verify': 'Verificar código',
  'otp.resend': 'Reenviar frase de acceso',
  'otp.resendSuccess': 'Se ha enviado una nueva frase de acceso a tu correo.',
  'otp.resendFailed': 'No se pudo reenviar la frase de acceso.',
  'otp.switchFailed': 'No se pudo cambiar a la nueva cuenta',
  'otp.userDataFailed': 'No se pudieron obtener los datos del usuario',
  'otp.verifyFailed': 'No se pudo verificar el código',
  'otp.genericError': 'Se produjo un error. Inténtalo de nuevo.',
  'otp.troubleToggle': '¿Problemas para iniciar sesión?',
  'otp.hint':
    '¿No lo has recibido? Revisa tu carpeta de spam o correo no deseado. Algunos proveedores de correo (como ProtonMail) pueden retrasar o filtrar los mensajes de DuckDuckGo.',

  // Dashboard
  'dashboard.tabGenerate': 'Generar',
  'dashboard.tabSend': 'Enviar',
  'dashboard.generating': 'Generando...',
  'dashboard.generate': 'Generar dirección nueva',
  'dashboard.loadFailed': 'No se pudieron cargar los datos',
  'dashboard.generateFailed': 'No se pudo generar la dirección',
  'dashboard.hideInstructions': 'Ocultar',
  'dashboard.howToUse': 'Cómo se usa',
  'dashboard.step1': 'Introduce el correo del destinatario y pulsa <b>Convertir</b>',
  'dashboard.step2': 'Pega el resultado en el campo <b>Para</b> de tu cliente de correo',
  'dashboard.step3': 'Envía desde el correo vinculado a tu cuenta de DDG',
  'dashboard.learnMore': 'Más información',
  'dashboard.from': 'De:',
  'dashboard.recipientPlaceholder': 'alguien@correo.com',
  'dashboard.convert': 'Convertir',
  'dashboard.sendFrom': 'Enviar desde',
  'dashboard.closePicker': 'Cerrar selector',
  'dashboard.searchAddresses': 'Buscar direcciones...',
  'dashboard.personalAddress': 'Dirección personal',

  // Generated address list
  'list.generated.title': 'Direcciones generadas',
  'list.generated.itemsLabel': 'direcciones',
  'list.generated.emptyTitle': 'Aún no hay direcciones',
  'list.generated.emptySubtitle': 'Pulsa el botón de arriba para generar tu primera dirección',
  'list.generated.searchPlaceholder': 'Buscar direcciones o notas...',
  'list.generated.deleteTitle': 'Eliminar dirección',
  'list.generated.deleteMessage': '¿Seguro que quieres eliminar esta dirección\n({key}@duck.com)?',
  'list.generated.clearTitle': 'Borrar todas las direcciones',
  'list.generated.clearMessage':
    '¿Seguro que quieres borrar todas las direcciones?\n\nEsta acción no se puede deshacer.',

  // Reverse alias list
  'list.send.title': 'Historial',
  'list.send.itemsLabel': 'alias',
  'list.send.emptyTitle': 'Aún no hay historial',
  'list.send.emptySubtitle': 'Convierte arriba el correo de un destinatario para empezar',
  'list.send.searchPlaceholder': 'Buscar correos o notas...',
  'list.send.deleteTitle': 'Eliminar alias inverso',
  'list.send.deleteMessage': '¿Seguro que quieres eliminar el alias inverso de\n{key}?',
  'list.send.clearTitle': 'Borrar todo el historial',
  'list.send.clearMessage':
    '¿Seguro que quieres borrar todo el historial de alias inversos?\n\nEsta acción no se puede deshacer.',

  // List UI (shared by both lists)
  'list.copyItem': 'Copiar {value}',
  'list.copyReverseAlias': 'Copiar el alias inverso de {value}',
  'list.removeTag': 'Quitar la etiqueta {tag}',
  'list.addTagPlaceholder': 'Añadir etiqueta...',
  'list.addTag': 'Añadir etiqueta',
  'list.closeTagInput': 'Cerrar el campo de etiquetas',
  'list.notesPlaceholder': 'Añadir notas...',
  'list.editNotes': 'Editar notas',
  'list.saveNotes': 'Guardar notas',
  'list.cancelEditing': 'Cancelar edición',
  'list.editTags': 'Editar etiquetas',
  'list.untagged': 'Sin etiquetas',
  'list.sortNewest': 'Recientes',
  'list.sortOldest': 'Antiguas',
  'list.sortBy': 'Ordenar por: {order}',
  'list.noResultsTitle': 'No se encontraron resultados',
  'list.noResultsSubtitle': 'Prueba a ajustar la búsqueda o el filtro',
  'list.clearAllItems': 'Borrar todas las {items}',
  'list.showItems': 'Mostrar {items}',
  'list.hideItems': 'Ocultar {items}',
  'list.searchItems': 'Buscar {items}',
  'list.clearSearch': 'Borrar búsqueda',
  'list.groupByTag': 'Agrupar por etiqueta',
  'list.group': 'Agrupar',
  'list.filterAll': 'Todas',
  'list.showingCount': 'Mostrando {shown} de {total} {items}',
  'list.clearAll': 'Borrar todo',

  // User info card
  'userInfo.title': 'Mi cuenta',
  'userInfo.show': 'Mostrar la información del usuario',
  'userInfo.hide': 'Ocultar la información del usuario',
  'userInfo.username': 'Usuario de duck',
  'userInfo.email': 'Correo de reenvío',
  'userInfo.totalGenerated': 'Total generadas',
  'userInfo.invites': 'Invitaciones',

  // My account page
  'myAccount.manage': 'Gestionar tu cuenta de duck',
  'myAccount.removing': 'Eliminando...',
  'myAccount.remove': 'Eliminar los datos locales de la cuenta',
  'myAccount.removeTitle': 'Eliminar los datos locales de la cuenta',
  'myAccount.removeMessage':
    'Vas a eliminar {account} junto con sus {data} de este dispositivo y de la sincronización. Tu cuenta de DuckDuckGo no se verá afectada. Esta acción no se puede deshacer.',
  'myAccount.thisAccount': 'esta cuenta',
  'myAccount.savedAddresses': '{count} direcciones guardadas',
  'myAccount.savedAddresses_one': '{count} dirección guardada',
  'myAccount.savedAddresses_other': '{count} direcciones guardadas',
  'myAccount.reverseAliases': '{count} alias inversos',
  'myAccount.reverseAliases_one': '{count} alias inverso',
  'myAccount.reverseAliases_other': '{count} alias inversos',
  'myAccount.addressesAndAliases': '{addresses} y {aliases}',
  'myAccount.removeFailed': 'No se pudo eliminar la cuenta',
  'myAccount.noAccountSelected': 'No hay ninguna cuenta seleccionada',

  // About page
  'about.support': 'Apoya el proyecto',
  'about.github': 'Repositorio de GitHub',
  'about.firefoxStore': 'Complementos de Firefox',
  'about.chromeStore': 'Chrome Web Store',

  // Changelog page
  'changelog.loading': 'Cargando el registro de cambios...',
  'changelog.error': 'No se pudo cargar el registro de cambios. Inténtalo de nuevo más tarde.',
  'changelog.loadFailed': 'No se pudo cargar el registro de cambios',
  'changelog.heading': '¿Qué hay de nuevo?',

  // Settings — appearance
  'settings.appearance': 'Apariencia',
  'settings.theme': 'Tema',
  'settings.themeLight': 'Claro',
  'settings.themeDark': 'Oscuro',
  'settings.themeSystem': 'Sistema',
  'settings.language': 'Idioma',
  'settings.timeFormat24h': 'Formato de 24 horas',

  // Settings — permissions
  'settings.permissions': 'Permisos y funciones',

  // Settings — sync
  'settings.sync': 'Sincronización',
  'settings.syncOptions': 'Opciones de sincronización',
  'settings.syncAddresses': 'Direcciones',
  'settings.syncReverseAliases': 'Alias inversos',
  'settings.syncSessionData': 'Datos de sesión',
  'settings.syncSessionHint': '(datos de acceso y ajustes)',
  'settings.syncTokenWarningFirefox':
    'Los datos de sesión incluyen tus tokens de acceso. Firefox los cifra durante la sincronización, pero se guardan en tu cuenta de Mozilla.',
  'settings.syncTokenWarningChrome':
    'Los datos de sesión incluyen tus tokens de acceso. Chrome los cifra durante la sincronización, pero se guardan en tu cuenta de Google.',
  'settings.syncStatus': 'Estado:',
  'settings.syncLastSynced': 'Última sincronización: {date}',
  'settings.syncNever': 'Nunca sincronizado',
  'settings.syncRefresh': 'Actualizar',
  'settings.syncStorageUsed': 'Almacenamiento usado:',
  'settings.syncAutoDisabled':
    'La sincronización se desactivó automáticamente porque se superó la cuota de almacenamiento.',
  'settings.allAccounts': 'Todas las cuentas',
  'settings.selectAccounts': 'Selecciona las cuentas...',
  'settings.accountsSelected': '{count} cuentas seleccionadas',

  // Settings — backup & restore
  'settings.backup': 'Copia de seguridad y restauración',
  'settings.exporting': 'Exportando...',
  'settings.exportBackup': 'Exportar copia de seguridad',
  'settings.importing': 'Importando...',
  'settings.importBackup': 'Importar copia de seguridad',
  'settings.importHint':
    'La importación acepta una copia de seguridad de Qwacky (.json) o un archivo .txt con una lista de direcciones duck.com existentes, una por línea.',
  'settings.exportOptions': 'Opciones de exportación',
  'settings.includeSession': 'Incluir la sesión',
  'settings.exportFailed': 'No se pudo exportar la copia de seguridad',
  'settings.importFailedInvalidFile': 'Error al importar: archivo no válido',
  'settings.importFailed': 'Error al importar',
  'settings.importFailedWithReason': 'Error al importar: {reason}',
  'settings.unrecognizedFormat': 'Formato de archivo no reconocido',

  // Settings — import result summaries
  'settings.importDuplicates': '{count} duplicadas omitidas',
  'settings.importDuplicates_one': '{count} duplicada omitida',
  'settings.importDuplicates_other': '{count} duplicadas omitidas',
  'settings.importInvalid': '{count} ignoradas (no son direcciones duck.com)',
  'settings.importNothingNew': 'No hay direcciones nuevas que importar.',
  'settings.importedCount': '{count} direcciones importadas',
  'settings.importedCount_one': '{count} dirección importada',
  'settings.importedCount_other': '{count} direcciones importadas',
  'settings.importedCountWithNotes': '{imported} — {notes}',

  // Settings — backup summary dialog
  'settings.summaryAccounts': 'Cuentas: {accounts}',
  'settings.summaryAddresses': 'Direcciones: {count}',
  'settings.summaryReverseAliases': 'Alias inversos: {count}',
  'settings.summarySessionIncluded': 'Datos de sesión: incluidos',
  'settings.summarySessionRestored': 'Datos de sesión: restaurados',
  'settings.summaryNewAccounts': 'Cuentas nuevas añadidas: {count}',
  'settings.summaryAddressCount': '{count} direcciones',
  'settings.summaryAliasCount': '{count} alias inversos',
  'settings.summaryAccountLine': '{account}@duck.com: +{parts}',
  'settings.summarySkipped': 'Omitidas (ya existían): {parts}',
  'settings.summaryUpToDate': 'Ya estaba todo actualizado.',
  'settings.exportComplete': 'Exportación completada',
  'settings.importComplete': 'Importación completada',

  // Settings — dialogs
  'settings.popoutTitle': 'Abrir en una ventana nueva',
  'settings.popoutMessage':
    'Firefox no permite seleccionar archivos desde la ventana emergente. La extensión se abrirá en una ventana nueva donde podrás importar tu copia de seguridad con normalidad.',
  'settings.popoutConfirm': 'Abrir ventana',
  'settings.exportWarningTitle': 'Advertencia de seguridad',
  'settings.exportWarningMessage':
    'El archivo exportado contendrá tu token de acceso y tus credenciales de inicio de sesión. Guárdalo en un lugar seguro y no lo compartas. Cualquiera que tenga este archivo puede acceder a tu cuenta de DuckDuckGo Email.',
  'settings.exportWarningConfirm': 'Exportar de todos modos',
  'settings.importConfirmTitle': 'Importar copia de seguridad',
  'settings.importConfirmMessage':
    'Esta copia de seguridad contiene datos de sesión. Al importarla se añadirán las cuentas y sus datos a tu extensión. ¿Seguro que quieres continuar?',
  'settings.importConfirmButton': 'Importar',

  // Sync session restore prompt
  'sync.foundTitle': 'Se encontraron cuentas sincronizadas',
  'sync.foundMessage':
    'Se encontraron {count} cuentas sincronizadas: {accounts}. ¿Quieres restaurarlas?',
  'sync.foundMessage_one':
    'Se encontró {count} cuenta sincronizada: {accounts}. ¿Quieres restaurarla?',
  'sync.foundMessage_other':
    'Se encontraron {count} cuentas sincronizadas: {accounts}. ¿Quieres restaurarlas?',
  'sync.restore': 'Restaurar',
  'sync.dataTooLarge': 'Los datos son demasiado grandes ({size} KB). El máximo es 8 KB por cuenta.',
  'sync.addressCount': '{count} direcciones',
  'sync.aliasCount': '{count} alias inversos',
  'sync.sessionData': 'datos de sesión',
  'sync.syncedParts': 'Se sincronizaron correctamente: {parts}',
  'sync.migrationFailed': 'Error en la migración',
  'sync.pullFailed': 'No se pudieron obtener los datos sincronizados',
  'sync.noSyncedData': 'No se encontraron datos sincronizados',
  'sync.quotaExceededDisabled':
    'Se superó la cuota de sincronización. La sincronización se ha desactivado.',
  'sync.disabled': 'Sincronización desactivada',
  'sync.notEnabled': 'La sincronización no está activada',
  'sync.noUser': 'No hay ninguna sesión iniciada',
  'sync.nothingToMigrate': 'No hay datos que migrar',
  'sync.quotaExceeded':
    'Se superó la cuota de almacenamiento. Prueba a reducir la cantidad de datos sincronizados.',

  // Permissions
  'permission.storage.name': 'Almacenamiento',
  'permission.storage.description':
    '`storage`\nNecesario para que la extensión funcione correctamente, para guardar y recuperar datos localmente',
  'permission.contextMenu.name': 'Menú contextual',
  'permission.contextMenu.description':
    '`contextMenus`\nFirefox exige que este permiso figure en el bloque de permisos del manifiesto en el momento de la instalación. [Más información](https://github.com/Lanshuns/Qwacky?tab=readme-ov-file#browser-specific-permission-handling-and-limitations)',
  'permission.autofill.name': 'Autocompletar',
  'permission.autofill.descriptionFirefox':
    '`activeTab`, `clipboardWrite` y `scripting`\nActiva las opciones de Qwacky en el menú contextual para generar una dirección duck o convertir un destinatario en una dirección de envío',
  'permission.autofill.descriptionChrome':
    '`contextMenus`, `activeTab`, `clipboardWrite` y `scripting`\nActiva las opciones de Qwacky en el menú contextual para generar una dirección duck o convertir un destinatario en una dirección de envío',

  // Permission toggle
  'permissionToggle.denied': 'Se denegó la solicitud de permisos',
  'permissionToggle.reloading': 'Recargando para aplicar los cambios...',
  'permissionToggle.enableFailed': 'No se pudo activar la función',
  'permissionToggle.disabling': 'Desactivando {name}...',
  'permissionToggle.disableFailed': 'No se pudo desactivar la función',
  'permissionToggle.error': 'Se produjo un error',
  'permissionToggle.noticeTitle': 'Aviso de permisos',
  'permissionToggle.tooltip':
    'La solicitud de permisos adicionales del navegador solo aparecerá una vez si aún no se han concedido.',
  'permissionToggle.readMore': 'Más información',
  'permissionToggle.firefox1': 'Para activar esta función:',
  'permissionToggle.firefox2':
    '1. Firefox mostrará una solicitud de permisos: pulsa «Permitir»',
  'permissionToggle.firefox3': '2. Vuelve a la extensión y activa la función de nuevo',
  'permissionToggle.firefox4': 'Puedes desactivar esta función en cualquier momento.',
  'permissionToggle.chrome1': 'Chrome gestiona los permisos de forma distinta a Firefox.',
  'permissionToggle.chrome2':
    'Para activar esta función, Chrome mostrará una solicitud de permisos una sola vez. Después de pulsar «Listo», puede aparecer un diálogo de permisos.',
  'permissionToggle.chrome3':
    'Si aparece un diálogo de permisos, pulsa «Permitir», vuelve a la extensión y activa la función de nuevo.',
  'permissionToggle.chrome4': 'Para más detalles, consulta:',
  'permissionToggle.chromeLink':
    'Gestión y limitaciones de permisos según el navegador',

  // Error boundary
  'errorBoundary.title': 'Algo salió mal',
  'errorBoundary.message': 'La extensión encontró un error inesperado.',
  'errorBoundary.reload': 'Recargar la extensión',

  // Context menu (background)
  'contextMenu.parent': 'Qwacky',
  'contextMenu.generate': 'Autocompletar con una dirección duck',
  'contextMenu.convert': 'Convertir en dirección de envío',

  // Content script notifications
  'notify.loginFirst': 'Primero tienes que iniciar sesión',
  'notify.selectRecipient': 'Selecciona el correo de un destinatario para convertirlo',
  'notify.generateFailed': 'No se pudo generar la dirección. ¿Has iniciado sesión?',
  'notify.fillFailedCopied':
    'No se pudo rellenar el campo; la dirección se copió al portapapeles',
  'notify.fillFailedNotCopied':
    'No se pudo rellenar el campo ni copiar al portapapeles. Revisa los permisos en los ajustes.',
  'notify.filledAndCopied': 'Dirección rellenada y copiada al portapapeles',
  'notify.filledNotCopied':
    'Dirección rellenada, pero no se pudo copiar al portapapeles. Revisa los permisos en los ajustes.',
  'notify.replaceFailedCopied':
    'No se pudo reemplazar la selección; la dirección se copió al portapapeles',
  'notify.replaceFailedNotCopied':
    'No se pudo reemplazar la selección ni copiar al portapapeles. Revisa los permisos en los ajustes.',
  'notify.convertedAndCopied': 'Convertido y copiado al portapapeles',
  'notify.convertedNotCopied':
    'Convertido, pero no se pudo copiar al portapapeles. Revisa los permisos en los ajustes.',

  // Service errors
  'error.usernameRequired': 'El nombre de usuario es obligatorio',
  'error.otpRequired': 'El código de un solo uso es obligatorio',
  'error.notAuthenticated': 'Primero tienes que iniciar sesión',
  'error.invalidUserData': 'Datos de usuario no válidos. Inicia sesión de nuevo.',
  'error.noAddressReturned': 'El servidor no devolvió ninguna dirección',
  'error.otpSent': '¡Se envió el código de un solo uso a tu correo!',
  'error.tooManyRequests': 'Demasiadas solicitudes. Espera un momento antes de volver a intentarlo.',
  'error.otpSendFailed':
    'No se pudo enviar el código de un solo uso. Inténtalo de nuevo más tarde.',
  'error.network': 'Error de red. Comprueba tu conexión a internet.',
  'error.loginFailed': 'No se pudo iniciar sesión. Inténtalo de nuevo.',
  'error.invalidServerResponse': 'Respuesta no válida del servidor.',
  'error.dashboardFailed': 'No se pudieron cargar los datos del panel.',
  'error.loginSuccessful': '¡Sesión iniciada correctamente!',
  'error.invalidPassphrase':
    'Frase de acceso no válida. Comprueba la frase de acceso de tu correo e inténtalo de nuevo.',
  'error.generateFailed': 'No se pudo generar la dirección',
  'error.invalidResponseFormat': 'Formato de respuesta no válido',
  'error.unexpectedLogin': 'Se produjo un error inesperado al iniciar sesión',
  'error.unexpectedVerify': 'Se produjo un error inesperado durante la verificación',
  'error.unknownGenerate': 'Error desconocido al generar la dirección',
  'error.unknownDeleteAccount': 'Error desconocido al eliminar la cuenta',
  'error.unknownLogout': 'Error desconocido al cerrar sesión',
  'error.unknownImportAddresses': 'Error desconocido al importar las direcciones',
  'error.unknownImportBackup': 'Error desconocido al importar la copia de seguridad',
  'error.exportBackupFailed': 'No se pudo exportar la copia de seguridad',
  'error.importDataEmpty': 'Los datos de importación están vacíos o no son válidos',
  'error.importMissingAddresses': 'Formato no válido: falta el array de direcciones',
  'error.importInvalidJson': 'Formato JSON no válido',
  'error.importNoAddresses': 'No se encontraron direcciones en el archivo',
  'error.importNoValidAddresses': 'No se encontraron direcciones duck.com válidas.',
  'error.importAllExist': 'No hay direcciones nuevas que importar. Todas ya existen.',
  'error.importStorage': 'Error de almacenamiento: {reason}',
  'error.importSaveFailed': 'No se pudieron guardar las direcciones importadas',
  'error.deleteAccountFailed': 'No se pudo eliminar la cuenta',
  'error.userDataNotFoundLogin':
    'No se encontraron los datos del usuario. Inicia sesión de nuevo.',
  'error.userDataNotFoundLoginFirst':
    'No se encontraron los datos del usuario. Inicia sesión primero.',
  'error.invalidBackupFormat': 'Formato de archivo de copia de seguridad no válido',
  'error.notQwackyBackup': 'No es un archivo de copia de seguridad válido de Qwacky',
  'error.accountNotInSession': 'La cuenta actual no se encuentra en los datos de sesión',
}
