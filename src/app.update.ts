import { Telegraf, Context, Markup } from 'telegraf';
import { InjectBot, Start, Hears, Update, Command } from 'nestjs-telegraf';
import { getGroupId } from './app.utils';
import { GroupsService } from './groups/groups.service';
import { MembersService } from './members/members.service';
import { SceneContext } from 'telegraf/typings/scenes';
import { ConfirmAction } from './common/actions';
import { SceneName } from './common/constants';

@Update()
export class AppUpdate {
  constructor(
    @InjectBot()
    private readonly bot: Telegraf<Context>,
    private readonly groupService: GroupsService,
    private readonly memberService: MembersService,
  ) {}

  @Start()
  async start(ctx: Context) {}

  @Command('members')
  async members(ctx: SceneContext) {
    const groupId = getGroupId(ctx);

    const existedGroup = await this.groupService.findByGroupId(groupId);

    if (!existedGroup) {
      await this.groupService.create(groupId);
    }

    await ctx.scene.enter(SceneName.MEMBERS);
  }

  @Hears(ConfirmAction.YES)
  async goToMemberScene(ctx: SceneContext) {
    await this.members(ctx);
  }

  @Hears(ConfirmAction.NO)
  async completeTask(ctx: Context) {
    await ctx.reply(
      'Telegram does not provide its bots with a posibility to get information about chat members. Type /members in case of operating with members.',
      Markup.removeKeyboard(),
    );
  }
}
