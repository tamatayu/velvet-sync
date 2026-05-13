import { EventEmitter } from 'eventemitter3';
import { injectable } from 'tsyringe';
import { IEventBus, VelvetEvent, EventType } from '../interfaces';

@injectable()
export class EventBus implements IEventBus {
    private emitter = new EventEmitter();

    on(event: EventType | string, handler: (e: VelvetEvent) => void) {
        this.emitter.on(event, handler);
    }

    off(event: EventType | string, handler: (e: VelvetEvent) => void) {
        this.emitter.off(event, handler);
    }

    emit(event: VelvetEvent) {
        this.emitter.emit(event.type, event);
    }
}