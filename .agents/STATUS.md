# Delivery Status

> Read before work. Every Agent updates this dashboard at start, block, and handoff.

## Current snapshot

## 2026-11-07 — 学习窗实际宽度与简洁说明（Developer follow-up）

Manager转交QA在375px实际发现两格右边框被裁、桌面缩窄后旧SVG坐标仍偏大的问题。现showModal后按学习窗scroller实测内容宽度设置相接两格尺寸；ResizeObserver仅尺寸确变时取消旧序列、换独立mount并用真实新尺寸重建Writer，关闭时断开。两格共边-3px保留，长词只在词内横滑，原Promise串行/练字和人工评分不变。

用户新增要求说明默认隐藏、界面简洁：采用原生默认关闭details和带明确无障碍名称的问号summary；预习锁数/复习规则、学习操作等放入两段短详情。书架、顶栏和课程概览移除版本长文，保留册名、数量选择、进度、动作按钮、状态和加载/无词表错误。源版本元数据、教材JSON、拼音数据、调度、ID及云账号资源不改；welcome脚本/样式缓存链接同步。

Checks: 本轮67项（66 Node+原独立词库1）通过；新增首次手机打开与同实例桌面缩手机的真实Writer尺寸/旧链终止/关闭observer检查，默认收起说明与可见控件及简洁书架回归。严格build当前2536字/全源2571字缺0；app/welcome语法及diff检查通过。实际375首开/缩放与问号键盘操作交QA复核，既有真实串行证据可由QA按未变模块继承；Developer不宣称最终QA通过，未push/deploy/main/dev。

## 2026-11-07 — 看拼音听写与整词串行笔顺（Developer intake）

Developer独占F:/taskHelper/hanzi-pinyin-sequence-20261107、feature/pinyin-stroke-sequence-20261107，基底2d4a088。仅实现听写进行时完整整词拼音默认可见（汉字答案仍隐藏），以及词语学习窗连排相接田字格/按实际动画完成顺序逐字播放。独立dictation_readings作者只写静态data与其证据，业务先fixture，待Manager通知合源；原2168教材词表+旧28题/ID/已学数据不改。
Contract/plan: 已读固定HanziWriter2.0.2实际源码animateCharacter与_renderState取消约定；仅从其Promise确认canceled:false后推进，不固定延时。序列epoch+dialog session阻止重播/练字/关闭/快速换词/切tab的旧链续播；每次writer用独立mount节点隔离旧异步加载。拼音优先经逐词校读context/wholeword数据，不静默用单字或pinyin-pro补音；缺失明确提示且不露答案。保持原全词写完人工评分、10/20/30锁数和错词两日规则，不push/deploy/main/dev。
Content integration: 按Manager授权先用e8bac3d覆盖阶段接线，随后仅从最终源bd6a065157c09ecc6a2e888013fe39e0a7c7531f更新datajs并选择性导入独有content-review/dictation-pinyin-20261107八份证据，不取source STATUS或未提交内容。最终覆盖2168教材词位+旧28题，共2196位置/2131词形；6儿化允许音节少一，129项审校调整和32语义例验证已记录。stage稿不发布，当前候选使用最终校读数据。
Developer state: 整词拼音在听写默认可见、汉字答案仍隐藏；缺data/缺词有显式不可用提示，不猜读音。新适配器仅补运行时item.pinyin，原JSON、ID和存储键不改。学习窗田字格单行相接，未来字空白；实际完成前字后才建下一字，已完字保留；整词重播/单字演示/练写/关闭全部使旧序列失效，并取消当前动画/quiz。新inner mount防旧异步加载进入复用DOM。手机两字可全见，长词仅词内横滑。
Touch handling: 查看笔顺时允许pan-x与词内横滑，仅当前练写格禁止触摸滚动；换动作时复位其他格触控状态，避免旧无条件preventDefault挡住长词滑动。相应用行为fixture验证查看可滑、练写阻止滚动；没有扩大到账号或评分逻辑。
Checks: 原57回归+新增8行为检查共65项通过（64 Node+原独立词库1）；包括真实固定2.0.2 Promise完成/取消/缺data契约、四字顺序、重播/练字/关窗/切tab/换词旧回调、默认提示与缺音不露字、原loader接入与全部2196覆盖/ID保留。独立内容checker覆盖2196/2131、32语义例、6儿化与25原文件不变并PASS。严格build必需白名单含data/适配器/序列模块，缺data或单词拼音阻断且不覆盖旧完整dist；构建2536当前字/全源2571字缺0，2623公开文件无内部证据/私密路径。app/helper/build语法与diff检查通过。
Handoff: 未执行Developer真实浏览器动画/移动界面验收，不声称QA已通过新UI；交精确SHA给QA独立复核。数据脚本/新版缓存链接均接入，其他词表/2500配套/TXT/目录/调度/云/parent原文件对2d4a088不变。Manager负责最终发布，Developer不push/deploy/main/dev。
## 2026-11-06 — 生字配套与听写预习已部署（Manager final）

用户三项更新完成：12册2500写字位共5000组词/用法、2500自编句，55受限字明示用法；欢迎页移除旧教材区块而保留旧数据/ID/记录。每日预习10/20/30、逐词学习窗/本地笔顺与练字、准备好再逐词听写，仍全词写完后人工自评；开始后当天锁数、刷新留结果、旧15已答队列兼容。错词次日红三角，连续两个相邻日正确后解除每日强化，同日/漏日/再错规则与旧known不误判兼容均完成。

业务88ff104517eed9fa2823b9d7d3fff4ee83116aae；PR11 https://github.com/ico0018/hanzi_garden/pull/11 已合入feature/textbook-word-tables-2026，merge b81660cfbd0cafe4a96dc608dbcb55b46fd1d6d0与候选零文件差异，旧头ba589dc已存backup/2026-11-06-before-dictation-study。干净canonical安全快进；main/dev未改。来源作者SHA及交接备份/原树未跟踪候选全部保留，QA有意STATUS修改不重置。

独立QA exact PASS：57回归+7日期/真实storage矩阵+11异常持久数量及HTML边界；全2500人工逐行读并核对12册冻结JSON、2168原词/全部2500新字850旧字28旧词库ID不变。仅三下18膀páng→bǎng+翅膀、16卜bǔ→bo+萝卜四字段按原词表和权威词条精确纠错，其他2498原字段全同，四下卜bǔ保留。2571字笔画与固定npm字节均有效，2620公开白名单构建。三视口学习窗/四字词/红标/真实上升全词gate与自评刷新，以及最终内容和旧区块移除实测通过；未重做认证/线上孩子云同步，不宣称零扩展console诊断。

直接用QA原始dist（清单SHA7bf3d4c4af91b20bdb2f662c4935839ed731f70385ea9dba8ba37791f6142cbc）发布，排除实际cloud-config。为避免重复上传已有相同vendor，实际更新133文件，全部2619运行资源服务器前后逐项哈希通过，2487保护文件含真实cloud-config字节不变。完整备份 /srv/xuebabangbang-unified-preview/deployment-backups/hanzi-before-dictation-study-20261106-222739.tar.gz（600）。DB/容器/Nginx/DNS无操作。

公网50个运行/教材/代表字形资源200/SHA全同，主域/hanzi和IP/hanzi共6别名请求亦通过且TLS正常校验；全部2619是服务器核验，不冒称公网逐项GET。证据ops/hanzi-dictation-study-20261106/qa/qa-report.md、public-verification.json、server-report.json、release-report.md。

Next owner: User — https://hanzi.xuebabangbang.cn/welcome.html 刷新即可使用。Manager仅提交本私有流程状态，不改变已部署业务来源。

## 2026-11-06 — 已存听写数量边界修正（Developer targeted fix）

Manager在3b4afd7候选发现已存locked queue的size未校型且被预习option拼接，要求仅定向修这一数据边界。现locked size仅保留1–30正整数（正常10/20/30与旧15不变），否则回退到当前题源内有效队列长度数字，保留原ids/results；预习所有state.size文本/属性均显式转义。新增真实started=true与HTML size fixture，验证数量回退、原队列结果不丢、正常档位保留及renderer自身转义，不改调度日期规则或2500内容。
Checks: 恢复后核对仅STATUS/app/scheduler/test四文件差异，无重置或重复扩展。npm test 56个Node项+原独立词库1，共57通过；npm run build当前2536字/全源2571字缺0；app/scheduler/test语法与diff检查通过。所有2500内容与源证据对3b4afd7无差异，交新精确SHA给QA复核边界修正后由root发布；Developer仍未push/deploy/main/dev。

## 2026-11-06 — 2500字完整内容整合（Developer final candidate）

Manager授权只从finish最终提交e523f8ecc123dddf11b7470fdd75edbc2dac3aad导入二下/三下2JSON及5份已提交finish-*证据，并合并保留其两个finish intake/follow-up；2000阶段内容、源作者/证据和既有业务代码不覆盖。integration-sources.json追加content_finish作者/SHA/500位与精确纠错路径，所有12册共2500字位、5000条词或用法、2500句已齐，55位明确用法示例。
Source exceptions: Manager与QA明确允许仅三下lessonKey18 index4膀páng→bǎng且新增readingPhrase翅膀，lessonKey16 index1卜bǔ→bo且新增readingPhrase萝卜，共4字段；四下卜bǔ不动。只读check-integrated逐项建立此四字段预期对象再比较全12册原字段，不泛化忽略pinyin；其他2498位全部原字段一致。全部2500生字ID、2168新词ID、850旧教材字ID及28旧三上词ID与ba589dc完全一致。低检查器保留原字段全表比较，并允许未核新词音空字符串，不将无音词误列usage。
Developer checks: 完整只读内容/ID审计PASS，低1300和高1200内容验证PASS；最终数据上的npm test共56项（55Node+原独立词库1）通过。npm run build当前所需2536独特汉字/连旧源总2571全部有效、缺0；明确白名单不发布content-review、ops、.agents、.git/env/内部脚本。原2168教材词表、旧TXT、目录、原词库与云/家长资源不改；旧known兼容保留5b0a87e新裁决。
Gate: 尚不宣称最终QA PASS或已部署。交确切新SHA给QA做源文件精确比较、原字段四路径白名单、独立7调度矩阵和补充内容UI烟测。root将采用最终QA独立构建字节打包，Developer dist只作检查留存，不push/deploy/main/dev。

## 2026-11-06 — 旧known记录兼容定向修正（Manager revised decision）

在fd977eb已提交2000字阶段整合之后，遵Manager新裁决：没有wrongReview字段的旧lastResult known不能证明曾错，全部保留正常间隔，不凭successCount=1自动加红标或提前拉回次日。此前6c9与本文件历史中的“旧known1保守强化”裁决由本段明确取代；不删除原历史，也不修改任何已有记录。
Implementation: 仅去掉scheduler中的known1推断分支，旧unknown仍强化0起，新版本明确wrongReview.active继续按两个相邻日历日正确；缺日期不能凭correctDays解除。README与测试同步，新增旧从未错known1不标红、不提前调度及原正常到期仍按4天间隔的回归，其他业务/UI代码不变。当前低册500仍独立编写、2000字不是最终内容完成。
Checks: npm test 55个Node项+独立旧词库1，共56通过；调度日期矩阵包含旧known正常保留、旧unknown与明确错词连续两日、重复/跳日/倒退、锁定数量及正常复习。scheduler语法/diff检查通过；此前三视口与学习窗的业务代码没有改动，实际书写gate与最终内容仍待QA确切候选。

## 2026-11-06 — 已提交内容2000字阶段整合（Developer recovery）

Manager明确授权Developer接管已停止高作者的脏树，先备份8项待存成果及原STATUS/哈希/diff到ops/hanzi-dictation-study-20261106/higher-handoff-backup；低原树3个未跟踪候选另备份，既不重置也不导入教学内容。高成果保存bdd389e后，按Manager最终裁决让牺牲/牺牲品恢复普通组词，定向保存高源c0b583c9c058da3e7c162e3c87c5a9f4f421410c，高树clean。原作者high/low各intake与接手记录保留在本文件；来源角色/作者/SHA/文件列表见content-review/integration-sources.json。
Import: 仅从确定Git提交选择性导入高6册1200字及TSV/验证证据、低1c23f78四册800字及已提交内容证据；未导入任何未审候选或未提交数据。不合并其他业务源文件，业务仍为6c9cb35。低二下/三下500字由独立content_finish树负责，未修改或覆盖。
Checks: 独立高1200内容结构/原教材字段检查、低800词音/句关联检查通过（低验证器在集成树明确只检查低册词音，不把高册允许留空的注音当错误）；其全12册原字段检查仍保留。55业务回归和build通过；当前补充词内笔画使当前独特字2518/总2553，缺0。此阶段不宣称全部2500内容完成或最终内容QA通过，也未部署。下一步遵Manager新裁决定向修旧known兼容，再等finish500与最终QA。

## 2026-11-06 — 生字组词造句与预习听写（Developer intake）

Task: 用户要求新版生字2组词1句、移除旧教材书架、每日先词表预习并可学习后按10/20/30听写、错词需连续两日正确解除强化。Developer独占F:/taskHelper/hanzi-dictation-study-20261106，feature/dictation-study-20261106，基底ba589dc；source只JSON/内容证据，待Manager明确通知才整合。
Plan: 预习数量仅未开始当天可变，开始/有旧结果后锁定，旧15题结果保留。v4原存储键兼容，追加队列/强化字段，旧unknown和仅一次known保守保留强化；日期而非点击次数决定连续正确。原人工自评门槛与正常间隔保留，异步回调按页面会话失效。写字表进度ID第四段固定char保持原部署ID，旧TXT不改；欢迎页只删入口不删旧数据/记录。
Content API: 写字JSON可加learningSupportVersion:1，每字words恰好2个{word,pinyin,meaning}及sentence:{groupWord,text}；词与句非空，拼音/释义按Manager允许可空不编造。教材现有char/pinyin/readingPhrase与课次不动。Developer实现验证/展示/build笔画覆盖；sources独立填内容。
Developer state: 业务阶段完成，尚未整合sources内容。新增纯调度模块与预习/词语学习dialog，10/20/30在当日开始后持久锁定；兼容原有已答15词，保留ID/结果。强化按两相邻日历日正确解除，跳日重计、错清零、同日/刷新/倒退日期不能刷日数；旧unknown及有日期known1保守强化。红色三角内白!加屏幕阅读文字；错词优先普通复习，再到新词。学习窗有整词朗读、逐字本地笔顺/练字，不保存听写成绩。
Compatibility: writingTable第四段固定char，新增组词前后ID相同；旧TXT仍原首词ID。书架仅删旧入口，原教材/词库/全部记录键保留。viewEpoch+phase+日期/结果与dialog session使旧异步quiz、关闭/切词/切tab自评失效；真实写完整词后才可人工评分。支持2词1句严格验证与可空注音释义、用法示例标点，原char/pinyin/readingPhrase不改。
Developer checks: npm test 54 Node项+原独立词库1，共55通过；含10项新功能检查、额外跨tab/重渲染自评保护、旧ID前后断言，以及原云/家长/笔画/教材回归按新数量语义更新。npm run build在当前未补内容数据上通过，2405当前字/2480总字缺0；build白名单加入调度模块并收集words汉字，新组词缺笔画会阻断。app/parser/scheduler语法及diff检查通过。源JSON、词语表、旧TXT、目录/原词库、cloud/parent对ba589dc无差异；未整合source。
Handoff: 此提交仅业务阶段，不能宣称全部2500生字补充内容已齐或实际浏览器验收完成。Manager待内容分工完成后通知整合，再重build/QA精确完整候选。README/缓存版本同步本次业务行为；Developer不push/deploy/main/dev。
Next owner: QA — 先独立验业务候选调度与界面；sources继续内容，最终整合由Manager指令。

## 2026-11-06 — 写字表组词例句（Source content intake）

Manager指派内容开发：独占 F:/taskHelper/hanzi-writing-examples-20261106，feature/writing-examples-20261106，基线ba589dc。仅12册writing JSON与内容证据/验证文件及本STATUS；不碰app/parser/build，不push/deploy/main/dev。保留原教材2500字位、顺序、拼音、来源；教学补充明确自编。统计2336独特字、2342字音键；旧四册可匹配822键组词候选、244键句候选，均须复核。其余至少1520键需补词、2098键需补句；main-review补充词汇仅作候选，不直接信任或套句。按册分批人工编写、内容映射覆盖，不伪造教材原文。语气词/单一词素不能假造两独立词，例外用法待Manager裁决并明示。第一批一上100字、三上250字完成：两词与一句，旧三上适宜句经全文校读并修正多音/不自然搭配。一上了/又、三上哦/螃明示用法示例。check-content.py核所有2500原教材字段完全不变、完成册词句关联/普通词目标音匹配。第二批一下200字完成，累计550字；词中照片piàn、北斗/烟斗dǒu更正库草稿误读，用法例外另记录。第三批二上250字完成，累计800字；经Manager确认，词中正常轻声保留真实读音，单字本调不改，审计单列。其余2个低年级册继续；高年级6册由另一独立树接手。Next owner: QA首批内容审核 / Source继续低册。



## 2026-11-06 — 高年级内容接手保存（Developer handoff recovery）

Manager明确授权/root/writing_developer接管本树；实时agent清单确认原higher作者已停止且不再写入，低册剩余500由独立content_finish树负责，不在此树修改。接手前保留HEAD187dece，8项未提交/未跟踪成果及原STATUS均已逐字节备份到ops/hanzi-dictation-study-20261106/higher-handoff-backup，含before.diff与文件SHA256清单；原低树3个未跟踪候选另行备份保留、不采信发布。无reset/stash/清理/覆盖其他树。
Review plan: 原提交高四册900字+未保存六上180/六下120已经全部填入JSON，五下咧liě第二词已由大大咧咧修为龇牙咧嘴。先对原字段/严格parser/特殊usage短语逐项校读并运行独立内容检查，保存单独提交；随后Manager授权业务树选择性整合已提交高1200+低800及来源证据，不合低未审候选。保留原作者各intake与历史，下次handoff写明新SHA；不push/deploy/main/dev。
Recovery checks: 高6册1200字全部通过独立内容check与业务严格parser，剥离补充字段后原教材对象与ba589dc逐项相同。哼hng用带标点语气短句，娜nà用安娜/桑娜，蟋蟀/蚯蚓/猬等标用法示例，咧liě用咧嘴/龇牙咧嘴。修复apply遗留label而遗漏kind的牺，补usage一致标记并在重生成前清旧补充字段；降xiáng第二词由易混读“降服”换为明确“归降”，句子仍用投降。离线整词读音审计仅辅助人工发现歧义，不把库读音自动当教材；保留原教材pinyin不变。最终源校对仍交独立QA，不把结构检查当全内容验收。
Manager follow-up: bdd389e保存后，Manager明确牺的牺牲/牺牲品是两个真词，应按普通组词显示。按新裁决移除牺SPECIAL，用已修复的清旧字段步骤重生成，四上/六下均不保留examplesLabel或kind；增加明确回归断言。前保存点不重写，其他哼/娜/蟋蟀/蚯蚓/猬等usage维持。此行取代上一行临时牺usage处理。

## 2026-11-06 — 四至六年级组词例句（Content Developer intake）

独占F:/taskHelper/hanzi-writing-examples-higher-20261106，feature/writing-examples-higher-20261106，基底ba589dc。Manager授权仅高年级6册补充，每字2组词1自编句，不改原字序/读音/来源。低年级sources独立处理。词义/词音未核时留空；语气词与单一词素只给真实自然用法并显式标用法示例。候选词仅参考现有教材词表/TXT，不盲信自动列表，不套句。先人工编四上，逐册覆盖并记录多音例外。不得push/merge/deploy/main/dev。


## 2026-11-06 — 三下卜字定向纠错（Finish Developer follow-up）

Manager转交QA完整500条通读后的同类旧注音修正：原词表第16组第1词胡萝卜及植物智萝卜luó bo已核，授权仅三下lesson16第2字卜bǔ→bo，新增readingPhrase萝卜，补充词萝卜/胡萝卜和具体洗菜句。0240ecd保留，新增定向提交；四下卜bǔ不动。finish检查器严格白名单三下膀/卜各pinyin+readingPhrase共4字段，12册2500字位置键全不变，其余2498字位原字段完全一致，500位/1000条/500句结构与git diff --check通过。QA已认可纠错，精确新提交待复核。不push/merge/deploy/main/dev。Next owner: QA / Manager。

## 2026-11-06 — 低册内容收尾（Finish Developer intake）

独占 F:/taskHelper/hanzi-writing-examples-finish-20261106、feature/writing-examples-finish-20261106，基线1c23f78。仅补二下/三下500教材字位的两个组词与一个自编例句，原单字/读音/课序/来源不改；其他10册只读。完成：二下250/三下250，1000条词或用法、500自编句，词拼音/释义未核全留空。受限词素10位（邓/芬/吴/佛、鸳/鸯/匕/系/屿/嗽）显式用法示例。检查通过：每字恰两不同条目含目标字、句含groupWord且groupWord属于两条、原教材字/课序/字序/总数/来源全保留。唯一Manager与QA核原词表及教育部辞典授权纠错：三下lesson18第5字膀páng→bǎng并新增readingPhrase翅膀，组词翅膀/肩膀；其余所有原读音与readingPhrase全等，校验器仅定点allowlist这两字段。证据ops/hanzi-writing-examples-20261106/finish-*，git diff --check通过；待独立QA全文验收，不声称QA PASS。不push/merge/deploy/main/dev。Next owner: QA精确候选 / Manager集成。


## 2026-11-05 — 本地笔画资源已合并并部署（Manager final）

用户确认处理本次合并：选择性整合main06beda9的本地笔画/拼音资源修复，当前课程和账号线为基底。独立QA精确候选fca13ef6399202136aa235a176215526de099747 PASS；PR https://github.com/ico0018/hanzi_garden/pull/10 已合入feature/textbook-word-tables-2026，merge baccb73b5910e0ab04b3d266278535ce61bb44ee与QA候选文件树完全一致。旧远程头1b6cf25已存backup/2026-11-05-before-local-strokes。main/dev未改；本地原干净d69fe8e已--ff-only同步此merge，不动其他工作树。

44检查、独立2416实际练习字覆盖、2480份本地JSON结构/固定数据字节、39保护文件/18核心函数、构建私密文件排除均通过。真实Chrome一画→自评→刷新保留、新二上15词/妈妈双格及/hanzi/样例丸/乙/湘SVG均通过；不声称扩大认证/移动端测试。独立部署对照2489文件字节一致、helper仅CRLF/LF且Git规范内容一致，报告明确记录。证据ops/hanzi-local-strokes-20261105/qa/final-report.md。

已部署腾讯云2490资源（vendor与helper/app/index），39基线预检无差异，38个线上保护文件含实际cloud-config前后字节一致。12册2500写字位、10册2168词、旧教材/ID/记录、每日15与云/家长原样保留。完整备份 /srv/xuebabangbang-unified-preview/deployment-backups/hanzi-before-local-strokes-20261105-115201.tar.gz（600）。数据库、容器、Nginx、DNS无调整。

公网44个代表运行/许可证/字形资源全部200且SHA256与发布包一致，包含全部31个原漏字；根域/hanzi及IP/hanzi的index与乙.json四次别名请求也通过，TLS正常校验。全部2490资源在服务器逐项校验，非声称公网逐项GET2490。结果ops/hanzi-local-strokes-20261105/public-verification.json。

Manager仅追加本状态文档并保存到已合并的线上功能分支；不改QA业务候选或重置QA/main-review树的有意文档修改。Next owner: User — https://hanzi.xuebabangbang.cn/welcome.html 刷新后使用。所授权合并和网站更新完成。

## 2026-11-05 — 本地笔画资源选择性移植（Developer intake）

Task: 用户授权处理main本地笔画资源修复，Manager指派Developer在独占F:/taskHelper/hanzi-local-strokes-2026、feature/local-stroke-assets-2026，基底d69fe8e上选择性移植，不覆盖当前教材/业务。
Plan: 固定writer2.0.2、data2.0.1、pinyin3.18.2，本地loader接现有3个书写入口；构建只发布白名单资源，以实际12写字表/10词表和旧4教材/旧3词库解析结果收集必需字，缺字或坏数据阻断。保留2500写字位、2168词、旧ID/进度、每日15和全词写完再自评；不引入main其他课程/句子/10-20-30或自动push工作流。
Developer state: 完成选择性移植。3个HanziWriter入口显式使用本站loader，失败可重试，实践状态节点按本次页面捕获，离开后失败不访问新DOM。index仅将writer/pinyin换为本站vendor并先加载loader；云脚本/教材加载顺序保留。Vercel指定npm run build及dist，原跳转/家长页限制保留。无main课程/句子/10-20-30/自动push工作流移植。
Build: 固定依赖及lock下载完整性已通过实际npm ci（指定ops npm-cache）；实际解析12写字表2500字位、10词表2168词、旧4教材及旧三上题库，当前独特字2405、旧源字1408、并集2480，所需数据全有且有效。旧四上TXT解析实际250条，只读取不修改。build在验证完整数据后才替换固定dist；必需字缺失/损坏或教材错误均失败，先前完整dist保留。发布明确白名单，包括运行页面/云脚本/22册JSON/5旧TXT、固定库及4许可证说明；不枚举发布.git（含worktree文件型）、.agents、.env、内部脚本/维护摘要。
Developer checks: npm run build通过，2480/2480笔画有效且缺0；npm test共44项通过（原39+新5）。新检查覆盖各域名前缀/并发共享、网络HTTP/JSON/格式失败重试、真实writer2.0.2回调契约、切离练字页面的失败回调不误写新DOM/不提前自评、实际全字覆盖与构建排私密/缺字损坏阻断。app/loader/build语法及diff检查通过。写字表/词语表/TXT/目录/每日词库/云/parent文件均未改。
Handoff: README说明仅部署dist及保留线上定制cloud-config.js并校对摘要；生成资源不提交。尚未进行Developer实际浏览器书写验证；交QA独立验证精确候选及构建产物。Developer不push/deploy/mainmerge。

## 2026-11-04 — 教材词语表已接入每日听写并部署（Manager final）

业务来源67f46b131648d287125d62475c9ed296155f7f39，二至六上下10册2168词；一年级上下经原书确认无独立词语表，页面明确说明。按原课序词序与园地收录，新book/lesson/word稳定ID，旧三上词库/ID/记录与2500写字表保留。原表无注音不生成猜测拼音或释义。每日最多15词、原复习间隔与逐字写完再自评继续沿用。

独立QA PASS：源逐词校读、10册2168/2无表、24个保护资源、18个旧核心函数及gate尾段、39回归与语法/diff通过；真实浏览器二上15词/239词题源/隐藏→显示妈妈，一上无词表，旧三上15词/原题源/早晨均通过。未重复未变的实际笔画、音频、手机平板或认证测试，不声称扩大覆盖。证据ops/hanzi-word-tables-20261104/qa/final-report.md及对应三份JSON。

腾讯云仅更新15静态文件，29个基线文件预检一致，25个线上保护文件含云配置前后字节一致。完整备份 /srv/xuebabangbang-unified-preview/deployment-backups/hanzi-before-word-tables-20261104-120229.tar.gz（600）。公网15文件全部200且SHA256与精确发布包一致，10词表合2168，根域/hanzi与IP/hanzi别名欢迎页同样200且摘要一致，正常校验证书。不改数据库、容器、DNS。

feature/textbook-word-tables-2026已推送，草稿PR https://github.com/ico0018/hanzi_garden/pull/9 对feature/writing-table-2026，已附加；未合并main/dev。Developer已交回干净树，Manager此后只提交本状态记录，QA独立树文档改动保留；后续文档提交不改变已部署业务来源67f46b1。

Next owner: User — https://hanzi.xuebabangbang.cn/welcome.html 选择二至六对应教材后进入每日听写。所请求教材词语表与腾讯云更新完成。

## 2026-11-04 — 教材词语表接入每日听写（Developer intake）

Task: 用户要求按人教版教材末尾词语表更新每日听写。Developer 独占 F:/taskHelper/hanzi-word-tables-2026，feature/textbook-word-tables-2026，基线96d090f；Manager/source负责原页转录，QA独立验收精确候选。
Plan: 新2026-*册次仅接入已核对的本地结构化词语表，保留原课原词序、来源和版本；按bookId+lessonKey+word稳定定位题目。无独立原表、未整理与加载失败分开提示，不从单字生成组词/释义。旧3-upper词库及其ID/进度保持兼容，每日15上限、复习间隔和写完后手动自评保留。写字表2500字位、旧TXT、云同步和家长相关文件不改。
Developer state: 十册原表2168词已接入：二上239/二下243、三上250/三下271、四上220/四下213、五上213/五下142、六上215/六下162。一上/一下无独立词语表的目录/末尾证据已记录；四上“谈话”采用source最新修正。原表未标拼音，全部留空，不批量猜填。标题只显示原课号/识字号/已核目录的园地号。阶段实现904ad79后，本次仅补齐数据、册次入口、实际总数断言与文档；不重写历史。
Developer behavior: 本地词语表验证/接入、三类空状态和失败隔离已实现；词表出错不阻断写字学习。题目ID不依赖索引或标题；完成页显示实际词数，脚本缓存版本更新到20261104。旧3-upper函数输出、存储键和词库保留，写字表2500字位/TXT/cloud/parent保护文件diff为空。
Developer checks: 新10项通过，含全部10册/2无表与2168词断言、完整课词序摘要、来源核验、稳定标识、本地加载/失败隔离、队列15上限/复习间隔、全词写完后手动自评、空状态与短队列完成。原写字表7、旧词库1在最终数据上再次通过；云11和家长8在相同业务代码阶段已通过，共37项。app/daily-word-bank/catalog语法及diff检查通过。
QA gate: Manager手转扫描原表仍待QA独立逐页对照，本记录不宣称源内容QA PASS。若有局部词形修正，另提交定向修正，不重写已保存提交。尚未进行Developer浏览器实测。
Developer correction: 完整候选8c7e757保存后，第二人逐词核原图纠正三下两处转录：garden-1“乞讨”改“乙方”，reading-23末“毒辣辣”改“轰隆隆”；三下仍271词、总2168词。仅重生成该册及源序摘要，新增两处回归样例并保留四下确认词“登陆/践行/劈面”。词语表11项（含新增样例）与diff检查通过。不修改应用逻辑或旧记录，不重写8c7e757；其他扫描册继续待独立QA。
Developer final source correction: Manager随后通知扫描原表独立逐词校对全部完成，最后一处五上reading-5第14词依据原PDF126由“推荐”改“推辞”；六上215和四下213全表确认，无更多待定。本次仅更新五上该词、序列摘要、回归例及本记录；五上仍213、总2168。词语表12项及diff检查通过，不重跑未改动的旧27项；保留f11f4bb及之前提交历史。源校对完成不等同于应用最终QA或部署完成，精确候选交QA验收。
Next owner: QA — 使用精确候选核源/核心流程；Manager记录验收与后续部署。公开运行变更共15文件（10册词语JSON+app/daily-word-bank/catalog/index/welcome），source-checks与README为维护资料。Developer不部署/push/merge。

## 2026-11-04 — 2026 写字表已部署（Manager final）

业务候选815866193f9f7321be5c19823a91ff975ba237d2已部署到腾讯云汉字子站，仅19个静态文件。12册2500字位，旧四册、原词库和学习记录命名保持兼容。私密备份 /srv/xuebabangbang-unified-preview/deployment-backups/hanzi-before-writing-20261104-101701.tar.gz；8个线上保护文件含cloud-config前后字节摘要相同。数据库、容器、DNS不作调整。

独立QA内容与核心流程PASS：逐课数据/重点读音/保护文件、27项回归；1440书架与六上加载、真实一画完成→自评→刷新保存、375书架无横向溢出。CUA连续超时后停止重试，768、375学习页宽度及旧新三上听写浏览器项未完成，明确不声称全浏览器PASS。相关16个笔画/自评/保存/听写函数与基线逐段一致；Manager接受剩余浏览器覆盖为平台限制。证据ops/hanzi-writing-20261103/qa/final-report.md、browser-results.json、candidate-data-results.json。

部署后公网正式域名19文件逐项SHA256一致，12册字数合计2500；根域/hanzi与IP/hanzi两别名同样200且欢迎页摘要一致，正常校验证书。结果ops/hanzi-writing-20261103/public-verification.json。

功能分支feature/writing-table-2026已推送，草稿PR https://github.com/ico0018/hanzi_garden/pull/8 对feature/unified-user-system，未合并main/dev。Manager在Developer已交回的干净树中仅提交本状态文档；QA独立树的状态记录保留，不重置。后续文档提交不改变已部署业务来源8158661。

Next owner: User — 可直接访问 https://hanzi.xuebabangbang.cn/welcome.html 选择教材。所请求写字表与已授权腾讯云更新完成。

## 2026-11-03 — 2026 写字表补全（Manager intake）

Task: 用户要求汉字乐园补齐对应人教版2026现用语文课本写字表，现只有1—4上册可用。
Acceptance: 主书架12册均依据已核对的2026现用教材末尾写字表，使用独立2026-*册次ID，记录版本、课次、字数和来源；不以识字表冒充写字表。原有4册TXT与旧ID学习键保留在折叠书架，词语听写题库、云同步与家长入口保持兼容；新版仅写字表练习，缺少组词时不编造释义。2026秋4—6上册使用新版，下册标明已核实的现用版。
Safe plan: 当前feature/unified-user-system干净，基线1ba3103；Manager只修改流程记录与研究证据。Developer另建F:/taskHelper/hanzi-writing-2026 worktree，feature/writing-table-2026；QA在独立worktree核验Developer确切提交。无main/dev合并。用户当前请求延续腾讯云网站更新，QA通过后更新该静态子站并保留回退备份。
Developer state: Done — 主书架12册2026-*本地JSON，共2500教材字位；含版本/原页/课次/拼音。源图逐字核验后纠正牺、莺、倚等混字；Manager最终语境裁决结jiē/教jiāo/倒dào/哩lī（呜哩哇啦）/晃huàng/禁jìn/哇wa/扎zā/薄báo已纳入。旧4册放入折叠书架，旧TXT、词语题库、cloud与parent文件逐字节不变。新版用lessonKey定位进度，旧ID规则兼容；不生成伪组词或造句。
Developer checks: 写字表集成7项、独立词语题库1项、云同步11项、家长界面8项共27项通过；app/catalog/writing-tables/welcome语法及diff check通过。Developer浏览器可见12册选择与六上19课组、首课10字加载；后续田字格操作遇浏览器平台browser.user unavailable，不虚报交互PASS。完整三视口与最终语境复核交独立QA。
Developer follow-up: 69e2aa8保存后收到Manager最终原页裁决，哩由li定向纠正为lī并加原课文读音提示“呜哩哇啦”；不重写已保存提交。7项内容/集成测试重新通过，其余业务代码与旧19项云/家长检查对应代码未再修改。
Next owner: QA — 在精确候选提交独立验收。禁止Developer部署/main/dev操作。运行部署资源为12个JSON加7个页面/脚本/样式，共19个静态文件。



## 2026-10-07 — Project README refresh

```text
Task: Add a clear README that reflects the current Hanzi Garden implementation.
Acceptance criteria: Document only currently available books and implemented learning/dictation behavior; include local run, static deployment, curriculum data format, core files, browser-local progress, and frontend dependencies; do not claim unavailable curriculum support.
Developer branch: feature/update-readme-dev
Developer worktree: GitHub connector edit; no local worktree created
Developer state: Done — README added in 32b537369e568eb597eed9a369854832cd0bf2ca
QA result: PASS
QA evidence / defects: Diff contains only README.md plus this status record; README was checked against index.html, app.js, book-catalog.js, daily-word-bank.js, vercel.json and current curriculum availability; Vercel status check passed on 410eea340602a7f78c28fbfb1af779e9c6e41ae1.
dev merge: Completed — PR #2 merged as 4be195e3870e95e80e85ae9960d486ecdf854e3c
Preview: Vercel check passed
Human acceptance: Approved — user said “给main加一个readme”, 2026-10-07
Next owner: Manager — release dev to main
```

## 2026-09-19 — Explicit daily word-bank refresh

```text
Task: Replace generated daily-dictation phrases with an editable Grade 3 Upper word bank.
Acceptance criteria: The supplied 28 words are stored one per line in a UTF-8 TXT file; only that file supplies Grade 3 Upper daily dictation; other books show a configured-bank empty state; v4 keys do not read/migrate generated queues.
Developer branch: feature/daily-word-bank-current
Developer worktree: F:\chinese webapp\.worktrees\daily-word-bank-current
Developer state: Done — explicit Grade 3 Upper bank, v4 isolation, and focused Node behavior test completed.
QA result: PASS
QA evidence / defects: Independent QA passed exact `c793bacd551b0fe46e11b44717b3c991e0c5109a`: TXT contents/order, Grade 3-only source, non-generated empty state for other books, v4 storage isolation, load order, syntax checks, test script, and diff check. Final main checks also passed: `node --check app.js`, `node --check daily-word-bank.js`, `node scripts/test-daily-word-bank.js`, and `git diff --check origin/main...HEAD`.
dev merge: Completed — GitHub `dev` fast-forwarded to `c793bac`.
main merge: Completed — `735c106 merge: release editable daily word bank`.
GitHub push: Completed — origin/main advanced from 9e3645e to 5f05c94.
Next owner: Manager
```

## 2026-09-02 — Grade 3 sentence-learning candidate

```text
Task: Add an optional, backwards-compatible sentence and linked group-word field to the character data model; show it in the character-learning page; give every current Grade 3 Upper character a sentence; and add reproducible data validation.
Acceptance criteria: Every non-comment character entry in 生字数据.txt has a sentence linked to its first group word; each sentence contains that linked word; legacy textbook files remain parseable; the learning page renders the linked group word and “造句”; verification is reproducible.
Developer branch: feature/third-grade-pdf-sentences
Developer worktree: /root/Documents/Codex/2026-09-02/https-github-com-ico0018-hanzi-garden/worktrees/third-grade-pdf-sentences
Developer state: Done — QA-001 corrected: all 250 sentences are individually authored natural-context uses of their linked first group word; the former automatic metadata-population tool was removed.
QA result: PASS for the exact feature candidate `8e9073fea6dd266d444b19e4cf73836d2b72a373`; the user accepted the disclosed PDF-source and browser-runtime limitations for this release.
QA evidence / defects: Independent QA verified 250/250 linked unique contextual sentences and 600 legacy entries; parser, source-preservation, escaping, diff, and validator self-test checks passed. PDF source replacement and browser DOM/three-viewport evidence remain known gaps: neither a PDF nor Node/Chromium/agent-browser was available. The user explicitly accepted the current candidate rather than asserting that the PDF curriculum replacement is done; full evidence is in `.agents/QA.md` in the Manager worktree.
dev merge: Completed locally — fast-forwarded `dev` from `7eb22aa` to `8e9073f`; release checks passed, remote push pending
Preview: Static HTTP probe passed — `index.html`, scripts, styles and the current Grade 3 data file returned HTTP 200; browser runtime not available in this environment
Human acceptance: Approved — user said “验收pass，合并到main吧”, 2026-09-02
Next owner: Manager — push `dev`, fast-forward `main` through a clean release worktree, then push without force
```

## 2026-08-19 Production release authorization

```text
Release scope: QA-passed multi-book curriculum support, audio/dictation fixes, and persistent switch-book navigation from dev.
Human acceptance: Approved — user said “合并到main并推送github”, 2026-08-19.
Rollback branch: backup/2026-08-19-pre-main-release at 60c04e5.
main merge: Completed — c62b93d merge: release dev to production.
Verification: node --check app.js, node --check welcome.js, node --check book-catalog.js, and git diff --check origin/main...HEAD passed.
GitHub push: Completed — origin/main advanced from 60c04e5 to dd77082.
Next owner: Manager
```

## 2026-08-19 Switch-book navigation integration

```text
Task: Add a persistent header-level “← 切换教材” control to the multi-book learning page.
Developer branch: feature/add-multi-grade-data
Developer commit: 7a5572c feat: add switch-book navigation
QA result: PASS
QA evidence / defects: Exact commit `7a5572c1e5a8033786adc10c03fda199c113737c` passed `node --check app.js` and `git diff --check 7a5572c^ 7a5572c`; static QA confirmed a persistent pre-tab header control, `welcome.html` navigation only, no storage mutation, and <=640px responsive layout.
dev merge: Completed — `e720efb merge: add switch-book navigation`
Preview: Not requested
Human acceptance: Waiting
Next owner: User
```

## 2026-08-19 Multi-book global navigation addition

```text
Task: Add a persistent, header-level “← 切换教材” control to the multi-book learning page.
Acceptance criteria:
- `index.html?book=1-upper`, `2-upper`, `3-upper`, and `4-upper` each show the control at the upper left in the app header.
- The control is visible in both 生字学习 and 每日听写, returns to `welcome.html`, and makes no localStorage or progress mutation.
- Desktop, iPad, and narrow mobile layouts keep the title unobstructed.
Developer branch: feature/add-multi-grade-data
Developer worktree: F:\chinese webapp\.worktrees\add-multi-grade-data
Developer state: Done - header-level switch-book control implemented; no commit created.
QA result: PASS
QA evidence / defects: Independent QA on the uncommitted `feature/add-multi-grade-data` candidate: `node --check app.js` and `git diff --check` passed. The `switch-book-button` is in the static App Shell header before `#app-tabs`, so it remains present for both learning and dictation views. Its click handler only sets `window.location.href = "welcome.html"`; the handler contains no storage mutation. At <=640px `.topbar-left` becomes a left-aligned column with an 8px gap, preserving the title. Static assertions passed for all of these conditions. Browser interaction was not run.
dev merge: Not allowed — awaiting QA PASS
Next owner: QA
```

## 2026-08-19 Multi-book dataset integration

```text
Task: Integrate user-provided Grade 1, Grade 2 and Grade 4 character datasets and complete multi-book loading.
Developer branch: feature/add-multi-grade-data
Developer worktree: F:\chinese webapp\.worktrees\add-multi-grade-data
Developer state: Done — `a56c6d4 feat: add multi-grade book datasets`
QA result: PASS
QA evidence / defects: Independent QA verified exact `a30251b` / `a56c6d4`: syntax and diff checks, catalog availability, script load order, URL propagation, fail-closed invalid selection, original-data preservation, parser counts, and book-scoped practice/dictation keys all passed.
dev merge: Completed — `1e2dd42 merge: add multi-grade book datasets`
Next owner: Manager
```

## 2026-08-19 Audio fallback and write-before-review

```text
Task: Fix audio fallback and enforce write-before-review daily dictation.
Developer branch: feature/fix-audio-dictation-flow
Developer worktree: F:\chinese webapp\.worktrees\fix-audio-dictation-flow
Developer state: Done — `ad0ec06 fix: fallback audio and require dictation writing`
QA result: PASS
QA evidence / defects: Independent QA passed exact `a983df0` / `ad0ec06`: syntax and diff checks; mocked error, rejected play, synchronous throw, and timeout each produced one TTS fallback; human `onplaying` suppressed fallback; the daily flow has no manual bypass, gates assessment on every HanziWriter completion, and fails closed without HanziWriter. Browser/iPad interaction remains unexecuted.
dev merge: Completed — `0bb73cb merge: fix audio and dictation flow`
Next owner: Manager
```

| Field | Current state |
| --- | --- |
| Last updated | 2026-08-17 — Daily Dictation commit 7954325 integrated into dev after QA PASS |
| Manager | Active — daily dictation preview coordination |
| Developer | Done — daily dictation feature integrated |
| QA | PASS — commit 7954325 |
| Current task | Daily Dictation first — legacy-aligned flow; memory redesign deferred |
| Branch | `dev` |
| Worktree | Integration: `F:\chinese webapp\.worktrees\daily-dictation-dev` |
| QA status | PASS — 15-item persisted queue, reveal control, listening, Tianzige and manual self-assessment verified |
| Preview status | Not requested / not verified — dev contains 7954325 |
| Human acceptance | Waiting — main release forbidden without explicit approval |

## 2026-08-17 Daily dictation handoff

```text
Task: Complete the old-version-style daily dictation flow before any memory/spacing redesign.
Acceptance criteria: Daily queue is capped at 15; each prompt has a listen action; pinyin and word answer are hidden until the learner chooses to reveal them; each word character has a Tianzige handwriting area; learner manually marks “我会写 / 我不会写” after writing; queue and result persist locally. Memory/spacing redesign is out of scope.
Developer branch: feature/dictation-interaction
Developer worktree: F:\chinese webapp\.worktrees\dictation-interaction
Developer state: Done — `7954325 feat: align daily dictation flow`
QA result: PASS
QA evidence / defects: `node --check app.js` and `git diff 7954325^ 7954325 --check` passed. QA confirmed queue cap/persistence, hidden pinyin and answer, listen control, Tianzige/HanziWriter targets, manual self-assessment and next-item progression.
dev merge: Completed — fast-forwarded to `7954325`
Preview: Not requested
Human acceptance: Waiting
Next owner: Manager
```

## 2026-08-18 Welcome start-button repair

```text
Task: Repair the welcome-page “开始学习” control reported as unresponsive.
Acceptance criteria: Clicking the default Grade 3 Upper start control must enter `index.html?book=3-upper`, including when the external welcome script does not execute; normal welcome-script behavior remains intact.
Developer branch: feature/start-learning-button-fix
Developer worktree: F:\chinese webapp\.worktrees\start-learning-button-fix
Developer state: Done — `427ff63 fix: make welcome start control navigate reliably`
QA result: PASS
QA evidence / defects: QA independently verified exact `427ff63`: clean worktree, `node --check welcome.js`, `node --check app.js`, and `git diff 427ff63^ 427ff63 --check` pass; a DOM-stub test confirmed the fallback invokes `window.location.assign('index.html?book=3-upper')`, preserving the only enabled Grade 3 Upper selection.
dev merge: Completed — merged as `e633745 merge: repair welcome start control`
Preview: Ready locally — http://127.0.0.1:4173/welcome.html (HTTP 200)
Human acceptance: Waiting
Next owner: User
```

## Required task record

`
Task:
Acceptance criteria:
Developer branch: feature/<task>
Developer worktree:
Developer state: Running | Waiting | Blocked | Done
QA result: Waiting | PASS | FAIL | BLOCKED
QA evidence / defects:
dev merge: Not allowed | Ready | Completed
Preview: Not requested | Deploying | Ready — <URL>
Human acceptance: Waiting | Approved — <exact user words and timestamp>
Next owner:
`

## Previous status preserved for context

# Delivery Status

> Update this dashboard at every material state change and handoff.

| Field | Current state |
| --- | --- |
| Last updated | 2026-08-16 — direct-to-main push requested; backup pending |
| Manager | ACTIVE — create rollback branch then push current feature to `main` |
| Developer | READY FOR QA — implementation completed on `feature/dictation-spaced-repetition` |
| QA | WAITING — interaction validation pending after main push |
| Current task | Add a 15-word/day manual-marking dictation trainer with spaced repetition |
| Branch | `feature/dictation-spaced-repetition` |
| Working tree | Policy update awaiting commit at inspection time |
| QA status | NOT STARTED — syntax and diff checks passed; interaction validation pending |
| Preview status | NOT REQUESTED / NOT VERIFIED |
| Human acceptance | NOT REQUIRED for the user-approved direct-to-main workflow |

## Active task template

```text
Task: Add an independent Dictation tab.
Scope: Draw only from existing lesson vocabulary in lesson order; offer exactly 15 items per day; require a manual "can write" or "cannot write" mark for each item; persist progress locally; schedule repeats by an Ebbinghaus-style interval plan.
Acceptance criteria: New words begin with lesson 1 in order; a "cannot write" mark makes the item eligible again tomorrow; a "can write" mark increases its review interval; no automatic correctness marking; daily queue never exceeds 15 items; existing learning tab remains available.
Developer branch: feature/dictation-spaced-repetition
Developer state: READY FOR QA
QA result: NOT STARTED
QA evidence / defects: `node --check app.js` and `git diff --check` passed. Interactive browser verification is pending.
dev merge: NOT REQUIRED for the user-approved direct-to-main workflow
Preview: NOT REQUESTED
Human acceptance: WAITING
Next owner: Developer
```
## 2026-10-08 — Unified user system tool sync
Task: Integrate account/profile scoped cloud learning data without changing learning rules.
Developer branch: feature/unified-user-system
Developer worktree: F:/taskHelper/unified/hanzi (separate checkout; sole Developer)
Developer state: Running — storage inventory complete, implementing durable optimistic sync.
QA result: Waiting
Preview: Tencent isolated preview requested; production and DNS forbidden.
Human acceptance: Waiting; do not merge main.
Next owner: Developer / Manager

## 2026-10-08 — Unified user sync handoff
Developer state: Done — static account UI, isolated per-user/profile caches, durable outbox, optimistic conflict and export/recovery handling implemented; old guest keys retained.
Tests: 10 tool cloud regressions PASS; existing daily word-bank test PASS; app/cloud/ui syntax and diff checks PASS. Cross-tool independent QA 27 PASS.
QA result: Waiting — exact feature commit pending independent API/browser review.
dev/main merge: Not allowed; user requested Tencent branch preview and owner review before main.
Next owner: QA / Manager.

2026-10-08 follow-up: canonical payload comparison handles PostgreSQL JSONB key ordering without false dirty/conflict; accounts without child do not reload on every focus. New regression cases PASS.

2026-10-08 follow-up: local storage quota failures now explicitly report not saved/not synced; last readable payload is retained. Cloud regression remains 10 PASS per tool.

## 2026-10-08 — Unified accounts and cloud sync: Manager final local gate

Task: Connect existing static Hanzi learning records to the shared parent/child API, preserve guest history and original curriculum, and prepare only isolated Tencent branch deployment.
Developer worktree: F:/taskHelper/unified/hanzi
Developer branch: feature/unified-user-system
Developer state: Done; business commit 94fe0ff29bb1fbc658a4ad94a9d231bd6e16bd7d.
QA result: LOCAL IMPLEMENTATION PASS. Original word-bank and syntax tests; cloud10; independent three-adapter sync30; real PostgreSQL/API integration and browser account/child/offline/multi-device checks pass. Main QA report is recorded in portal docs/unified-qa.md.
Draft PR: https://github.com/ico0018/hanzi_garden/pull/4 (base dev).
dev merge: Not performed; draft review only.
Preview: Current local localhost8321 available. Tencent deployment NOT VERIFIED; awaiting current user SSH-credential reuse authorization after auto-review rejection. COS/SMTP and deployed HTTPS remain pending.
Human acceptance: Waiting; main merge and production release forbidden.
Next owner: Manager — finish authorized isolated deployment after credential confirmation; user then checks actual cloud environment.

## 2026-10-08 — Tencent isolated owner-review gate

Manager state: Done — feature branch deployed to Tencent Guangzhou, /srv/xuebabangbang-unified-preview with rootless Docker and loopback Nginx; original production services and content unchanged.
QA result: Deployed cloud account/security, three tools, child isolation, offline recovery, second-browser restore, authenticated account/admin mobile layouts PASS. Database restart and fresh restore match all11 table hashes; cloud-backup-server-results evidence recorded in portal/docs/evidence.
Preview: http://localhost:8321/ through fixed-host-key SSH tunnel; account8320, guwen8322, taskhelper8323; local private mail helper8324.
External gates: COS missing bucket/role, real SMTP and production-domain HTTPS/filing unverified; timer explicitly local-only and ubuntu.
Human acceptance: WAITING — READY FOR OWNER REVIEW; main/dev merge not performed, DNS NOT CHANGED.
Next owner: User — manual check; Manager handles requested fixes, no production action without separate authorization.

## 2026-10-08 — Parent controls simplification (active)
Task: Chinese arithmetic three-choice parent gate; move sync/import/export to parent pages; remove repeated password and 15-minute lock.
Acceptance: Server checks arithmetic for signed-in sessions, same login retains parent access; student UI hides record tools; preserve account/admin authentication and learning data isolation.
Developer branch: feature/unified-user-system in all four repositories.
Developer worktrees: accounts sole owner F:/taskHelper/unified/portal; tool_sync sole owner F:/taskHelper/unified/taskhelper, hanzi, guwen. Separate existing feature checkouts; no overlapping business-file writers.
QA: qa independently verifies exact candidate; Manager coordinates/deploys only after PASS.
Safe plan: Existing trees clean at intake; preserve all prior changes. No merges, production/DNS changes. Tencent isolated preview only.
Human acceptance: Waiting. Next owner: Developers / QA.


## 2026-10-08 — Parent controls simplification: Developer handoff
Developer worktrees: Sole editor of taskhelper/hanzi/guwen feature/unified-user-system checkouts; no curriculum edits.
Developer state: Implemented Chinese multiplication question with three numeric choices. Signed mode uses server parentReady for the whole current login; guest uses tab-scoped sessionStorage and explicit parent exit. Password/PIN setup and 15-minute timer removed. Task records inside /parent/ gate; Hanzi/Guwen parent.html on original origin. Student pages show only parent entry and learning content; automatic cloud sync still runs.
Tests: Task40 core/parent PASS; each tool11 cloud regressions PASS; each static tool4 parent UI regressions PASS. Final lint/typecheck/build and exact candidate QA follow.
Safety: No push/deploy/merge/DNS/production actions; original guest records, caches and recovery copies retained. Explicit parent-lock/logout clears grant.
Next owner: QA / Manager — inspect exact feature heads and only update isolated Tencent preview after PASS.

Final developer checks: Task40 tests/lint/typecheck/webpack build PASS; each cloud11 and static parent UI4 PASS; Hanzi original word-bank PASS; Guwen original Node20 and Python27 PASS. Feature candidates ready for independent QA, no release performed.

Parent UI follow-up: wrong/expired server challenge400 and rate-limit429 display friendly Chinese; no changes to authentication or learning rules. Targeted tests updated.

## 2026-10-08 — Parent simplification final isolated gate
Business source ffaa0b705497b2371889f5a3783c7bc5aa5dc77f; later status-only commit. Sole tool_sync Developer handed off final source, no overlap.
QA: PASS — independent local/API and deployed375/768/1440 browser. Student record management hidden, parent same-origin import/conflict export/restore works, one current-login arithmetic grant reused, task/child data isolated, no browser errors. Full report portal/docs/unified-parent-qa.md.
Preview: Deployed Tencent existing isolated rootless/ubuntu/loopback environment. Original production and existing data unchanged. No database migration.
Manager: Feature branches saved; no dev/main merges or DNS changes.
Human acceptance: WAITING — ready for manual inspection, no release authorized.
Next owner: User.

## 2026-10-08 — Central parent record controls (active follow-up)
Task: Remove every parent entry from Hanzi/Guwen student pages; put both tools' local import/backup/recovery controls directly on the central parent page.
Confirmed user preference: Taskhelper /parent/ is the central parent page; portal business changes unnecessary.
Developer tool_sync sole writer static Hanzi/Guwen and taskhelper existing feature/unified-user-system checkouts; accounts read-only portal preparation if preference changes. QA independently verifies exact candidate.
Safe plan: Four trees clean at intake; preserve existing auth/math/learning data, no unrelated refactors. UI embedding must keep records at each tool's own origin, no cross-origin storage access or arbitrary postMessage data operations.
Release: Only existing Tencent isolated preview; no main/dev merges, DNS/production changes.
Next owner: Developer / QA; human acceptance waiting.

## 2026-10-08 — Central parent controls: isolated deployment handoff

User confirmed Taskhelper /parent/ placement. Exact final business sources Task9e9c98b, Hanzi5af7888, Guwend9fcc04 passed independent local13 and applicable Developer checks. Manager deployed static-only archive plus two exact preview CSP locations, EXIT0. Database content and app image unchanged, production homepage unchanged, no migrations or new public ports. Deployment evidence unified/qa/central-release-results.json.
QA is now running actual cloud browser record/import/cancel/conflict/child/gate checks. Human readiness stays PENDING cloud browser PASS; no main/dev merges or production release. Manager-owned STATUS remains the only unstaged Hanzi file, intentionally preserved for final documentation commit.
Next owner: QA / Manager.
## 2026-10-08 — Central parent record controls: final isolated gate

User confirmed Taskhelper /parent/ as central parent page. All Hanzi/Guwen learning pages now have no parent entry or record-management DOM. Both same-origin record widgets are directly visible under the existing Task parent gate; one child selector and exit, no repeated password/math or fifteen-minute lock. Original guest data, account/child isolation and background sync preserved.

Business sources: Task9e9c98bbb8f9059a471451116cbbed86985dc08b / Hanzi5af788877c523fa2b0e563ae171845aee3fce3f9 / Guwend9fcc04e721ff89e1333cea3915e89e270c965fb. Portal business81abd4a89b9f37295c7e8c5c3aa64940b8a5eb61/image unchanged; portal ops/docs-only changes and later Hanzi Manager docs separately saved.

PASS: independent13 local cases; Task43 + cloud11 + lint/typecheck/final static build; both staticUI8/cloud11/syntax and original curriculum checks. Independent actual cloud browser375/768/1440: student removal, real two widgets, inline import cancellation/confirmation, backups/conflict recovery, child isolation, one mode exit, signed/forged activation rejected. Report portal/docs/unified-parent-central-qa.md and evidence parent-central-controls-*.json.

Only /srv/xuebabangbang-unified-preview updated, static-only and two exact preview CSP locations. No database migration/container restart; original business data SHA 5ed4a9b04bdbf33caba9bfe130c5b5f0791d1e10edbd79093baad07553cd1e26 unchanged, appimage sha256:60c4365bf757b85fd55c382164f5338bda5f3d02f26c0a873a711664371b60f0 unchanged, productionhomepage SHA 05c355b6bf439819fc155d2508da24451bd96ddb1f8a7f4d18f2b074c4de84c5 unchanged. Backup backups/preview-20261008T095858Z-21637.dump, original static/Nginx rollback private parent-central-review/rollback. Rootless Docker/ubuntu/loopback/SSH retained; no new public ports, main/dev/DNS/production unchanged.

Manual entry http://localhost:8323/parent/ with existing SSH connection; student8321/8322 can inspect entry removal. All Draft PRs stay unmerged. SMTP/COS still unconfigured, no new claim. STOP for manual owner acceptance; no production action or merge without explicit approval.

Safe commit plan: Developer business files already committed and independently validated at above heads; Manager commits only owned STATUS/DECISIONS and portal docs/evidence, stages exact paths, excludes private runtime and secrets. No merges or resets, later documentation heads do not change deployed business artifacts.
Next owner: User — manual acceptance.

## 2026-10-08 — Public IP preview (authorized follow-up)

User explicitly requests Tencent public IP access, no localhost/SSH requirement, no DNS migration. This supersedes prior loopback-only inspection restriction for isolated preview, does not authorize production/main/dev merge. Plan: trusted IP HTTPS at existing allowed443, shared account root and /hanzi/, /guwen/, /taskhelper/ static prefixes, no production server block changes. Rootless app/db stay loopback/private; retain original data and backup.
Developer worktrees on existing feature/unified-user-system: accounts owns portal build/deployment-template configuration; tool_sync owns minimal path-compatible widgets/static URLs and Task build. Manager owns server certificate/isolated route deployment/status; QA independently verifies actual public browser/cookies/gates/data. Separate source writers, trees clean at intake; only Manager STATUS dirty intentionally. No credentials committed or printed.
Next owner: Developers / Manager / QA. Human acceptance waiting.
## 2026-10-08 — Public IP server deployment handoff

User explicitly authorizes public Tencent IP, no localhost/SSH requirement, no DNS migration or main/dev merge. New canonical origin https://134.175.136.31; tools /hanzi/, /guwen/, /taskhelper/ and central parent /taskhelper/parent/. Private rootless app127.0.0.1:3200/database preserved.

Server deployment PASS: business Portal0a67d2c/Task97ea361, Hanzi5af7888 and Guwend9fcc04 unchanged; later portal renewal ops b4b12bc/docs-only separate. No migration; before/after complete business data SHA 0276adc3308abe64df832a1fddf85c79d06e6435cc00ab02ef842e3a1ffe5226 unchanged, image sha256:227e92a8f24659cc6db2c9b89a2eea254b07d8da7a9752bfd762d6cda989555c, original homepage SHA 05c355b6bf439819fc155d2508da24451bd96ddb1f8a7f4d18f2b074c4de84c5 unchanged and original services active. TLS normal CA check + unknownHost421 internally passed. Backup preview-20261008T140946Z-2654.dump retained privately.

PASS independent local17, Portal developer20/independent19+Hostguard/lint/typecheck/build, Task45/lint/typecheck/build/cloud11, each staticUI8/cloud11. Certbot5.8 IPcertificate issued; ubuntu renewal timer active twice perday Asia/Shanghai, actual service success, ACME dryrun and Nginx hook PASS. No secrets committed.

BLOCKED public gate: Windows curl and actual Chrome20secTCP443 timeout, no TLS/HTTP metadata; UFW allows443 but has zero exterior hits. No public fixture/auth/rate suite run. Exact CVM Guangzhou ins-ed8etx60 needs cloud rule TCP443/source0.0.0.0/0 allow. Browser control helper cannot initialize; no metadata CAM role listed. User status question pending for cloud rule; elapsed time is not approval or success. Do not claim READY FOR OWNER REVIEW until exterior functional checks pass.

Documentation: portal/docs/unified-public-ip.md, unified-public-ip-qa.md, evidence/public-ip-*.json. All features saved/Draft unmerged; main/dev/DNS/production unchanged. Next owner: User provides cloud-rule state; Manager/QA complete exterior validation. No production action authorized.

Safe commit plan: preserve Manager STATUS and exact developer feature commits; stage only owned docs/status/evidence. No broad adds, main/dev merge or resets.
## 2026-11-04 — 教材词语表接入每日听写（Manager intake）

用户要求按人教版教材末尾词语表更新每日听写，延续2026年现用12册。以原页实际有无词语表为准，不从单字或外部教辅拼造；保留课次、词序、词形、来源及稳定新题目ID。旧3-upper词库/ID/复习记录不覆盖，2026-*书册接入对应本地词语表；沿用每日最多15词、真实书写后自评和原复习间隔。无词语表的册次明确显示。

当前feature/writing-table-2026干净，HEAD ef9bbd3，线上业务8158661。Manager新建独立Developer工作树F:/taskHelper/hanzi-word-tables-2026、feature/textbook-word-tables-2026；QA另建精确提交工作树。Manager只处理研究/流程/部署，Developer负责代码/数据接入，QA独立源与功能校验。用户当前请求为已授权腾讯云网站的连续更新，QA通过后备份并仅更新必要静态文件；不合并main/dev，不改DNS、账号、数据库或云配置。

Next owner: Developer / source / Manager，完成原页核对及接入后交QA。
## 2026-11-05 — 合入本地笔画/拼音资源（Manager intake）

用户确认按上次检查建议处理合并：以已上线feature/textbook-word-tables-2026（HEAD1b6cf25/业务67f46b1）为基底，选择性整合main06beda9的本地笔画/拼音库与构建思路。保留已核2026写字表2500字位、10册2168词、旧教材ID/进度、每日15规则、账号/cloud/parent；不整站覆盖main旧目录或旧词库，不合入10/20/30变化。该确认延续腾讯云网站维护授权，独立QA通过后备份并部署必要静态更新，无main/dev合并。

Safe plan: 当前基底干净，新Developer独占F:/taskHelper/hanzi-local-strokes-2026，feature/local-stroke-assets-2026。main审查树有Manager状态文档和自建node_modules/dist，保持不动。Developer只做本地依赖/loader/3处HanziWriter接入及构建，修文件型.git被发布与缺字不阻断问题。实际练字字符集须从当前12份写字表、10份词语表及旧可选教材/旧题库收集完整验证（当前新表独特字2405；main现vendor缺其中31，全在固定npm包存在），不复用旧main3115包作为完整包。构建输出仅公开运行资源，排除内部说明/私密配置，线上cloud-config运行值必须保留。

Manager负责流程与部署；Developer实现/测试/提交；QA在独立精确候选树检查资源全覆盖、无CDN笔画请求、真实笔画、自评和既有记录/题库兼容，不重校教材文本。操作证据ops/hanzi-local-strokes-20261105。Next owner: Developer / QA。
