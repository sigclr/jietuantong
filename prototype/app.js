const AUTH_SCREENS = {
  "register-org": `<div class="auth"><div class="auth-box"><h1>注册地接社</h1><div class="tabs"><div class="tab on">创建企业</div><div class="tab" onclick="go('register-invite')">邀请码加入</div></div><div class="note">POST /auth/register-org</div><div class="form-g"><label>地接社名称 <span class="tag">organizations.name</span></label><input placeholder="云南 XX 地接社"></div><div class="form-g"><label>管理员姓名</label><input></div><div class="form-g"><label>邮箱</label><input type="email"></div><div class="form-g"><label>密码</label><input type="password"></div><button class="btn btn-p" style="width:100%" onclick="go('dashboard')">创建并进入</button></div></div>`,
  "register-invite": `<div class="auth"><div class="auth-box"><h1>加入团队</h1><div class="tabs"><div class="tab" onclick="go('register-org')">创建企业</div><div class="tab on">邀请码加入</div></div><div class="form-g"><label>邀请码 <span class="tag">invites.code</span></label><input placeholder="8 位邀请码"></div><div class="form-g"><label>姓名</label><input></div><div class="form-g"><label>邮箱</label><input type="email"></div><div class="form-g"><label>密码</label><input type="password"></div><button class="btn btn-p" style="width:100%" onclick="go('dashboard')">加入</button></div></div>`
};

const APP_PAGES = {
  dashboard: { title: "工作台", nav: "dashboard", html: `
    <div class="alert-bar"><span>有 <strong>3 笔</strong> 应收已逾期，合计 <strong>¥ 28,600.00</strong></span><a href="#" onclick="go('project-finance');return false" style="color:#721c24">查看 →</a></div>
    <div class="note">GET /dashboard/stats</div>
    <div class="stats"><div class="stat"><div class="l">执行中接团</div><div class="v">8</div></div><div class="stat"><div class="l">待结算</div><div class="v">5</div></div><div class="stat"><div class="l">逾期应收</div><div class="v warn">3</div></div></div>
    <div class="card"><div class="card-h">近 30 天抵团量</div><div class="card-b"><div class="chart"><div style="height:35px"></div><div style="height:60px"></div><div style="height:80px"></div><div style="height:55px"></div><div style="height:90px"></div></div></div></div>
    <div class="card"><div class="card-h">快捷操作</div><div class="card-b"><button class="btn btn-p" onclick="go('project-form')">+ 新建接团单</button> <button class="btn btn-o" onclick="go('partners')">合作方</button> <button class="btn btn-o" onclick="go('suppliers')">供应商</button></div></div>
    <div class="card"><div class="card-h">近期抵团</div><table><tr><th>团号</th><th>合作方</th><th>抵团日</th><th>人数</th><th>状态</th></tr>
    <tr style="cursor:pointer" onclick="go('project-finance')"><td><strong>YN20260615-A</strong></td><td>上海国旅</td><td>2026-06-15</td><td>32</td><td><span class="badge b-prog">执行中</span></td></tr>
    <tr><td>YN20260608-C</td><td>携程定制</td><td>2026-06-08</td><td>6</td><td><span class="badge b-settle">待结算</span></td></tr></table></div>` },
  partners: { title: "合作方（组团社）", nav: "partners", html: `
    <div class="note">GET /partners · 替代散客 CRM</div>
    <div class="toolbar"><input placeholder="搜索社名/对接人" style="width:200px"><select><option>账期</option></select><button class="btn btn-p" style="margin-left:auto" onclick="openDrawer('drawer-partner')">+ 添加合作方</button></div>
    <table class="card" style="display:block"><tr><th>合作方</th><th>对接人</th><th>账期</th><th>在途团</th><th>未结应收</th></tr>
    <tr style="cursor:pointer" onclick="go('partner-detail')"><td><strong>上海国旅</strong></td><td>张经理</td><td>月结30天</td><td>3</td><td style="color:var(--danger)">¥45,200</td></tr>
    <tr><td><strong>广之旅</strong></td><td>李计调</td><td>单团结</td><td>1</td><td>¥12,800</td></tr></table>
    <div id="drawer-partner" class="drawer hidden"><h3>添加合作方 <button class="btn btn-o btn-sm" style="float:right" onclick="closeDrawers()">×</button></h3><div class="form-g"><label>组团社名称</label><input></div><button class="btn btn-p">保存</button></div>
    <div id="overlay-global" class="overlay hidden" onclick="closeDrawers()"></div>` },
  "partner-detail": { title: "合作方 · 上海国旅", nav: "partners", html: `
    <div class="detail"><div class="profile"><h3>上海国旅</h3><dl><dt>对接人</dt><dd>张经理 138****1234</dd><dt>账期</dt><dd>月结 30 天</dd></dl></div>
    <div><div class="card"><div class="card-h">未结应收</div><table><tr><th>团号</th><th>款项</th><th>金额</th><th>状态</th></tr>
    <tr><td><a href="#" onclick="go('project-finance')">YN20260608-C</a></td><td>尾款</td><td>¥18,600</td><td><span class="badge b-overdue">已逾期</span></td></tr></table></div>
    <div class="card"><div class="card-h">历史接团</div><div class="card-b">YN20260615-A · 执行中 · 32人<br>YN20260501-E · 已结清</div></div></div></div>` },
  suppliers: { title: "供应商", nav: "suppliers", html: `
    <div class="note">GET /suppliers</div>
    <div class="toolbar"><span class="tab-link on">全部</span><span class="tab-link">酒店</span><span class="tab-link">车队</span><span class="tab-link">导游</span><button class="btn btn-p" style="margin-left:auto">+ 添加</button></div>
    <table class="card" style="display:block"><tr><th>名称</th><th>分类</th><th>结算</th></tr>
    <tr><td>大理 XX 酒店</td><td>hotel</td><td>预付</td></tr><tr><td>云南 XX 车队</td><td>fleet</td><td>现结</td></tr><tr><td>导游-阿花</td><td>guide</td><td>单团结</td></tr></table>` },
  projects: { title: "接团单", nav: "projects", html: `
    <div class="note">GET /projects · group_no 唯一</div>
    <div class="toolbar"><span class="tab-link on">全部</span><span class="tab-link">执行中</span><span class="tab-link">待结算</span><input placeholder="团号" style="margin-left:8px"><button class="btn btn-p" style="margin-left:auto" onclick="go('project-form')">+ 新建</button></div>
    <table class="card" style="display:block"><tr><th>团号/团名</th><th>合作方</th><th>状态</th><th>抵离</th><th>人数</th><th>毛利</th><th>操作</th></tr>
    <tr><td>★ <strong>YN20260615-A</strong><br><small>大理丽江6日</small></td><td>上海国旅</td><td><span class="badge b-prog">执行中</span></td><td>06-15~20</td><td>32</td><td style="color:var(--p)">¥8,400</td><td><a href="#" onclick="go('project-finance')">核算</a></td></tr>
    <tr><td><strong>YN20260608-C</strong></td><td>携程</td><td><span class="badge b-settle">待结算</span></td><td>06-08~12</td><td>6</td><td>¥2,100</td><td><a href="#" onclick="go('project-finance')">核算</a></td></tr></table>` },
  "project-form": { title: "新建接团单", nav: "projects", html: `
    <div class="card"><div class="card-h">接团基本信息</div><div class="card-b grid2">
    <div class="form-g"><label>团号 * <span class="tag">group_no</span></label><input value="YN20260615-A"></div>
    <div class="form-g"><label>合作组团社 * <span class="tag">partner_id</span></label><select><option>上海国旅</option></select></div>
    <div class="form-g"><label>团名</label><input value="大理丽江 6 日"></div>
    <div class="form-g"><label>接待地区</label><input value="大理/丽江"></div>
    <div class="form-g"><label>抵团日</label><input type="date" value="2026-06-15"></div>
    <div class="form-g"><label>送团日</label><input type="date" value="2026-06-20"></div>
    <div class="form-g"><label>人数</label><input type="number" value="32"></div>
    <div class="form-g"><label>领队/电话</label><input value="王领队 / 139****5678"></div>
    <div class="form-g" style="grid-column:1/-1"><label>接团备注 <span class="tag">remark</span></label><textarea rows="3">含玉龙雪山大索道；2晚大理+2晚丽江</textarea></div>
    <div style="grid-column:1/-1;text-align:right"><button class="btn btn-o" onclick="go('projects')">取消</button> <button class="btn btn-p">保存</button> <button class="btn btn-o" onclick="go('project-finance')">保存并核算 →</button></div>
    </div></div>` },
  "project-finance": { title: "接团核算 · YN20260615-A", nav: "projects", html: `
    <div class="fsum"><div><span style="color:#888;font-size:13px">应收</span><div class="big" style="color:var(--p)">¥86,000</div></div><div><span style="color:#888;font-size:13px">应付</span><div class="big" style="color:var(--danger)">¥77,600</div></div><div><span style="color:#888;font-size:13px">毛利</span><div class="big">¥8,400</div></div></div>
    <div class="section-title">收付款计划 payment_schedules</div>
    <table class="card" style="display:block"><tr><th>方向</th><th>对象</th><th>款项</th><th>金额</th><th>到期</th><th>状态</th></tr>
    <tr><td>应收</td><td>上海国旅</td><td>定金</td><td>¥25,800</td><td>05-01</td><td><span class="badge b-paid">已收</span></td></tr>
    <tr><td>应收</td><td>上海国旅</td><td>尾款</td><td>¥60,200</td><td>06-25</td><td><span class="badge b-pending">待收</span></td></tr>
    <tr><td>应付</td><td>大理 XX 酒店</td><td>预付</td><td>¥12,000</td><td>06-10</td><td><span class="badge b-paid">已付</span></td></tr></table>
    <div class="toolbar" style="margin-top:16px"><span class="tab-link on">支出明细</span><span class="tab-link">收入明细</span></div>
    <table class="card" style="display:block"><tr><th>分类</th><th>项目</th><th>供应商</th><th>单价(元)</th><th>小计</th></tr>
    <tr><td>hotel</td><td>大理客栈</td><td>大理 XX 酒店</td><td>380 <span class="tag">38000分</span></td><td>24,320</td></tr>
    <tr><td>fleet</td><td>33座6天</td><td>XX 车队</td><td>1,200</td><td>7,200</td></tr></table>` },
  "settings-org": { title: "企业信息", nav: "settings", html: `<div class="card"><div class="card-h">云南 XX 地接社</div><div class="card-b"><h3>云南 XX 国际旅行社（地接）</h3><p style="color:#888">机构号 5301XXXX</p></div></div>` },
  "settings-users": { title: "员工管理", nav: "settings", html: `<table class="card" style="display:block"><tr><th>姓名</th><th>角色</th></tr><tr><td>老板张</td><td>owner</td></tr><tr><td>小李</td><td>coordinator 计调</td></tr><tr><td>财务王</td><td>admin</td></tr></table>` }
};

function renderAppPage(id) {
  const p = APP_PAGES[id];
  if (!p) return;
  document.getElementById(id).innerHTML = `<div class="app"><div class="sb">
    <a href="#" class="${p.nav==="dashboard"?"on":""}" onclick="go('dashboard');return false" title="工作台">⌂</a>
    <a href="#" class="${p.nav==="projects"?"on":""}" onclick="go('projects');return false" title="接团单">☰</a>
    <a href="#" class="${p.nav==="partners"?"on":""}" onclick="go('partners');return false" title="合作方">◎</a>
    <a href="#" class="${p.nav==="suppliers"?"on":""}" onclick="go('suppliers');return false" title="供应商">◇</a>
    <a href="#" class="${p.nav==="settings"?"on":""}" onclick="go('settings-org');return false" title="设置">⚙</a>
  </div><div class="wrap"><div class="bar"><h2>${p.title}</h2><span style="font-size:13px;color:#888">逾期应收 <strong style="color:var(--danger)">3</strong></span></div><div class="body">${p.html}</div></div></div>`;
}

function go(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  const el = document.getElementById(id);
  el.classList.remove("hidden");
  document.querySelectorAll(".proto-nav button").forEach(b => b.classList.toggle("on", b.dataset.page === id));
  if (AUTH_SCREENS[id]) el.innerHTML = AUTH_SCREENS[id];
  else if (APP_PAGES[id]) renderAppPage(id);
  closeDrawers();
  window.scrollTo(0, 0);
}

function openDrawer(id) { document.getElementById(id)?.classList.remove("hidden"); document.getElementById("overlay-global")?.classList.remove("hidden"); }
function closeDrawers() { document.querySelectorAll(".drawer,.overlay").forEach(el => el.classList.add("hidden")); }
document.querySelectorAll(".proto-nav button").forEach(b => { b.onclick = () => go(b.dataset.page); });