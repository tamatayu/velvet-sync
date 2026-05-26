import axios                        from 'axios';
import { type AxiosInstance }       from 'axios';
import { handyConfig }              from '../config/handy.config';
import { logger }                   from '../infrastructure/server';

export class HandyAdapter {
    protected readonly apiKey         : string;
    protected readonly baseUrl        : string;
    protected readonly http           : AxiosInstance;

    protected lastHSTPSync            : HSTPSyncSnapshot | null;         // Time sync (HSTP)
    protected lastEstimatedServerTime : number | null;

    constructor( apiKey: string ) {
        this.apiKey     = apiKey;
        this.baseUrl    = handyConfig.apiUrl.endsWith('/') ? handyConfig.apiUrl : `${handyConfig.apiUrl}/`;
        this.http       = axios.create({
            timeout         : 10_000,
            headers         : { 'Content-Type': 'application/json' },
        });

        this.lastHSTPSync               = null;
        this.lastEstimatedServerTime    = null;
    }

    /**
     * Validate the connection key by calling the Handy `/status` endpoint.
     * Expected 200 response body: { mode: number; status: number }
     */
    public async getStatus(): Promise<HandyStatus | null> {
        if (!this.apiKey) return null;

        const url = `${this.baseUrl}status`;
        const headers = { 'X-Connection-Key': this.apiKey };

        try {
            const resp = await this.http.get(url, { headers });
            const mode = Number(resp?.data?.mode);
            const status = Number(resp?.data?.status);

            if (!Number.isFinite(mode) || !Number.isFinite(status)) {
                logger.error('[HANDY ERROR] Unexpected /status response payload.');
                return null;
            }

            if (!this.lastHSTPSync) {
                await this.syncHSTPTime();
            }

            return { mode, status };
        } catch (e: any) {
            logger.error({
                e, url, headers
            })

            const msg = (e as any)?.message ?? String(e);
            logger.error(`[HANDY ERROR] /status failed: ${msg}`);
            return null;
        }
    }

    /**
     * Performs a time sync against The Handy (HSTP) to estimate server start time for script playback.
     *
     * Calls: GET `/hstp/sync?syncCount=30&outliers=6`
     * Expected payload: { result: 0, time: number, rtd: number }
     *
     * We store a snapshot including the local timestamps and a derived `estimatedServerTimeMs`.
     */
    public async syncHSTPTime(): Promise<HSTPSyncResult | null> {
        if (!this.apiKey) return null;

        const url = `${this.baseUrl}hstp/sync`;
        const headers = { 'X-Connection-Key': this.apiKey };

        const tLocalSend = Date.now();

        try {
            const resp = await this.http.get(url, {
                headers,
                params: {
                    syncCount: 30,
                    outliers: 6,
                },
            });

            const result = Number(resp?.data?.result);
            const time = Number(resp?.data?.time);
            const rtd = Number(resp?.data?.rtd);

            const tLocalRecv = Date.now();

            if (result !== 0 || !Number.isFinite(time) || !Number.isFinite(rtd)) {
                logger.error('[HANDY ERROR] Unexpected /hstp/sync response payload.');
                return null;
            }

            // `time` is the server time reference returned by Handy. We estimate current server time at receive by adding half RTT.
            const estimatedServerTimeMs = Math.round(time + (rtd / 2));

            const snapshot: HSTPSyncSnapshot = {
                result,
                time,
                rtd,
                tLocalSend,
                tLocalRecv,
                estimatedServerTimeMs,
            };

            this.lastHSTPSync = snapshot;
            this.lastEstimatedServerTime = estimatedServerTimeMs;

            return { ...snapshot };
        } catch (e: any) {
            const msg = (e as any)?.message ?? String(e);
            logger.error(`[HANDY ERROR] /hstp/sync failed: ${msg}`);
            return null;
        }
    }
}

export interface HandyStatus {
    mode: number;
    status: number;
}

export interface HSTPSyncResult {
    result: number;
    time: number;
    rtd: number;
    tLocalSend: number;
    tLocalRecv: number;
    estimatedServerTimeMs: number;
}

export interface HSTPSyncSnapshot extends HSTPSyncResult {}