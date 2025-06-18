<p align="center">
  <img src="https://raw.githubusercontent.com/Hydroline/hydroline-services/main/logo/Hydroline_Logo_Normal.svg" width="200" />
</p>

<h1 align="center">Hydroline Services Platform</h1>
<p align="center">实用的、强大的、开源的 Minecraft 服务器聚合信息服务平台</p>

> （2025 年 6 月）项目还处于初期开发验证阶段。主要服务城市建设类、轨道建设类的 Minecraft 服务器。

## Hydroline 是什么？

> Hydroline. A Useful, Powerful, and Open-Source Minecraft Server Information Integration Platform.

Hydroline Services（简称 Hydroline）由 Hydrlab 的开源项目组织 Hydroline（与项目同名）负责维护。Hydroline 是一款为 Minecraft 服务器服主、管理员和玩家解决运营痛点的 Web 项目。类似的项目最初源于 2023 年 7 月的 Digital HydCraft Project，但最终该项目胎死腹中。

除了最基本的玩家账户系统、鉴权系统、SSO、统一 API，用户还可以基于项目自行开发 Adapter、Connector 以适配服务器自身情况。

设想一下：登录插件（AuthMe 等）的登录数据可否直接为服务器 Wiki 站点提供登录凭证？能不能存在一个 SSO 系统统一服务器的用户系统？玩家可不可以直接在网站上修改自己的权限组（LuckPerms）？能不能直接在后台呈现 MTR Mod（一个铁路模组）的线路和车厂数据？……

这些对于 Web 开发（尤其是 B 端）习以为常的概念，对 Minecraft 服务器管理来说却几乎不存在，尽管两者有着极强的相关性。正因为此，Hydroline 的想法从此诞生。

## 可以做什么？

首先，需要明确的是：**Hydroline** 更接近一个**低代码平台**（如基于 SpringBoot 的若依），而非开箱即用的项目，而是需要开发者二次开发。

- Hydroline 默认提供 Minecraft 相关的方法类，供开发者直接调用。如 Ping Minecraft 服务器、模拟 Minecraft 服务器登录等。
- Hydroline 默认提供接入 AuthMe、LuckPerms 等常用插件的方法类，如 AuthMe 的登录验证、LuckPerms 的插件数据库读取等。
- Hydroline 默认提供玩家账户系统，携带黑名单、入服信息记录等常见的玩家管理功能。（此外，如果用户允许通过 MCSManager 接入服务端，还支持更细化的操作）
- Hydroline 默认提供 SSO、OAuth 功能。如微软账户登录，此外也支持绑定其它业务系统（如 MediaWiki、Wikijs，通过 OAuth）。
- Hydroline 支持提供统一 API 平台。类似于 Dynmap、MTR Mod 之类的模组和插件存在多种数据需要被返回（甚至有些数据没有直接暴露，需要手动修改代码）将通过统一接口获取。我们希望像服务器信息、地图数据等信息通过统一的接口操作，这样会更方便周边项目的开发。
- Hydroline 后续将支持通过 Bukkit 插件或 Forge API Mod 作为 Connector 获取服务端信息。特别是 MTR Mod、Create 一类的模组。

此外，用户还可以根据自己的需求，基于已有的玩家账户系统二次开发，也可以基于已有的数据库扩展，如自行开发存储铁路信息、交通信息的数据功能；基于玩家账户系统设计统一的账户余额系统；开发虚拟出行系统。

## 开发进度

目前，Hydroline 启动于 2025 年 6 月底，初期的验证工作将在 7 月底前完成（最小验证原型），在开发初期阶段，对于具体的技术栈的支持不会被优先考虑，主要功能（玩家账户系统、SSO、OAuth、鉴权系统、统一 API 平台、周边平台接入）将会被优先考虑。

| 开发阶段     | 时间                             | 主要功能                                                                        |
| ------------ | -------------------------------- | ------------------------------------------------------------------------------- |
| 验证原型     | 2025 年 6 月底 - 2025 年 7 月底  | 玩家账户系统、SSO、OAuth、鉴权系统、统一 API 平台（一期）、周边平台接入         |
| 第一开发阶段 | 2025 年 7 月底 - 2025 年 12 月底 | 统一 API 平台，Adapter、Conenctor 等适配器的开发，以及周边 Minecraft 项目的适配 |
| 第二开发阶段 | 2025 年 12 月底 -                | 完善文档和项目结构、适配 Docker 等技术                                          |

## 设计结构

项目采用 NestJS 作为后端框架（Node.js），并使用 pnpm Monorepo 管理项目，ORM 为 Prisma，前端和后台前端采用 Vue 3 + TS 作为开发框架。在验证阶段，数据库采取 PostgreSQL。

项目根目录下的 `/admin` 为后台管理系统（前端），`frontend` 为前端系统，`backend` 为后端。

| 类型       | 技术栈               |
| ---------- | -------------------- |
| 前端及后台 | Vue 3 + TS           |
| 后端       | NestJS               |
| 数据库     | PostgreSQL           |
| ORM        | Prisma               |
| 包管理     | pnpm + pnpm Monorepo |
