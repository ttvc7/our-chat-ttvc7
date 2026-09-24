/* ===== 设置面板逻辑 ===== */
(function() {
  const settingsModal = document.getElementById('settingsModal');
  const settingsBody = document.querySelector('#settingsModal .modal-body');
  const closeBtn = document.getElementById('closeSettingsBtn');
  const openBtn = document.getElementById('openSettingsBtn');

  const MAIN_MENU = `
    <div class="settings-grid">
      <div class="settings-item" data-key="美化"><span class="icon">✨</span>美化</div>
      <div class="settings-item" data-key="外观"><span class="icon">🎨</span>外观</div>
      <div class="settings-item" data-key="聊天"><span class="icon">💬</span>聊天</div>
      <div class="settings-item" data-key="音乐"><span class="icon">🎵</span>音乐</div>
      <div class="settings-item" data-key="信箱"><span class="icon">✉️</span>信箱</div>
      <div class="settings-item" data-key="陪伴"><span class="icon">💗</span>陪伴</div>
    </div>
  `;

  function renderMain() {
    settingsBody.innerHTML = MAIN_MENU;
    bindMain();
  }

  function bindMain() {
    settingsBody.querySelectorAll('.settings-item').forEach(item => {
      item.onclick = () => openSub(item.dataset.key);
    });
  }

  function openSub(key) {
    if (key === '美化') return render美化();
    if (key === '外观') return render外观();
    if (key === '聊天') return render聊天();
    if (key === '音乐') return render音乐();
    if (key === '信箱') return render信箱();
    if (key === '陪伴') return render陪伴();
  }

  function backBtn() {
    return `<button class="back" id="subBack">← 返回</button>`;
  }
  function bindBack() {
    const b = document.getElementById('subBack');
    if (b) b.onclick = renderMain;
  }

  /* ===== 美化 ===== */
  function render美化() {
    settingsBody.innerHTML = `
      <div class="sub-head">${backBtn()}美化</div>
      <div class="sec-title">聊天背景</div>
      <div class="color-row">
        <div class="color-dot" style="background:#f5f5f5" data-bg="#f5f5f5"></div>
        <div class="color-dot" style="background:#fdf6f0" data-bg="#fdf6f0"></div>
        <div class="color-dot" style="background:#f0f4f8" data-bg="#f0f4f8"></div>
        <div class="color-dot" style="background:#f7f0f5" data-bg="#f7f0f5"></div>
        <div class="color-dot" style="background:#eef4ee" data-bg="#eef4ee"></div>
      </div>
      <div class="sec-title">气泡形状</div>
      <div class="opt-grid">
        <div class="opt-card" data-bubble="sharp">标准尖角</div>
        <div class="opt-card" data-bubble="round">圆角</div>
        <div class="opt-card" data-bubble="pill">大圆角胶囊</div>
        <div class="opt-card" data-bubble="square">方形直角</div>
      </div>
      <div class="sec-title">字体大小</div>
      <div class="opt-grid">
        <div class="opt-card" data-font="14">小</div>
        <div class="opt-card" data-font="15">中</div>
        <div class="opt-card" data-font="17">大</div>
      </div>
    `;
    bindBack();
    bindBeautify();
  }

  function bindBeautify() {
    settingsBody.querySelectorAll('.color-dot').forEach(dot => {
      dot.onclick = () => {
        const bg = dot.dataset.bg;
        document.getElementById('messages').style.background = bg;
        localStorage.setItem('chat_bg', bg);
        settingsBody.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
      };
    });
    settingsBody.querySelectorAll('.opt-card').forEach(card => {
      card.onclick = () => {
        if (card.dataset.bubble) {
          const shape = card.dataset.bubble;
          applyBubble(shape);
          localStorage.setItem('bubble_shape', shape);
        }
        if (card.dataset.font) {
          const size = card.dataset.font;
          document.querySelectorAll('.bubble').forEach(b => b.style.fontSize = size + 'px');
          localStorage.setItem('font_size', size);
        }
        const group = card.parentElement;
        group.querySelectorAll('.opt-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      };
    });
  }

  function applyBubble(shape) {
    let radius = '8px';
    if (shape === 'round') radius = '18px';
    if (shape === 'pill') radius = '24px';
    if (shape === 'square') radius = '0';
    document.querySelectorAll('.bubble').forEach(b => b.style.borderRadius = radius);
  }

  /* ===== 外观 ===== */
  function render外观() {
    settingsBody.innerHTML = `
      <div class="sub-head">${backBtn()}外观</div>
      <div class="sec-title">主色调</div>
      <div class="color-row">
        <div class="color-dot" style="background:#95ec69" data-main="#95ec69"></div>
        <div class="color-dot" style="background:#a8d8ea" data-main="#a8d8ea"></div>
        <div class="color-dot" style="background:#f7c8d8" data-main="#f7c8d8"></div>
        <div class="color-dot" style="background:#c8b6e2" data-main="#c8b6e2"></div>
        <div class="color-dot" style="background:#f5d6a0" data-main="#f5d6a0"></div>
        <div class="color-dot" style="background:#b5e0c0" data-main="#b5e0c0"></div>
      </div>
      <div class="sec-title">头像样式</div>
      <div class="opt-grid">
        <div class="opt-card" data-avatar="circle">圆形</div>
        <div class="opt-card" data-avatar="square">方形</div>
        <div class="opt-card" data-avatar="rounded">圆角方形</div>
      </div>
    `;
    bindBack();
    bindAppearance();
  }

  function bindAppearance() {
    settingsBody.querySelectorAll('.color-dot').forEach(dot => {
      dot.onclick = () => {
        const color = dot.dataset.main;
        document.querySelectorAll('.msg-row.me .bubble').forEach(b => b.style.background = color);
        localStorage.setItem('main_color', color);
        settingsBody.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
      };
    });
    settingsBody.querySelectorAll('.opt-card').forEach(card => {
      card.onclick = () => {
        const style = card.dataset.avatar;
        let radius = '6px';
        if (style === 'circle') radius = '50%';
        if (style === 'square') radius = '0';
        if (style === 'rounded') radius = '10px';
        document.querySelectorAll('.avatar').forEach(a => a.style.borderRadius = radius);
        localStorage.setItem('avatar_style', style);
        card.parentElement.querySelectorAll('.opt-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      };
    });
  }

  /* ===== 其他（开发中） ===== */
  function render聊天() {
    settingsBody.innerHTML = `<div class="sub-head">${backBtn()}聊天</div><p style="color:#999;padding:20px 0;">聊天功能正在开发中…</p>`;
    bindBack();
  }
  function render音乐() {
    settingsBody.innerHTML = `<div class="sub-head">${backBtn()}音乐</div><p style="color:#999;padding:20px 0;">音乐功能正在开发中…</p>`;
    bindBack();
  }
  function render信箱() {
    settingsBody.innerHTML = `<div class="sub-head">${backBtn()}信箱</div><p style="color:#999;padding:20px 0;">信箱功能正在开发中…</p>`;
    bindBack();
  }
  function render陪伴() {
    settingsBody.innerHTML = `<div class="sub-head">${backBtn()}陪伴</div><p style="color:#999;padding:20px 0;">陪伴功能正在开发中…</p>`;
    bindBack();
  }

  /* 打开 / 关闭 */
  openBtn.onclick = () => { renderMain(); settingsModal.classList.remove('hidden'); };
  closeBtn.onclick = () => settingsModal.classList.add('hidden');

  /* 启动时恢复已保存的设置 */
  window.addEventListener('load', () => {
    const bg = localStorage.getItem('chat_bg');
    if (bg) document.getElementById('messages').style.background = bg;
    const shape = localStorage.getItem('bubble_shape');
    if (shape) applyBubble(shape);
    const fs = localStorage.getItem('font_size');
    if (fs) document.querySelectorAll('.bubble').forEach(b => b.style.fontSize = fs + 'px');
    const mc = localStorage.getItem('main_color');
    if (mc) document.querySelectorAll('.msg-row.me .bubble').forEach(b => b.style.background = mc);
    const av = localStorage.getItem('avatar_style');
    if (av) {
      let radius = '6px';
      if (av === 'circle') radius = '50%';
      if (av === 'square') radius = '0';
      if (av === 'rounded') radius = '10px';
      document.querySelectorAll('.avatar').forEach(a => a.style.borderRadius = radius);
    }
  });
})();
