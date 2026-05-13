export type EventType =
    | 'chat_message'
    | 'toy_command'
    | 'mode_started'
    | 'edge_detected'
    | 'orgasm'
    | 'mood_changed'
    | 'visual_change';

export interface VelvetEvent {
    id: string;
    type: EventType;
    timestamp: Date;
    sessionId: string;
    payload: any;
    source: 'user' | 'ai' | 'system' | 'toy';
}