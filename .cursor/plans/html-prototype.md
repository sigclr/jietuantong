# HTML 原型 — 地接社版 v2

> **如何查看：** 浏览器打开 **[prototype/index.html](../../prototype/index.html)**（依赖同目录 `app.js`）。左侧导航切换 12 屏；黄色 `tag` 为 API/字段名。

## 页面清单（地接社 · 共 12 屏）

| # | 页面 | 路由 | 功能要点 |
|---|------|------|---------|
| 1 | 登录 | /login | 地接社管理平台 |
| 2 | 注册-创建地接社 | /register | 创建 org + owner |
| 3 | 注册-邀请码 | /register | 员工加入 |
| 4 | 工作台 | / | 执行中/待结算/逾期应收、近期抵团 |
| 5 | 合作方列表 | /partners | 组团社 B2B 档案、账期 |
| 6 | 合作方详情 | /partners/:id | 未结应收、历史接团 |
| 7 | 供应商 | /suppliers | 酒店/车队/导游名录 |
| 8 | 接团单列表 | /projects | 团号、状态流、毛利预览 |
| 9 | 新建/编辑接团 | /projects/new | group_no、partner_id、领队、备注 |
| 10 | 接团核算 | /projects/:id/finance | 收支明细 + **收付款计划** |
| 11 | 企业信息 | /settings/org | |
| 12 | 员工管理 | /settings/users | owner/coordinator/admin |

**v1 已移除：** 散客 CRM、客户跟进、星级（组团社能力延后 v2）。

## 文件结构

```
prototype/
├── index.html   # 壳 + 样式
└── app.js       # 12 屏内容与导航逻辑
```

## 完整单文件原型（旧版 · 通用旅行社）

<details>
<summary>旧版 v1 单文件 HTML（已 superseded，仅作参考）</summary>

已更新为地接社 v2，请使用上方 `index.html` + `app.js`。

<details>
<summary>源码（与 index.html 同步，展开可复制）</summary>

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>旅行社管理平台 — 交互原型</title>
<style>
:root{--p:#1eb2a6;--pd:#179a90;--sb:#2c3e50;--bd:#e8ecef;--bg:#f5f7fa;--mut:#888}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:"PingFang SC","Microsoft YaHei",sans-serif;font-size:14px;background:var(--bg);color:#333}
.hidden{display:none!important}
.note{background:#fff8e6;border:1px dashed #f0c040;padding:8px 12px;margin-bottom:12px;font-size:12px;color:#856400;border-radius:4px}
.tag{display:inline-block;background:#eef7f6;color:var(--pd);font-size:11px;padding:1px 6px;border-radius:3px;margin-left:4px}
/* 原型外壳 */
.proto-shell{display:flex;height:100vh}
.proto-nav{width:200px;background:#1a252f;color:#ccc;padding:12px;overflow-y:auto;flex-shrink:0}
.proto-nav h3{color:#fff;font-size:13px;margin:8px 0 12px}
.proto-nav button{display:block;width:100%;text-align:left;padding:8px 10px;margin-bottom:4px;border:none;background:transparent;color:#aaa;border-radius:4px;cursor:pointer;font-size:13px}
.proto-nav button:hover,.proto-nav button.on{background:rgba(30,178,166,.25);color:#fff}
.proto-main{flex:1;overflow:auto}
/* 登录 */
.auth{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#e8f8f6}
.auth-box{background:#fff;padding:32px;border-radius:8px;width:420px;box-shadow:0 4px 20px rgba(0,0,0,.08)}
.auth-box h1{font-size:20px;margin-bottom:6px}
.tabs{display:flex;border-bottom:2px solid var(--bd);margin:20px 0}
.tab{flex:1;text-align:center;padding:10px;cursor:pointer;color:var(--mut)}
.tab.on{color:var(--p);border-bottom:2px solid var(--p);margin-bottom:-2px;font-weight:600}
/* App */
.app{display:flex;min-height:100vh}
.sb{width:52px;background:var(--sb);padding:10px 0;display:flex;flex-direction:column;align-items:center;position:fixed;top:0;bottom:0;left:200px}
.sb a{width:36px;height:36px;display:flex;align-items:center;justify-content:center;color:#999;border-radius:6px;margin:4px 0;text-decoration:none;font-size:16px}
.sb a.on{background:rgba(255,255,255,.15);color:#fff}
.wrap{margin-left:252px;flex:1;display:flex;flex-direction:column;min-height:100vh}
.bar{height:48px;background:#fff;border-bottom:1px solid var(--bd);display:flex;align-items:center;justify-content:space-between;padding:0 20px;position:sticky;top:0;z-index:10}
.bar h2{font-size:15px}
.body{padding:16px 20px}
.btn{padding:7px 14px;border-radius:4px;border:none;cursor:pointer;font-size:13px}
.btn-p{background:var(--p);color:#fff}
.btn-o{background:#fff;border:1px solid var(--bd)}
.card{background:#fff;border:1px solid var(--bd);border-radius:6px;margin-bottom:12px}
.card-h{padding:12px 16px;border-bottom:1px solid var(--bd);font-weight:600;display:flex;justify-content:space-between;align-items:center}
.card-b{padding:14px 16px}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:12px}
.stat{padding:16px;background:#fff;border:1px solid var(--bd);border-radius:6px}
.stat .v{font-size:28px;font-weight:700;color:var(--p)}
.stat .l{font-size:12px;color:var(--mut)}
.toolbar{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px;align-items:center}
.toolbar input,.toolbar select{padding:6px 10px;border:1px solid var(--bd);border-radius:4px}
table{width:100%;border-collapse:collapse}
th,td{padding:10px 12px;border-bottom:1px solid var(--bd);text-align:left;font-size:13px}
th{background:#fafbfc;color:var(--mut);font-weight:600}
.stars{color:var(--p)}
.badge{padding:2px 8px;border-radius:10px;font-size:11px}
.b-prog{background:#fff3cd;color:#856400}
.b-done{background:#d4edda;color:#155724}
.layout-f{display:flex;gap:12px}
.filter{width:180px;background:#fff;border:1px solid var(--bd);border-radius:6px;padding:10px;flex-shrink:0}
.filter div{padding:8px 0;border-bottom:1px solid var(--bd);font-size:12px;cursor:pointer}
.main{flex:1;min-width:0}
.form-g{margin-bottom:12px}
.form-g label{display:block;font-size:12px;margin-bottom:4px;font-weight:500}
.form-g input,.form-g select,.form-g textarea{width:100%;padding:7px 10px;border:1px solid var(--bd);border-radius:4px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.detail{display:grid;grid-template-columns:280px 1fr;gap:16px}
.profile{background:#fff;border:1px solid var(--bd);border-radius:6px;padding:16px}
.timeline li{list-style:none;padding:10px 0 10px 16px;border-left:2px solid var(--bd);margin-left:6px;font-size:13px}
.drawer{position:fixed;top:0;right:0;width:480px;height:100%;background:#fff;box-shadow:-4px 0 20px rgba(0,0,0,.1);padding:20px;overflow-y:auto;z-index:100}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.3);z-index:99}
.fsum{display:flex;gap:24px;align-items:baseline;margin-bottom:16px}
.fsum .big{font-size:24px;font-weight:700}
.chart{height:140px;display:flex;align-items:flex-end;gap:8px;padding:0 10px;border-bottom:2px solid var(--p)}
.chart div{flex:1;background:var(--p);opacity:.6;border-radius:3px 3px 0 0}
</style>
</head>
<body>

<div class="proto-shell">
  <nav class="proto-nav">
    <h3>原型导航</h3>
    <button class="on" data-page="login">1. 登录</button>
    <button data-page="register-org">2. 注册-创建企业</button>
    <button data-page="register-invite">3. 注册-邀请码</button>
    <button data-page="dashboard">4. 工作台</button>
    <button data-page="customers">5. 客户列表</button>
    <button data-page="customer-detail">6. 客户详情</button>
    <button data-page="projects">7. 项目列表</button>
    <button data-page="project-form">8. 新建/编辑项目</button>
    <button data-page="project-finance">9. 项目收支</button>
    <button data-page="settings-org">10. 企业信息</button>
    <button data-page="settings-users">11. 员工管理</button>
  </nav>

  <div class="proto-main">

<!-- ========== 1 登录 ========== --> 
<section id="login" class="screen">
<div class="auth"><div class="auth-box">
  <h1>旅行社管理平台</h1>
  <p style="color:#888;margin-bottom:16px">登录您的企业账号</p>
  <div class="note">API: POST /api/v1/auth/login → 返回 JWT + Set-Cookie refresh_token</div>
  <div class="form-g"><label>邮箱 <span class="tag">email</span></label><input type="email" placeholder="admin@example.com"></div>
  <div class="form-g"><label>密码</label><input type="password"></div>
  <button class="btn btn-p" style="width:100%;margin-top:8px">登录</button>
  <p style="margin-top:16px;font-size:13px;color:#888;text-align:center">还没有账号？<a href="#" onclick="go('register-org')">创建企业 / 邀请码加入</a></p>
</div></div>
</section>

<!-- ========== 2 注册-创建企业 ========== --> 
<section id="register-org" class="screen hidden">
<div class="auth"><div class="auth-box">
  <h1>注册</h1>
  <div class="tabs"><div class="tab on">创建企业</div><div class="tab" onclick="go('register-invite')">邀请码加入</div></div>
  <div class="note">API: POST /auth/register-org → organizations + users(role=owner)</div>
  <div class="form-g"><label>企业名称 <span class="tag">organizations.name</span></label><input placeholder="XX 国际旅行社"></div>
  <div class="form-g"><label>管理员姓名 <span class="tag">users.name</span></label><input></div>
  <div class="form-g"><label>邮箱 <span class="tag">users.email</span></label><input type="email"></div>
  <div class="form-g"><label>密码</label><input type="password"></div>
  <button class="btn btn-p" style="width:100%" onclick="go('dashboard')">创建并进入</button>
</div></div>
</section>

<!-- ========== 3 注册-邀请码 ========== --> 
<section id="register-invite" class="screen hidden">
<div class="auth"><div class="auth-box">
  <h1>注册</h1>
  <div class="tabs"><div class="tab" onclick="go('register-org')">创建企业</div><div class="tab on">邀请码加入</div></div>
  <div class="note">API: POST /auth/register-invite → 校验 D1 invites 表(code, expires_at, used_by)</div>
  <div class="form-g"><label>邀请码 <span class="tag">invites.code</span></label><input placeholder="8 位邀请码"></div>
  <div class="form-g"><label>姓名</label><input></div>
  <div class="form-g"><label>邮箱</label><input type="email"></div>
  <div class="form-g"><label>密码</label><input type="password"></div>
  <button class="btn btn-p" style="width:100%" onclick="go('dashboard')">加入企业</button>
</div></div>
</section>

<!-- ========== 4+ 带侧栏的应用页 ========== --> 
<section id="dashboard" class="screen hidden"></section>
<section id="customers" class="screen hidden"></section>
<section id="customer-detail" class="screen hidden"></section>
<section id="projects" class="screen hidden"></section>
<section id="project-form" class="screen hidden"></section>
<section id="project-finance" class="screen hidden"></section>
<section id="settings-org" class="screen hidden"></section>
<section id="settings-users" class="screen hidden"></section>

</div><!-- proto-main -->

<script>
const APP_PAGES = {
  dashboard: {
    title: '工作台',
    nav: 'dashboard',
    html: `
    <div class="note">API: GET /dashboard/stats（KV 缓存 5min）· 最近项目 cursor 分页</div>
    <div class="stats">
      <div class="stat"><div class="l">项目制作中</div><div class="v">12</div><span class="tag">status=in_progress</span></div>
      <div class="stat"><div class="l">项目已完成</div><div class="v">48</div><span class="tag">status=completed</span></div>
      <div class="stat"><div class="l">我的客户</div><div class="v">86</div></div>
    </div>
    <div class="card"><div class="card-h">近 30 天新建项目 <span class="tag">LineChart</span></div>
      <div class="card-b"><div class="chart"><div style="height:40px"></div><div style="height:70px"></div><div style="height:55px"></div><div style="height:90px"></div><div style="height:60px"></div><div style="height:80px"></div><div style="height:100px"></div></div></div>
    </div>
    <div class="card"><div class="card-h">快捷入口</div><div class="card-b">
      <button class="btn btn-o" onclick="go('customers')">客户管理</button>
      <button class="btn btn-p" style="margin-left:8px" onclick="go('project-form')">+ 新建项目</button>
    </div></div>
    <div class="card"><div class="card-h">最近更新项目 <span style="font-weight:400;font-size:12px;color:#888">ORDER BY updated_at DESC</span></div>
      <table><tr><th>项目</th><th>状态</th><th>客户</th><th>更新</th></tr>
      <tr><td><a href="#" onclick="go('project-finance')">北京 3 日游 · 张先生</a></td><td><span class="badge b-prog">制作中</span></td><td>张先生</td><td>2026-06-10 小助手</td></tr>
      <tr><td>云南 6 日休闲游</td><td><span class="badge b-done">已完成</span></td><td>李女士</td><td>2026-06-08 王销售</td></tr>
      </table>
      <p style="padding:8px 12px;font-size:12px;color:#888;text-align:right">cursor 分页 · 加载更多 →</p>
    </div>`
  },
  customers: {
    title: '客户资料',
    nav: 'customers',
    html: `
    <div class="note">GET /customers?limit=20&cursor=... · 软删除第一版不做回收站</div>
    <div class="toolbar">
      <a style="padding:8px 12px;color:var(--p);font-weight:600;border-bottom:2px solid var(--p)">全部客户</a>
      <a style="padding:8px 12px;color:#888">我负责的</a>
      <input placeholder="搜索姓名/电话/微信" style="margin-left:auto;width:200px">
      <select><option>星级</option><option>5星</option><option>4星</option></select>
      <select><option>来源</option></select>
      <button class="btn btn-p" onclick="document.getElementById('drawer-customer').classList.remove('hidden');document.getElementById('overlay').classList.remove('hidden')">+ 添加客户</button>
    </div>
    <div class="layout-f">
      <div class="filter"><strong style="font-size:12px;color:#888">筛选</strong>
        <div>出行项目 +</div><div>上次跟进时间 +</div><div>下次跟进时间 +</div><div>客户星级 +</div><div>客户来源 +</div><div>居住城市 +</div><div>企业 +</div>
      </div>
      <div class="main card"><table>
        <tr><th>客户信息</th><th>最新出行项目</th><th>上次跟进</th><th>下次跟进</th></tr>
        <tr style="cursor:pointer" onclick="go('customer-detail')">
          <td><strong>王忠</strong><br><span class="stars">★★★★☆</span> <span style="color:#888;font-size:12px">备注: 老客户</span><span class="tag">star_rating, remark</span></td>
          <td>2019-09-01 出发<br>中土魔法之旅<span class="tag">projects via customer_id</span></td>
          <td>2026-06-01<br>沟通完行程天数…</td>
          <td>2026-06-15<br>跟客户对行程</td></tr>
        <tr><td><strong>沈龙泉</strong><br><span class="stars">★★★☆☆</span></td><td style="color:#888">出发时间待定</td><td style="color:#888">暂未跟进</td><td style="color:#888">暂未设置</td></tr>
      </table></div>
    </div>
    <div id="overlay" class="overlay hidden" onclick="closeDrawer()"></div>
    <div id="drawer-customer" class="drawer hidden">
      <h3 style="margin-bottom:12px">添加客户 <button class="btn btn-o" style="float:right" onclick="closeDrawer()">×</button></h3>
      <div class="note">POST /customers · 无附件上传</div>
      <div class="grid2">
        <div class="form-g"><label>姓名 * <span class="tag">name</span></label><input></div>
        <div class="form-g"><label>电话 <span class="tag">phone</span></label><input></div>
        <div class="form-g"><label>微信 <span class="tag">wechat</span></label><input></div>
        <div class="form-g"><label>邮箱</label><input></div>
        <div class="form-g"><label>客户来源</label><select><option>电话来访</option><option>转介绍</option></select></div>
        <div class="form-g"><label>星级</label><select><option>5</option><option>4</option></select></div>
        <div class="form-g"><label>居住城市</label><input></div>
        <div class="form-g"><label>故乡</label><input></div>
        <div class="form-g"><label>身份证</label><input></div>
        <div class="form-g"><label>护照号</label><input></div>
        <div class="form-g" style="grid-column:1/-1"><label>备注(15字) <span class="tag">remark</span></label><input maxlength="15"></div>
        <div class="form-g" style="grid-column:1/-1"><label>关联主客户（家庭成员）<span class="tag">primary_customer_id nullable</span></label><select><option>无（独立客户）</option><option>王忠</option></select></div>
      </div>
      <button class="btn btn-p">保存</button>
    </div>`
  },
  'customer-detail': {
    title: '客户资料 · 王忠',
    nav: 'customers',
    html: `
    <div class="note">GET /customers/:id · GET/POST /customers/:id/follow-ups</div>
    <div class="detail">
      <div class="profile">
        <button class="btn btn-o btn-sm">编辑</button>
        <h3 style="margin-top:12px">王忠</h3>
        <p style="color:#888;font-size:13px">男 / 35 / 汉族 · 138****8888</p>
        <p class="stars" style="margin:8px 0">★★★★☆</p>
        <dl style="font-size:13px"><dt style="color:#888">来源</dt><dd>电话来访</dd>
        <dt style="color:#888">居住城市</dt><dd>上海</dd>
        <dt style="color:#888">备注</dt><dd>老客户</dd>
        <dt style="color:#888">负责人</dt><dd>小助手 <span class="tag">owner_user_id</span></dd></dl>
        <p style="margin-top:12px;font-size:12px;color:#888">操作：转移客户 · 共享 · 删除（软删后续迭代）</p>
      </div>
      <div>
        <div class="card"><div class="card-h">跟进记录</div><div class="card-b">
          <p style="font-size:13px;margin-bottom:8px">下次跟进：2026-06-15 10:00 <button class="btn btn-o btn-sm">修改</button></p>
          <input placeholder="添加跟进(50字)" style="width:70%"><button class="btn btn-p btn-sm">添加</button>
          <ul class="timeline" style="margin-top:16px">
            <li><strong>2026-06-01 14:30</strong> 小助手<br>刚刚和客户沟通完，确认了行程天数和目的地。</li>
            <li><strong>2026-05-20 09:00</strong> 王销售<br>首次电话沟通，客户意向云南线。</li>
          </ul>
        </div></div>
        <div class="card"><div class="card-h">关联出行项目</div><div class="card-b">
          <p style="font-size:13px;padding:6px 0;border-bottom:1px solid #eee"><a href="#" onclick="go('project-finance')">2019 中土魔法之旅</a> · 已完成</p>
          <p style="font-size:13px;padding:6px 0"><a href="#">2020 北京 3 日游</a> · 制作中</p>
        </div></div>
      </div>
    </div>`
  },
  projects: {
    title: '出行项目',
    nav: 'projects',
    html: `
    <div class="note">GET /projects · 单主客户 customer_id（无 project_customers 多对多）</div>
    <div class="toolbar">
      <span style="color:var(--p);font-weight:600;border-bottom:2px solid var(--p);padding:8px">全部</span>
      <span style="padding:8px;color:#888">制作中</span><span style="padding:8px;color:#888">已完成</span><span style="padding:8px;color:#888">已关闭</span>
      <input placeholder="关键词" style="margin-left:12px">
      <input placeholder="出发日期范围" type="date">
      <label style="font-size:13px"><input type="checkbox"> 星标</label>
      <button class="btn btn-p" style="margin-left:auto" onclick="go('project-form')">+ 新建</button>
    </div>
    <table class="card" style="display:block;overflow:hidden">
      <tr><th>项目信息</th><th>状态</th><th>行程摘要</th><th>成员</th><th>操作</th></tr>
      <tr>
        <td>★ 北京 3 日游 · 张先生<br><small style="color:#888">更新 2026-06-10 小助手</small></td>
        <td><span class="badge b-prog">制作中</span></td>
        <td>北京出发 · 3天 · 北京/承德<br><small>备注: 客户希望含长城</small><span class="tag">remark</span></td>
        <td>销 制</td>
        <td><a href="#" onclick="go('project-form')">编辑</a> · <a href="#" onclick="go('project-finance')">收支</a></td>
      </tr>
      <tr>
        <td>云南 6 日休闲游</td><td><span class="badge b-done">已完成</span></td>
        <td>昆明出发 · 6天</td><td>销</td><td><a href="#">收支</a></td>
      </tr>
    </table>`
  },
  'project-form': {
    title: '新建项目',
    nav: 'projects',
    html: `
    <div class="note">POST/PATCH /projects · 无行程编辑器/地图/POI</div>
    <div class="card"><div class="card-h">基本需求</div><div class="card-b">
      <div class="grid2">
        <div class="form-g"><label>项目标题 * <span class="tag">title</span></label><input value="北京 3 日游 · 张先生"></div>
        <div class="form-g"><label>主客户 * <span class="tag">customer_id</span></label><select><option>张先生</option><option>+ 新建客户</option></select></div>
        <div class="form-g"><label>主要目的地 * <span class="tag">destination</span></label><input value="北京"></div>
        <div class="form-g"><label>出发城市 <span class="tag">departure_city</span></label><input value="北京"></div>
        <div class="form-g"><label>最早出行日期</label><input type="date"></div>
        <div class="form-g"><label>最晚出行日期</label><input type="date"></div>
        <div class="form-g"><label>游玩天数 <span class="tag">duration_days</span></label><input type="number" value="3"></div>
        <div class="form-g"><label>出游类型 <span class="tag">travel_type</span></label><select><option>休闲旅游</option><option>商务</option><option>团建</option></select></div>
        <div class="form-g"><label>成人数 <span class="tag">adult_count</span></label><input type="number" value="2"></div>
        <div class="form-g"><label>儿童 / 婴儿</label><input type="number" value="0" style="width:48%;display:inline"> <input type="number" value="0" style="width:48%;display:inline"></div>
        <div class="form-g" style="grid-column:1/-1"><label>项目备注 <span class="tag">remark</span>（代替详细行程）</label><textarea rows="3">客户希望含长城，住宿四星以上</textarea></div>
        <div class="form-g" style="grid-column:1/-1"><label>参与员工 <span class="tag">project_members</span></label>
          <label style="font-weight:400"><input type="checkbox" checked> 小助手 (销售)</label>
          <label style="font-weight:400;margin-left:12px"><input type="checkbox"> 王制师 (制师)</label>
        </div>
        <div class="form-g"><label>状态</label><select><option>制作中</option><option>已完成</option><option>已关闭</option></select></div>
        <div class="form-g"><label><input type="checkbox"> 星标项目</label></div>
      </div>
      <div style="text-align:right;margin-top:12px">
        <button class="btn btn-o" onclick="go('projects')">取消</button>
        <button class="btn btn-p">保存</button>
        <button class="btn btn-o" onclick="go('project-finance')">保存并录入收支 →</button>
      </div>
    </div></div>`
  },
  'project-finance': {
    title: '费用核算 · 北京 3 日游',
    nav: 'projects',
    html: `
    <div class="note">GET/POST /projects/:id/transactions · 金额 DB 存 unit_price_cents（分），展示 ÷100</div>
    <p style="font-size:12px;color:#888;margin-bottom:12px">* 费用核算仅机构内部可见，对客户不可见</p>
    <div class="fsum">
      <div><span style="color:#888;font-size:13px">收入合计</span><div class="big" style="color:var(--p)">¥ 8,600.00</div><span class="tag">SUM(income)</span></div>
      <div><span style="color:#888;font-size:13px">支出合计</span><div class="big" style="color:#c0392b">¥ 6,200.00</div><span class="tag">SUM(expense)</span></div>
      <div><span style="color:#888;font-size:13px">毛利</span><div class="big">¥ 2,400.00</div></div>
    </div>
    <div class="toolbar">
      <span style="color:var(--p);font-weight:600;border-bottom:2px solid var(--p);padding:8px">支出明细</span>
      <span style="padding:8px;color:#888">收入明细</span>
      <button class="btn btn-p" style="margin-left:auto">+ 添加明细</button>
    </div>
    <table class="card" style="display:block">
      <tr><th>分类</th><th>项目名称</th><th>选项</th><th>单价(元)</th><th>数量</th><th>小计</th><th>操作</th></tr>
      <tr>
        <td>交通 <span class="tag">category</span></td>
        <td>往返高铁 <span class="tag">item_name</span></td>
        <td>二等座 <span class="tag">option_name</span></td>
        <td>553.00 <span class="tag">55300分</span></td>
        <td>2</td>
        <td>1,106.00</td>
        <td><a href="#">编辑</a></td>
      </tr>
      <tr>
        <td>酒店</td><td>北京 xx 酒店</td><td>大床房</td>
        <td>680.00</td><td>2</td><td>1,360.00</td><td><a href="#">编辑</a></td>
      </tr>
      <tr>
        <td>其他</td><td>导游费</td><td>—</td>
        <td>800.00</td><td>1</td><td>800.00</td><td><a href="#">编辑</a></td>
      </tr>
    </table>
    <div class="card" style="margin-top:12px"><div class="card-h">添加/编辑明细（弹窗字段）</div><div class="card-b grid2">
      <div class="form-g"><label>类型</label><select><option>expense 支出</option><option>income 收入</option></select></div>
      <div class="form-g"><label>分类</label><select><option>transport</option><option>hotel</option><option>activity</option><option>other</option></select></div>
      <div class="form-g"><label>项目名称</label><input></div>
      <div class="form-g"><label>选项说明</label><input></div>
      <div class="form-g"><label>单价（元，提交×100）</label><input placeholder="553.00"></div>
      <div class="form-g"><label>数量 integer</label><input type="number" value="1"></div>
    </div></div>`
  },
  'settings-org': {
    title: '企业信息管理',
    nav: 'settings',
    html: `
    <div class="note">GET/PUT /org · Logo 仅 URL 文本，第一版不上传</div>
    <div class="card"><div class="card-h">路书星球 Planet 示例<button class="btn btn-p btn-sm">编辑</button></div>
      <div class="card-b" style="display:flex;gap:20px">
        <div style="width:80px;height:80px;background:var(--p);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px">LOGO</div>
        <div><h3>示例国际旅行社</h3>
          <p style="color:#888;margin:4px 0">机构号：287638326357 <span class="tag">org_code</span></p>
          <p style="margin-top:12px;font-size:13px">企业介绍 <span class="tag">intro</span></p>
          <p style="font-size:13px;color:#666;margin-top:4px">专注定制出境游与国内高端线路……</p>
        </div>
      </div>
    </div>
    <div class="card hidden-edit"><div class="card-h">编辑表单</div><div class="card-b grid2">
      <div class="form-g"><label>企业名称</label><input></div>
      <div class="form-g"><label>机构号</label><input></div>
      <div class="form-g" style="grid-column:1/-1"><label>Logo URL</label><input placeholder="https://..."></div>
      <div class="form-g" style="grid-column:1/-1"><label>企业介绍</label><textarea rows="4"></textarea></div>
    </div></div>`
  },
  'settings-users': {
    title: '成员信息',
    nav: 'settings',
    html: `
    <div class="note">GET/POST/PATCH/DELETE /users · 邀请码 D1 invites 表</div>
    <div class="toolbar">
      <button class="btn btn-p">+ 添加员工</button>
      <button class="btn btn-o">生成邀请码</button>
      <span style="font-size:12px;color:#888;margin-left:8px">邀请码 7 天有效 · 一次性 · used_by 标记</span>
    </div>
    <table class="card" style="display:block">
      <tr><th>姓名</th><th>邮箱</th><th>角色</th><th>状态</th><th>操作</th></tr>
      <tr><td>小助手</td><td>admin@demo.com</td><td>owner</td><td>启用</td><td>—</td></tr>
      <tr><td>王销售</td><td>sales@demo.com</td><td>staff</td><td>启用</td><td>编辑 · 禁用</td></tr>
      <tr><td>李制师</td><td>planner@demo.com</td><td>staff</td><td>启用</td><td>编辑 · 禁用</td></tr>
    </table>
    <div class="card"><div class="card-h">最近邀请码</div><div class="card-b" style="font-size:13px">
      <p><code>A8K2M9XP</code> · 创建于 2026-06-10 · 过期 2026-06-17 · <span style="color:green">未使用</span></p>
      <p><code>B3N7Q1WR</code> · 已用于 王销售 注册</p>
    </div></div>`
  }
};

function renderAppPage(id) {
  const p = APP_PAGES[id];
  if (!p) return;
  const navItems = {dashboard:'🏠',projects:'📁',customers:'👤',settings:'⚙'};
  document.getElementById(id).innerHTML = `
  <div class="app">
    <div class="sb">
      <a href="#" class="${p.nav==='dashboard'?'on':''}" onclick="go('dashboard');return false" title="工作台">🏠</a>
      <a href="#" class="${p.nav==='projects'?'on':''}" onclick="go('projects');return false" title="项目">📁</a>
      <a href="#" class="${p.nav==='customers'?'on':''}" onclick="go('customers');return false" title="客户">👤</a>
      <a href="#" class="${p.nav==='settings'?'on':''}" onclick="go('settings-org');return false" title="设置">⚙</a>
    </div>
    <div class="wrap">
      <div class="bar"><h2>${p.title}</h2>
        <span style="font-size:13px;color:#888">通知(占位) · 小助手 ▾ → 企业信息 / 成员 / 退出</span>
      </div>
      <div class="body">${p.html}</div>
    </div>
  </div>`;
}

function go(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  document.querySelectorAll('.proto-nav button').forEach(b => b.classList.toggle('on', b.dataset.page === id));
  if (APP_PAGES[id]) renderAppPage(id);
  closeDrawer();
  window.scrollTo(0,0);
}

function closeDrawer() {
  const d = document.getElementById('drawer-customer');
  const o = document.getElementById('overlay');
  if (d) d.classList.add('hidden');
  if (o) o.classList.add('hidden');
}

document.querySelectorAll('.proto-nav button').forEach(b => b.onclick = () => go(b.dataset.page));
go('login');
</script>
</body>
</html>
```

## 各屏字段对照表（便于核对）

### 客户 `customers`

| 界面字段 | DB 字段 | 说明 |
|---------|---------|------|
| 姓名 | name | 必填 |
| 电话/微信/邮箱 | phone, wechat, email | |
| 星级 | star_rating | 1-5 |
| 备注 | remark | ≤15 字 |
| 来源 | source | 下拉 |
| 身份证/护照 | id_card, passport | 文本，无附件 |
| 主客户 | primary_customer_id | 家庭成员关联 |
| 负责人 | owner_user_id | 「我负责的」Tab |

### 项目 `projects`

| 界面字段 | DB 字段 | 说明 |
|---------|---------|------|
| 标题 | title | |
| 主客户 | customer_id | **唯一**，无多对多 |
| 目的地/出发地/天数 | destination, departure_city, duration_days | |
| 日期 | start_date, end_date | |
| 人数 | adult_count, child_count, infant_count | |
| 备注 | remark | **代替行程** |
| 成员 | project_members | sales / planner |
| 星标/状态 | is_starred, status | in_progress / completed / closed |

### 收支 `transactions`

| 界面展示 | DB 字段 | 说明 |
|---------|---------|------|
| 单价 ¥553.00 | unit_price_cents = 55300 | **整数分** |
| 数量 2 | quantity | integer |
| 小计 | unit_price_cents × quantity | SQL 整数运算 |
| 类型 Tab | type | income / expense |
| 分类 | category | transport / hotel / activity / other |

---

**下一步：** 在浏览器打开 `prototype/index.html` 审阅；确认无误后回复「开始实现」进入正式开发。
