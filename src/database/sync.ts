import { synchronize } from '@nozbe/watermelondb/sync';
import { database } from './database';

async function Synchronize() {
    await synchronize({
        database
        pullChanges: async ({ lastPulledAt, schemaVersion, migration }) => {
            const urlParams = `last_pulled_at=${lastPulledAt}&schema_version=${schemaVersion}&migration=${encodeURIComponent(
                JSON.stringify(migration),
            )}`;
            const response = await fetch(`http://10.0.0.29:3000/api/sync?${urlParams}`);
            const changes = await response.json();
            return changes;
        },
        pushChanges: async () => {

        }
    })
}