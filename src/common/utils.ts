import { Context } from 'telegraf';
import { ChatType } from './constants';

export const getChatType = (ctx: Context): ChatType | null => {
  if ('message' in ctx.update) {
    const chatTypeKey = ctx.update.message.chat.type.toUpperCase();
    return ChatType[chatTypeKey];
  }

  return null;
};
