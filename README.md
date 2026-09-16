# Lernraum-App

Webanwendung zur schnellen Suche nach verfügbaren Lernräumen an der Hochschule Kaiserslautern.

Das Projekt entsteht im Rahmen von **Projekt 1** im Studiengang Wirtschaftsinformatik. Ziel ist es, Studierenden eine einfache Möglichkeit zu geben, verfügbare Lernräume und freie Plätze zu finden, ohne mehrere Räume vor Ort überprüfen zu müssen.

## Projektziel

Die Anwendung soll Studierenden ermöglichen, schnell einen verfügbaren Lernraum zu finden und mit möglichst wenig Aufwand eine Sitzung zu starten.

Der zentrale Nutzungsablauf ist:

```text
Lernräume
    ↓
Raumdetails
    ↓
QR-Code scannen
    ↓
Check-in
    ↓
Aktive Sitzung
    ↓
Check-out
```

Die Anzahl der freien Plätze wird dynamisch anhand der aktuell aktiven Sitzungen berechnet.

## Aktueller Stand

Die technische Grundstruktur sowie der erste vollständige Nutzungsablauf sind implementiert.

Der aktuelle Datenfluss ist:

```text
PostgreSQL
    ↓
Prisma ORM
    ↓
NestJS Backend
    ↓
REST API
    ↓
Next.js Frontend
    ↓
Browser
```

Lernraum- und Sitzungsdaten werden in PostgreSQL gespeichert, über Prisma im NestJS-Backend verarbeitet und über REST-Endpunkte an das Next.js-Frontend übertragen.

## Technologien

### Frontend

- Next.js
- TypeScript
- Tailwind CSS

### Backend

- NestJS
- TypeScript
- Prisma ORM

### Datenbank

- PostgreSQL
- Docker

### Weitere geplante Technologien

- WebSocket für Echtzeit-Aktualisierungen
- NestJS Scheduler für automatische Sitzungsbeendigung
- NFC als primärer Check-in

## Projektstruktur

```text
lernraum-app/
├── backend/            # NestJS, Prisma und REST API
├── frontend/           # Next.js Benutzeroberfläche
└── docker-compose.yml  # Lokale PostgreSQL-Datenbank
```

## Bereits umgesetzt

- Next.js-Frontend
- NestJS-Backend
- PostgreSQL lokal über Docker
- Prisma-Anbindung an PostgreSQL
- Prisma-Migrationen
- Datenmodelle für Lernräume und Sitzungen
- PrismaService und PrismaModule
- RoomsModule, RoomsController und RoomsService
- SessionsModule, SessionsController und SessionsService
- REST-Endpunkte für Lernräume und Sitzungen
- responsive Lernraumübersicht
- Raumdetailseite
- Anzeige von Raumbezeichnung, Gebäude, Etage und Gesamtkapazität
- dynamische Berechnung und Anzeige freier Plätze
- QR-Code-basierter Check-in
- Validierung des Raum-Tokens
- anonyme Sitzungszuordnung über eine lokale `clientId`
- Prüfung zentraler Check-in-Regeln
- Erfolgs- und Fehlermeldungen beim Check-in
- automatische Weiterleitung zur aktiven Sitzung nach erfolgreichem Check-in
- Anzeige der aktiven Sitzung
- Anzeige von Check-in-Zeit, automatischem Sitzungsende und verbleibender Zeit
- dynamische Navigation abhängig von einer aktiven Sitzung
- Check-out einer aktiven Sitzung
- automatische Freigabe des belegten Platzes nach Check-out
- Rückleitung zur Lernraumübersicht nach dem Check-out

## Aktuelle API-Endpunkte

### Lernräume

```text
GET /rooms
GET /rooms/:id
```

### Sitzungen

```text
POST /sessions/check-in
GET  /sessions/current/:clientId
POST /sessions/check-out
```

## Check-in

Beim Check-in wird der QR-Code des jeweiligen Lernraums gescannt.

Der QR-Code enthält einen eindeutigen `raumToken`, der vom Backend validiert wird.

Zusätzlich wird eine lokal erzeugte anonyme `clientId` verwendet, um eine Sitzung einem Browser bzw. Gerät zuzuordnen.

Beim Check-in werden unter anderem folgende Regeln geprüft:

- der Raum-Token muss gültig sein
- der Lernraum muss aktiv sein
- es muss mindestens ein freier Platz vorhanden sein
- die maximale Raumkapazität darf nicht überschritten werden
- ein Client darf maximal eine aktive Sitzung besitzen

Nach einem erfolgreichen Check-in wird eine neue Sitzung erstellt und die Anzahl der freien Plätze entsprechend reduziert.

Anschließend wird der Nutzer automatisch zur aktiven Sitzung weitergeleitet.

## Aktive Sitzung

Nach einem erfolgreichen Check-in wird die Seite **„Aktuelle Sitzung“** verfügbar.

Dort werden folgende Informationen angezeigt:

- Raumbezeichnung
- Gebäude
- Etage
- Sitzungsstatus
- Check-in-Zeit
- automatisches Sitzungsende
- verbleibende Sitzungszeit

Die aktuelle Sitzungsdauer beträgt im Prototyp **120 Minuten**.

Über den Button **„Auschecken“** kann die aktive Sitzung beendet werden. Anschließend wird der zuvor belegte Platz wieder freigegeben und der Nutzer zur Lernraumübersicht zurückgeleitet.

Der Button **„Aufenthalt verlängern“** ist bereits in der Benutzeroberfläche vorhanden. Die zugehörige Logik wird in einem späteren Entwicklungsschritt umgesetzt.

## Dynamische Navigation

Die Navigation richtet sich nach dem aktuellen Sitzungsstatus.

Ohne aktive Sitzung:

```text
Lernräume | Besuche
```

Mit aktiver Sitzung:

```text
Lernräume | Aktuelle Sitzung | Besuche
```

Nach einem Check-out verschwindet der Navigationspunkt **„Aktuelle Sitzung“** automatisch wieder.

## Anonyme Nutzung

Studierende können die Anwendung ohne Registrierung und ohne Login verwenden.

Für die technische Zuordnung einer Sitzung wird eine anonyme Kennung im Browser erzeugt und über `localStorage` gespeichert.

```text
lernraum-client-id
```

Diese Kennung wird beim Check-in sowie beim Abrufen und Beenden einer aktiven Sitzung verwendet.

Ein späterer Administratorbereich wird separat geschützt.

## Noch geplanter Funktionsumfang

- NFC als primärer Check-in
- Verlängerung einer aktiven Sitzung
- automatische Beendigung abgelaufener Sitzungen
- Erinnerung vor Ablauf einer Sitzung
- Echtzeit-Aktualisierung der Belegung über WebSocket
- Raumwechsel
- Ausblenden vollständig belegter Räume
- geschützter Administratorbereich

## Lokale Entwicklung

### PostgreSQL starten

Im Projektverzeichnis:

```bash
docker compose up -d
```

Die lokale PostgreSQL-Datenbank läuft derzeit über Port:

```text
5434
```

### Backend starten

```bash
cd backend
npm install
npm run start:dev
```

Das Backend läuft lokal auf:

```text
http://localhost:3002
```

### Frontend starten

```bash
cd frontend
npm install
npm run dev
```

## Aktuelle Projektphase

### Woche 5 – Raumdetails, Check-in und aktive Sitzung

In Woche 5 wurde erstmals ein vollständiger Kernablauf der Anwendung umgesetzt:

```text
Lernraumübersicht
    ↓
Raumdetails
    ↓
QR-Code-basierter Check-in
    ↓
Sitzung erstellen
    ↓
Aktuelle Sitzung anzeigen
    ↓
Check-out
    ↓
Platz wieder freigeben
```

Damit ist erstmals ein vollständiger realer Ablauf von der Auswahl eines Lernraums bis zum Beenden einer Sitzung demonstrierbar.

## Ziel

Am Ende des Projekts soll ein Studierender innerhalb kurzer Zeit erkennen können, welcher Lernraum aktuell freie Plätze bietet, den Raum auswählen und dort mit möglichst wenig Aufwand einchecken können.

Die Anwendung soll dabei einfach, mobil nutzbar und ohne verpflichtende Registrierung verwendbar sein.
