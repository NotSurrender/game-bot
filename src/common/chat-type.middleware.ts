import { Context } from 'telegraf';
import { getChatType } from './utils';
import { ChatType } from './constants';

export const chatTypeMiddleware =
  (supportedChatType: ChatType) =>
  (ctx: Context, next: () => Promise<void>) => {
    const currentChatType = getChatType(ctx);

    if (currentChatType !== supportedChatType) {
      ctx.reply(
        `The GameBot works only in a Telegram ${supportedChatType}. It does not support ${currentChatType} chat types.`,
      );
      return;
    }

    next();
  };
