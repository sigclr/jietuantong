# 接团通（jietuantong）

面向中小地接社的接团与结算管理 SaaS 原型与产品文档。

## 目录

- [`web/`](web/) — React + Vite 可点击原型（新疆地接社场景）
- [`prototype/`](prototype/) — 早期 HTML 静态原型（备份）
- [`.cursor/plans/`](.cursor/plans/) — PRD 与实施计划

## 快速开始（React 原型）

```bash
cd web
npm install
npm run dev
```

## PRD v2.2 更新（客户反馈）

- **团款组成**：建团/详情支持多行「类型 + 单价 + 备注」，计价方式为人均或每组（非整团一口价）
- **拼出团**：业务类型可选自营/拼出，拼出需选择承接同行；合作方增加组团社/同行类型

## 角色演示（PRD v2.1）

登录后默认进入 **阿财（计调/OP）** 视角。顶栏可切换三种业务角色（标注「演示用」）：

| 角色 | 顶栏显示 | 默认首页 | 能力 |
|------|----------|----------|------|
| 马总 | 老板 | `/dashboard` | 工作台只读、员工/设置 |
| 阿财 | 计调 OP | `/projects` | 接团全链路：建团、节点、记账、结清 |
| 王姐 | 财务 | `/finance` | 账龄简表、流水只读、导出演示 |

### 推荐演示路径（阿财）

1. 登录 → 接团单列表（OP 快捷条）
2. 新建接团单 → 一键添加定金/尾款模板
3. 团详情 → 标记节点已收/已付（联动收支明细）
4. 记一笔收入/支出 → 修改状态为已结清

### 快捷键

- `/` — 聚焦顶栏搜索
- `n` — 接团列表新建（仅阿财）
- `Esc` — 关闭抽屉/弹窗

## CodeGraph（代码图谱 / Cursor MCP）

本项目已接入 [@colbymchenry/codegraph](https://www.npmjs.com/package/@colbymchenry/codegraph)，供 Cursor 通过 MCP 查询调用链、依赖与符号结构。

**已配置（本仓库）：**

- `.cursor/mcp.json` — Cursor 项目级 MCP（指向本仓库根目录）
- `.codegraph/` — 本地代码索引（不入库，换机器需重建）

**新克隆仓库后：**

```bash
npm i -g @colbymchenry/codegraph   # 若未安装
cd "d:\Person\ly demo"
codegraph init                     # 重建索引
```

然后在 Cursor 中 **重启窗口** 或打开 **Settings → Tools & MCP**，确认 `codegraph` 为已连接（绿点）。

**常用命令：**

```bash
codegraph status                   # 索引状态
codegraph sync                     # 增量同步
codegraph query AppProvider        # 搜索符号
codegraph explore store.tsx        # 探索文件/模块
```

## 仓库

https://github.com/sigclr/jietuantong
