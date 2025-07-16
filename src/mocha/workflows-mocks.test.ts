import { TestWorkflowEnvironment } from '@temporalio/testing';
import { after, before, it } from 'mocha';
import { Worker } from '@temporalio/worker';
import { notifyDeliveryDelays } from '../workflows';
import assert from 'assert';

import { orders } from '../shared';

describe('notifyDeliveryDelays', () => {
  let testEnv: TestWorkflowEnvironment;

  before(async () => {
    testEnv = await TestWorkflowEnvironment.createLocal();
  });

  after(async () => {
    await testEnv?.teardown();
  });

  it('successfully completes the Workflow with mocked Activities', async () => {
    const { client, nativeConnection } = testEnv;
    const taskQueue = 'test';

    const worker = await Worker.create({
      connection: nativeConnection,
      taskQueue,
      workflowsPath: require.resolve('../workflows'),
      activities: {
        getTrafficDelay: async (): Promise<number> => 37,
        getCustomMessage: async (_ip: string): Promise<string> => 'A nice enough message',
        delayNotification: async (_ip: string) => {},
      },
    });

    const result = await worker.runUntil(
      client.workflow.execute(notifyDeliveryDelays, {
        args: [orders[0]],
        workflowId: 'test',
        taskQueue,
      }),
    );
    assert.equal(result, undefined);
  });
});
