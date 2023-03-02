import { Markup } from 'telegraf';

export enum ConfirmAction {
  YES = '✅ Yes',
  NO = '❌ No',
}

export const confirmButtons = Markup.keyboard(
  [
    Markup.button.callback(ConfirmAction.NO, 'no'),
    Markup.button.callback(ConfirmAction.YES, 'yes'),
  ],
  { columns: 2 },
);
