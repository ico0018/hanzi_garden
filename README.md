# 汉字乐园 Hanzi Garden

一个给小学阶段使用的课内生字学习网页。

它不是刷题系统，也不需要账号。孩子先选择教材，再按课学习生字、听读、看笔顺、自己书写，最后通过每日听写做复习。学习记录保存在当前浏览器里，打开网页就能继续。

## 当前支持

| 教材 | 生字学习 | 每日词语听写 |
| --- | --- | --- |
| 一年级上册 | ✅ | — |
| 二年级上册 | ✅ | — |
| 三年级上册 | ✅ | ✅ |
| 四年级上册 | ✅ | — |
| 其他册别 | 数据结构已预留，暂未开放 | — |

当前可用教材以 `book-catalog.js` 中的 `available: true` 为准。

## 主要功能

### 生字学习

- 按课文切换生字
- 显示拼音、组词和词义
- 支持数据中的关联组词与造句
- 点击生字或词语即可朗读
- 真人普通话录音可用时优先播放，加载失败时回退到浏览器中文语音
- 使用 Hanzi Writer 演示笔顺
- 在田字格中按笔顺书写，写错会提示重试
- 书写完成后由孩子自己选择“已学会”或“还要复习”
- 学习状态保存在浏览器 `localStorage`，并按教材分别记录

### 每日听写

目前每日词语听写只为三年级上册配置了独立题库：`每日词语听写题库.txt`。

每天最多安排 15 个词。流程是：

1. 先听读音
2. 自己写下词语
3. 需要时再查看提示或答案
4. 在田字格中完成每个汉字的书写
5. 最后由孩子自己判断“我会写 / 我不会写”

系统不会自动替孩子判定是否掌握。

“我不会写”的词会更快回来复习；连续标记“我会写”后，复习间隔依次按 2、4、7、15、30、60 天拉开。

## 使用方式

这个项目没有 Node 构建步骤，也不需要安装依赖。

因为页面会通过 `fetch` 读取本地教材数据，不建议直接双击 `index.html`。在项目目录启动一个静态服务器即可：

```bash
python -m http.server 8000
```

然后打开：

```text
http://localhost:8000/welcome.html
```

首页选择教材后，会进入类似：

```text
index.html?book=3-upper
```

的学习页面。

## 部署

项目是纯 HTML / CSS / JavaScript 静态站点，可以直接部署到 Vercel 或其他静态托管服务。

仓库中的 `vercel.json` 会把根路径 `/` 临时重定向到 `/welcome.html`，因此在 Vercel 上不需要额外构建配置。

## 教材数据

教材入口统一配置在：

```text
book-catalog.js
```

每个已开放教材对应一个文本数据文件，例如：

```text
生字数据_一年级上册.txt
生字数据_二年级上册.txt
生字数据.txt
生字数据_四年级上册.txt
```

其中 `生字数据.txt` 是当前三年级上册数据。

基础格式如下：

```text
[课文标题]
字|拼音|组词|组词拼音|词义;组词|组词拼音|词义
```

如果需要附加“关联组词 + 造句”，可以在该行末尾追加：

```text
||关联组词|完整句子
```

例如：

```text
晨|chén|早晨|zǎo chén|一天刚开始的时候||早晨|早晨的阳光照进了教室。
```

应用会忽略空行和以 `#` 开头的注释行。

## 项目结构

```text
hanzi_garden/
├── welcome.html              # 教材选择页
├── welcome.js                # 教材选择逻辑
├── index.html                # 主学习页
├── app.js                    # 生字学习、书写、朗读、每日听写
├── styles.css                # 页面样式与响应式布局
├── book-catalog.js           # 教材目录与开放状态
├── daily-word-bank.js        # 每日听写题库解析
├── 每日词语听写题库.txt       # 三年级上册每日听写词库
├── 生字数据*.txt              # 各册教材数据
├── writing-table-support.js  # 写字表数据适配辅助脚本
├── AUDIO-CREDITS.md          # 音频来源说明
└── vercel.json               # Vercel 根路径跳转
```

## 前端依赖

页面通过 CDN 直接加载：

- [Hanzi Writer](https://hanziwriter.org/)：笔顺动画与书写检测
- [pinyin-pro](https://github.com/zh-lx/pinyin-pro)：中文文本拼音转换

项目本身没有 `package.json`，也没有 npm 安装或打包流程。

## 关于学习记录

所有学习状态都保存在当前浏览器的 `localStorage` 中，没有登录系统，也不会同步到其他设备。

清除浏览器站点数据后，本机学习记录也会一起清除。
## 统一账号与云同步（开发分支）

保持静态 HTML/JS 与现有免费游客学习。登录 Cookie 只由统一 API 管理，工具不保存认证 Token。部署必须包含 `cloud-config.js`、`cloud-sync.js`、`cloud-ui.js`、`cloud-ui.css`。配置文件中 `apiBase` 默认 `https://api.xuebabangbang.cn`，`portalBase` 默认 `https://xuebabangbang.cn`；腾讯隔离预览可使用相同 origin（或 `apiBase: ''` 同源）。地址末尾不要加 `/`。API 必须允许本站 Origin 和带凭据请求。

每个工具只在自己的 origin 读取游客 localStorage。首次登录不自动搬数据，先选择孩子，再点“导入本机游客记录”确认；原有游客键保留。登录缓存按 `xbb:state:v1:<tool>:<userId>:<profileId>` 隔离，教材/录音等静态资源不进入云数据。页面打开先确认 Session、孩子和云记录，再加载学习流程；Session 暂时不可达时可继续最近孩子的本机缓存，联网后重试验证身份。

学习原数据以 key → 原JSON字符串组成 schemaVersion 1 的 JSON payload；汉字包含生字掌握及每日听写进度、队列，古文包含阅读、学习及屏幕默写进度。旧书籍/课文身份和原有判定规则不变。

本机修改即时持久保存，dirty/generation 随缓存保存，刷新和断网后仍可重试。同步失败显示失败，不显示完成。revision 409 停止自动写入，用户可导出本机+云端冲突+游客的备份并明确选择；选择前不会静默覆盖，选择时另存 `:recovery:<timestamp>` 恢复副本。切孩子重载本工具，原孩子未上传记录仍留在原隔离缓存。账号中心提供完整云端导出。

验证：`node scripts/test-cloud-sync.cjs` 运行11项同步回归；汉字另运行 `node scripts/test-daily-word-bank.js`，古文运行 `node --test tests/*.test.cjs` 与 `python -m unittest discover -s tests`。这两个静态仓库没有 lint/typecheck/build 工程配置，部署是静态文件复制。


## 家长页面与简洁学习页面

`parent.html` 是本工具同origin的家长入口，包含账号中心、孩子切换、同步状态、游客记录导入、备份、冲突选择与恢复。学生页不显示家长入口或记录管理控件，后台仍自动同步，不向孩子展示存储和同步操作。

家长回答一道中文数字计算题、从三个数字中选择正确结果即可进入。账号模式由服务器签发与校验题目，读取统一Session的 `parentReady`；当前登录持续有效，不再输入密码/PIN，也没有15分钟自动锁定。已在账号中心或另一工具进入家长模式后直接继承当前Session。主动“退出家长模式”调用服务端 parent-lock，或退出登录后才失效。游客仅作本机误点确认，以sessionStorage保存当前标签页状态，刷新可继续，主动退出清除；这不替代真正的账号认证。旧游客学习数据和遗留设置不会被删除。

运行 `node scripts/test-parent-ui.cjs`：学生无记录控件、三选一正确/错误答案、已授权Session免重复题目、显式退出、游客刷新保持；原有云同步回归新增服务端Session授权撤销，共11项。家长页题目或请求失败时可换题重试。


统一记录管理在任务小帮手 `/parent/` 中直接显示本工具 `parent.html?embedded=1` 的控件，面板仍在本工具自己的origin读取localStorage。嵌入模式隐藏重复标题、返回学习、切孩子与单独退出，只显示当前孩子和实际导入/备份/同步/冲突按钮；切孩子由中央页面统一重载。嵌入导入和冲突选择使用明确的内嵌确认/取消，点击前不执行数据操作。

`cloud-config.js` 的公开 `parentBase` 默认 `https://taskhelper.xuebabangbang.cn`，隔离预览配置为 `http://localhost:8323`。只接受真实嵌入页面、这个精确origin且source为直接父窗口的type-only游客激活/退出消息；游客授权仅保存在当前widget内存，登录会话仍必须拥有服务器parentReady，绝不通过消息授予登录权限或导入记录。消息不传送学习内容、账号/孩子ID或URL，出站仅ready或整数高度。独立parent.html仍可直接访问。定向家长UI测试现在8项，含错误来源、额外字段、初始化竞态与内嵌确认。
