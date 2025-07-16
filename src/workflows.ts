import * as workflow from '@temporalio/workflow';

// Only import the activity types
import type * as activities from './activities';
import { DELAY_THRESHOLD_IN_MINUTES, DeliveryOrder } from './shared';

// Load Activities and assign the Retry Policy
const { getTrafficDelay, getCustomMessage, delayNotification } = workflow.proxyActivities<typeof activities>({
  retry: {
    initialInterval: '1 second', // amount of time that must elapse before the first retry occurs.
    maximumInterval: '1 minute', // maximum interval between retries.
    backoffCoefficient: 2, // how much the retry interval increases.
    maximumAttempts: 5, // maximum number of execution attempts. Unspecified means unlimited retries.
  },
  startToCloseTimeout: '1 minute', // maximum time allowed for a single Activity Task Execution.
});

export async function notifyDeliveryDelays(order: DeliveryOrder) {
  try {
    const delayInMinutes: number = await getTrafficDelay();
    if (delayInMinutes <= DELAY_THRESHOLD_IN_MINUTES) {
      console.log('Delivery on schdule, no notification necessary');
      return;
    }

    try {
      const message: string = await getCustomMessage(order.name, delayInMinutes);
      try {
        await delayNotification(order.name, order.email, order.phone, message);
      } catch (error) {
        console.log({ error });
        throw new workflow.ApplicationFailure('Failed to notify customer');
      }
    } catch (error) {
      console.log({ error });
      throw new workflow.ApplicationFailure('Failed to fetch a custom message');
    }
  } catch (error) {
    console.log({ error });
    throw new workflow.ApplicationFailure('Failed to calculate possible delays');
  }
}
