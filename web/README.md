# 接团通 — React 交互原型

新疆地接社场景可点击原型，对齐 [PRD](../.cursor/plans/PRD-接团通-地接社平台.md) P0+P1 主流程。

## 启动

```bash
cd web
npm install
npm run dev
```

浏览器打开终端显示的本地地址（通常 http://localhost:5173）。

## 演示路径

1. `/register` 创建「乌鲁木齐丝路地接社」→ `/dashboard` 查看逾期卡片
2. `/partners` 查看北京中青旅未结清 → `/projects/new` 新建北疆团
3. `/projects/JTT-20260615-01` 收支 Tab 记一笔 → 收付款 Tab 标记禾木山居逾期节点
4. 顶栏搜索 `0601` 或 `北疆` 快速定位团
5. `/team` 复制邀请链接 → `/join/8FK2-9D3A` 演示加入流程

## 说明

- 右下角「原型导航」可一键跳转全部 13 个页面
- 数据为内存 Mock，刷新后恢复初始状态
- 任意手机号密码均可登录

## 技术栈

React 19 + Vite + TypeScript + react-router-dom + dayjs
