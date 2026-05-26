import { singleton }        from 'tsyringe';
import { HandyAdapter }     from '../adapters';

@singleton()
export class DeviceService {

    private adapter : HandyAdapter|null;

    constructor() {
        this.adapter = null;
    }

    public async init( apiKey: string ): Promise<boolean> {
        const adapter = new HandyAdapter(apiKey);

        const status = await adapter.getStatus();
        if ( status ) {
            this.adapter = adapter;
            return true;
        }
        return false;
    }
}