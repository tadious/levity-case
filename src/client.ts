import { Connection, Client } from '@temporalio/client';
import { notifyDeliveryDelays } from './workflows';
import { nanoid } from 'nanoid';
import { TASK_QUEUE_NAME, orders } from './shared';
import process from 'process';

async function run() {
  const connection = await Connection.connect({ address: 'localhost:7233' });
  const client = new Client({ connection });

  // Start the workflow with the sample data in shared.ts
  const handle = await client.workflow.start(notifyDeliveryDelays, {
    taskQueue: TASK_QUEUE_NAME,
    args: [orders[0]],
    workflowId: 'notifyDeliveryDelays-' + nanoid(),
  });
  console.log(await handle.result());
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
