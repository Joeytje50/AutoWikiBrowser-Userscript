/**
 * Internationalisation file for AutoWikiBrowser script
 * See https://en.wikipedia.org/wiki/User:Joeytje50/AWB.js for the full script, as well as licensing.
 * Licensed under GNU GPL 2. http://www.gnu.org/copyleft/gpl.html
 */

if (!window.AWB || AWB === false) {
	//Make AWB an object again to prevent errors later on. The onload function will re-delete this again.
	window.AWB = {
		messages: {},
		allowed: false
	};
}

// Tab indentation is optimalised for the Ace editor. The indentation may look weird outside of it.

/** English
 * @author Joeytje50
 */

AWB.messages.en = {
	// General interface
	'tab-setup':			'Setup',
	'tab-editing':			'Editing',
	'tab-skip':				'Skip',
	'tab-other':			'Other',
	'tab-log':				'Log',
	'pagelist-caption':		'Enter list of pages:',
	'editbox-caption':		'Editing area',
	'no-changes-made':		'No changes made. Press skip to go to the next page in the list.',
	'page-not-exists':		'Page doesn\'t exist, diff can not be made.',
	
	// Stats
	'stat-pages':			'Pages listed:',
	'stat-save':			'Pages saved:',
	'stat-null':			'Null-edits:',
	'stat-skip':			'Pages skipped:',
	'stat-other':			'Other:',
	
	// Tab 1
	'label-pagelist':		'Page list',
	'button-remove-dupes':	'Remove duplicates',
	'button-sort':			'Sort',
	'preparse':				'Use pre-parse mode',
	'tip-preparse':			'Go through listed pages, filtering it down to just the ones that would not be skipped by the current Skip rules.',
	'preparse-reset':		'reset',
	'tip-preparse-reset':	'Clear the #PRE-PARSE-STOP tag in the pagelist, to pre-parse the whole page list again',
	'pagelist-generate':	'Generate',
	'label-settings':		'Settings',
	'store-setup':			'Store setup',
	'tip-store-setup':		'Store the current settings in the dropdown menu, for later access.\n'+
							'To be able to access this in a later session, you need to save it to the wiki, or download it.',
	'load-settings':		'Load:',
	'blank-setup':			'Blank setup',
	'delete-setup':			'Delete',
	'tip-delete-setup':		'Delete the setup that is currently selected.',
	'save-setup':			'Save to wiki',
	'download-setup':		'Download',
	'import-setup':			'Import',
	'tip-import-setup':		'Upload settings files (JSON file format) from your computer.',
	'update-setup':			'Update',
	'tip-update-setup':		'Refresh the settings stored on your /AWB-settings.js page',
	
	// Tab 2
	'edit-summary':			'Summary:',
	'minor-edit':			'Minor edit',
	'watch-add':			'add now',
	'watch-remove':			'remove now',
	'watch-nochange':		'Don\'t modify watchlist',
	'watch-preferences':	'Watch based on preferences',
	'watch-watch':			'Add pages to watchlist',
	'watch-unwatch':		'Remove pages from watchlist',
	'auto-save':			'Save automatically',
	'save-interval':		'every $1 sec', //$1 represents the throttle/interval input element
	'tip-save-interval':	'Amount of seconds to pause between each edit',
	'editbutton-stop':		'Stop',
	'editbutton-start':		'Start',
	'editbutton-save':		'Save',
	'editbutton-preview':	'Preview',
	'editbutton-skip':		'Skip', // This message is also used in tab 4
	'editbutton-diff':		'Diff',
	'button-open-popup':	'More replace fields',
	'button-more-fields':	'Add more fields',
	'label-replace':		'Replace:',
	'label-rwith':			'With:',
	'label-useregex':		'Regular Expression',
	'label-regex-flags':	'flags:',
	'tip-regex-flags':		'Any flags for regular expressions, for example i for ignorecase.\n'+
							'In this AWB script, the _ flag treats underscores and spaces as the same entity. Use with caution.',
	'label-ignore-comment':	'Ignore unparsed content',
	'tip-ignore-comment':	'Ignore comments and text within nowiki, source, math, or pre tags.',
	
	// Tab 3
	'label-redirects':		'Redirects:',
	'redirects-follow':		'Follow',
	'tip-redirects-follow':	'Edit the page the redirect leads to',
	'redirects-skip':		'Skip',
	'tip-redirects-skip':	'Skip redirects',
	'redirects-edit':		'Edit',
	'tip-redirects-edit':	'Edit the redirect itself instead of the page it redirects to',
	'label-skip-when':		'Skip when:',
	'skip-no-change':		'No changes were made',
	'skip-exists-yes':		'exists',
	'skip-exists-no':		'doesn\'t exist',
	'skip-exists-neither':	'neither',
	'skip-after-action':	'Skip editing after move/protect',
	'skip-contains':		'When page contains:',
	'skip-not-contains':	'When page doesn\'t contain:',
	
	// Tab 4
	'editbutton-move':		'Move',
	'editbutton-delete':	'Delete',
	'editbutton-protect':	'Protect',
	'move-header':			'Move options',
	'move-redir-suppress':	'Suppress redirects',
	'move-also':			'Also move:',
	'move-talk-page':		'talk page',
	'move-subpage':			'subpages',
	'move-new-name':		'New pagename:',
	'protect-header':		'Protect options',
	'protect-edit':			'Edit:',
	'protect-move':			'Move:',
	'protect-none':			'No protection', // This is the default label. It should indicate that the dropdown menu is used for selecting protection levels
	'protect-autoconf':		'Autoconfirmed',
	'protect-sysop':		'Sysop only',
	'protect-expiry':		'Expiry:',

	//Dialog boxes
	'confirm-leave':		'Closing this tab will cause you to lose all progress.',
	'alert-no-move':		'Please enter the new pagename before clicking move.',
	'not-on-list':			'Your username was not found on the AWB checklist. Please request access by contacting an administrator.',
	'verify-error':			'An error occurred while loading the AutoWikiBrowser checkpage:',
	'new-message':			'You have new messages. See the status bar for links to view them.',
	'no-pages-listed':		'Please enter some articles to browse before clicking start.',
	'infinite-skip-notice':	"No replacement rules were specified, with AWB set to automatically skip when no changes are made.\n"+
							"Please review these settings in the 'Content' and 'Skip' tabs.",
	
	//Statuses
	'status-alt':			'loading...',
	'status-done':			'Done',
	'status-newmsg':		'You have $1 ($2)',
	'status-talklink':		'new messages',
	'status-difflink':		'last change',
	'status-load-page':		'Getting page contents',
	'status-submit':		'Submitting edit',
	'status-preview':		'Getting preview',
	'status-diff':			'Getting edit diff',
	'status-move':			'Moving page',
	'status-delete':		'Deleting page',
	'status-undelete':		'Undeleting page',
	'status-protect':		'Protecting page',
	'status-watch':			'Modifying watchlist',
	'status-watch-added':	'$1 has been added to your watchlist',
	'status-watch-removed':	'$1 has been removed from your watchlist',
	'status-regex-err':		'Regex error. Please change the entered <i>replace</i> regular expression',
	'status-setup-load':	'Loading AWB settings',
	'status-setup-submit':	'Submitting settings to wiki',
	'status-setup-dload':	'Downloading settings',
	'status-old-browser':	'Please use $1 for importing.',
	'status-del-setup':		"'$1' has been deleted. $2.",
	'status-del-default':	'Your default settings have been reset. $1.',
	'status-del-undo':		'Undo',

	//Setup
	'setup-prompt':			'Under what name do you want to $1 your current setup?',
	'setup-prompt-store':	'store',
	'setup-prompt-save':	'save',
	'setup-summary':		'Updating AWB settings /*semi-automatic*/', //this is based on wgContentLanguage, not wgUserLanguage.
	'old-browser':			'Your browser does not support importing files. Please upgrade to a newer browser, or upload the contents of the file to the wiki. See the status bar for links.',
	'not-json':				'Only JSON files can be imported. Please ensure your file uses the extension .json, or modify the file extension if necessary.',
	'json-err':				'An error was found in your AWB settings:\n$1\nPlease review your settings $2.',
	'json-err-upload':		'file',
	'json-err-page':		"by going to 'Special:MyPage/AWB-settings.js'",
	'setup-delete-blank':	'You can\'t delete the blank setup.',
	
	//Pagelist generating
	'exceeded-iterations':	'Maximum list length reached. Cancelling further requests to avoid overloading server.',
	'namespace-main':		'main',
	'label-ns-select':		'Namespace:',
	'tip-ns-select':		'Ctrl+click to select multiple namespaces.',
	'legend-cm':			'Category',
	'label-cm':				'Category:',
	'cm-include':			'Include:',
	'cm-include-pages':		'pages',
	'cm-include-subcgs':	'subcategories',
	'cm-include-files':		'files',
	'legend-linksto':		'Links to page',
	'label-linksto':		'Links to:',
	'links-include':		'Include:',
	'links-include-links':	'wikilinks',
	'links-include-templ':	'transclusions',
	'links-include-files':	'file usage',
	'links-redir':			'Redirects:',
	'links-redir-redirs':	'redirects',
	'links-redir-noredirs':	'non-redirects',
	'links-redir-all':		'both',
	'label-link-redir':		'Include links to redirects',
	'tip-link-redir':		'Include links directed towards one of this page\'s redirects',
	'legend-ps':			'Pages with prefix',
	'label-ps':				'Prefix:',
	'legend-wr':			'Watchlist',
	'label-wr':				'Include watchlist contents',
	'legend-pl':			'Links on page',
	'label-pl':				'On page:',
	'tip-pl':				'Fetch a list of links on the page(s).\nSeperate values with | vertical bars.',
};

/** Dutch (Nederlands)
 * @author Joeytje50
 * Does probably need improvements
 */

AWB.messages.nl = {
	// General interface
	'tab-setup':			'Setup',
	'tab-editing':			'Bewerk',
	'tab-skip':				'Skip',
	'tab-other':			'Overig',
	'tab-log':				'Log',
	'pagelist-caption':		'Lijst met pagina\'s:',
	'editbox-caption':		'Bewerkingsveld',
	'no-changes-made':		'Geen bewerkingen gemaakt. Druk op skip om door te gaan met de volgende pagina in de lijst.',
	'page-not-exists':		'Pagina bestaat niet. Wijzigingen kunnen niet worden opgesteld.',
	
	// Stats
	'stat-pages':			'Pagina\'s in lijst:',
	'stat-save':			'Pagina\'s opgeslagen:',
	'stat-null':			'Lege bewerkingen:',
	'stat-skip':			'Overgeslagen pagina\'s:',
	'stat-other':			'Anders:',
	
	// Tab 1
	'label-pagelist':		'Paginalijst',
	'button-remove-dupes':	'Filter dubbele pagina\'s',
	'button-sort':			'Sorteer',
	'preparse':				'Gebruik pre-parse modus',
	'tip-preparse':			'Werk door pagina\'s in de lijst om de pagina\'s weg te filteren die overgeslagen worden via de huidige skip-regels.',
	'preparse-reset':		'reset',
	'tip-preparse-reset':	'Reset de #PRE-PARSE-STOP tag in de lijst met pagina\'s, om weer door de hele lijst met pagina\'s te kunnen pre-parsen.',
	'pagelist-generate':	'Genereer',
	'label-settings':		'Instellingen:',
	'store-setup':			'Vastzetten',
	'tip-store-setup':		'Zet de huidige instellingen vast, om deze later te herstellen via het selectiemenu.\n'+
							'Om deze in een latere sessie te kunnen gebruiken moeten ze op de wiki worden opgeslagen, of worden gedownload.',
	'load-settings':		'Laad:',
	'blank-setup':			'Blanco instellingen',
	'delete-setup':			'Verwijder',
	'tip-delete-setup':		'Verwijder de instellingen die nu geselecteerd zijn.',
	'save-setup':			'Opslaan op wiki',
	'download-setup':		'Download',
	'import-setup':			'Importeer',
	'tip-import-setup':		'Upload bestanden met AWB instellingen (JSON bestandsformaat) van uw computer.',
	'update-setup':			'Update',
	'tip-update-setup':		'Herlaad de instellingen die op uw /AWB-settings.js pagina zijn opgeslagen.',
	
	// Tab 2
	'edit-summary':			'Samenvatting:',
	'minor-edit':			'Kleine bewerking',
	'watch-add':			'volg nu',
	'watch-remove':			'ontvolg nu',
	'watch-nochange':		'Wijzig volglijst niet',
	'watch-preferences':	'Volg naar ingestelde voorkeuren',
	'watch-watch':			'Volg bewerkte pagina\'s',
	'watch-unwatch':		'Haal bewerkte pagina\'s van volglijst',
	'auto-save':			'Automatisch opslaan',
	'save-interval':		'elke $1 sec', //$1 represents the throttle/interval input element
	'tip-save-interval':	'Aantal secondes rust tussen elke automatische bewerking',
	'editbutton-stop':		'Stop',
	'editbutton-start':		'Start',
	'editbutton-save':		'Opslaan',
	'editbutton-preview':	'Voorbeeld',
	'editbutton-skip':		'Skip', // This message is also used in tab 4
	'editbutton-diff':		'Wijz.',
	'button-open-popup':	'Meer invoervelden',
	'button-more-fields':	'Voeg meer velden toe',
	'label-replace':		'Vervang:',
	'label-rwith':			'Met:',
	'label-useregex':		'Reguliere expressie',
	'label-regex-flags':	'flags:',
	'tip-regex-flags':		'Flags om aan de expressie toe te voegen, bijvoorbeeld i voor hoofdletterongevoeligheid.\n'+
							'In dit AWB script werkt de _ flag om underscores en spaties als hetzelfde te beschouwen. Wees hier wel voorzichtig mee.',
	'label-ignore-comment':	'Negeer onverwerkte inhoud',
	'tip-ignore-comment':	'Negeer commentaar en tekst binnen nowiki, source, math, of pre tags bij vervangen.',
	
	// Tab 3
	'label-redirects':		'Doorverwijzingen:',
	'redirects-follow':		'Volg',
	'tip-redirects-follow':	'Bewerk de pagina waar de doorverwijzing naar leidt',
	'redirects-skip':		'Skip',
	'tip-redirects-skip':	'Sla doorverwijzingen over',
	'redirects-edit':		'Bewerk',
	'tip-redirects-edit':	'Bewerk de doorverwijzing zelf, niet de pagina waar deze naar leidt',
	'label-skip-when':		'Skip bij:',
	'skip-no-change':		'Geen gemaakte bewerkingen',
	'skip-exists-yes':		'bestaat',
	'skip-exists-no':		'bestaat niet',
	'skip-exists-neither':	'geen',
	'skip-after-action':	'Niet bewerken na hernoem/beveilig',
	'skip-contains':		'Als pagina bevat:',
	'skip-not-contains':	'Als pagina niet bevat:',
	
	// Tab 4
	'editbutton-move':		'Hernoem',
	'editbutton-delete':	'Verwijder',
	'editbutton-protect':	'Beveilig',
	'move-header':			'Hernoemopties',
	'move-redir-suppress':	'Doorverwijzing onderdrukken',
	'move-also':			'Ook hernoemen:',
	'move-talk-page':		'overleg',
	'move-subpage':			'subpagina\'s',
	'move-new-name':		'Nieuwe naam:',
	'protect-header':		'Beschermingsopties',
	'protect-edit':			'Bewerken:',
	'protect-move':			'Hernoemen:',
	'protect-none':			'Geen beveiliging', // This is the default label. It should indicate that the dropdown menu is used for selecting protection levels
	'protect-autoconf':		'Autobevestigd',
	'protect-sysop':		'Alleen administrators',
	'protect-expiry':		'Verloopt:',

	//Dialog boxes
	'confirm-leave':		'Als u dit tabblad sluit verlies je alle gegevens.',
	'alert-no-move':		'Voer eerst de artikelnaam in om naar te hernoemen.',
	'not-on-list':			'Uw gebruikersnaam kon niet worden gevonden op de checkpagina. Vraag hiervoor toegang aan bij een administrator.',
	'verify-error':			'Er is een error opgetreden tijdens het laden van de checkpagina:',
	'new-message':			'U hebt nieuwe berichten. Kijk op de statusbalk voor links om deze te bekijken.',
	'no-pages-listed':		'Voer eerst een lijst met pagina\'s in voor op Start te drukken.',
	'infinite-skip-notice':	"Er zijn geen vervang-regels ingevoerd, terwijl AWB ingesteld is automatisch te skippen als er geen automatische veranderingen zijn gemaakt.\n"+
							"Kijk in de 'Inhoud'  en 'Skip' tabs om deze instellingen aan te passen.",
	
	//Statuses
	'status-alt':			'laden...',
	'status-done':			'Klaar',
	'status-newmsg':		'<b>U hebt $1 ($2)</b>',
	'status-talklink':		'nieuwe berichten',
	'status-difflink':		'laatste bewerking',
	'status-load-page':		'Pagina-inhoud ophalen',
	'status-submit':		'Pagina opslaan',
	'status-preview':		'Voorbeeld ophalen',
	'status-diff':			'Wijzigingen ophalen',
	'status-move':			'Pagina hernoemen',
	'status-delete':		'Pagina verwijderen',
	'status-undelete':		'Pagina herstellen',
	'status-protect':		'Pagina beveiligen',
	'status-watch':			'Volglijst bijwerken',
	'status-watch-added':	'$1 is toegevoegd aan uw volglijst',
	'status-watch-removed':	'$1 is verwijderd van uw volglijst',
	'status-regex-err':		'Regex error. Verander de ingevoerde <i>vervang</i> expressie',
	'status-setup-load':	'AWB instellingen laden',
	'status-setup-submit':	'Instellingen verzenden naar wiki',
	'status-setup-dload':	'Instellingen downloaden',
	'status-old-browser':	'Gebruik $1 voor het importeren.',
	'status-del-setup':		"'$1' is verwijderd. $2.",
	'status-del-default':	'Uw standaardinstellingen zijn gereset. $1.',
	'status-del-undo':		'Ongedaan maken',

	//Setup
	'setup-prompt':			'Op welke naam wilt u uw huidige instellingen $1?',
	'setup-prompt-store':	'store',
	'setup-prompt-save':	'opslaan',
	'setup-summary':		'AWB instellingen bijwerken /*semi-automatisch*/',
	'old-browser':			'Uw browser ondersteunt importeren niet. Download een nieuwere browser, of upload de inhoud van het bestand naar de wiki. Kijk in de statusbalk voor links.',
	'not-json':				'Alleen JSON bestanden kunnen worden geïmporteerd. Zorg dat de bestandsextensie .json is, of verander de bestandsextensie indien nodig.',
	'json-err':				'Er is een fout opgetreden in uw AWB instellingen:\n$1\nKijk uw instellingen$2 na.',
	'json-err-upload':		'',
	'json-err-page':		" op 'Special:MyPage/AWB-settings.js'",
	'setup-delete-blank':	'De blanco-instellingen kunnen niet worden verwijderd.',

	//Pagelist generating
	'exceeded-iterations':	'Maximum lijstlengte bereikt. Verdere verzoeken geannuleerd om overbelasten van servers te voorkomen.',
	'namespace-main':		'artikel',
	'label-ns-select':		'Naamruimte:',
	'tip-ns-select':		'Ctrl+klik om meerdere naamruimten te selecteren.',
	'legend-cm':			'Categorie',
	'label-cm':				'Categorie:',
	'cm-include':			'Opnemen:',
	'cm-include-pages':		'pagina\'s',
	'cm-include-subcgs':	'subcategorieën',
	'cm-include-files':		'bestanden',
	'legend-linksto':		'Links naar pagina',
	'label-linksto':		'Links naar:',
	'links-include':		'Opnemen:',
	'links-include-links':	'wikilinks',
	'links-include-templ':	'sjabloongebruik',
	'links-include-files':	'bestandsgebruik',
	'links-redir':			'Doorverwijzingen:',
	'links-redir-redirs':	'uitsluitend',
	'links-redir-noredirs':	'geen',
	'links-redir-all':		'beide',
	'label-link-redir':		'links via doorverwijzingen opnemen',
	'tip-link-redir':		'Ook links naar een van de doorverwijzingen van deze pagina in de lijst opnemen',
	'legend-ps':			'Pagina\'s met voorvoegsel',
	'label-ps':				'Voorvoegsel:',
	'legend-wr':			'Volglijst',
	'label-wr':				'Volglijstinhoud in de paginalijst opnemen',
	'legend-pl':			'Links op pagina',
	'label-pl':				'Op pagina:',
	'tip-pl':				'Verkrijg de lijst van links gebruikt op de pagina(s).\nSplits meerdere pagina\'s met | sluistekens (staafje).',
};
