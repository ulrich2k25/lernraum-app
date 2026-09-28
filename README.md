# Lernraum-App

Webanwendung zur schnellen Suche nach verfügbaren Lernräumen an der Hochschule Kaiserslautern.

Das Projekt entsteht im Rahmen von **Projekt 1** im Studiengang Wirtschaftsinformatik. Ziel ist es, Studierenden eine einfache und mobile Möglichkeit zu geben, verfügbare Lernräume und freie Plätze zu finden und sich direkt vor Ort einzuchecken.

## Projektziel

Studierende sollen innerhalb kurzer Zeit erkennen können, welche Lernräume aktuell verfügbar sind und wie viele freie Plätze dort noch vorhanden sind.

Der Check-in soll möglichst einfach, mobil und ohne verpflichtende Registrierung funktionieren.

Ein typischer Nutzungsablauf ist:

```text
Lernraum auswählen
        ↓
Raumdetails anzeigen
        ↓
QR-Code scannen
        ↓
Check-in
        ↓
Aktive Sitzung
        ↓
Check-out

Alternativ kann der QR-Code eines Lernraums direkt mit der normalen Smartphone-Kamera gescannt werden.

Hauptfunktionen
Lernräume
Übersicht verfügbarer Lernräume
Anzeige von Raumbezeichnung, Gebäude, Etage, Kapazität und freien Plätzen
Raumdetailseiten
dynamische Berechnung freier Plätze anhand aktiver Sitzungen
Unterstützung unterschiedlicher Raumstatus
Check-in

Es stehen zwei Check-in-Möglichkeiten zur Verfügung:

QR-Code-Scanner innerhalb der Lernraum-Anwendung
direkter Scan des Raum-QR-Codes mit der Smartphone-Kamera

Jeder Lernraum besitzt einen eindeutigen Raum-Token.

Beim Check-in prüft das Backend unter anderem:

ob der Raum existiert
ob der Raum aktiv ist
ob der Raum-Token gültig ist
ob noch freie Plätze vorhanden sind
ob bereits eine aktive Sitzung für den Nutzer besteht

Nach erfolgreichem Check-in wird der Nutzer automatisch zu seiner aktiven Sitzung weitergeleitet.

Sitzungsverwaltung

Eine aktive Sitzung enthält unter anderem:

Lernraum
Gebäude und Etage
Check-in-Zeit
automatisches Sitzungsende
verbleibende Sitzungszeit

Die aktuelle Sitzungsdauer beträgt 120 Minuten.

Abgelaufene Sitzungen werden automatisch beendet, damit keine alten Sitzungen dauerhaft aktiv bleiben.

Eine aktive Sitzung kann über „Aufenthalt verlängern“ um weitere 120 Minuten verlängert werden. Dabei bleibt dieselbe Sitzung bestehen und erhält eine neue Endzeit.

Über „Auschecken“ kann die Sitzung jederzeit manuell beendet werden. Der belegte Platz wird anschließend automatisch wieder freigegeben.

Für bestimmte Räume kann zusätzlich eine automatische Schließlogik aktiviert werden. Wenn keine aktive Sitzung mehr vorhanden ist, kann der Raum vorübergehend als geschlossen angezeigt werden.

Push-Benachrichtigungen

Nutzer können Push-Benachrichtigungen aktivieren.

Zehn Minuten vor dem automatischen Sitzungsende wird eine Erinnerung gesendet. Die Benachrichtigung kann auch empfangen werden, wenn die Anwendung nicht im Vordergrund geöffnet ist.

Wird eine Sitzung verlängert, wird der Erinnerungszeitpunkt entsprechend neu gesetzt. Nach einem vorherigen Check-out wird keine Erinnerung mehr versendet.

Installierbare Web-App

Die Lernraum-Anwendung ist als Progressive Web App (PWA) vorbereitet.

Dadurch kann sie auf unterstützten Smartphones auf dem Startbildschirm installiert und anschließend ähnlich wie eine normale App gestartet werden.

Umgesetzt wurden unter anderem:

Web-App-Manifest
Service Worker
App-Icons
Installationsfunktion innerhalb der Anwendung

Die Installation wurde auf Android erfolgreich getestet.

Admin-Bereich

Für die Verwaltung der Lernräume steht ein geschützter Administratorbereich zur Verfügung.

Administratoren können:

Lernräume anzeigen
neue Lernräume anlegen
bestehende Lernräume bearbeiten
Gebäude, Etage, Kapazität und Status verwalten
spezielle Raumregeln konfigurieren
QR-Codes für Lernräume erzeugen
QR-Codes als PDF ausgeben

Jeder neu angelegte Lernraum erhält automatisch einen eindeutigen Raum-Token.

QR-Codes

Jeder Lernraum besitzt einen eigenen QR-Code.

Der QR-Code verweist auf den direkten Check-in des jeweiligen Raums:

/check-in?roomToken=<RAUM_TOKEN>

Der Raum-Token bleibt grundsätzlich bestehen. Dadurch kann ein ausgedruckter QR-Code dauerhaft im jeweiligen Lernraum verwendet werden.

Über den Admin-Bereich kann der QR-Code jederzeit erneut angezeigt und als PDF ausgegeben werden.

Anonyme Nutzung

Studierende können die Anwendung ohne Registrierung und ohne Login verwenden.

Für die technische Zuordnung einer Sitzung wird eine anonyme Client-ID lokal im Browser gespeichert:

lernraum-client-id

Diese Kennung wird unter anderem für Check-in, aktive Sitzung, Verlängerung, Check-out und Push-Benachrichtigungen verwendet.

Der Administratorbereich ist davon getrennt und geschützt.

Architektur

Die Anwendung ist in Frontend, Backend und Datenbank getrennt aufgebaut.

Smartphone / Browser
        ↓
Next.js Frontend
        ↓
REST API
        ↓
NestJS Backend
        ↓
Prisma ORM
        ↓
PostgreSQL

Das Frontend übernimmt die Benutzeroberfläche. Das Backend steuert die Geschäftslogik, Sitzungsverwaltung und Datenverarbeitung.

Die Daten werden über Prisma in PostgreSQL gespeichert.

Technologie-Stack
Frontend
Next.js
React
TypeScript
Tailwind CSS
Progressive Web App
Service Worker
Web Push
Backend
NestJS
TypeScript
Prisma ORM
NestJS Scheduler
Web Push
Datenbank und Infrastruktur
PostgreSQL
Docker
Weitere Werkzeuge
Git
GitHub
QR-Code-Generierung
PDF-Generierung

Projektstruktur
lernraum-app/
├── backend/            # NestJS, Prisma und Backend-Logik
├── frontend/           # Next.js Benutzeroberfläche
├── docker-compose.yml  # Lokale PostgreSQL-Datenbank
└── README.md

Wichtige API-Endpunkte

Lernräume
GET /rooms
GET /rooms/:id
GET /rooms/by-token/:roomToken

Sitzungen
POST /sessions/check-in
GET  /sessions/current/:clientId
POST /sessions/check-out
POST /sessions/extend
Push-Benachrichtigungen
GET  /push-notifications/public-key
POST /push-notifications/subscribe

Administration
Für die Raumverwaltung stehen geschützte Admin-Endpunkte zur Verfügung, unter anderem für:

Anzeigen von Lernräumen
Erstellen neuer Lernräume
Bearbeiten bestehender Lernräume
Ändern von Raumstatus und Raumkonfiguration
Lokale Entwicklung
Voraussetzungen

Für die lokale Entwicklung werden benötigt:

Node.js
npm
Docker
Git
PostgreSQL starten

Im Hauptverzeichnis:

docker compose up -d

Die PostgreSQL-Datenbank läuft lokal über Port:

5434
Backend starten
cd backend
npm install
npm run start:dev

Das Backend läuft standardmäßig auf:

http://localhost:3002
Frontend starten

In einem zweiten Terminal:

cd frontend
npm install
npm run dev

Das Frontend läuft lokal über den konfigurierten Next.js-Port.

Aktueller Entwicklungsstand

Der zentrale Nutzungsablauf ist funktionsfähig. Zusätzlich stehen bereits ein geschützter Admin-Bereich, automatische Sitzungsbeendigung, Sitzungsverlängerung, Push-Benachrichtigungen und die Installation als Web-App zur Verfügung.

Das Projekt befindet sich weiterhin in aktiver Entwicklung.

Geplante Erweiterungen

Zu den nächsten geplanten Erweiterungen gehören unter anderem:

Besuchshistorie vergangener Sitzungen
Echtzeit-Aktualisierungen über WebSocket
NFC-basierter Check-in
Raumwechsel
weitere Optimierung der mobilen Nutzung

Projektkontext

Dieses Projekt wird im Rahmen von Projekt 1 im Studiengang Wirtschaftsinformatik an der Hochschule Kaiserslautern entwickelt.

Der Schwerpunkt liegt auf der Konzeption und prototypischen Umsetzung einer mobilen Webanwendung zur besseren Nutzung vorhandener Lernräume.
```
