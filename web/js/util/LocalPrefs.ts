import {Optional} from './ts/Optional';

/**
 * @Deprecated use the new IPrefs systems
 */
export class LocalPrefs {

    public static mark(key: string, value: boolean = true): void {

        if (value) {
            this.set(key, 'true');
        } else {
            this.set(key, 'false');
        }
    }

    public static toggle(key: string, value: boolean = false) {
        this.mark(key, ! this.isMarked(key, value));
    }

    /**
     * The initial value is false, After that the value is true.
     */
    public static markOnceRequested(key: string) {

        const result = this.isMarked(key);

        this.mark(key);

        return result;

    }

    public static async markOnceExecuted(key: string,
                                         handler: () => Promise<void>,
                                         otherwise?: () => Promise<void>): Promise<void> {

        const marked = this.isMarked(key);

        if (marked) {

            if (otherwise) {
                await otherwise();
            }

            return;
        }

        await handler();

        this.mark(key);

    }

    public static isMarked(key: string, defaultValue: boolean = false) {

        const currentValue =
            this.get(key).getOrElse(`${defaultValue}`);

        return currentValue === 'true';

    }

    public static isDelayed(key: string, duration: DurationStr) {

        const durationMS = TimeDurations.toMillis(duration);

        const pref = this.get(key).getOrUndefined();

        if (pref && pref.match(/[0-9]+/)) {

            const until = parseInt(pref, 10);
            const now = Date.now();

            if (now < until) {
                return true;
            } else {
                return false;
            }

        } else {
            return false;
        }

    }

    public static markDelayed(key: string, duration: DurationStr) {

        const durationMS = TimeDurations.toMillis(duration);
        const until = Date.now() + durationMS;
        this.set(key, `${until}`);

    }

    /**
     * Return true if the given pref is defined.
     */
    public static defined(key: string) {
        return this.get(key).isPresent();
    }

    public static get(key: string): Optional<string> {
        return Optional.of(window.localStorage.getItem(key));
    }

    public static set(key: string, value: string): void {
        window.localStorage.setItem(key, value);
    }

}

import {DurationStr, TimeDurations} from './TimeDurations';
