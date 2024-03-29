import { Context } from 'telegraf';

export const getMessageText = (ctx: Context): string => {
  if ('message' in ctx.update && 'text' in ctx.update.message) {
    return ctx.update.message.text.trim();
  }
};

export const getGroupId = (ctx: Context): number => {
  if ('message' in ctx.update) {
    return ctx.update.message.chat.id;
  }

  if ('my_chat_member' in ctx.update) {
    return ctx.update.my_chat_member.chat.id;
  }

  return -1;
};
