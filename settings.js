/* ★★★ settings.js 第 1 段 开始 ★★★ */
(function() {
  // ==========================================
  // 1. 注入全局自定义样式（气泡小角、浅灰白配色）
  // ==========================================
  const styleInject = document.createElement('style');
  styleInject.textContent = `
    /* 我的气泡：浅灰色 */
    .msg-row.me .bubble, .msg-row.me .voice-bubble {
      background-color: #e8e8e8 !important;
      color: #111 !important;
      border-radius: 10px;
      position: relative;
    }
    /* 对方气泡：纯白色 */
    .msg-row.ta .bubble, .msg-row.ta .voice-bubble {
      background-color: #ffffff !important;
      color: #111 !important;
      border-radius: 10px;
      position: relative;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    
    /* 我的气泡小角（指向右侧头像） */
    .msg-row.me .bubble::after, .msg-row.me .voice-bubble::after {
      content: "";
      position: absolute;
      right: -8px;
      top: 14px;
      width: 0; height: 0;
      border-top: 6px solid transparent;
      border-bottom: 6px solid transparent;
      border-left: 8px solid #e8e8e8;
    }

    /* 对方气泡小角（指向左侧头像） */
    .msg-row.ta .bubble::after, .msg-row.ta .voice-bubble::after {
      content: "";
      position: absolute;
      left: -8px;
      top: 14px;
      width: 0; height: 0;
      border-top: 6px solid transparent;
      border-bottom: 6px solid transparent;
      border-right: 8px solid #ffffff;
    }

    /* 隐藏已经作废的“允许搞怪”设置项（双保险） */
    #prankAutoOn { display: none !important; }
  `;
  document.head.appendChild(styleInject);

  const settingsModal = document.getElementById('settingsModal');
  const settingsBody = document.querySelector('#settingsModal .modal-body');
  const closeBtn = document.getElementById('closeSettingsBtn');

  function load(key, def) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; }
    catch (e) { return def; }
  }
  function save(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.error('保存失败', key, e);
      alert('本地存储已满，请清理一些图片或表情');
    }
  }

  let cfg = {
    taName: load('ta_name', 'TA'),
    myName: load('my_name', '我'),
    taAvatar: load('ta_avatar', ''),
    myAvatar: load('my_avatar', ''),
    textColor: load('text_color', '#111111'),
    bubbleShape: load('bubble_shape', ''),
    fontSize: load('font_size', ''),
    chatBg: load('chat_bg', ''),
    chatBgImage: load('chat_bg_image', ''),
    taAvatarStyle: load('avatar_style_ta', ''),
    myAvatarStyle: load('avatar_style_my', ''),
    themeColor: load('theme_color', '#222222')
  };

  function applyAll() {
    const taNameEl = document.getElementById('taName');
    if (taNameEl && !taNameEl.dataset.typing) taNameEl.textContent = cfg.taName;
    document.querySelectorAll('.bubble').forEach(b => b.style.color = cfg.textColor);
    
    const messagesEl = document.getElementById('messages');
    if (messagesEl) {
      if (cfg.chatBgImage) messagesEl.style.background = `url(${cfg.chatBgImage}) center/cover no-repeat`;
      else if (cfg.chatBg) messagesEl.style.background = cfg.chatBg;
    }
    document.querySelectorAll('.msg-row').forEach(row => {
      const avatar = row.querySelector('.avatar');
      if (!avatar) return;
      const isMe = row.classList.contains('me');
      const img = isMe ? cfg.myAvatar : cfg.taAvatar;
      const style = isMe ? cfg.myAvatarStyle : cfg.taAvatarStyle;
      if (img) { avatar.style.background = `url(${img}) center/cover no-repeat`; avatar.textContent = ''; }
      if (style) {
        let radius = '6px';
        if (style === 'circle') radius = '50%';
        if (style === 'square') radius = '0';
        if (style === 'rounded') radius = '10px';
        avatar.style.borderRadius = radius;
      }
    });
    if (typeof window.applyHomeAssets === 'function') window.applyHomeAssets();
  }

  function applyThemeColor(color) {
    document.documentElement.style.setProperty('--theme-color', color);
    let s = document.getElementById('userThemeColor');
    if (!s) { s = document.createElement('style'); s.id = 'userThemeColor'; document.head.appendChild(s); }
    s.textContent = `
      .btn-primary, .set-btn, .music-input-save, .shop-save-btn, .shop-btn-dark, 
      .survey-header-btn.dark, .mail-send-btn, .moment-fab, .shop-fab, .mail-fab, .call-hangup { 
        background: ${color} !important; 
        border-color: ${color} !important;
      } 
      .moment-top-icons button.active { 
        background: ${color} !important; 
        border-color: ${color} !important;
      }
      input[type="range"]::-webkit-slider-thumb { background: ${color} !important; }
    `;
  }

  function renderMain() {
    settingsBody.innerHTML = `
      <div class="settings-tabs">
        <div class="settings-tab active" data-tab="chat">聊天</div>
        <div class="settings-tab" data-tab="appearance">外观</div>
        <div class="settings-tab" data-tab="feature">功能</div>
        <div class="settings-tab" data-tab="sound">音效</div>
        <div class="settings-tab" data-tab="other">其他</div>
      </div>
      <div style="padding:14px 16px;" id="settingsPanel"></div>
    `;
    document.querySelectorAll('.settings-tab').forEach(t => {
      t.onclick = () => {
        document.querySelectorAll('.settings-tab').forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        renderTab(t.dataset.tab);
      };
    });
    renderTab('chat');
  }

  function renderTab(tab) {
    const panel = document.getElementById('settingsPanel');
    if (tab === 'chat') return renderChatTab(panel);
    if (tab === 'appearance') return renderAppearanceTab(panel);
    if (tab === 'feature') return renderFeatureTab(panel);
    if (tab === 'sound') return renderSoundTab(panel);
    if (tab === 'other') return renderOtherTab(panel);
  }

  // 注意：这段代码最后要保留 (function() { ... 的闭合，请等待第 2 段发完后再统一闭合！
/* ★★★ settings.js 第 1 段 结束 ★★★ *//* ★★★ settings.js 第 2 段 开始 ★★★ */
  function renderChatTab(panel) {
    const replyMin = load('reply_min', 1), replyMax = load('reply_max', 2);
    const delayMin = load('delay_min', 5), delayMax = load('delay_max', 15);
    const quoteProb = load('quote_prob', 30);
    const readReceipt = load('read_receipt', true), readStyle = load('read_style', 'icon'), readNoReply = load('read_no_reply', false);
    
    const transPool = load('trans_pool', [5.20, 13.14, 52.00, 99.99]);

    panel.innerHTML = `
      <div class="set-card">
        <div class="set-card-title">消息交互</div>
        <div class="set-row"><span class="label">引用回复概率</span><input type="number" id="quoteProbInput" value="${quoteProb}" min="0" max="100"><span style="color:#999;font-size:13px;">%</span></div>
        <div class="set-row"><span class="label">已读回执</span><input type="checkbox" id="readReceiptInput" ${readReceipt ? 'checked' : ''}></div>
        <div class="set-row"><span class="label">已读样式</span><div class="radio-group"><label><input type="radio" name="readStyle" value="icon" ${readStyle === 'icon' ? 'checked' : ''}>图形</label><label><input type="radio" name="readStyle" value="text" ${readStyle === 'text' ? 'checked' : ''}>文字</label></div></div>
        <div class="set-row"><span class="label">已读不回</span><input type="checkbox" id="readNoReplyInput" ${readNoReply ? 'checked' : ''}></div>
      </div>
      <div class="set-card">
        <div class="set-card-title">回复速度 (秒)</div>
        <div class="set-row" style="flex-direction:column; align-items:flex-start;">
          <span class="label" style="margin-bottom:8px;">最短等待</span>
          <input type="range" id="delayMinInput" min="0" max="60" value="${delayMin}" oninput="this.nextElementSibling.innerText=this.value+'s'">
          <span style="align-self:flex-end;font-size:12px;color:var(--theme-color);">${delayMin}s</span>
        </div>
        <div class="set-row" style="flex-direction:column; align-items:flex-start; border-bottom:none;">
          <span class="label" style="margin-bottom:8px;">最长等待</span>
          <input type="range" id="delayMaxInput" min="0" max="120" value="${delayMax}" oninput="this.nextElementSibling.innerText=this.value+'s'">
          <span style="align-self:flex-end;font-size:12px;color:var(--theme-color);">${delayMax}s</span>
        </div>
      </div>
      <button class="set-btn" id="saveChatSettings">保存聊天设置</button>
      <div class="set-card">
        <div class="set-card-title">清空数据</div>
        <div class="set-row" id="clearMessages" style="cursor:pointer;color:#e74c3c;">清空聊天记录</div>
        <div class="set-row" id="clearCards" style="cursor:pointer;color:#e74c3c;">清空所有字卡</div>
      </div>
    `;

    panel.querySelector('#saveChatSettings').onclick = () => {
      const g = id => parseInt(document.getElementById(id).value) || 0;
      save('delay_min', g('delayMinInput'));
      save('delay_max', g('delayMaxInput'));
      save('quote_prob', g('quoteProbInput'));
      save('read_receipt', document.getElementById('readReceiptInput').checked);
      save('read_no_reply', document.getElementById('readNoReplyInput').checked);
      const rs = document.querySelector('input[name="readStyle"]:checked');
      save('read_style', rs ? rs.value : 'icon');
      alert('已保存');
      if (typeof scheduleAutoMessage === 'function') scheduleAutoMessage();
    };
    panel.querySelector('#clearMessages').onclick = () => {
      if (confirm('确定清空聊天记录吗？')) { localStorage.removeItem('our_messages'); alert('已清空，刷新页面生效'); }
    };
    panel.querySelector('#clearCards').onclick = () => {
      if (confirm('确定清空所有字卡吗？')) { localStorage.removeItem('our_cards'); alert('已清空，刷新页面生效'); }
    };
  }

  /* ===== 音效 Tab 完整版（恢复你原来的） ===== */
  function renderSoundTab(panel) {
    const SOUND_PRESETS = {
      drop: '内置：清脆水滴',
      bell: '内置：柔和风铃',
      ding: '内置：轻快叮咚',
      wood: '内置：温柔木鱼'
    };
    const SOUND_CATEGORIES = [
      { key: 'send', label: '发消息' },
      { key: 'receive', label: '收消息' },
      { key: 'poke', label: '拍一拍' },
      { key: 'system', label: '系统提示' }
    ];
    function getCustomSounds() { return load('custom_sounds', []); }
    function saveCustomSounds(list) { save('custom_sounds', list); }
    function getPreset(cat) { return load('sound_preset_' + cat, 'drop'); }
    function esc(s) {
      return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    const soundOn = load('sound_enabled', true);
    const soundVol = load('sound_volume', 15);
    const customs = getCustomSounds();

    let categoriesHTML = '';
    SOUND_CATEGORIES.forEach(cat => {
      const cur = getPreset(cat.key);
      let opts = '';
      Object.keys(SOUND_PRESETS).forEach(k => {
        opts += '<option value="' + k + '"' + (cur === k ? ' selected' : '') + '>' + SOUND_PRESETS[k] + '</option>';
      });
      customs.forEach(c => {
        const v = 'custom_' + c.id;
        opts += '<option value="' + esc(v) + '"' + (cur === v ? ' selected' : '') + '>自定义：' + esc(c.name) + '</option>';
      });
      categoriesHTML +=
        '<div class="set-row" style="flex-direction:column; align-items:flex-start; gap:8px;">'
        + '<span class="label">' + cat.label + '</span>'
        + '<div style="display:flex; width:100%; gap:8px; align-items:center;">'
        +   '<select class="sound-preset-select" data-cat="' + cat.key + '" style="flex:1; padding:10px 12px; border:1px solid #eee; border-radius:10px; font-size:14px; background:#fafafa; color:#333; outline:none;">' + opts + '</select>'
        +   '<button class="btn-secondary sound-test-btn" data-cat="' + cat.key + '" style="width:auto; padding:10px 14px; flex-shrink:0;">▶ 试听</button>'
        + '</div>'
        + '</div>';
    });

    let customListHTML = '';
    if (customs.length === 0) {
      customListHTML = '<div style="font-size:13px;color:#999;padding:8px 0;">还没有自定义音效</div>';
    } else {
      customs.forEach(c => {
        customListHTML +=
          '<div class="card-item" style="padding:10px 12px;">'
          + '<div style="flex:1; font-size:14px; color:#333; word-break:break-all;">' + esc(c.name) + '</div>'
          + '<button class="sound-custom-play" data-id="' + esc(c.id) + '" style="background:none;border:none;color:#333;font-size:14px;cursor:pointer;padding:4px 8px;">▶</button>'
          + '<button class="sound-custom-del" data-id="' + esc(c.id) + '" style="background:none;border:none;color:#e74c3c;font-size:18px;cursor:pointer;padding:0 4px;">×</button>'
          + '</div>';
      });
    }

    panel.innerHTML =
      '<div class="set-card">'
      +   '<div class="set-card-title">音效总开关</div>'
      +   '<div class="set-row"><span class="label">开启全局音效</span><input type="checkbox" id="soundEnabledInput"' + (soundOn ? ' checked' : '') + '></div>'
      +   '<div class="set-row" style="flex-direction:column; align-items:flex-start; border-bottom:none;">'
      +     '<span class="label" style="margin-bottom:8px;">全局音量</span>'
      +     '<input type="range" id="soundVolInput" min="0" max="100" value="' + soundVol + '">'
      +     '<span id="soundVolVal" style="align-self:flex-end;font-size:12px;color:var(--theme-color);">' + soundVol + '%</span>'
      +   '</div>'
      + '</div>'
      + '<div class="set-card">'
      +   '<div class="set-card-title">分类音效预设</div>'
      +   categoriesHTML
      + '</div>'
      + '<div class="set-card">'
      +   '<div class="set-card-title">自定义音效</div>'
      +   '<div style="margin-bottom:10px;">'
      +     '<button class="btn-secondary" id="soundCustomUploadBtn" style="width:100%;">+ 上传自定义音效（mp3/wav）</button>'
      +     '<input type="file" id="soundCustomUpload" accept="audio/*" multiple style="display:none;">'
      +   '</div>'
      +   '<div id="soundCustomList">' + customListHTML + '</div>'
      + '</div>'
      + '<button class="set-btn" id="saveFullSoundSettings">保存音效设置</button>';

    const volInput = document.getElementById('soundVolInput');
    const volVal = document.getElementById('soundVolVal');
    if (volInput) {
      volInput.oninput = () => { if (volVal) volVal.textContent = volInput.value + '%'; };
      volInput.onchange = () => { if (window.playSound) window.playSound('send'); };
    }

    panel.querySelectorAll('.sound-preset-select').forEach(sel => {
      sel.onchange = () => {
        save('sound_preset_' + sel.dataset.cat, sel.value);
        if (window.playSound) window.playSound(sel.dataset.cat);
      };
    });

    panel.querySelectorAll('.sound-test-btn').forEach(btn => {
      btn.onclick = () => {
        if (window.playSound) window.playSound(btn.dataset.cat);
        const old = btn.textContent;
        btn.textContent = '▶ 已播放';
        setTimeout(() => { btn.textContent = old; }, 900);
      };
    });

    panel.querySelectorAll('.sound-custom-play').forEach(btn => {
      btn.onclick = () => {
        if (!window.playSound) return;
        const saved = getPreset('send');
        save('sound_preset_send', 'custom_' + btn.dataset.id);
        window.playSound('send');
        save('sound_preset_send', saved);
      };
    });

    panel.querySelectorAll('.sound-custom-del').forEach(btn => {
      btn.onclick = async () => {
        if (!confirm('删除这个自定义音效？')) return;
        const id = btn.dataset.id;
        try { if (window.idbDelete) await window.idbDelete('voices', id); } catch (e) {}
        const list = getCustomSounds().filter(c => c.id !== id);
        saveCustomSounds(list);
        SOUND_CATEGORIES.forEach(cat => {
          if (getPreset(cat.key) === 'custom_' + id) save('sound_preset_' + cat.key, 'drop');
        });
        renderSoundTab(panel);
      };
    });

    const uploadBtn = document.getElementById('soundCustomUploadBtn');
    const uploadInput = document.getElementById('soundCustomUpload');
    if (uploadBtn && uploadInput) {
      uploadBtn.onclick = () => uploadInput.click();
      uploadInput.onchange = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        uploadInput.value = '';
        for (const f of files) {
          if (f.size > 5 * 1024 * 1024) { alert(f.name + ' 超过5MB，已跳过'); continue; }
          try {
            const buf = await f.arrayBuffer();
            const blob = new Blob([buf], { type: f.type || 'audio/mpeg' });
            const id = 'cs_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
            if (window.idbPut) await window.idbPut('voices', { id, name: f.name, blob, duration: '' });
            const list = getCustomSounds();
            list.push({ id, name: f.name });
            saveCustomSounds(list);
          } catch (err) {
            alert(f.name + ' 读取失败：' + err.message);
          }
        }
        renderSoundTab(panel);
      };
    }

    const saveBtn = document.getElementById('saveFullSoundSettings');
    if (saveBtn) saveBtn.onclick = () => {
      const en = document.getElementById('soundEnabledInput');
      const vol = document.getElementById('soundVolInput');
      save('sound_enabled', en ? en.checked : true);
      save('sound_volume', vol ? parseInt(vol.value, 10) : 15);
      alert('音效设置已保存');
      if (window.playSound) window.playSound('send');
    };
  }
/* ★★★ settings.js 第 2 段 结束 ★★★ *//* ★★★ settings.js 第 3 段 开始 ★★★ */
  function renderAppearanceTab(panel) {
    panel.innerHTML = `
      <div class="set-card">
        <div class="set-card-title">首页壁纸</div>
        <div class="wallpaper-row" style="padding:6px 2px;">
          <div class="wallpaper-dot" data-wp="#f5f5f5" style="background:#f5f5f5"></div>
          <div class="wallpaper-dot" data-wp="linear-gradient(180deg,#ffe8ec 0%,#f8d7e3 100%)" style="background:linear-gradient(180deg,#ffe8ec,#f8d7e3)"></div>
          <div class="wallpaper-dot" data-wp="linear-gradient(180deg,#e8f0ff 0%,#d7e4f8 100%)" style="background:linear-gradient(180deg,#e8f0ff,#d7e4f8)"></div>
          <div class="wallpaper-dot" data-wp="linear-gradient(180deg,#e8fff2 0%,#c8f0dc 100%)" style="background:linear-gradient(180deg,#e8fff2,#c8f0dc)"></div>
          <div class="wallpaper-dot" data-wp="linear-gradient(180deg,#f3e8ff 0%,#e0d0f5 100%)" style="background:linear-gradient(180deg,#f3e8ff,#e0d0f5)"></div>
          <div class="wallpaper-dot" data-wp="linear-gradient(180deg,#fff4e0 0%,#f5e0c5 100%)" style="background:linear-gradient(180deg,#fff4e0,#f5e0c5)"></div>
        </div>
        <button class="btn-secondary" id="pickWallpaperBtn" style="margin:8px 0;">从相册选首页壁纸</button>
        <input type="file" id="wallpaperUpload" accept="image/*" style="display:none;">
      </div>
      <div class="set-card">
        <div class="set-card-title">聊天背景</div>
        <div class="color-row" style="padding:6px 2px;">
          <div class="color-dot" style="background:#f5f5f5" data-bg="#f5f5f5"></div>
          <div class="color-dot" style="background:#fdf6f0" data-bg="#fdf6f0"></div>
          <div class="color-dot" style="background:#f0f4f8" data-bg="#f0f4f8"></div>
          <div class="color-dot" style="background:#f7f0f5" data-bg="#f7f0f5"></div>
          <div class="color-dot" style="background:#eef4ee" data-bg="#eef4ee"></div>
        </div>
        <button class="btn-secondary" id="pickBgBtn" style="margin:8px 0;">从相册选背景图</button>
        <input type="file" id="bgUpload" accept="image/*" style="display:none;">
      </div>
      <div class="set-card">
        <div class="set-card-title">气泡形状</div>
        <div class="opt-grid" style="padding:6px 2px;">
          <div class="opt-card" data-bubble="sharp">标准尖角</div>
          <div class="opt-card" data-bubble="round">圆角</div>
          <div class="opt-card" data-bubble="pill">大圆角胶囊</div>
          <div class="opt-card" data-bubble="square">方形直角</div>
        </div>
      </div>
      <div class="set-card">
        <div class="set-card-title">字体大小</div>
        <div class="opt-grid" style="padding:6px 2px;">
          <div class="opt-card" data-font="14">小</div>
          <div class="opt-card" data-font="15">中</div>
          <div class="opt-card" data-font="17">大</div>
        </div>
      </div>
      <div class="set-card">
        <div class="set-card-title">主题颜色</div>
        <div style="padding:6px 2px;"><input type="color" class="color-slider" id="textColorPicker" value="${cfg.themeColor}"></div>
        <button class="btn-primary" id="applyTextColor" style="margin:8px 0;">应用颜色</button>
      </div>
      <div class="set-card">
        <div class="set-card-title">头像 & 昵称</div>
        <div class="avatar-row" id="taAvatarRow">
          <div class="avatar-preview" id="taAvatarPreview" style="${cfg.taAvatar ? `background-image:url(${cfg.taAvatar})` : ''}"></div>
          <span class="label">TA 的头像（点击更换）</span>
        </div>
        <div class="avatar-row" id="myAvatarRow">
          <div class="avatar-preview" id="myAvatarPreview" style="${cfg.myAvatar ? `background-image:url(${cfg.myAvatar})` : ''}"></div>
          <span class="label">我的头像（点击更换）</span>
        </div>
        <input type="file" id="avatarUpload" accept="image/*" style="display:none;">
        <div class="input-row"><span class="label">TA 的昵称</span><input type="text" id="taNameInput" value="${cfg.taName}"></div>
        <div class="input-row"><span class="label">我的昵称</span><input type="text" id="myNameInput" value="${cfg.myName}"></div>
        <button class="btn-primary" id="saveNames" style="margin:8px 0;">保存昵称</button>
      </div>
      <div class="set-card">
        <div class="set-card-title">头像样式</div>
        <div class="opt-grid" style="padding:6px 2px;">
          <div class="opt-card ${cfg.myAvatarStyle === 'circle' ? 'active' : ''}" data-avatar="circle">圆形</div>
          <div class="opt-card ${cfg.myAvatarStyle === 'square' ? 'active' : ''}" data-avatar="square">方形</div>
          <div class="opt-card ${cfg.myAvatarStyle === 'rounded' ? 'active' : ''}" data-avatar="rounded">圆角方形</div>
        </div>
      </div>
      <div class="set-card">
        <div class="set-card-title">高级 CSS</div>
        <textarea class="css-area" id="bubbleCssInput" placeholder=".bubble { ... }">${load('bubble_css', '')}</textarea>
        <button class="btn-primary" id="applyBubbleCss" style="margin:4px 0 12px;">应用气泡 CSS</button>
        <textarea class="css-area" id="fontCssInput" placeholder=".bubble { font-family: ...; }">${load('font_css', '')}</textarea>
        <button class="btn-primary" id="applyFontCss" style="margin:4px 0 12px;">应用字体 CSS</button>
        <textarea class="css-area" id="themeCssInput" placeholder="body { ... }">${load('theme_css', '')}</textarea>
        <button class="btn-primary" id="applyThemeCss" style="margin:4px 0;">应用主题 CSS</button>
      </div>
    `;

    panel.querySelectorAll('.wallpaper-dot').forEach(dot => {
      dot.onclick = () => {
        const wp = dot.dataset.wp;
        const homePage = document.getElementById('homePage');
        if (homePage) homePage.style.background = wp;
        save('home_wallpaper', wp);
      };
    });
    const pickWpBtn = panel.querySelector('#pickWallpaperBtn');
    const wpUpload = panel.querySelector('#wallpaperUpload');
    pickWpBtn.onclick = () => wpUpload.click();
    wpUpload.onchange = (e) => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target.result;
        const homePage = document.getElementById('homePage');
        if (homePage) homePage.style.background = `url(${url}) center/cover no-repeat`;
        save('home_wallpaper', url);
      };
      reader.readAsDataURL(file);
      wpUpload.value = '';
    };
    panel.querySelectorAll('.color-dot').forEach(dot => {
      dot.onclick = () => {
        const bg = dot.dataset.bg;
        const messagesEl = document.getElementById('messages');
        if (messagesEl) messagesEl.style.background = bg;
        cfg.chatBg = bg; cfg.chatBgImage = '';
        save('chat_bg', bg); save('chat_bg_image', '');
      };
    });
    const pickBgBtn = panel.querySelector('#pickBgBtn');
    const bgUpload = panel.querySelector('#bgUpload');
    pickBgBtn.onclick = () => bgUpload.click();
    bgUpload.onchange = (e) => {
      const file = e.target.files[0]; if (!file) return;
      if (typeof compressImage === 'function') {
        compressImage(file, 800, (url) => {
          const messagesEl = document.getElementById('messages');
          if (messagesEl) messagesEl.style.background = `url(${url}) center/cover no-repeat`;
          cfg.chatBgImage = url; cfg.chatBg = '';
          save('chat_bg_image', url); save('chat_bg', '');
        });
      }
    };
    panel.querySelectorAll('.opt-card').forEach(card => {
      card.onclick = () => {
        if (card.dataset.bubble) {
          cfg.bubbleShape = card.dataset.bubble;
          save('bubble_shape', card.dataset.bubble);
          applyAll();
          card.parentElement.querySelectorAll('.opt-card').forEach(c => c.classList.remove('active'));
          card.classList.add('active');
        }
        if (card.dataset.font) {
          cfg.fontSize = card.dataset.font;
          save('font_size', card.dataset.font);
          applyAll();
          card.parentElement.querySelectorAll('.opt-card').forEach(c => c.classList.remove('active'));
          card.classList.add('active');
        }
        if (card.dataset.avatar) {
          const style = card.dataset.avatar;
          cfg.taAvatarStyle = style; cfg.myAvatarStyle = style;
          save('avatar_style_ta', style); save('avatar_style_my', style);
          applyAll();
          card.parentElement.querySelectorAll('.opt-card').forEach(c => c.classList.remove('active'));
          card.classList.add('active');
        }
      };
    });
    const picker = panel.querySelector('#textColorPicker');
    panel.querySelector('#applyTextColor').onclick = () => {
      const color = picker.value;
      cfg.textColor = '#111111';
      cfg.themeColor = color;
      save('theme_color', color);
      applyAll(); applyThemeColor(color);
      alert('主题颜色已应用');
    };
    let currentAvatarTarget = null;
    const avatarUpload = panel.querySelector('#avatarUpload');
    panel.querySelector('#taAvatarRow').onclick = () => { currentAvatarTarget = 'ta'; avatarUpload.click(); };
    panel.querySelector('#myAvatarRow').onclick = () => { currentAvatarTarget = 'my'; avatarUpload.click(); };
    avatarUpload.onchange = (e) => {
      const file = e.target.files[0]; if (!file) return;
      if (typeof compressImage === 'function') {
        compressImage(file, 400, (url) => {
          if (currentAvatarTarget === 'ta') {
            cfg.taAvatar = url; save('ta_avatar', url);
            panel.querySelector('#taAvatarPreview').style.backgroundImage = `url(${url})`;
          } else {
            cfg.myAvatar = url; save('my_avatar', url);
            panel.querySelector('#myAvatarPreview').style.backgroundImage = `url(${url})`;
          }
          applyAll();
        });
      }
      avatarUpload.value = '';
    };
    panel.querySelector('#saveNames').onclick = () => {
      const ta = panel.querySelector('#taNameInput').value.trim() || 'TA';
      const my = panel.querySelector('#myNameInput').value.trim() || '我';
      cfg.taName = ta; cfg.myName = my;
      save('ta_name', ta); save('my_name', my);
      applyAll();
      alert('已保存');
    };
    panel.querySelector('#applyBubbleCss').onclick = () => {
      const css = panel.querySelector('#bubbleCssInput').value;
      let el = document.getElementById('userBubbleCss');
      if (!el) { el = document.createElement('style'); el.id = 'userBubbleCss'; document.head.appendChild(el); }
      el.textContent = css;
      save('bubble_css', css);
    };
    panel.querySelector('#applyFontCss').onclick = () => {
      const css = panel.querySelector('#fontCssInput').value;
      let el = document.getElementById('userFontCss');
      if (!el) { el = document.createElement('style'); el.id = 'userFontCss'; document.head.appendChild(el); }
      el.textContent = css;
      save('font_css', css);
    };
    panel.querySelector('#applyThemeCss').onclick = () => {
      const css = panel.querySelector('#themeCssInput').value;
      let el = document.getElementById('userThemeCss');
      if (!el) { el = document.createElement('style'); el.id = 'userThemeCss'; document.head.appendChild(el); }
      el.textContent = css;
      save('theme_css', css);
    };
  }

  function renderFeatureTab(panel) {
    const mailOn = load('mail_auto_on', false);
    const mailMin = load('mail_auto_min', 3);
    const mailMax = load('mail_auto_max', 6);
    const momentOn = load('moment_auto_on', true);
    const questionOn = load('question_auto_on', true);
    const callOn = load('call_auto_on', true);
    
    panel.innerHTML = `
      <div class="set-card">
        <div class="set-card-title">信箱</div>
        <div class="set-row"><span class="label">对方主动写信</span><input type="checkbox" id="mailAutoOn" ${mailOn ? 'checked' : ''}></div>
        <div class="set-row"><span class="label">最短间隔（小时）</span><input type="number" id="mailAutoMin" value="${mailMin}" min="1" max="48"></div>
        <div class="set-row"><span class="label">最长间隔（小时）</span><input type="number" id="mailAutoMax" value="${mailMax}" min="1" max="48"></div>
      </div>
      <div class="set-card">
        <div class="set-card-title">朋友圈互动</div>
        <div class="set-row">
          <span class="label">自动发动态 / 点赞评论</span>
          <input type="checkbox" id="momentAutoOn" ${momentOn ? 'checked' : ''}>
        </div>
      </div>
      <div class="set-card">
        <div class="set-card-title">主动互动</div>
        <div class="set-row">
          <span class="label">允许主动打电话</span>
          <input type="checkbox" id="callAutoOn" ${callOn ? 'checked' : ''}>
        </div>
        <!-- 搞怪已被彻底删掉 -->
        <div class="set-row">
          <span class="label">允许发问卷</span>
          <input type="checkbox" id="questionAutoOn" ${questionOn ? 'checked' : ''}>
        </div>
      </div>
      <button class="set-btn" id="saveFeatureSettings">保存功能设置</button>
      <div class="set-card">
        <div class="set-card-title">收藏 & 搜索</div>
        <div class="set-row" id="openFavBtn" style="cursor:pointer;">打开收藏夹</div>
        <div class="set-row" id="openSearchBtn" style="cursor:pointer;">搜索聊天记录</div>
      </div>
    `;
    
    panel.querySelector('#saveFeatureSettings').onclick = () => {
      save('mail_auto_on', panel.querySelector('#mailAutoOn').checked);
      const mn = parseInt(panel.querySelector('#mailAutoMin').value) || 3;
      const mx = parseInt(panel.querySelector('#mailAutoMax').value) || 6;
      save('mail_auto_min', Math.min(mn, mx));
      save('mail_auto_max', Math.max(mn, mx));
      save('moment_auto_on', panel.querySelector('#momentAutoOn').checked);
      save('call_auto_on', panel.querySelector('#callAutoOn').checked);
      save('question_auto_on', panel.querySelector('#questionAutoOn').checked);
      
      save('moment_trigger_time', 0);
      save('question_trigger_time', 0);
      save('call_trigger_time', 0);
      save('call_trigger_count', 0);
      
      alert('已保存');
      if (typeof scheduleAutoMail === 'function') scheduleAutoMail();
    };
    panel.querySelector('#openFavBtn').onclick = () => {
      document.getElementById('favModal').classList.remove('hidden');
      if (typeof window.renderFavList === 'function') window.renderFavList();
    };
    panel.querySelector('#openSearchBtn').onclick = () => {
      document.getElementById('searchModal').classList.remove('hidden');
    };
  }

  function renderOtherTab(panel) {
    panel.innerHTML = `
      <div class="set-card">
        <div class="set-card-title">备份与导出</div>
        <p style="font-size:13px;color:#999;padding:6px 2px 12px;">只导出主字卡、Emoji、拍一拍、问卷题库。不包含语音和聊天记录。</p>
        <button class="btn-primary" id="exportBtn" style="margin:4px 0;">一键导出字卡库</button>
        <textarea class="css-area" id="backupArea" placeholder="点击上方导出后，内容会显示在这里，请复制保存" style="height:160px;margin-top:10px;"></textarea>
      </div>
      <div class="set-card">
        <div class="set-card-title">关于</div>
        <div class="about-box" style="padding:20px 10px;">
          <div class="title">Echo</div>
          你和 TA 的专属聊天室
          <div class="divider">────────────</div>
          版本 v1.0<br>作者 ttvc7
        </div>
      </div>
    `;
    
    panel.querySelector('#exportBtn').onclick = () => {
      const data = {
        mainCards: JSON.parse(localStorage.getItem('our_cards') || '[]'),
        patToTa: localStorage.getItem('pat_to_ta') || '["{我} 拍了拍 {TA}"]',
        patToMe: localStorage.getItem('pat_to_me') || '["{TA} 拍了拍 {我}"]',
        questionBank: localStorage.getItem('our_question_bank') || '[]'
      };
      const jsonStr = JSON.stringify(data, null, 2);
      panel.querySelector('#backupArea').value = jsonStr;
      alert('已导出纯字卡库，请复制文本框内容');
    };
  }

  function compressImage(file, maxSize, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > h) { if (w > maxSize) { h = h * maxSize / w; w = maxSize; } }
        else { if (h > maxSize) { w = w * maxSize / h; h = maxSize; } }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        callback(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  if (closeBtn) closeBtn.onclick = () => settingsModal.classList.add('hidden');

  window.addEventListener('load', () => {
    applyAll();
    renderMain();

    const savedThemeColor = localStorage.getItem('theme_color');
    if (savedThemeColor) applyThemeColor(JSON.parse(savedThemeColor));
  });

})();
/* ★★★ settings.js 第 3 段 结束 ★★★ */
