# Live Tables Tracker

Evo 与 Pragmatic Play 桌台数量、游戏类型统计网站。数据通过人工录入，按 UTC+8 自然日自动汇总。

## 功能

- 无需登录即可查看实时总览、平台详情、每日汇总与趋势
- **自动从公开资料汇总** Evo / Pragmatic 桌台数据（年报、官网游戏目录等）
- 管理员可人工录入快照（8 类游戏类型必填）覆盖或补充
- 录入历史编辑 / 删除（自动重算日汇总）
- 管理员创建 viewer / admin 账号
- 每日 UTC+8 00:05 定时重算前一日汇总（部署后生效）
- 时区统一为 UTC+8

## 本地开发

```bash
cp .env.example .env.local
npm install
npm run dev
```

默认管理员（首次启动自动创建）：

- 邮箱：`admin@example.com`
- 密码：`changeme123`

可在 `.env.local` 中通过 `ADMIN_EMAIL` / `ADMIN_PASSWORD` 修改。

## 环境变量

| 变量 | 说明 |
|------|------|
| `AUTH_SECRET` | JWT 会话密钥 |
| `CRON_SECRET` | 定时任务鉴权密钥（Vercel Cron 自动携带） |
| `ADMIN_EMAIL` | 初始管理员邮箱 |
| `ADMIN_PASSWORD` | 初始管理员密码 |
| `DATABASE_PATH` | SQLite 数据库路径，默认 `./data/app.db` |

## 页面

| 路径 | 说明 |
|------|------|
| `/` | 实时总览（公开） |
| `/login` | 管理员登录 |
| `/platforms/evo` | Evo 详情与趋势 |
| `/platforms/pragmatic` | Pragmatic 详情与趋势 |
| `/daily` | 每日汇总列表 |
| `/daily/[date]` | 指定日详情 |
| `/admin/entry` | 录入（admin） |
| `/admin/history` | 历史（admin） |
| `/admin/users` | 用户管理（admin） |

## 脚本

```bash
npm run dev          # 开发服务器
npm run build        # 生产构建
npm run db:generate  # 生成迁移
npm run db:migrate   # 执行迁移
```

## 部署到 Vercel

1. 将仓库推送到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量：`AUTH_SECRET`、`CRON_SECRET`、`ADMIN_EMAIL`、`ADMIN_PASSWORD`
4. 部署后，Cron 会在每天 **UTC 16:05**（= UTC+8 00:05）重算前一日汇总

> 注意：Vercel 无状态部署下 SQLite 文件不持久，生产环境建议换用 Turso / Neon 等外部数据库。当前 SQLite 适合本地与单机部署。

### 手动触发 Cron（测试）

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain/api/cron/daily
curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://your-domain/api/sync/public
```

## 公开数据来源

| 平台 | 总数来源 | 类型分布 |
|------|----------|----------|
| **Evo** | Evolution 2024 年报（约 1,700 张桌台） | evolution.com 游戏目录权重估算 |
| **Pragmatic** | 官网 live casino + OnlineCasinos.net 公开桌台清单 | 桌台命名与游戏分类映射 |

页面会标注 **「公开数据汇总」** 或 **「人工录入」**。

## 录入说明

1. 使用管理员账号登录
2. 进入「录入」页面
3. 选择平台、时间（UTC+8）并填写 8 类游戏类型桌台数
4. 系统自动计算桌台总数并更新日汇总

## 技术栈

- Next.js 16 (App Router)
- SQLite + Drizzle ORM
- JWT Session (jose)
- Tailwind CSS
