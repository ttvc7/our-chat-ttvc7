/* ===== 设置面板（横排 4 Tab） ===== */
(function() {
  const settingsModal = document.getElementById('settingsModal');
  const settingsBody = document.querySelector('#settingsModal .modal-body');
  const closeBtn = document.getElementById('closeSettingsBtn');

  function load(key, def) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; }
    catch (e) { return def; }
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
    document.querySelectorAll('.bubble').forEach(b => b.style.color = cfg.textColor);
    if (cfg.bubbleShape) {
      let radius = '8px';
      if (cfg.bubbleShape === 'round') radius = '18px';
      if (cfg.bubbleShape === 'pill') radius = '24px';
      if (cfg.bubbleShape === 'square') radius = '0';
      document.querySelectorAll('.bubble').forEach(b => b.style.borderRadius = radius);
    }
    if (cfg.fontSize) document.querySelectorAll('.bubble').forEach(b => b.style.fontSize = cfg.fontSize + 'px');
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
    let s = document.getElementById('userThemeColor');
    if (!s) { s = document.createElement('style'); s.id = 'userThemeColor'; document.head.appendChild(s); }
    s.textContent = `.btn-primary { background: ${color} !important; } .set-btn { background: ${color} !important; }`;
  }

  function renderMain() {
    settingsBody.innerHTML = `
      <div class="settings-tabs">
        <div class="settings-tab active" data-tab="chat">聊天</div>
        <div class="settings-tab" data-tab="appearance">外观</div>
        <div class="settings-tab" data-tab="feature">功能</div>
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
    if (tab === 'other') return renderOtherTab(panel);
  }

  /* ===== 聊天 Tab ===== */
  function renderChatTab(panel) {
    const replyMin = load('reply_min', 1), replyMax = load('reply_max', 1);
    const delayMin = load('delay_min', 5), delayMax = load('delay_max', 15);
    const emojiProb = load('emoji_prob', 10), stickerProb = load('sticker_prob', 20);
    const transRecv = load('trans_recv', 60), transRef = load('trans_ref', 30), transIgn = load('trans_ign', 10);
    const autoMsgMin = load('auto_msg_min', 1), autoMsgMax = load('auto_msg_max', 5);
    const autoTransProb = load('auto_trans_prob', 30), autoTransMin = load('auto_trans_min', 5), autoTransMax = load('auto_trans_max', 50);
    const quoteProb = load('quote_prob', 30);
    const giftProb = load('gift_prob', 0), giftMin = load('gift_min', 1), giftMax = load('gift_max', 5);
    const readReceipt = load('read_receipt', true), readStyle = load('read_style', 'icon'), readNoReply = load('read_no_reply', false);
    const voiceProb = load('voice_prob', 0);

    panel.innerHTML = `
      <div class="set-card">
        <div class="set-card-title">消息交互</div>
        <div class="set-row"><span class="label">引用回复</span><input type="number" id="quoteProbInput" value="${quoteProb}" min="0" max="100"><span style="color:#999;font-size:13px;">%</span></div>
        <div class="set-row"><span class="label">已读回执</span><input type="checkbox" id="readReceiptInput" ${readReceipt ? 'checked' : ''}></div>
        <div class="set-row"><span class="label">已读样式</span><div class="radio-group"><label><input type="radio" name="readStyle" value="icon" ${readStyle === 'icon' ? 'checked' : ''}>图形</label><label><input type="radio" name="readStyle" value="text" ${readStyle === 'text' ? 'checked' : ''}>文字</label></div></div>
        <div class="set-row"><span class="label">已读不回</span><input type="checkbox" id="readNoReplyInput" ${readNoReply ? 'checked' : ''}></div>
      </div>
      <div class="set-card">
        <div class="set-card-title">回复条数 & 延迟</div>
        <div class="set-row"><span class="label">最少条数</span><input type="number" id="replyMinInput" value="${replyMin}" min="1" max="10"></div>
        <div class="set-row"><span class="label">最多条数</span><input type="number" id="replyMaxInput" value="${replyMax}" min="1" max="10"></div>
        <div class="set-row"><span class="label">最短延迟（秒）</span><input type="number" id="delayMinInput" value="${delayMin}" min="0" max="300"></div>
        <div class="set-row"><span class="label">最长延迟（秒）</span><input type="number" id="delayMaxInput" value="${delayMax}" min="0" max="300"></div>
      </div>
      <div class="set-card">
        <div class="set-card-title">额外概率</div>
        <div class="set-row"><span class="label">颜文字</span><input type="number" id="emojiProbInput" value="${emojiProb}" min="0" max="100"><span style="color:#999;font-size:13px;">%</span></div>
        <div class="set-row"><span class="label">表情包</span><input type="number" id="stickerProbInput" value="${stickerProb}" min="0" max="100"><span style="color:#999;font-size:13px;">%</span></div>
        <div class="set-row"><span class="label">语音</span><input type="number" id="voiceProbInput" value="${voiceProb}" min="0" max="100"><span style="color:#999;font-size:13px;">%</span></div>
      </div>
      <div class="set-card">
        <div class="set-card-title">转账反应（TA 收到你转账时）</div>
        <div class="set-row"><span class="label">自动收款</span><input type="number" id="transRecvInput" value="${transRecv}" min="0" max="100"><span style="color:#999;font-size:13px;">%</span></div>
        <div class="set-row"><span class="label">自动退还</span><input type="number" id="transRefInput" value="${transRef}" min="0" max="100"><span style="color:#999;font-size:13px;">%</span></div>
        <div class="set-row"><span class="label">不理</span><input type="number" id="transIgnInput" value="${transIgn}" min="0" max="100"><span style="color:#999;font-size:13px;">%</span></div>
      </div>
      <div class="set-card">
        <div class="set-card-title">自动消息（TA 主动）</div>
        <div class="set-row"><span class="label">最短间隔（分钟）</span><input type="number" id="autoMsgMinInput" value="${autoMsgMin}" min="1" max="120"></div>
        <div class="set-row"><span class="label">最长间隔（分钟）</span><input type="number" id="autoMsgMaxInput" value="${autoMsgMax}" min="1" max="120"></div>
        <div class="set-row"><span class="label">TA 转账概率</span><input type="number" id="autoTransProbInput" value="${autoTransProb}" min="0" max="100"><span style="color:#999;font-size:13px;">%</span></div>
        <div class="set-row"><span class="label">转账金额最少</span><input type="number" id="autoTransMinInput" value="${autoTransMin}" min="0"></div>
        <div class="set-row"><span class="label">转账金额最多</span><input type="number" id="autoTransMaxInput" value="${autoTransMax}" min="0"></div>
      </div>
      <div class="set-card">
        <div class="set-card-title">TA 送礼反应</div>
        <div class="set-row"><span class="label">送礼概率</span><input type="number" id="giftProbInput" value="${giftProb}" min="0" max="100"><span style="color:#999;font-size:13px;">%</span></div>
        <div class="set-row"><span class="label">最短间隔（分钟）</span><input type="number" id="giftMinInput" value="${giftMin}" min="1" max="120"></div>
        <div class="set-row"><span class="label">最长间隔（分钟）</span><input type="number" id="giftMaxInput" value="${giftMax}" min="1" max="120"></div>
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
      const rmin = g('replyMinInput'), rmax = g('replyMaxInput');
      save('reply_min', Math.min(rmin, rmax));
      save('reply_max', Math.max(rmin, rmax));
      const dmin = g('delayMinInput'), dmax = g('delayMaxInput');
      save('delay_min', Math.min(dmin, dmax));
      save('delay_max', Math.max(dmin, dmax));
      save('emoji_prob', Math.max(0, Math.min(100, g('emojiProbInput'))));
      save('sticker_prob', Math.max(0, Math.min(100, g('stickerProbInput'))));
      save('voice_prob', Math.max(0, Math.min(100, g('voiceProbInput'))));
      save('quote_prob', Math.max(0, Math.min(100, g('quoteProbInput'))));
      save('trans_recv', Math.max(0, Math.min(100, g('transRecvInput'))));
      save('trans_ref', Math.max(0, Math.min(100, g('transRefInput'))));
      save('trans_ign', Math.max(0, Math.min(100, g('transIgnInput'))));
      const amn = g('autoMsgMinInput'), amx = g('autoMsgMaxInput');
      save('auto_msg_min', Math.min(amn, amx));
      save('auto_msg_max', Math.max(amn, amx));
      save('auto_trans_prob', Math.max(0, Math.min(100, g('autoTransProbInput'))));
      const atm = g('autoTransMinInput'), atM = g('autoTransMaxInput');
      save('auto_trans_min', Math.min(atm, atM));
      save('auto_trans_max', Math.max(atm, atM));
      save('gift_prob', Math.max(0, Math.min(100, g('giftProbInput'))));
      const gmn = g('giftMinInput'), gmx = g('giftMaxInput');
      save('gift_min', Math.min(gmn, gmx));
      save('gift_max', Math.max(gmn, gmx));
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
  /* ===== 外观 Tab ===== */
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
          <div class="wallpaper-dot" data-wp="linear-gradient(180deg,#fff4e0 0%,#f5e0c8 100%)" style="background:linear-gradient(180deg,#fff4e0,#f5e0c5)"></div>
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
        <div style="padding:6px 2px;"><input type="color" class="color-slider" id="textColorPicker" value="${cfg.textColor}"></div>
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
        messagesEl.style.background = bg;
        cfg.chatBg = bg; cfg.chatBgImage = '';
        save('chat_bg', bg); save('chat_bg_image', '');
      };
    });
    const pickBgBtn = panel.querySelector('#pickBgBtn');
    const bgUpload = panel.querySelector('#bgUpload');
    pickBgBtn.onclick = () => bgUpload.click();
    bgUpload.onchange = (e) => {
      const file = e.target.files[0]; if (!file) return;
      compressImage(file, 800, (url) => {
        document.getElementById('messages').style.background = `url(${url}) center/cover no-repeat`;
        cfg.chatBgImage = url; cfg.chatBg = '';
        save('chat_bg_image', url); save('chat_bg', '');
      });
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
      cfg.textColor = color; cfg.themeColor = color;
      save('text_color', color); save('theme_color', color);
      applyAll(); applyThemeColor(color);
    };
    let currentAvatarTarget = null;
    const avatarUpload = panel.querySelector('#avatarUpload');
    panel.querySelector('#taAvatarRow').onclick = () => { currentAvatarTarget = 'ta'; avatarUpload.click(); };
    panel.querySelector('#myAvatarRow').onclick = () => { currentAvatarTarget = 'my'; avatarUpload.click(); };
    avatarUpload.onchange = (e) => {
      const file = e.target.files[0]; if (!file) return;
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

  /* ===== 功能 Tab ===== */
  function renderFeatureTab(panel) {
    const mailOn = load('mail_auto_on', false);
    const mailMin = load('mail_auto_min', 3);
    const mailMax = load('mail_auto_max', 6);
    panel.innerHTML = `
      <div class="set-card">
        <div class="set-card-title">信箱</div>
        <div class="set-row"><span class="label">对方主动写信</span><input type="checkbox" id="mailAutoOn" ${mailOn ? 'checked' : ''}></div>
        <div class="set-row"><span class="label">最短间隔（小时）</span><input type="number" id="mailAutoMin" value="${mailMin}" min="1" max="48"></div>
        <div class="set-row"><span class="label">最长间隔（小时）</span><input type="number" id="mailAutoMax" value="${mailMax}" min="1" max="48"></div>
      </div>
      <button class="set-btn" id="saveFeatureSettings">保存</button>
      <div class="set-card">
        <div class="set-card-title">收藏 & 搜索</div>
        <div class="set-row" id="openFavBtn" style="cursor:pointer;">打开收藏夹</div>
        <div class="set-row" id="openSearchBtn" style="cursor:pointer;">搜索聊天记录</div>
      </div>
      <div class="set-card">
        <div class="set-card-title">音乐 / 陪伴</div>
        <div class="set-row"><span class="label">音乐</span><span class="value">开发中</span></div>
        <div class="set-row"><span class="label">陪伴</span><span class="value">开发中</span></div>
      </div>
    `;
    panel.querySelector('#saveFeatureSettings').onclick = () => {
      save('mail_auto_on', panel.querySelector('#mailAutoOn').checked);
      const mn = parseInt(panel.querySelector('#mailAutoMin').value) || 3;
      const mx = parseInt(panel.querySelector('#mailAutoMax').value) || 6;
      save('mail_auto_min', Math.min(mn, mx));
      save('mail_auto_max', Math.max(mn, mx));
      alert('已保存');
    };
    panel.querySelector('#openFavBtn').onclick = () => {
      document.getElementById('favModal').classList.remove('hidden');
      if (typeof window.renderFavList === 'function') window.renderFavList();
    };
    panel.querySelector('#openSearchBtn').onclick = () => {
      document.getElementById('searchModal').classList.remove('hidden');
    };
  }

  /* ===== 其他 Tab ===== */
  function renderOtherTab(panel) {
    panel.innerHTML = `
      <div class="set-card">
        <div class="set-card-title">备份</div>
        <p style="font-size:13px;color:#999;padding:6px 2px 12px;">导出后请把文字存到备忘录。</p>
        <button class="btn-primary" id="exportBtn" style="margin:4px 0;">导出备份</button>
        <button class="btn-secondary" id="importBtn" style="margin:4px 0;">导入备份</button>
        <textarea class="css-area" id="backupArea" placeholder="备份内容会显示在这里" style="height:160px;margin-top:10px;"></textarea>
      </div>
      <div class="set-card">
        <div class="set-card-title">关于</div>
        <div class="about-box" style="padding:20px 10px;">
          <div class="title">Echo</div>
          你和 TA 的专属聊天室
          <div class="divider">────────────</div>
          版本  v1.0<br>作者  ttvc7<br>始于  2026 年 9 月 24 日
        </div>
      </div>
    `;
    panel.querySelector('#exportBtn').onclick = () => {
      const data = {
        messages: JSON.parse(localStorage.getItem('our_messages') || '[]'),
        cards: JSON.parse(localStorage.getItem('our_cards') || '[]'),
        mails: JSON.parse(localStorage.getItem('our_mails') || '[]'),
        surveys: JSON.parse(localStorage.getItem('our_surveys') || '[]'),
        voices: JSON.parse(localStorage.getItem('our_voices') || '[]'),
        taName: cfg.taName, myName: cfg.myName
      };
      let text = '=== ttvc7 备份 ===\n';
      text += 'TA昵称：' + data.taName + '\n我的昵称：' + data.myName + '\n\n';
      text += '=== 字卡 ===\n';
      data.cards.forEach(c => text += (c.content || c) + '\n');
      text += '\n=== 聊天记录 ===\n';
      data.messages.forEach(m => {
        text += (m.sender === 'me' ? data.myName : data.taName) + '：' + (m.content || m.title || m.text || '') + '\n';
      });
      text += '\n=== 原始数据（勿改） ===\n';
      text += JSON.stringify(data);
      panel.querySelector('#backupArea').value = text;
      alert('已生成，请复制保存');
    };
    panel.querySelector('#importBtn').onclick = () => {
      const text = panel.querySelector('#backupArea').value;
      const match = text.match(/=== 原始数据（勿改） ===\s*(\{[\s\S]*\})/);
      if (!match) { alert('备份格式不对'); return; }
      try {
        const data = JSON.parse(match[1]);
        if (data.messages) localStorage.setItem('our_messages', JSON.stringify(data.messages));
        if (data.cards) localStorage.setItem('our_cards', JSON.stringify(data.cards));
        if (data.mails) localStorage.setItem('our_mails', JSON.stringify(data.mails));
        if (data.surveys) localStorage.setItem('our_surveys', JSON.stringify(data.surveys));
        if (data.voices) localStorage.setItem('our_voices', JSON.stringify(data.voices));
        if (data.taName) localStorage.setItem('ta_name', JSON.stringify(data.taName));
        if (data.myName) localStorage.setItem('my_name', JSON.stringify(data.myName));
        alert('导入成功，刷新页面生效');
      } catch (e) { alert('导入失败：' + e.message); }
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
    const bubbleCss = localStorage.getItem('bubble_css');
    if (bubbleCss) { const s = document.createElement('style'); s.id = 'userBubbleCss'; s.textContent = JSON.parse(bubbleCss); document.head.appendChild(s); }
    const fontCss = localStorage.getItem('font_css');
    if (fontCss) { const s = document.createElement('style'); s.id = 'userFontCss'; s.textContent = JSON.parse(fontCss); document.head.appendChild(s); }
    const themeCss = localStorage.getItem('theme_css');
    if (themeCss) { const s = document.createElement('style'); s.id = 'userThemeCss'; s.textContent = JSON.parse(themeCss); document.head.appendChild(s); }
    const savedThemeColor = localStorage.getItem('theme_color');
    if (savedThemeColor) applyThemeColor(JSON.parse(savedThemeColor));
  });

})();
