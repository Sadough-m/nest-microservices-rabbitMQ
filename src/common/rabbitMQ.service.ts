import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';
import { randomUUID } from 'crypto';

@Injectable()
export class RabbitMQService {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  async connect() {
    // Establish a connection to RabbitMQ
    this.connection = await amqp.connect('amqp://localhost');
    this.channel = await this.connection.createChannel();
  }

  // Method to create a dynamic queue
  async createQueue(queueName: string) {
    await this.channel.assertQueue(queueName, { durable: true });
    console.log(`Queue "${queueName}" is created.`);
  }

  // Method to send a message to a specific queue
  async sendToQueue(queueName: string, message: any) {
    const messageBuffer = Buffer.from(JSON.stringify(message));
     this.channel.sendToQueue(queueName, messageBuffer);
    console.log(`Message sent to queue "${queueName}": ${message}`);
  }

  async sendRPCMessage(queueName: string, message: any): Promise<any> {
    return new Promise(async (resolve) => {
      const correlationId = randomUUID(); // Unique ID for correlation

      // Create a temporary exclusive queue for response
      const { queue: replyQueue } = await this.channel.assertQueue('', { exclusive: true });

      // Send the message to the queue, with the correlationId and replyTo properties
      this.channel.sendToQueue(
        queueName,
        Buffer.from(JSON.stringify(message)),
        {
          correlationId,
          replyTo: replyQueue, // Specify where to send the response
        },
      );

      // Wait for a message in the reply queue
      await this.channel.consume(
        replyQueue,
        (msg) => {
          if (msg.properties.correlationId === correlationId) {
            resolve(JSON.parse(msg.content.toString())); // Resolve the promise with the response
            this.channel.ack(msg); // Acknowledge the message
          }

        },
        { noAck: false },  // Ensure manual acknowledgment
      );
    });
  }

  // Method to consume messages from a specific queue
  async consumeQueue(queueName: string, callback: (msg: any) => Promise<any> = () => new Promise(() => {})) {
    await this.channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const result = await callback(JSON.parse(msg.content.toString()));
          if (msg.properties.replyTo && msg.properties.correlationId) {
            // Send the response to the replyTo queue with the same correlationId
            this.channel.sendToQueue(
              msg.properties.replyTo,  // Use replyTo to send the response
              Buffer.from(JSON.stringify({ status: 'success', ...result, ...JSON.parse(msg.content.toString()) })),
              {
                correlationId: msg.properties.correlationId,  // Same correlationId to match the request
              },
            );
          }
          this.channel.ack(msg);  // Acknowledge the message after processing
        } catch (error) {
          console.error('Error processing message:', error);

          // Requeue message or dead-letter it after a number of attempts
          const retries = msg.properties.headers['x-retries'] || 0;
          if (retries < 3) {
            this.channel.nack(msg, false, true); // Retry: requeue the message
          } else {
            this.channel.nack(msg, false, false); // Dead-letter the message
          }
        }
      }
    });
  }
}
