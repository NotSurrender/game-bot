import { Hears, SceneEnter, Scene } from 'nestjs-telegraf';
import { Markup } from 'telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { ValidationError } from 'src/errors/validation-error';
import { MemberService } from './member.service';
import {
  MemberEnterAction,
  MemberMenuAction,
  ROW_SEPARATOR,
  memberMenuButtons,
} from './member.constants';
import { getGroupId, getMessageText } from 'src/app.utils';
import { AdminSceneSessionType } from './member.context';
import { MemberModel } from './member.model';
import { ConfirmAction, confirmButtons } from 'src/common/constants';

@Scene('member')
export class MemberScene {
  private choosedNickname?: string | null;
  private sessionType?: MemberMenuAction | MemberEnterAction;

  constructor(private readonly memberService: MemberService) {}

  @SceneEnter()
  async enter(ctx: SceneContext) {
    await ctx.reply('Members menu', memberMenuButtons);
  }

  @Hears(MemberMenuAction.GET)
  async getList(ctx: SceneContext) {
    const groupId = getGroupId(ctx);
    const members = await this.memberService.findByGroupId(groupId);

    if (!members.length) {
      await ctx.reply('The list of members is empty.');
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
      `Please, enter the list of members in the appropriate format: ${ROW_SEPARATOR}nickname - username${ROW_SEPARATOR}nickname2 - username2${ROW_SEPARATOR}etc...${ROW_SEPARATOR} Example:${ROW_SEPARATOR}Alex - not_surrender`,
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
      this.sessionType = null;
      await ctx.reply('The list of members is empty.');
      return;
    }

    const buttonMembers = members.map(({ nickname }) =>
      Markup.button.callback(nickname, nickname),
    );

    await ctx.reply(
      'Please, choose a member to edit:',
      Markup.keyboard(buttonMembers),
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
      this.sessionType = null;
      await ctx.reply('The list of members is empty.');
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
      'You have been exited from "admin" menu',
      Markup.removeKeyboard(),
    );
    await ctx.scene.leave();
  }

  @Hears(ConfirmAction.NO)
  async cancelDeleting(ctx: SceneContext<AdminSceneSessionType>) {
    await this.delete(ctx);
  }

  @Hears(ConfirmAction.YES)
  async confirmDeleting(ctx: SceneContext<AdminSceneSessionType>) {
    const groupId = getGroupId(ctx);
    await this.memberService.delete(this.choosedNickname, groupId);
    await ctx.replyWithHTML(
      `The <b>${this.choosedNickname}</b> has been removed.`,
    );
    this.sessionType = null;
    await this.delete(ctx);
  }

  // TODO: refactor this method
  @Hears(/.*/)
  async balancer(ctx: SceneContext<AdminSceneSessionType>) {
    switch (this.sessionType) {
      case MemberMenuAction.CREATE:
        const membersStr = getMessageText(ctx);
        try {
          this.validateMembersString(membersStr);
          const groupId = getGroupId(ctx);
          const membersInput = this.getMembersInputByMembersString(
            membersStr,
            groupId,
          );
          await this.memberService.create(membersInput, groupId);
          this.sessionType = null;
          await ctx.reply('The users have been added successfully.');
          await this.getList(ctx);
          await ctx.scene.reenter();
        } catch (err) {
          if (err instanceof Error) {
            this.sessionType = null;
            await ctx.replyWithHTML(err.message, memberMenuButtons);
          }
        }
        break;

      case MemberMenuAction.UPDATE:
        this.sessionType = MemberEnterAction.UPDATE;
        await ctx.reply(
          `Please, enter a new nickname of the member in the appropriate format:${ROW_SEPARATOR}nickname - username`,
          Markup.forceReply(),
        );
        break;

      case MemberMenuAction.DELETE:
        this.sessionType = MemberEnterAction.CONFIRM_TO_DELETE;
        this.choosedNickname = getMessageText(ctx);
        await ctx.replyWithHTML(
          `Are you sure you want to remove <b>${this.choosedNickname}</b>? All related information will be removed as well.`,
          confirmButtons,
        );
        break;

      case MemberEnterAction.UPDATE:
        await ctx.reply('GOT IT');
        break;
    }
  }

  private validateMembersString(members: string) {
    const splittedMembers = members.split(ROW_SEPARATOR);
    const notValidMembers = splittedMembers.filter(
      (member) => !this.validateMemberString(member),
    );

    if (notValidMembers.length) {
      throw new ValidationError('');
    }
  }

  private validateMemberString(member: string) {
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
  ): MemberModel[] {
    const rows = members.split(ROW_SEPARATOR);
    const membersInput = rows.map((row) => {
      const [name, username] = this.parseMemberString(row);
      return new MemberModel(name, username, groupId);
    });

    return membersInput;
  }
}
