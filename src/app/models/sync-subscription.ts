import { SyncSubject } from "./sync-subject";

export class SyncSubscription<T> {
    constructor(private subject: SyncSubject<T>, private callback: (arg0: T) => void) {

    }

    unsubscribe() {
        this.subject.unsubscribe(this.callback);
    }
}