/* ===== 设置面板逻辑 ===== */
(function() {
  const settingsModal = document.getElementById('settingsModal');
  const settingsBody = document.querySelector('#settingsModal .modal-body');
  const closeBtn = document.getElementById('closeSettingsBtn');
  const openBtn = document.getElementById('openSettingsBtn');

  function load(key, def) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : def;
    } catch (e) { return def; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  let cfg = {
    taName: load('ta_name', 'TA'),
    myName: load('my_name', '我'),
    taAvatar: load('ta_avatar', ''),
    myAvatar: load('my_avatar', ''),
    textColor: load('text_color', '#111111'),
    patToTa: load('pat_to_ta', ['{我} 拍了拍 {TA}']),
    patToMe: load('pat_to_me', ['{TA} 拍了拍 {我}']),
    bubbleShape: load('bubble_shape', ''),
    fontSize: load('font_size', ''),
    chatBg: load('chat_bg', ''),
    chatBgImage: load('chat_bg_image', ''),
    taAvatarStyle: load('avatar_style_ta', ''),
    myAvatarStyle: load('avatar_style_my', ''),
    themeColor: load('theme_color', '')
  };

  function applyAll() {
    const taNameEl = document.getElementById('taName');
    if (taNameEl && !taNameEl.dataset.typing) taNameEl.textContent = cfg.taName;

    document.querySelectorAll('.bubble').forEach(b => {
      b.style.color = cfg.textColor;
    });

    if (cfg.bubbleShape) {
      let radius = '8px';
      if (cfg.bubbleShape === 'round') radius = '18px';
      if (cfg.bubbleShape === 'pill') radius = '24px';
      if (cfg.bubbleShape === 'square') radius = '0';
      document.querySelectorAll('.bubble').forEach(b => b.style.borderRadius = radius);
    }

    if (cfg.fontSize) {
      document.querySelectorAll('.bubble').forEach(b => b.style.fontSize = cfg.fontSize + 'px');
    }

    const messagesEl = document.getElementById('messages');
    if (messagesEl) {
      if (cfg.chatBgImage) {
        messagesEl.style.background = `url(${cfg.chatBgImage}) center/cover no-repeat`;
      } else if (cfg.chatBg) {
        messagesEl.style.background = cfg.chatBg;
      }
    }

    document.querySelectorAll('.msg-row').forEach(row => {
      const avatar = row.querySelector('.avatar');
      if (!avatar) return;
      const isMe = row.classList.contains('me');
      const img = isMe ? cfg.myAvatar : cfg.taAvatar;
      const style = isMe ? cfg.myAvatarStyle : cfg.taAvatarStyle;
      if (img) {
        avatar.style.background = `url(${img}) center/cover no-repeat`;
        avatar.textContent = '';
      }
      if (style) {
        let radius = '6px';
        if (style === 'circle') radius = '50%';
        if (style === 'square') radius = '0';
        if (style === 'rounded') radius = '10px';
        avatar.style.borderRadius = radius;
      }
    });
  }

  function hookNewMessages() {
    const messagesEl = document.getElementById('messages');
    if (!messagesEl) return;
    const observer = new MutationObserver(() => applyAll());
    observer.observe(messagesEl, { childList: true });
  }

  function applyThemeColor(color) {
    let s = document.getElementById('userThemeColor');
    if (!s) {
      s = document.createElement('style');
      s.id = 'userThemeColor';
      document.head.appendChild(s);
    }
    s.textContent = `
      #send { background: ${color} !important; }
      .card-tab.active { color: ${color} !important; background: ${color}22 !important; }
      .card-cat.active { background: ${color} !important; }
      .back { color: ${color} !important; }
      .btn-primary { background: ${color} !important; }
      .sub-head .back { color: ${color} !important; }
    `;
  }

  function renderMain() {
    settingsBody.innerHTML = `
      <div class="settings-grid">
        <div class="settings-item" data-key="美化"><span class="icon">✨</span>美化</div>
        <div class="settings-item" data-key="外观"><span class="icon">🎨</span>外观</div>
        <div class="settings-item" data-key="聊天"><span class="icon">💬</span>聊天</div>
        <div class="settings-item" data-key="音乐"><span class="icon">🎵</span>音乐</div>
        <div class="settings-item" data-key="信箱"><span class="icon">✉️</span>信箱</div>
        <div class="settings-item" data-key="陪伴"><span class="icon">💗</span>陪伴</div>
        <div class="settings-item" data-key="备份"><span class="icon">💾</span>备份</div>
        <div class="settings-item" data-key="关于"><span class="icon">ℹ️</span>关于</div>
      </div>
    `;
    settingsBody.querySelectorAll('.settings-item').forEach(item => {
      item.onclick = () => openSub(item.dataset.key);
    });
  }

  function openSub(key) {
    if (key === '美化') return renderBeautify();
    if (key === '外观') return renderAppearance();
    if (key === '聊天') return renderChat();
    if (key === '音乐') return renderMusic();
    if (key === '信箱') return renderMailbox();
    if (key === '陪伴') return renderCompany();
    if (key === '备份') return renderBackup();
    if (key === '关于') return renderAbout();
  }

  function backBtn() {
    return `<button class="back" id="subBack">← 返回</button>`;
  }
  function bindBack() {
    const b = document.getElementById('subBack');
    if (b) b.onclick = renderMain;
  }

  /* 美化 */
  function renderBeautify() {
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
      <input type="file" id="bgUpload" accept="image/*" style="display:none;">
      <button class="btn-secondary" id="pickBgBtn">从相册选背景图</button>

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

      <div class="sec-title">气泡 CSS（高级）</div>
      <textarea class="css-area" id="bubbleCssInput" placeholder=".bubble { ... }"></textarea>
      <button class="btn-primary" id="applyBubbleCss">应用气泡 CSS</button>

      <div class="sec-title">字体 CSS（高级）</div>
      <textarea class="css-area" id="fontCssInput" placeholder=".bubble { font-family: ...; }"></textarea>
      <button class="btn-primary" id="applyFontCss">应用字体 CSS</button>
    `;
    bindBack();
    bindBeautify();
  }

  function bindBeautify() {
    settingsBody.querySelectorAll('.color-dot').forEach(dot => {
      dot.onclick = () => {
        const bg = dot.dataset.bg;
        const messagesEl = document.getElementById('messages');
        messagesEl.style.background = bg;
        cfg.chatBg = bg;
        cfg.chatBgImage = '';
        save('chat_bg', bg);
        save('chat_bg_image', '');
        settingsBody.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
      };
    });

    const pickBtn = document.getElementById('pickBgBtn');
    const upload = document.getElementById('bgUpload');
    if (pickBtn && upload) {
      pickBtn.onclick = () => upload.click();
      upload.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        compressImage(file, 800, (url) => {
          document.getElementById('messages').style.background = `url(${url}) center/cover no-repeat`;
          cfg.chatBgImage = url;
          cfg.chatBg = '';
          save('chat_bg_image', url);
          save('chat_bg', '');
        });
      };
    }

    settingsBody.querySelectorAll('.opt-card').forEach(card => {
      card.onclick = () => {
        if (card.dataset.bubble) {
          const shape = card.dataset.bubble;
          cfg.bubbleShape = shape;
          save('bubble_shape', shape);
          applyAll();
        }
        if (card.dataset.font) {
          const size = card.dataset.font;
          cfg.fontSize = size;
          save('font_size', size);
          applyAll();
        }
        card.parentElement.querySelectorAll('.opt-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      };
    });

    const bubbleCssBtn = document.getElementById('applyBubbleCss');
    if (bubbleCssBtn) {
      bubbleCssBtn.onclick = () => {
        const css = document.getElementById('bubbleCssInput').value;
        let styleEl = document.getElementById('userBubbleCss');
        if (!styleEl) {
          styleEl = document.createElement('style');
          styleEl.id = 'userBubbleCss';
          document.head.appendChild(styleEl);
        }
        styleEl.textContent = css;
        save('bubble_css', css);
      };
    }

    const fontCssBtn = document.getElementById('applyFontCss');
    if (fontCssBtn) {
      fontCssBtn.onclick = () => {
        const css = document.getElementById('fontCssInput').value;
        let styleEl = document.getElementById('userFontCss');
        if (!styleEl) {
          styleEl = document.createElement('style');
          styleEl.id = 'userFontCss';
          document.head.appendChild(styleEl);
        }
        styleEl.textContent = css;
        save('font_css', css);
      };
    }
  }

  /* 外观 */
  function renderAppearance() {
    settingsBody.innerHTML = `
      <div class="sub-head">${backBtn()}外观</div>

      <div class="sec-title">文字 & 主题颜色</div>
      <input type="color" class="color-slider" id="textColorPicker" value="${cfg.textColor}">
      <button class="btn-primary" id="applyTextColor">应用颜色（文字 + 按钮同步）</button>

      <div class="sec-title">主题 CSS（高级）</div>
      <textarea class="css-area" id="themeCssInput" placeholder="body { ... }"></textarea>
      <button class="btn-primary" id="applyThemeCss">应用主题 CSS</button>

      <div class="sec-title">头像</div>
      <div class="avatar-row" id="taAvatarRow">
        <div class="avatar-preview" id="taAvatarPreview" style="${cfg.taAvatar ? `background-image:url(${cfg.taAvatar})` : ''}"></div>
        <span class="label">TA 的头像（点击更换）</span>
      </div>
      <div class="avatar-row" id="myAvatarRow">
        <div class="avatar-preview" id="myAvatarPreview" style="${cfg.myAvatar ? `background-image:url(${cfg.myAvatar})` : ''}"></div>
        <span class="label">我的头像（点击更换）</span>
      </div>
      <input type="file" id="avatarUpload" accept="image/*" style="display:none;">

      <div class="sec-title">昵称</div>
      <div class="input-row">
        <span class="label">TA 的昵称</span>
        <input type="text" id="taNameInput" value="${cfg.taName}">
      </div>
      <div class="input-row">
        <span class="label">我的昵称</span>
        <input type="text" id="myNameInput" value="${cfg.myName}">
      </div>
      <button class="btn-primary" id="saveNames">保存昵称</button>

      <div class="sec-title">头像样式</div>
      <div class="opt-grid">
        <div class="opt-card" data-avatar="circle">圆形</div>
        <div class="opt-card" data-avatar="square">方形</div>
        <div class="opt-card" data-avatar="rounded">圆角方形</div>
      </div>

      <div class="sec-title">拍一拍</div>
      <div style="font-size:13px;color:#999;margin-bottom:8px;">我拍他（双击 TA 头像时显示）</div>
      <div class="pat-item">
        <input type="text" id="patToTaInput" value="${cfg.patToTa[0] || ''}">
      </div>
      <div style="font-size:13px;color:#999;margin:12px 0 8px;">他拍我（双击我的头像时随机选一条）</div>
      <div id="patToMeList"></div>
      <button class="btn-secondary" id="addPatBtn">+ 添加一条</button>
      <button class="btn-primary" id="savePatBtn">保存拍一拍</button>
    `;
    bindBack();
    bindAppearance();
  }

  function bindAppearance() {
    const picker = document.getElementById('textColorPicker');
    const applyColor = document.getElementById('applyTextColor');
    if (picker && applyColor) {
      applyColor.onclick = () => {
        const color = picker.value;
        cfg.textColor = color;
        cfg.themeColor = color;
        save('text_color', color);
        save('theme_color', color);
        applyAll();
        applyThemeColor(color);
      };
    }

    const themeBtn = document.getElementById('applyThemeCss');
    if (themeBtn) {
      themeBtn.onclick = () => {
        const css = document.getElementById('themeCssInput').value;
        let styleEl = document.getElementById('userThemeCss');
        if (!styleEl) {
          styleEl = document.createElement('style');
          styleEl.id = 'userThemeCss';
          document.head.appendChild(styleEl);
        }
        styleEl.textContent = css;
        save('theme_css', css);
      };
    }

    let currentAvatarTarget = null;
    const avatarUpload = document.getElementById('avatarUpload');
    document.getElementById('taAvatarRow').onclick = () => { currentAvatarTarget = 'ta'; avatarUpload.click(); };
    document.getElementById('myAvatarRow').onclick = () => { currentAvatarTarget = 'my'; avatarUpload.click(); };
    avatarUpload.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      compressImage(file, 400, (url) => {
        if (currentAvatarTarget === 'ta') {
          cfg.taAvatar = url;
          save('ta_avatar', url);
          document.getElementById('taAvatarPreview').style.backgroundImage = `url(${url})`;
        } else {
          cfg.myAvatar = url;
          save('my_avatar', url);
          document.getElementById('myAvatarPreview').style.backgroundImage = `url(${url})`;
        }
        applyAll();
      });
      avatarUpload.value = '';
    };

    document.getElementById('saveNames').onclick = () => {
      const ta = document.getElementById('taNameInput').value.trim() || 'TA';
      const my = document.getElementById('myNameInput').value.trim() || '我';
      cfg.taName = ta;
      cfg.myName = my;
      save('ta_name', ta);
      save('my_name', my);
      applyAll();
      alert('已保存');
    };

    settingsBody.querySelectorAll('.opt-card').forEach(card => {
      card.onclick = () => {
        const style = card.dataset.avatar;
        cfg.taAvatarStyle = style;
        cfg.myAvatarStyle = style;
        save('avatar_style_ta', style);
        save('avatar_style_my', style);
        applyAll();
        card.parentElement.querySelectorAll('.opt-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      };
    });

    renderPatList();
    document.getElementById('addPatBtn').onclick = () => {
      cfg.patToMe.push('');
      save('pat_to_me', cfg.patToMe);
      renderPatList();
    };
    document.getElementById('savePatBtn').onclick = () => {
      const toTa = document.getElementById('patToTaInput').value.trim();
      cfg.patToTa = toTa ? [toTa] : ['{我} 拍了拍 {TA}'];
      save('pat_to_ta', cfg.patToTa);
      const inputs = document.querySelectorAll('#patToMeList .pat-input');
      const list = [];
      inputs.forEach(inp => {
        if (inp.value.trim()) list.push(inp.value.trim());
      });
      cfg.patToMe = list.length ? list : ['{TA} 拍了拍 {我}'];
      save('pat_to_me', cfg.patToMe);
      alert('已保存');
    };
  }

  function renderPatList() {
    const box = document.getElementById('patToMeList');
    if (!box) return;
    box.innerHTML = '';
    cfg.patToMe.forEach((text, idx) => {
      const div = document.createElement('div');
      div.className = 'pat-item';
      div.innerHTML = `<input type="text" class="pat-input" value="${text}"><button class="remove">×</button>`;
      div.querySelector('.remove').onclick = () => {
        cfg.patToMe.splice(idx, 1);
        save('pat_to_me', cfg.patToMe);
        renderPatList();
      };
      box.appendChild(div);
    });
  }

  /* 聊天 */
  function renderChat() {
    const replyMin = load('reply_min', 1);
    const replyMax = load('reply_max', 1);
    const delayMin = load('delay_min', 5);
    const delayMax = load('delay_max', 15);
    const emojiProb = load('emoji_prob', 10);
    const stickerProb = load('sticker_prob', 20);

    settingsBody.innerHTML = `
      <div class="sub-head">${backBtn()}聊天</div>

      <div class="sec-title">回复条数</div>
      <div class="input-row">
        <span class="label">最少</span>
        <input type="number" id="replyMinInput" value="${replyMin}" min="1" max="10">
        <span class="label">条</span>
      </div>
      <div class="input-row">
        <span class="label">最多</span>
        <input type="number" id="replyMaxInput" value="${replyMax}" min="1" max="10">
        <span class="label">条</span>
      </div>

      <div class="sec-title">回复延迟</div>
      <div class="input-row">
        <span class="label">最少</span>
        <input type="number" id="delayMinInput" value="${delayMin}" min="0" max="300">
        <span class="label">秒</span>
      </div>
      <div class="input-row">
        <span class="label">最多</span>
        <input type="number" id="delayMaxInput" value="${delayMax}" min="0" max="300">
        <span class="label">秒</span>
      </div>

      <div class="sec-title">额外概率</div>
      <div class="input-row">
        <span class="label">颜文字</span>
        <input type="number" id="emojiProbInput" value="${emojiProb}" min="0" max="100">
        <span class="label">%</span>
      </div>
      <div class="input-row">
        <span class="label">表情包</span>
        <input type="number" id="stickerProbInput" value="${stickerProb}" min="0" max="100">
        <span class="label">%</span>
      </div>
      <div class="sec-title">转账反应（TA 收到你转账时）</div>
<div class="input-row">
  <span class="label">自动收款</span>
  <input type="number" id="transRecvInput" value="60" min="0" max="100">
  <span class="label">%</span>
</div>
<div class="input-row">
  <span class="label">自动退还</span>
  <input type="number" id="transRefInput" value="30" min="0" max="100">
  <span class="label">%</span>
</div>
<div class="input-row">
  <span class="label">不理（保持待收款）</span>
  <input type="number" id="transIgnInput" value="10" min="0" max="100">
  <span class="label">%</span>
</div>

      <button class="btn-primary" id="saveChatSettings">保存聊天设置</button>

      <div class="sec-title">清空数据</div>
      <button class="btn-danger" id="clearMessages">清空聊天记录</button>
      <button class="btn-danger" id="clearCards">清空所有字卡</button>
    `;
    bindBack();

    document.getElementById('saveChatSettings').onclick = () => {
      const rmin = parseInt(document.getElementById('replyMinInput').value) || 1;
      const rmax = parseInt(document.getElementById('replyMaxInput').value) || 1;
      const dmin = parseInt(document.getElementById('delayMinInput').value) || 0;
      const dmax = parseInt(document.getElementById('delayMaxInput').value) || 0;
      const ep = parseInt(document.getElementById('emojiProbInput').value) || 0;
      const sp = parseInt(document.getElementById('stickerProbInput').value) || 0;
      save('reply_min', Math.min(rmin, rmax));
      save('reply_max', Math.max(rmin, rmax));
      save('delay_min', Math.min(dmin, dmax));
      save('delay_max', Math.max(dmin, dmax));
      save('emoji_prob', Math.max(0, Math.min(100, ep)));
      save('sticker_prob', Math.max(0, Math.min(100, sp)));
      alert('已保存');
    };

    document.getElementById('clearMessages').onclick = () => {
      if (confirm('确定清空聊天记录吗？删除后无法恢复。')) {
        localStorage.removeItem('our_messages');
        alert('已清空，刷新页面生效');
      }
    };
    document.getElementById('clearCards').onclick = () => {
      if (confirm('确定清空所有字卡吗？删除后无法恢复。')) {
        localStorage.removeItem('our_cards');
        alert('已清空，刷新页面生效');
      }
    };
  }

  function renderMusic() {
    settingsBody.innerHTML = `<div class="sub-head">${backBtn()}音乐</div><p style="color:#999;padding:20px 0;">音乐功能正在开发中…</p>`;
    bindBack();
  }
  function renderMailbox() {
    settingsBody.innerHTML = `<div class="sub-head">${backBtn()}信箱</div><p style="color:#999;padding:20px 0;">信箱功能正在开发中…</p>`;
    bindBack();
  }
  function renderCompany() {
    settingsBody.innerHTML = `<div class="sub-head">${backBtn()}陪伴</div><p style="color:#999;padding:20px 0;">陪伴功能正在开发中…</p>`;
    bindBack();
  }

  function renderBackup() {
    settingsBody.innerHTML = `
      <div class="sub-head">${backBtn()}备份</div>
      <p style="font-size:13px;color:#999;margin-bottom:10px;">导出后请把文字存到备忘录，方便以后恢复。</p>
      <button class="btn-primary" id="exportBtn">导出备份</button>
      <button class="btn-secondary" id="importBtn">导入备份</button>
      <textarea class="css-area" id="backupArea" placeholder="备份内容会显示在这里，或把备份文字粘贴到这里后点导入" style="height:200px;margin-top:12px;"></textarea>
    `;
    bindBack();
    document.getElementById('exportBtn').onclick = () => {
      const data = {
        messages: JSON.parse(localStorage.getItem('our_messages') || '[]'),
        cards: JSON.parse(localStorage.getItem('our_cards') || '[]'),
        taName: cfg.taName,
        myName: cfg.myName
      };
      let text = '=== ttvc7 备份 ===\n';
      text += 'TA昵称：' + data.taName + '\n';
      text += '我的昵称：' + data.myName + '\n\n';
      text += '=== 字卡 ===\n';
      data.cards.forEach(c => text += (c.content || c) + '\n');
      text += '\n=== 聊天记录 ===\n';
      data.messages.forEach(m => {
        text += (m.sender === 'me' ? data.myName : data.taName) + '：' + m.content + '\n';
      });
      text += '\n=== 原始数据（勿改） ===\n';
      text += JSON.stringify(data);
      document.getElementById('backupArea').value = text;
      alert('已生成，请复制保存到备忘录');
    };
    document.getElementById('importBtn').onclick = () => {
      const text = document.getElementById('backupArea').value;
      const match = text.match(/=== 原始数据（勿改） ===\s*(\{[\s\S]*\})/);
      if (!match) { alert('备份格式不对'); return; }
      try {
        const data = JSON.parse(match[1]);
        if (data.messages) localStorage.setItem('our_messages', JSON.stringify(data.messages));
        if (data.cards) localStorage.setItem('our_cards', JSON.stringify(data.cards));
        if (data.taName) localStorage.setItem('ta_name', JSON.stringify(data.taName));
        if (data.myName) localStorage.setItem('my_name', JSON.stringify(data.myName));
        alert('导入成功，刷新页面生效');
      } catch (e) {
        alert('导入失败：' + e.message);
      }
    };
  }

  function renderAbout() {
    settingsBody.innerHTML = `
      <div class="sub-head">${backBtn()}关于</div>
      <div class="about-box">
        <div class="title">Echo</div>
        你和 TA 的专属聊天室
        <div class="divider">────────────</div>
        版本  v1.0<br>
        作者  ttvc7<br>
        始于  2026 年 9 月 24 日
      </div>
    `;
    bindBack();
  }

  function compressImage(file, maxSize, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > h) {
          if (w > maxSize) { h = h * maxSize / w; w = maxSize; }
        } else {
          if (h > maxSize) { w = w * maxSize / h; h = maxSize; }
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        callback(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  window.addEventListener('load', () => {
    applyAll();
    hookNewMessages();

    // 打开设置按钮（如果存在的话）
    if (openBtn) openBtn.onclick = () => { renderMain(); settingsModal.classList.remove('hidden'); };
    if (closeBtn) closeBtn.onclick = () => settingsModal.classList.add('hidden');

    const bubbleCss = localStorage.getItem('bubble_css');
    if (bubbleCss) {
      const s = document.createElement('style');
      s.id = 'userBubbleCss';
      s.textContent = JSON.parse(bubbleCss);
      document.head.appendChild(s);
    }
    const fontCss = localStorage.getItem('font_css');
    if (fontCss) {
      const s = document.createElement('style');
      s.id = 'userFontCss';
      s.textContent = JSON.parse(fontCss);
      document.head.appendChild(s);
    }
    const themeCss = localStorage.getItem('theme_css');
    if (themeCss) {
      const s = document.createElement('style');
      s.id = 'userThemeCss';
      s.textContent = JSON.parse(themeCss);
      document.head.appendChild(s);
    }
    const savedThemeColor = localStorage.getItem('theme_color');
    if (savedThemeColor) {
      applyThemeColor(JSON.parse(savedThemeColor));
    }
  });

  // 兼容：如果菜单点“设置”打开设置面板，得先渲染主菜单
  window.addEventListener('load', () => {
    const menuSettings = document.getElementById('menuSettings');
    if (menuSettings) {
      // 菜单逻辑在 index.html 里，这里只保证设置面板打开时能显示主菜单
      const observer = new MutationObserver(() => {
        if (!settingsModal.classList.contains('hidden')) {
          if (!settingsBody.innerHTML.trim()) renderMain();
        }
      });
      observer.observe(settingsModal, { attributes: true, attributeFilter: ['class'] });
    }
  });

})();
