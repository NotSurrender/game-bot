import { Hears, SceneEnter, Scene } from 'nestjs-telegraf';
import { Markup } from 'telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { ValidationError } from 'src/errors/validation-error';
import { MembersService } from './members.service';
import {
  BackAction,
  MemberEnterAction,
  MemberMenuAction,
  ROW_SEPARATOR,
  memberMenuButtons,
} from './members.constants';
import { getGroupId, getMessageText } from 'src/app.utils';
import { ConfirmAction } from 'src/common/actions';
import { AdminSceneSessionType } from './members.context';
import { Member } from './members.model';
import { confirmButtons } from 'src/common/buttons';
import { SceneName } from 'src/common/constants';
import { DuplicateError } from 'src/errors/duplicate-error';

@Scene(SceneName.MEMBERS)
export class MembersScene {
  private choosedNickname?: string | null;
  private sessionType?: MemberMenuAction | MemberEnterAction;

  constructor(private readonly memberService: MembersService) {}

  @SceneEnter()
  async enter(ctx: SceneContext) {
    await ctx.reply('Welcome to "Members" menu', memberMenuButtons);
  }

  @Hears(MemberMenuAction.GET)
  async getList(ctx: SceneContext) {
    const groupId = getGroupId(ctx);
    const members = await this.memberService.findByGroupId(groupId);

    if (!members.length) {
      await ctx.reply('The list of members is empty.');
      this.sessionType = MemberEnterAction.CONFIRM_TO_ADD;
      await ctx.reply('Do you want to add members?', confirmButtons);
      return;
    }

    const formattedMembers = members
      .map(
        (member) =>
          `${member.nickname} - <b>${member.username}</b>${ROW_SEPARATOR}`,
      )
      .join('');

    await ctx.replyWithHTML(
      `The list of users: ${ROW_SEPARATOR}` + `${formattedMembers}`,
    );
  }

  @Hears(MemberMenuAction.CREATE)
  async add(ctx: SceneContext<AdminSceneSessionType>) {
    this.sessionType = MemberMenuAction.CREATE;

    await ctx.reply(
      'Please, enter the list of members in the appropriate format: \nnickname - username\nExample: Alex - not_surrender',
      Markup.forceReply(),
    );

    setTimeout(() => {
      if (ctx.scene.session.type === MemberMenuAction.CREATE) {
        this.exit(ctx);
      }
    }, 10000);
  }

  @Hears(MemberMenuAction.UPDATE)
  async update(ctx: SceneContext<AdminSceneSessionType>) {
    this.sessionType = MemberMenuAction.UPDATE;
    const groupId = getGroupId(ctx);
    const members = await this.memberService.findByGroupId(groupId);

    if (!members.length) {
      await ctx.reply('The list of members is empty.');
      this.sessionType = MemberEnterAction.CONFIRM_TO_ADD;
      await ctx.reply('Do you want to add members?', {});
      return;
    }

    const buttonMembers = members.map(({ nickname }) =>
      Markup.button.callback(nickname, nickname),
    );

    buttonMembers.push(Markup.button.callback('⏎ Back', 'back'));

    await ctx.reply(
      'Please, choose a member to edit:',
      Markup.keyboard(buttonMembers, { columns: 2 }),
    );

    setTimeout(() => {
      if (ctx.scene.session.type === MemberMenuAction.UPDATE) {
        this.exit(ctx);
      }
    }, 10000);
  }

  @Hears(MemberMenuAction.DELETE)
  async delete(ctx: SceneContext<AdminSceneSessionType>) {
    const groupId = getGroupId(ctx);
    const members = await this.memberService.findByGroupId(groupId);

    if (!members.length) {
      await ctx.reply('The list of members is empty.');
      this.sessionType = MemberEnterAction.CONFIRM_TO_ADD;
      await ctx.reply('Do you want to add members?', confirmButtons);
      return;
    }

    const buttonMembers = members.map(({ nickname }) =>
      Markup.button.callback(nickname, nickname),
    );

    buttonMembers.push(Markup.button.callback('⏎ Back', 'back'));

    this.sessionType = MemberMenuAction.DELETE;

    await ctx.reply(
      'Please, choose a member to remove:',
      Markup.keyboard(buttonMembers),
    );
  }

  @Hears(MemberMenuAction.EXIT)
  async exit(ctx: SceneContext<AdminSceneSessionType>) {
    this.sessionType = null;

    await ctx.reply(
      'You have been exited from "Members" menu',
      Markup.removeKeyboard(),
    );
    await ctx.scene.leave();
  }

  @Hears(ConfirmAction.NO)
  async cancel(ctx: SceneContext<AdminSceneSessionType>) {
    // ctx.scene.leave();
    switch (this.sessionType) {
      case MemberMenuAction.CREATE:
      case MemberEnterAction.CONFIRM_TO_ADD:
        this.sessionType = null;
        await ctx.scene.reenter();
        break;

      case MemberMenuAction.DELETE:
      case MemberEnterAction.CONFIRM_TO_DELETE:
        this.delete(ctx);
        break;
    }
  }

  @Hears(ConfirmAction.YES)
  async confirm(ctx: SceneContext<AdminSceneSessionType>) {
    switch (this.sessionType) {
      case MemberEnterAction.CONFIRM_TO_ADD:
        this.add(ctx);
        break;

      case MemberEnterAction.CONFIRM_TO_DELETE:
        const groupId = getGroupId(ctx);
        await this.memberService.delete(this.choosedNickname, groupId);
        await ctx.replyWithHTML(
          `The <b>${this.choosedNickname}</b> has been removed.`,
          Markup.removeKeyboard(),
        );
        await this.delete(ctx);

        break;
    }
  }

  // TODO: refactor this method
  @Hears(/.*/)
  async balancer(ctx: SceneContext<AdminSceneSessionType>) {
    // ctx.scene.leave();
    const message = getMessageText(ctx);

    switch (this.sessionType) {
      case MemberMenuAction.CREATE:
        try {
          this.validateMemberListString(message);

          const groupId = getGroupId(ctx);
          const membersInput = this.getMembersInputByMembersString(
            message,
            groupId,
          );

          await this.memberService.create(membersInput, groupId);

          this.sessionType = null;
          await ctx.reply('The users have been added successfully.');
          await this.getList(ctx);
          await ctx.scene.reenter();
        } catch (err) {
          if (err instanceof ValidationError) {
            await ctx.replyWithHTML(err.message);
          } else if (err instanceof DuplicateError) {
            await ctx.replyWithHTML(err.message);
          }
          this.sessionType = MemberEnterAction.CONFIRM_TO_ADD;
          await ctx.replyWithHTML('Do you want to try again?', confirmButtons);
        }
        break;

      case MemberMenuAction.UPDATE:
        if (message === BackAction) {
          this.sessionType = null;
          await ctx.scene.reenter();
          return;
        }

        this.sessionType = MemberEnterAction.UPDATE;
        await ctx.reply(
          `Please, enter a new nickname of the member in the appropriate format:${ROW_SEPARATOR}nickname - username`,
          Markup.forceReply(),
        );
        break;

      case MemberMenuAction.DELETE:
        if (message === BackAction) {
          this.sessionType = null;
          await ctx.scene.reenter();
          return;
        }

        this.sessionType = MemberEnterAction.CONFIRM_TO_DELETE;
        this.choosedNickname = message;
        await ctx.replyWithHTML(
          `Are you sure you want to remove <b>${this.choosedNickname}</b>? All related information will be removed as well.`,
          confirmButtons,
        );
        break;

      case MemberEnterAction.UPDATE:
        try {
          this.validateMemberListString(message);
          const groupId = getGroupId(ctx);
          const [memberInput] = this.getMembersInputByMembersString(
            message,
            groupId,
          );

          await this.memberService.update(memberInput);
        } catch (err) {
          if (err instanceof ValidationError) {
            await ctx.replyWithHTML(err.message);
          } else if (err instanceof DuplicateError) {
            await ctx.replyWithHTML(err.message);
          }
          this.sessionType = MemberEnterAction.CONFIRM_TO_ADD;
          await ctx.replyWithHTML('Do you want to try again?', confirmButtons);
        }
        break;
    }
  }

  private validateMemberListString(members: string) {
    const splittedMembers = members.split(ROW_SEPARATOR);
    const formatErrors = splittedMembers
      .filter((member) => !this.validateMemberString(member))
      .map((member) => 'Format error occured at: ' + member.trim() + '\n')
      .join('');

    if (formatErrors) {
      throw new ValidationError(formatErrors);
    }
  }

  private validateMemberString(member: string) {
    if (member.length < 3) {
      return false;
    }

    const splittedValue = member.split('-');
    return splittedValue.length === 2;
  }

  private parseMemberString(member: string) {
    const splittedValue = member.split('-');
    return splittedValue.map((val) => val.trim());
  }

  private getMembersInputByMembersString(
    members: string,
    groupId: number,
  ): Member[] {
    const rows = members.split(ROW_SEPARATOR);
    const membersInput = rows.map((row) => {
      const [name, username] = this.parseMemberString(row);
      return new Member(name, username, groupId);
    });

    return membersInput;
  }
}
