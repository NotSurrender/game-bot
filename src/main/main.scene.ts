import { Telegraf, Context, Markup } from 'telegraf';
import { InjectBot, Ctx, Scene, SceneEnter, Action } from 'nestjs-telegraf';
import { getGroupId, getChatType } from '../app.utils';
import { GroupService } from '../group/group.service';
import { MemberService } from '../member/member.service';
import { SceneContext } from 'telegraf/typings/scenes';

@Scene('main')
export class MainScene {
  constructor(
    @InjectBot()
    private readonly bot: Telegraf<Context>,
    private readonly groupService: GroupService,
    private readonly memberService: MemberService,
  ) {}

  @SceneEnter()
  async start(@Ctx() ctx: Context) {
    const chatType = getChatType(ctx);

    if (chatType !== 'group') {
      await ctx.reply(
        `The GameBot works only in Telegram groups. It does not support ${chatType} chat types.`,
      );
      return;
    }

    const groupId = getGroupId(ctx);
    const existedGroup = await this.groupService.findByGroupId(groupId);

    if (!existedGroup) {
      await this.groupService.create(groupId);
    }

    const groupMembers = await this.memberService.findByGroupId(groupId);

    if (!groupMembers.length) {
      await ctx.reply(
        'You have not registered any chat members. Do you want to start?',
        Markup.keyboard([
          Markup.button.callback('✅ Yes', 'yes'),
          Markup.button.callback('❌ No', 'no'),
        ]),
      );
    }
  }

  @Action('✅ Yes')
  async goToMemberScene(ctx: SceneContext) {
    await ctx.scene.enter('member');
  }

  @Action('❌ No')
  async completeTask(ctx: Context) {
    await ctx.reply(
      'Telegram does not provide its bots with a posibility to get information about chat members. Type "/members" bot command in case of operating with members.',
      Markup.removeKeyboard(),
    );
  }
}
