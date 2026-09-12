# Lernraum-App

Webanwendung zur schnellen Suche nach verfügbaren Lernräumen an der Hochschule Kaiserslautern.

Das Projekt entsteht im Rahmen von Projekt 1 im Studiengang Wirtschaftsinformatik. Ziel ist es, Studierenden eine einfache Möglichkeit zu geben, freie Lernräume und verfügbare Plätze zu finden, ohne mehrere Räume vor Ort überprüfen zu müssen.

## Aktueller Stand

Die technische Grundstruktur der Anwendung ist eingerichtet.

Der aktuelle Datenfluss funktioniert bereits vollständig:

```text
PostgreSQL
    ↓
Prisma
    ↓
NestJS
    ↓
REST API
    ↓
Next.js
    ↓
Browser
Lernraumdaten werden in PostgreSQL gespeichert, über Prisma im NestJS-Backend gelesen und über eine REST-Schnittstelle an das Next.js-Frontend übertragen.

Technologien
Frontend
Next.js
TypeScript
Tailwind CSS
Backend
NestJS
TypeScript
Prisma ORM
Datenbank
PostgreSQL
Docker
Weitere geplante Technologien
WebSocket für Echtzeit-Aktualisierungen
NestJS Scheduler für automatisches Check-out
NFC als primärer Check-in
QR-Code als Fallback
Projektstruktur
lernraum-app/
├── backend/            # NestJS, Prisma und REST API
├── frontend/           # Next.js Benutzeroberfläche
└── docker-compose.yml  # Lokale PostgreSQL-Datenbank
Bereits umgesetzt
Next.js-Frontend eingerichtet
NestJS-Backend eingerichtet
PostgreSQL lokal über Docker
Prisma mit PostgreSQL verbunden
erstes Datenmodell Lernraum
Prisma Migration
PrismaService und PrismaModule
RoomsModule, RoomsController und RoomsService
REST-Endpunkt GET /rooms
Testdaten über Prisma in PostgreSQL gespeichert
Lernraumdaten im Next.js-Frontend dargestellt
erste responsive Benutzeroberfläche mit Tailwind CSS
Geplanter Funktionsumfang

Die Anwendung soll später unter anderem folgende Funktionen enthalten:

Anzeige verfügbarer Lernräume
Anzeige von Kapazität, belegten und freien Plätzen
volle Räume werden nicht vorgeschlagen
anonyme Nutzung ohne Studenten-Login
Check-in über NFC
QR-Code als Fallback
Check-out
automatische Beendigung einer Sitzung
Verlängerung einer Sitzung
Raumwechsel
Echtzeit-Aktualisierung der Belegung
Erinnerungen vor Ablauf einer Sitzung
separater geschützter Administratorbereich
Anonyme Nutzung

Studierende sollen die Anwendung ohne Registrierung und ohne Login verwenden können.

Für die technische Zuordnung einer Sitzung ist eine lokal erzeugte anonyme Kennung vorgesehen.

Der Administratorbereich wird separat geschützt und verwendet eine Login-Kennung und ein Passwort.

Lokale Entwicklung
PostgreSQL starten

Im Projektverzeichnis:
docker compose up -d
Die lokale PostgreSQL-Datenbank läuft derzeit über Port:
5434
Backend starten
cd backend
npm install
npm run start:dev
Frontend starten
cd frontend
npm install
npm run dev
Aktuelle Projektphase
Woche 4 – Technische Grundstruktur und erste Implementierung

Schwerpunkt dieser Phase:

Projektstruktur
Datenbankanbindung
Prisma
REST API
Verbindung zwischen Backend und Frontend
erste Darstellung realer Daten im Browser

Funktionen wie Check-in, NFC, WebSocket, Scheduler und Admin-Verwaltung werden in späteren Projektphasen implementiert.

Ziel

Am Ende soll ein Studierender schnell erkennen können, welcher Lernraum aktuell freie Plätze bietet, und dort mit möglichst wenig Aufwand einchecken können.
```
