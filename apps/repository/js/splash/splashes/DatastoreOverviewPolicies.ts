import {DatastoreOverview} from '../../../../../web/js/datastore/Datastore';
import {TimeDurations} from '../../../../../web/js/util/TimeDurations';
import {ISODateTimeStrings} from '../../../../../web/js/metadata/ISODateTimeStrings';
import {Logger} from '../../../../../web/js/logger/Logger';
import {Preconditions} from '../../../../../web/js/Preconditions';

const log = Logger.create();

// TODO: we need events for these on startup... it would be nice to see how many
// users were onboarded
export class DatastoreOverviewPolicies {

    public static isLevel(level: UserLevel, datastoreOverview: DatastoreOverview) {

        Preconditions.assertPresent(datastoreOverview, 'datastoreOverview');

        switch (level) {

            case 'active':
                return this.isActive(datastoreOverview);

            case 'premium':
                return this.isPremium(datastoreOverview);

            case '24h':
                return this.is24H(datastoreOverview);

        }

    }

    public static is24H(datastoreOverview: DatastoreOverview) {

        const since = ISODateTimeStrings.parse(datastoreOverview.created);
        return TimeDurations.hasExpired(since, '1d');

    }

    /**
     * The user has onboarded and has been using the app for a while.
     */
    public static isActive(datastoreOverview: DatastoreOverview) {

        const since = ISODateTimeStrings.parse(datastoreOverview.created);
        return TimeDurations.hasExpired(since, '1w') && datastoreOverview.nrDocs > 5;

    }

    /**
     * The user is at a premium level but may or may not have converted to
     * premium.
     */
    public static isPremium(datastoreOverview: DatastoreOverview) {

        const since = ISODateTimeStrings.parse(datastoreOverview.created);
        const expired = TimeDurations.hasExpired(since, '2w');
        const hasMinDocs = datastoreOverview.nrDocs > 25;

        const result = expired && hasMinDocs;

        log.info(`since: ${since}, expired: ${expired}, hasMinDocs: ${hasMinDocs}, result: ${result}`);

        return result;

    }

}

export type UserLevel = '24h' | 'active' | 'premium';