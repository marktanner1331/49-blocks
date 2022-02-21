import { SyncSubscription } from "./sync-subscription";

export class SyncSubject<T> {
    private callbacks: ((arg0: T) => void)[] = [];

    subscribe(callback: (arg0: T) => void): SyncSubscription<T> {
        this.callbacks.push(callback);
        return new SyncSubscription(this, callback);
    }

    unsubscribe(callback: (arg0: T) => void) {
        this.callbacks.splice(this.callbacks.findIndex(x => x == callback));
    }

    next(item: T) {
        for (let callback of this.callbacks) {
            callback(item);
        }
    }
}