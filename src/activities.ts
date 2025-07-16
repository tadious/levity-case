import OpenAI from 'openai';
import { ServerClient } from 'postmark';
import moment from 'moment';

import { DeliveryOrder, OPEN_API_KEY, OPEN_ROUTER_API_KEY, POSTMARK_API_KEY } from './shared';

// Mock: return a mocked expected time delay: [0 - 50] minutes
export async function getTrafficDelay(): Promise<number> {
  const delayInMinutes: number = Math.floor(Math.random() * (50 - 0 + 1) + 0);
  console.log('estimated delays', { delayInMinutes });
  return delayInMinutes;
}

async function getDefaultMessage(name: string, delayInMinutes: number): Promise<string> {
  return `
Hi ${name}
Just a quick heads-up — your Freight delivery is running a bit behind and will arrive approximately ${delayInMinutes} minutes later than expected. We really appreciate your patience, and thank you for understanding! 🍔🚗💨
`;
}

export async function getCustomMessage(name: string, delayInMinutes: number): Promise<string> {
  try {
    const client = new OpenAI({ apiKey: OPEN_API_KEY });
    const response = await client.responses.create({
      model: 'gpt-4o-mini',
      input: `Write a friendly message to ${name} that his delivery from Freight will be ${delayInMinutes} minutes late`,
    });
    return response.output_text;
  } catch (error) {
    console.log('error getting open api custom message', { error });
    try {
      // Use a fallback API for creating a friendly message if one fails
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${OPEN_ROUTER_API_KEY}`, 'Content-Type': 'application/json' },
        body: `{"model":"openai/gpt-4o-mini","messages":[{"role":"user","content":"Write a friendly message to ${name} that their package delivery will be ${delayInMinutes} minutes late"}]}`,
      });
      const data: any = await response.json();
      if (data?.choices && data.choices.length && data.choices[0].message?.content) {
        return data.choices[0].message.content;
      }
      throw new Error('Invalid message response');
    } catch (error) {
      console.log('error getting open router custom message', { error });
      // Use a default message if all options fail. It might be more important for customer to receive a message
      return getDefaultMessage(name, delayInMinutes);
    }
  }
}

export async function delayNotification(name: string, email: string, phone: string, message: string) {
  try {
    const client = new ServerClient(POSTMARK_API_KEY);
    await client.sendEmailWithTemplate({
      From: `Levity Case <events@flippintickets.com>`,
      To: email,
      TemplateAlias: 'order-delay',
      TemplateModel: {
        name,
        message,
        year: moment().format('YYYY'),
        sender_name: 'Freight AB',
        product_name: 'Freight',
        company_name: 'Freight',
        company_address: 'Stockholm, Sweden',
      },
    });
    console.log('notified customer about a delay', { name, email, phone, message });
  } catch (error) {
    console.log('failed to notify customer about a delay', { name, email, phone, message });
    throw error;
  }
}
