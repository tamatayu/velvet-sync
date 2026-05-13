export interface IEventBus {
    on(event: EventType | string, handler: (event: VelvetEvent) => void): void;
    off(event: EventType | string, handler: (event: VelvetEvent) => void): void;
    emit(event: VelvetEvent): void;
}