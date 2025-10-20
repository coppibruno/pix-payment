import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationLogDocument = NotificationLog & Document;

@Schema({ timestamps: true })
export class NotificationLog {
  @Prop({ required: true })
  charge_id: string;

  @Prop({ required: true })
  received_at: Date;

  @Prop({ required: true })
  previous_status: string;

  @Prop({ required: true })
  new_status: string;

  @Prop({ required: true })
  message_id: string;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const NotificationLogSchema =
  SchemaFactory.createForClass(NotificationLog);
