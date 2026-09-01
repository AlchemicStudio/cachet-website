#!/usr/bin/env python3
"""One-off: add the keys the split documentation and the consent banner need.

Editing the seven catalogs by hand invites drift — a key added to one file and
forgotten in another, which `check_locales.py` would then flag as a failure.
This writes the same set of keys into every catalog in one pass, in the same
place, and leaves the existing entries untouched.

Kept as the record of the change; it is not part of the build.
"""
from __future__ import annotations

import json
from collections import OrderedDict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOCALES = ROOT / "i18n" / "locales"

DOCS_NAV = {
    "en": {
        "navTitle": "Sections",
        "navLead": "Each section is its own page. Read straight through, or go to the one you need.",
        "breadcrumb": "Breadcrumb",
        "pagerLabel": "Section navigation",
        "previous": "Previous",
        "next": "Next",
    },
    "fr": {
        "navTitle": "Sections",
        "navLead": "Chaque section est une page à part entière. Lisez-les à la suite, ou allez droit à celle qu'il vous faut.",
        "breadcrumb": "Fil d'Ariane",
        "pagerLabel": "Navigation entre les sections",
        "previous": "Précédent",
        "next": "Suivant",
    },
    "nl": {
        "navTitle": "Onderdelen",
        "navLead": "Elk onderdeel is een eigen pagina. Lees ze achter elkaar, of ga meteen naar wat u zoekt.",
        "breadcrumb": "Kruimelpad",
        "pagerLabel": "Navigatie tussen onderdelen",
        "previous": "Vorige",
        "next": "Volgende",
    },
    "de": {
        "navTitle": "Abschnitte",
        "navLead": "Jeder Abschnitt ist eine eigene Seite. Lesen Sie der Reihe nach, oder gehen Sie direkt zu dem, was Sie brauchen.",
        "breadcrumb": "Brotkrumenpfad",
        "pagerLabel": "Navigation zwischen den Abschnitten",
        "previous": "Zurück",
        "next": "Weiter",
    },
    "es": {
        "navTitle": "Secciones",
        "navLead": "Cada sección es una página propia. Léalas seguidas, o vaya directamente a la que necesite.",
        "breadcrumb": "Ruta de navegación",
        "pagerLabel": "Navegación entre secciones",
        "previous": "Anterior",
        "next": "Siguiente",
    },
    "pt": {
        "navTitle": "Secções",
        "navLead": "Cada secção é uma página própria. Leia-as de seguida, ou vá directamente à que precisa.",
        "breadcrumb": "Trilho de navegação",
        "pagerLabel": "Navegação entre secções",
        "previous": "Anterior",
        "next": "Seguinte",
    },
    "it": {
        "navTitle": "Sezioni",
        "navLead": "Ogni sezione è una pagina a sé. Le legga di seguito, oppure vada direttamente a quella che le serve.",
        "breadcrumb": "Percorso di navigazione",
        "pagerLabel": "Navigazione tra le sezioni",
        "previous": "Precedente",
        "next": "Successivo",
    },
}

DESCRIPTIONS = {
    "en": {
        "features": "What Cachet does, point by point: whole batches at once, three signing modes, PAdES levels, template validation and output verified on the spot.",
        "modes": "The eID card, an Azure Key Vault certificate or a plain image stamp — what each one requires, and what legal weight it carries.",
        "walkthrough": "The eight steps of the graphical wizard, from choosing a template to reading the report, with a screenshot of each.",
        "cli": "The console tool: the commands most batches need, and the options behind them.",
        "levels": "PAdES b-b, b-t, b-lt and b-lta — what each level adds, and which ones need network access.",
        "tiers": "Simple, advanced and qualified signatures under eIDAS, and which one your documents actually need.",
        "requirements": "What each mode needs at runtime: middleware and a card reader, outbound network access, or nothing at all.",
        "install": "Download a standalone build for Linux or Windows, or run Cachet from source.",
        "glossary": "The terms Cachet uses, from PAdES and LTV to the national register number embedded in every eID signature.",
        "sources": "The standards and services the signatures rest on, with links to the original documents.",
        "legal": "What to know before you sign: the national register number, free versus qualified timestamps, and the limits of an advanced signature.",
    },
    "fr": {
        "features": "Ce que fait Cachet, point par point : des lots entiers d'un coup, trois modes de signature, les niveaux PAdES, la validation par modèle et un résultat vérifié sur-le-champ.",
        "modes": "La carte eID, un certificat Azure Key Vault ou un simple tampon image — ce que chacun exige, et la portée juridique qu'il confère.",
        "walkthrough": "Les huit étapes de l'assistant graphique, du choix du modèle à la lecture du rapport, avec une capture d'écran de chacune.",
        "cli": "L'outil en ligne de commande : les commandes dont la plupart des lots ont besoin, et les options qui les accompagnent.",
        "levels": "PAdES b-b, b-t, b-lt et b-lta — ce que chaque niveau ajoute, et lesquels nécessitent un accès réseau.",
        "tiers": "Signatures simple, avancée et qualifiée au sens d'eIDAS, et celle dont vos documents ont réellement besoin.",
        "requirements": "Ce dont chaque mode a besoin à l'exécution : middleware et lecteur de cartes, accès réseau sortant, ou rien du tout.",
        "install": "Téléchargez un exécutable autonome pour Linux ou Windows, ou lancez Cachet depuis les sources.",
        "glossary": "Les termes employés par Cachet, de PAdES et LTV au numéro de registre national inscrit dans chaque signature eID.",
        "sources": "Les normes et services sur lesquels reposent les signatures, avec des liens vers les documents d'origine.",
        "legal": "À savoir avant de signer : le numéro de registre national, horodatage gratuit ou qualifié, et les limites d'une signature avancée.",
    },
    "nl": {
        "features": "Wat Cachet doet, punt voor punt: volledige batches in één keer, drie ondertekenmodi, PAdES-niveaus, validatie tegen een sjabloon en meteen geverifieerde uitvoer.",
        "modes": "De eID-kaart, een certificaat uit Azure Key Vault of een eenvoudige afbeeldingsstempel — wat elk ervan vraagt, en welk juridisch gewicht het draagt.",
        "walkthrough": "De acht stappen van de grafische assistent, van het kiezen van een sjabloon tot het lezen van het rapport, met van elke stap een schermafbeelding.",
        "cli": "Het console-programma: de opdrachten die de meeste batches nodig hebben, en de opties erachter.",
        "levels": "PAdES b-b, b-t, b-lt en b-lta — wat elk niveau toevoegt, en welke netwerktoegang vragen.",
        "tiers": "Eenvoudige, geavanceerde en gekwalificeerde handtekeningen volgens eIDAS, en welke uw documenten werkelijk nodig hebben.",
        "requirements": "Wat elke modus nodig heeft tijdens het draaien: middleware en een kaartlezer, uitgaande netwerktoegang, of helemaal niets.",
        "install": "Download een zelfstandige build voor Linux of Windows, of draai Cachet vanaf de broncode.",
        "glossary": "De termen die Cachet gebruikt, van PAdES en LTV tot het rijksregisternummer dat in elke eID-handtekening zit.",
        "sources": "De normen en diensten waarop de handtekeningen steunen, met links naar de oorspronkelijke documenten.",
        "legal": "Wat u moet weten voor u ondertekent: het rijksregisternummer, gratis tegenover gekwalificeerde tijdstempels, en de grenzen van een geavanceerde handtekening.",
    },
    "de": {
        "features": "Was Cachet leistet, Punkt für Punkt: ganze Stapel auf einmal, drei Signaturmodi, PAdES-Stufen, Prüfung gegen eine Vorlage und sofort verifizierte Ausgabe.",
        "modes": "Der eID-Ausweis, ein Zertifikat aus Azure Key Vault oder ein schlichter Bildstempel — was jedes verlangt und welches rechtliche Gewicht es trägt.",
        "walkthrough": "Die acht Schritte des grafischen Assistenten, von der Wahl der Vorlage bis zum Bericht, mit einem Bildschirmfoto zu jedem.",
        "cli": "Das Konsolenprogramm: die Befehle, die die meisten Stapel brauchen, und die Optionen dahinter.",
        "levels": "PAdES b-b, b-t, b-lt und b-lta — was jede Stufe ergänzt und welche Netzwerkzugang benötigen.",
        "tiers": "Einfache, fortgeschrittene und qualifizierte Signaturen nach eIDAS, und welche Ihre Dokumente tatsächlich brauchen.",
        "requirements": "Was jeder Modus zur Laufzeit benötigt: Middleware und Kartenlesegerät, ausgehenden Netzwerkzugang oder gar nichts.",
        "install": "Laden Sie ein eigenständiges Programm für Linux oder Windows herunter, oder führen Sie Cachet aus dem Quellcode aus.",
        "glossary": "Die Begriffe, die Cachet verwendet — von PAdES und LTV bis zur Nationalregisternummer in jeder eID-Signatur.",
        "sources": "Die Normen und Dienste, auf denen die Signaturen beruhen, mit Verweisen auf die Originaldokumente.",
        "legal": "Was Sie vor dem Signieren wissen sollten: die Nationalregisternummer, kostenlose gegenüber qualifizierten Zeitstempeln und die Grenzen einer fortgeschrittenen Signatur.",
    },
    "es": {
        "features": "Qué hace Cachet, punto por punto: lotes enteros de una vez, tres modos de firma, niveles PAdES, validación con plantilla y resultado verificado en el acto.",
        "modes": "La tarjeta eID, un certificado de Azure Key Vault o un simple sello de imagen: qué exige cada uno y qué peso jurídico aporta.",
        "walkthrough": "Los ocho pasos del asistente gráfico, desde elegir una plantilla hasta leer el informe, con una captura de cada uno.",
        "cli": "La herramienta de consola: los comandos que necesita la mayoría de los lotes y las opciones que los acompañan.",
        "levels": "PAdES b-b, b-t, b-lt y b-lta: qué añade cada nivel y cuáles necesitan acceso a la red.",
        "tiers": "Firmas simple, avanzada y cualificada según eIDAS, y cuál necesitan realmente sus documentos.",
        "requirements": "Lo que necesita cada modo en ejecución: middleware y lector de tarjetas, acceso saliente a la red, o nada en absoluto.",
        "install": "Descargue un ejecutable autónomo para Linux o Windows, o ejecute Cachet desde el código fuente.",
        "glossary": "Los términos que emplea Cachet, de PAdES y LTV al número de registro nacional incrustado en cada firma eID.",
        "sources": "Las normas y servicios en los que se apoyan las firmas, con enlaces a los documentos originales.",
        "legal": "Lo que conviene saber antes de firmar: el número de registro nacional, sellos de tiempo gratuitos frente a cualificados, y los límites de una firma avanzada.",
    },
    "pt": {
        "features": "O que o Cachet faz, ponto por ponto: lotes inteiros de uma vez, três modos de assinatura, níveis PAdES, validação por modelo e resultado verificado no momento.",
        "modes": "O cartão eID, um certificado do Azure Key Vault ou um simples carimbo de imagem: o que cada um exige e que peso jurídico confere.",
        "walkthrough": "Os oito passos do assistente gráfico, desde escolher um modelo até ler o relatório, com uma captura de ecrã de cada um.",
        "cli": "A ferramenta de consola: os comandos de que a maioria dos lotes precisa e as opções que os acompanham.",
        "levels": "PAdES b-b, b-t, b-lt e b-lta: o que cada nível acrescenta e quais precisam de acesso à rede.",
        "tiers": "Assinaturas simples, avançada e qualificada segundo o eIDAS, e qual delas os seus documentos realmente precisam.",
        "requirements": "O que cada modo precisa em execução: middleware e leitor de cartões, acesso de saída à rede, ou nada.",
        "install": "Transfira um executável autónomo para Linux ou Windows, ou execute o Cachet a partir do código-fonte.",
        "glossary": "Os termos que o Cachet usa, de PAdES e LTV ao número de registo nacional incorporado em cada assinatura eID.",
        "sources": "As normas e os serviços em que as assinaturas assentam, com ligações aos documentos originais.",
        "legal": "O que saber antes de assinar: o número de registo nacional, selos temporais gratuitos face a qualificados, e os limites de uma assinatura avançada.",
    },
    "it": {
        "features": "Che cosa fa Cachet, punto per punto: interi blocchi in una volta, tre modalità di firma, livelli PAdES, convalida su modello e risultato verificato sul momento.",
        "modes": "La carta eID, un certificato di Azure Key Vault o un semplice timbro immagine: che cosa richiede ciascuno e quale peso giuridico porta.",
        "walkthrough": "Gli otto passi della procedura guidata grafica, dalla scelta del modello alla lettura del rapporto, con una schermata di ciascuno.",
        "cli": "Lo strumento da console: i comandi di cui la maggior parte dei blocchi ha bisogno e le opzioni che li accompagnano.",
        "levels": "PAdES b-b, b-t, b-lt e b-lta: che cosa aggiunge ogni livello e quali richiedono l'accesso alla rete.",
        "tiers": "Firme semplice, avanzata e qualificata secondo eIDAS, e quale serve davvero ai suoi documenti.",
        "requirements": "Ciò di cui ogni modalità ha bisogno in esecuzione: middleware e lettore di carte, accesso in uscita alla rete, oppure nulla.",
        "install": "Scarichi un eseguibile autonomo per Linux o Windows, oppure esegua Cachet dal codice sorgente.",
        "glossary": "I termini usati da Cachet, da PAdES e LTV al numero di registro nazionale incorporato in ogni firma eID.",
        "sources": "Le norme e i servizi su cui poggiano le firme, con i collegamenti ai documenti originali.",
        "legal": "Che cosa sapere prima di firmare: il numero di registro nazionale, marche temporali gratuite o qualificate, e i limiti di una firma avanzata.",
    },
}

SHOTS = {
    "en": {"viewFullSize": 'Open "{title}" at full size', "fullSize": "Full size"},
    "fr": {"viewFullSize": "Ouvrir « {title} » en taille réelle", "fullSize": "Taille réelle"},
    "nl": {"viewFullSize": "'{title}' op volledige grootte openen", "fullSize": "Volledige grootte"},
    "de": {"viewFullSize": "„{title}“ in voller Größe öffnen", "fullSize": "Volle Größe"},
    "es": {"viewFullSize": "Abrir «{title}» a tamaño completo", "fullSize": "Tamaño completo"},
    "pt": {"viewFullSize": "Abrir «{title}» em tamanho real", "fullSize": "Tamanho real"},
    "it": {"viewFullSize": "Apri «{title}» a dimensione intera", "fullSize": "Dimensione intera"},
}

CONSENT = {
    "en": {
        "title": "May we count your visit?",
        "body": "We would like to use Google Analytics to see which pages get read, and in which languages. Nothing is loaded and no cookie is set unless you agree — and you can change your mind at any time from the bottom of any page.",
        "accept": "Agree",
        "decline": "No thanks",
        "manage": "Analytics choice",
    },
    "fr": {
        "title": "Pouvons-nous compter votre visite ?",
        "body": "Nous aimerions utiliser Google Analytics pour savoir quelles pages sont lues, et dans quelles langues. Rien n'est chargé et aucun cookie n'est déposé sans votre accord — et vous pouvez changer d'avis à tout moment depuis le bas de n'importe quelle page.",
        "accept": "J'accepte",
        "decline": "Non merci",
        "manage": "Choix analytique",
    },
    "nl": {
        "title": "Mogen we uw bezoek meetellen?",
        "body": "We zouden Google Analytics willen gebruiken om te zien welke pagina's gelezen worden, en in welke talen. Er wordt niets geladen en geen cookie geplaatst zonder uw akkoord — en u kunt onderaan elke pagina van gedachten veranderen.",
        "accept": "Akkoord",
        "decline": "Nee, bedankt",
        "manage": "Keuze over statistieken",
    },
    "de": {
        "title": "Dürfen wir Ihren Besuch zählen?",
        "body": "Wir würden gerne Google Analytics verwenden, um zu sehen, welche Seiten gelesen werden und in welchen Sprachen. Ohne Ihre Zustimmung wird nichts geladen und kein Cookie gesetzt — und Sie können es am Fuß jeder Seite jederzeit widerrufen.",
        "accept": "Einverstanden",
        "decline": "Nein danke",
        "manage": "Analyse-Einstellung",
    },
    "es": {
        "title": "¿Podemos contar su visita?",
        "body": "Nos gustaría usar Google Analytics para ver qué páginas se leen y en qué idiomas. No se carga nada ni se instala ninguna cookie sin su acuerdo, y puede cambiar de opinión en cualquier momento al pie de cualquier página.",
        "accept": "De acuerdo",
        "decline": "No, gracias",
        "manage": "Preferencia de analítica",
    },
    "pt": {
        "title": "Podemos contar a sua visita?",
        "body": "Gostaríamos de usar o Google Analytics para ver que páginas são lidas e em que idiomas. Nada é carregado nem é colocado qualquer cookie sem o seu acordo — e pode mudar de ideias a qualquer momento no fundo de qualquer página.",
        "accept": "Aceito",
        "decline": "Não, obrigado",
        "manage": "Escolha de estatísticas",
    },
    "it": {
        "title": "Possiamo contare la sua visita?",
        "body": "Vorremmo usare Google Analytics per sapere quali pagine vengono lette e in quali lingue. Senza il suo accordo non viene caricato nulla e non viene installato alcun cookie — e può cambiare idea in qualsiasi momento in fondo a ogni pagina.",
        "accept": "Accetto",
        "decline": "No, grazie",
        "manage": "Scelta sulle statistiche",
    },
}


def main() -> int:
    for path in sorted(LOCALES.glob("*.json")):
        locale = path.stem
        data = json.loads(path.read_text(encoding="utf-8"), object_pairs_hook=OrderedDict)

        docs = data["docs"]
        # `toc` addressed a table of contents on a single page; the sections are
        # pages of their own now and the sidebar heading replaces it.
        docs.pop("toc", None)
        docs.update(DOCS_NAV[locale])
        docs["descriptions"] = OrderedDict(DESCRIPTIONS[locale])
        docs["walkthrough"].update(SHOTS[locale])

        data["consent"] = OrderedDict(CONSENT[locale])

        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"  {path.name}: +{len(DOCS_NAV[locale]) + len(DESCRIPTIONS[locale]) + len(SHOTS[locale]) + len(CONSENT[locale])} keys")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
