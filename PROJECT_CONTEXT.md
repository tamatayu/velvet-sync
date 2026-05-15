# VelvetSync - Projekt Kontext (Mai 2026)

## Projekt-Ziel
VelvetSync ist eine **modulare Erotik-AI-Plattform** mit The-Handy-Integration. Ziel ist ein immersives Sexting-Erlebnis mit verschiedenen Modi (Edging, Stop&Go, Challenge etc.), bei dem die AI die Kontrolle über den Stroker übernimmt.

## Aktueller Architektur-Stand

### Tech-Stack
- **Backend**: Node.js + Express + TypeScript + tsyringe (DI) + Socket.io
- **Frontend**: Vue 3 + Pinia + Socket.io Client
- **LLM**: Ollama (`dolphin-llama3:8b` + `llama3.2:3b` für Intent Classifier)
- **Modi**: Modulares System mit `IModeModule` Interface

### Wichtige Komponenten (fertig oder weit fortgeschritten)
- **Profil-System** (Name, Geschlecht, Persona pro Profil)
- **Memory-System** (strukturierte Profile + Session-Summaries pro Profil)
- **Intent Classifier** (echte Absichtserkennung mit kleinem Modell)
- **Mode Manager** + 3 Module:
  - `StopAndGoModule` (teilweise implementiert)
  - `EdgingModule` + `ChallengeModule` (Stubs)
- **Confirmation Flow** + automatische AI-Benachrichtigung bei Modus-Start
- Zentrale Socket-Verbindung (in `main.ts`)

### Wichtige Design-Entscheidungen
- **Modulare Modi**: Jeder Modus ist ein eigenständiges Modul mit einheitlichem Interface
- **AI-Kontrolle**: In Edging-ähnlichen Modi hat die AI volle Kontrolle (User kann nicht übernehmen)
- **Milking-Feature**: Verfügbar in allen Modi (intensives finales Script + 30 Sekunden Weiterlauf)
- **Guard gegen doppelte Verbindungen**: Socket wird nur einmal erstellt

## Aktueller Fokus (Stand 15. Mai 2026)
- Verbindungsprobleme mit Socket.io (15–30 Sekunden Verzögerung) → wird aktuell untersucht
- Vollständige Implementierung des `StopAndGoModule`
- Integration von Pattern Generator + The Handy

## Nächste Prioritäten
1. `StopAndGoModule` fertigstellen (Phasen, Intensitätssteigerung, Milking-Logik)
2. `EdgingModule` implementieren
3. Pattern Generator + HandyAdapter

## Wichtige Dateien
- `backend/src/services/ModeManager.ts`
- `backend/src/modes/StopAndGoModule.ts`
- `frontend/src/stores/chat.ts` (Socket-Logik)
- `backend/src/infrastructure/server.ts` (Socket.io Server)

### Wichtige Design-Entscheidungen

- **Modulare Modi**: Jeder Modus ist ein eigenständiges Modul mit einheitlichem Interface
- **AI-Kontrolle**: In Edging-ähnlichen Modi hat die AI volle Kontrolle (User kann nicht übernehmen)

**Zentrale AI-Regel (neu – Stand 15. Mai 2026):**
> Die **AI Persona muss immer** auf Nutzereingaben reagieren — egal ob:
> - Normale Chat-Nachricht
> - Shortcut-Signal ("close", "orgasm", "milking", etc.)
> - Antwort auf eine AI-Frage (auch bei Timeout)
> - Wechsel in eine andere Phase oder einen anderen Modus (z. B. Verlängerung, Finale Phase)
>
> **Ausnahme:** Nur interne, automatisch wiederholte Phasenwechsel des Modus selbst (z. B. ständiger Wechsel zwischen GO ↔ STOP im StopAndGoModule).

---
*Stand: 15. Mai 2026 – Wird bei jedem neuen Chat mitgegeben*