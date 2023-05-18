import { Markup } from 'telegraf';

export const ROW_SEPARATOR = '\n\n';

export const BackAction = '⏎ Back';

export enum MemberMenuAction {
  GET = '📖 List of members',
  CREATE = '➕ Add members',
  UPDATE = '📝 Edit a member',
  DELETE = '❌ Remove a member',
  EXIT = 'Exit',
}

export enum MemberEnterAction {
  UPDATE = 'Update',
  CONFIRM_TO_ADD = 'ConfirmToAdd',
  CONFIRM_TO_DELETE = 'ConfirmToDelete',
}

export type MemberAction = MemberMenuAction | MemberEnterAction;

export const memberMenuButtons = Markup.keyboard([
  Markup.button.callback(MemberMenuAction.GET, 'get'),
  Markup.button.callback(MemberMenuAction.CREATE, 'create'),
  Markup.button.callback(MemberMenuAction.UPDATE, 'update'),
  Markup.button.callback(MemberMenuAction.DELETE, 'delete'),
  Markup.button.callback(MemberMenuAction.EXIT, 'exit'),
]);
