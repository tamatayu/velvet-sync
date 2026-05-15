# VelvetSync

**VelvetSync** ist eine moderne, modulare Erotik-AI-Plattform mit integrierter The-Handy-Steuerung. Das Projekt kombiniert immersives Rollenspiel, intelligente Modus-Steuerung und eine saubere, erweiterbare Architektur.

---

## Aktueller Stand (Mai 2026)

### ✅ Fertig
- Clean Architecture (Node.js + Express + TypeScript + Vue 3 + Socket.io)
- Ollama-Integration (`dolphin-llama3:8b`)
- Verbesserter System-Prompt (streng, JSON-only, gender-sicher)
- **Profil-System** (Anlegen, Wechseln, Löschen, pro Profil gespeichert)
- **Memory-System** (strukturierte Profile + Session-Summaries pro Profil)
- **Intent Classifier** (echte Absichtserkennung mit `llama3.2:3b`)
- **Mode Manager** + modulares Modus-System
  - `StopAndGoModule` (teilweise implementiert)
  - `EdgingModule` + `ChallengeModule` (Stubs)
- Confirmation Flow + automatische AI-Benachrichtigung bei Modus-Start
- Einstellungs-/Profil-Dialog beim Start

### 🚧 In Arbeit
- Vollständige Implementierung der Modi (StopAndGo, Edging, Challenge)
- Integration von Pattern Generator + The Handy

---

## Roadmap / ToDo

### Phase 1: Foundation (✅ größtenteils abgeschlossen)
- [x] Profil-System
- [x] Memory pro Profil
- [x] Intent Classifier
- [x] Mode Manager + Interface
- [x] Erste Modul-Struktur (StopAndGo, Edging, Challenge)

### Phase 2: Core Modi (nächster Fokus)
- [ ] `StopAndGoModule` vollständig fertigstellen
  - Phasensteuerung (Go/Stop)
  - Intensitätssteigerung über die Zeit
  - Milking-Logik (30 Sekunden Weiterlauf + zweiter Orgasmus)
- [ ] `EdgingModule` implementieren
- [ ] `ChallengeModule` / `StaminaModule` implementieren
- [ ] Mode-spezifische Phasen-Logik (z. B. Edge → Hold → Recovery)

### Phase 3: Hardware & Integration
- [ ] Pattern Generator (HSSP)
- [ ] The Handy Adapter (öffentliche API + HSSP)
- [ ] Shortcut-Buttons im Frontend während aktiven Modus
- [ ] AI wird während des Modus über aktuelle Phase informiert
- [ ] Not-Aus / Emergency Stop (öffentlich)

### Phase 4: Erweiterungen
- [ ] Performance-Tracking pro Profil (Durchhaltevermögen, Verbesserung)
- [ ] Weitere Modi (Fap Hero, Intercourse, Denial, etc.)
- [ ] Mehrere Personas (über Vanilla hinaus)
- [ ] Visuelle Darstellung (Avatar, Videos/Bilder zu Events)
- [ ] Bessere Mood-Progression (aktive Steuerung durch AI)

### Phase 5: Polish & Langfristig
- [ ] Vollständige Session-History pro Profil
- [ ] Bessere visuelle Bestätigung im Chat (farblich hervorgehoben)
- [ ] User kann während aktiven Modus die Kontrolle übernehmen (bei ausgewählten Modi)
- [ ] Backend-Persistenz (SQLite / Datei-basiert)
- [ ] Multi-User-Support (optional)

---

## Technische Architektur

- **Backend**: Node.js + Express + TypeScript + tsyringe (DI)
- **Frontend**: Vue 3 + Composition API + Pinia + Socket.io
- **LLM**: Ollama (`dolphin-llama3:8b` + `llama3.2:3b` für Classifier)
- **Modi**: Modulares System (`IModeModule` Interface)
- **Speicherung**: `localStorage` (Frontend) + JSON-Dateien (Backend)

---

## Schnellstart

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (neues Terminal)
cd frontend
npm install
npm run dev
```

---

## Nächste Priorität (Stand Mai 2026)

**Fokus**: Vollständige Implementierung des `StopAndGoModule` + Integration mit Pattern Generator.

---

*Letztes Update: Mai 2026*