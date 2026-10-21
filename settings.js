/* ★★★ settings.js 完全重写修复版 开始 ★★★ */
(function() {
  const settingsModal = document.getElementById('settingsModal');
  const settingsBody = document.querySelector('#settingsModal .modal-body');
  const closeBtn = document.getElementById('closeSettingsBtn');

  function load(key, def) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch (e) { return def; } }
  function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }

  let cfg = {
    taName: load('ta_name', 'TA'), myName: load('my_name', '我'),
    taAvatar: load('ta_avatar', ''), myAvatar: load('my_avatar', ''),
    textColor: load('text_color', '#111111'), bubbleShape: load('bubble_shape', ''),
    fontSize: load('font_size', ''), chatBg: load('chat_bg', ''), chatBgImage: load('chat_bg_image', ''),
    taAvatarStyle: load('avatar_style_ta', ''), myAvatarStyle: load('avatar_style_my', ''), themeColor: load('theme_color', '')
  };

  function applyAll() {
    const taNameEl = document.getElementById('taName');
    if (taNameEl && !taNameEl.dataset.typing) taNameEl.textContent = cfg.taName;
    document.querySelectorAll('.bubble').forEach(b => b.style.color = cfg.textColor);
    if (cfg.bubbleShape) {
      let radius = '8px'; if (cfg.bubbleShape === 'round') radius = '18px'; if (cfg.bubbleShape === 'pill') radius = '24px'; if (cfg.bubbleShape === 'square') radius = '0';
      document.querySelectorAll('.bubble').forEach(b => b.style.borderRadius = radius);
    }
    if (cfg.fontSize) document.querySelectorAll('.bubble').forEach(b => b.style.fontSize = cfg.fontSize + 'px');
    const messagesEl = document.getElementById('messages');
    if (messagesEl) { if (cfg.chatBgImage) messagesEl.style.background = `url(${cfg.chatBgImage}) center/cover no-repeat`; else if (cfg.chatBg) messagesEl.style.background = cfg.chatBg; }
    document.querySelectorAll('.msg-row').forEach(row => {
      const avatar = row.querySelector('.avatar'); if (!avatar) return;
      const isMe = row.classList.contains('me'); const img = isMe ? cfg.myAvatar : cfg.taAvatar; const style = isMe ? cfg.myAvatarStyle : cfg.taAvatarStyle;
      if (img) { avatar.style.background = `url(${img}) center/cover no-repeat`; avatar.textContent = ''; }
      if (style) { let radius = '6px'; if (style === 'circle') radius = '50%'; if (style === 'square') radius = '0'; if (style === 'rounded') radius = '10px'; avatar.style.borderRadius = radius; }
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
      t.onclick = () => { document.querySelectorAll('.settings-tab').forEach(x => x.classList.remove('active')); t.classList.add('active'); renderTab(t.dataset.tab); };
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

  function renderChatTab(panel) {
    const replyMin = load('reply_min', 1), replyMax = load('reply_max', 1), delayMin = load('delay_min', 5), delayMax = load('delay_max', 15);
    const emojiProb = load('emoji_prob', 10), stickerProb = load('sticker_prob', 20), transRecv = load('trans_recv', 60), transRef = load('trans_ref', 30), transIgn = load('trans_ign', 10);
    const autoMsgMin = load('auto_msg_min', 1), autoMsgMax = load('auto_msg_max', 5), autoTransProb = load('auto_trans_prob', 30), autoTransMin = load('auto_trans_min', 5), autoTransMax = load('auto_trans_max', 50);
    const quoteProb = load('quote_prob', 30), giftProb = load('gift_prob', 0), giftMin = load('gift_min', 1), giftMax = load('gift_max', 5);
    const readReceipt = load('read_receipt', true), readStyle = load('read_style', 'icon'), readNoReply = load('read_no_reply', false), voiceProb = load('voice_prob', 0);

    panel.innerHTML = `
      <div class="set-card">
        <div class="set-card-title">消息交互</div>
        <div class="set-row"><span class="label">引用回复</span><input type="number" id="quoteProbInput" value="${quoteProb}"><span>%</span></div>
        <div class="set-row"><span class="label">已读回执</span><input type="checkbox" id="readReceiptInput" ${readReceipt ? 'checked' : ''}></div>
        <div class="set-row"><span class="label">已读样式</span><div class="radio-group"><label><input type="radio" name="readStyle" value="icon" ${readStyle === 'icon' ? 'checked' : ''}>图形</label><label><input type="radio" name="readStyle" value="text" ${readStyle === 'text' ? 'checked' : ''}>文字</label></div></div>
        <div class="set-row"><span class="label">已读不回</span><input type="checkbox" id="readNoReplyInput" ${readNoReply ? 'checked' : ''}></div>
      </div>
      <div class="set-card">
        <div class="set-card-title">回复条数 & 延迟</div>
        <div class="set-row"><span class="label">最少条数</span><input type="number" id="replyMinInput" value="${replyMin}"></div>
        <div class="set-row"><span class="label">最多条数</span><input type="number" id="replyMaxInput" value="${replyMax}"></div>
        <div class="set-row"><span class="label">最短延迟（秒）</span><input type="number" id="delayMinInput" value="${delayMin}"></div>
        <div class="set-row"><span class="label">最长延迟（秒）</span><input type="number" id="delayMaxInput" value="${delayMax}"></div>
      </div>
      <div class="set-card">
        <div class="set-card-title">额外概率</div>
        <div class="set-row"><span class="label">颜文字</span><input type="number" id="emojiProbInput" value="${emojiProb}"><span>%</span></div>
        <div class="set-row"><span class="label">表情包</span><input type="number" id="stickerProbInput" value="${stickerProb}"><span>%</span></div>
        <div class="set-row"><span class="label">语音</span><input type="number" id="voiceProbInput" value="${voiceProb}"><span>%</span></div>
      </div>
      <div class="set-card">
        <div class="set-card-title">转账反应</div>
        <div class="set-row"><span class="label">自动收款</span><input type="number" id="transRecvInput" value="${transRecv}"><span>%</span></div>
        <div class="set-row"><span class="label">自动退还</span><input type="number" id="transRefInput" value="${transRef}"><span>%</span></div>
        <div class="set-row"><span class="label">不理</span><input type="number" id="transIgnInput" value="${transIgn}"><span>%</span></div>
      </div>
      <div class="set-card">
        <div class="set-card-title">自动消息</div>
        <div class="set-row"><span class="label">最短间隔（分钟）</span><input type="number" id="autoMsgMinInput" value="${autoMsgMin}"></div>
        <div class="set-row"><span class="label">最长间隔（分钟）</span><input type="number" id="autoMsgMaxInput" value="${autoMsgMax}"></div>
        <div class="set-row"><span class="label">转账概率</span><input type="number" id="autoTransProbInput" value="${autoTransProb}"><span>%</span></div>
        <div class="set-row"><span class="label">转账金额最少</span><input type="number" id="autoTransMinInput" value="${autoTransMin}"></div>
        <div class="set-row"><span class="label">转账金额最多</span><input type="number" id="autoTransMaxInput" value="${autoTransMax}"></div>
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
      save('reply_min', Math.min(g('replyMinInput'), g('replyMaxInput'))); save('reply_max', Math.max(g('replyMinInput'), g('replyMaxInput')));
      save('delay_min', Math.min(g('delayMinInput'), g('delayMaxInput'))); save('delay_max', Math.max(g('delayMinInput'), g('delayMaxInput')));
      save('emoji_prob', g('emojiProbInput')); save('sticker_prob', g('stickerProbInput')); save('voice_prob', g('voiceProbInput')); save('quote_prob', g('quoteProbInput'));
      save('trans_recv', g('transRecvInput')); save('trans_ref', g('transRefInput')); save('trans_ign', g('transIgnInput'));
      save('auto_msg_min', Math.min(g('autoMsgMinInput'), g('autoMsgMaxInput'))); save('auto_msg_max', Math.max(g('autoMsgMinInput'), g('autoMsgMaxInput')));
      save('auto_trans_prob', g('autoTransProbInput')); save('auto_trans_min', Math.min(g('autoTransMinInput'), g('autoTransMaxInput'))); save('auto_trans_max', Math.max(g('autoTransMinInput'), g('autoTransMaxInput')));
      save('read_receipt', document.getElementById('readReceiptInput').checked); save('read_no_reply', document.getElementById('readNoReplyInput').checked);
      const rs = document.querySelector('input[name="readStyle"]:checked'); save('read_style', rs ? rs.value : 'icon');
      alert('已保存'); if (typeof scheduleAutoMessage === 'function') scheduleAutoMessage();
    };
    panel.querySelector('#clearMessages').onclick = () => { if (confirm('确定清空？')) { localStorage.removeItem('our_messages'); alert('已清空'); } };
    panel.querySelector('#clearCards').onclick = () => { if (confirm('确定清空？')) { localStorage.removeItem('our_cards'); alert('已清空'); } };
  }

  function renderAppearanceTab(panel) {
    panel.innerHTML = `
      <div class="set-card">
        <div class="set-card-title">主题颜色</div>
        <div style="padding:6px 2px;"><input type="color" class="color-slider" id="textColorPicker" value="${cfg.textColor}" style="width:100%; height:40px; border:none; cursor:pointer;"></div>
        <button class="btn-primary" id="applyTextColor" style="margin:8px 0; padding:10px; width:100%; border-radius:8px; border:none; background:#222; color:#fff; cursor:pointer;">应用颜色</button>
      </div>
      <div class="set-card">
        <div class="set-card-title">头像 & 昵称</div>
        <div class="avatar-row" id="taAvatarRow" style="display:flex; align-items:center; gap:10px; margin-bottom:10px; cursor:pointer;">
          <div class="avatar-preview" id="taAvatarPreview" style="width:40px; height:40px; border-radius:50%; background:#eee center/cover; ${cfg.taAvatar ? `background-image:url(${cfg.taAvatar})` : ''}"></div>
          <span class="label" style="font-size:14px;">TA 的头像</span>
        </div>
        <div class="avatar-row" id="myAvatarRow" style="display:flex; align-items:center; gap:10px; margin-bottom:10px; cursor:pointer;">
          <div class="avatar-preview" id="myAvatarPreview" style="width:40px; height:40px; border-radius:50%; background:#eee center/cover; ${cfg.myAvatar ? `background-image:url(${cfg.myAvatar})` : ''}"></div>
          <span class="label" style="font-size:14px;">我的头像</span>
        </div>
        <input type="file" id="avatarUpload" accept="image/*" style="display:none;">
        <div class="input-row" style="display:flex; justify-content:space-between; align-items:center; margin:10px 0;"><span class="label" style="font-size:14px;">TA 的昵称</span><input type="text" id="taNameInput" value="${cfg.taName}" style="width:120px; padding:6px 10px; border:1px solid #ddd; border-radius:8px; outline:none;"></div>
        <div class="input-row" style="display:flex; justify-content:space-between; align-items:center; margin:10px 0;"><span class="label" style="font-size:14px;">我的昵称</span><input type="text" id="myNameInput" value="${cfg.myName}" style="width:120px; padding:6px 10px; border:1px solid #ddd; border-radius:8px; outline:none;"></div>
        <button class="btn-primary" id="saveNames" style="margin:8px 0; padding:10px; width:100%; border-radius:8px; border:none; background:#222; color:#fff; cursor:pointer;">保存昵称</button>
      </div>
    `;
    const picker = panel.querySelector('#textColorPicker');
    panel.querySelector('#applyTextColor').onclick = () => { const color = picker.value; cfg.textColor = color; cfg.themeColor = color; save('text_color', color); save('theme_color', color); applyAll(); applyThemeColor(color); };
    let currentAvatarTarget = null;
    const avatarUpload = panel.querySelector('#avatarUpload');
    panel.querySelector('#taAvatarRow').onclick = () => { currentAvatarTarget = 'ta'; avatarUpload.click(); };
    panel.querySelector('#myAvatarRow').onclick = () => { currentAvatarTarget = 'my'; avatarUpload.click(); };
    avatarUpload.onchange = (e) => {
      const file = e.target.files[0]; if (!file) return;
      compressImage(file, 400, (url) => {
        if (currentAvatarTarget === 'ta') { cfg.taAvatar = url; save('ta_avatar', url); panel.querySelector('#taAvatarPreview').style.backgroundImage = `url(${url})`; }
        else { cfg.myAvatar = url; save('my_avatar', url); panel.querySelector('#myAvatarPreview').style.backgroundImage = `url(${url})`; }
        applyAll();
      });
      avatarUpload.value = '';
    };
    panel.querySelector('#saveNames').onclick = () => {
      const ta = panel.querySelector('#taNameInput').value.trim() || 'TA'; const my = panel.querySelector('#myNameInput').value.trim() || '我';
      cfg.taName = ta; cfg.myName = my; save('ta_name', ta); save('my_name', my); applyAll(); alert('已保存');
    };
  }

  function renderFeatureTab(panel) {
    const mailOn = load('mail_auto_on', false), mailMin = load('mail_auto_min', 3), mailMax = load('mail_auto_max', 6);
    const momentOn = load('moment_auto_on', false), momentMin = load('moment_auto_min', 30), momentMax = load('moment_auto_max', 60);
    panel.innerHTML = `
      <div class="set-card">
        <div class="set-card-title">信箱自动</div>
        <div class="set-row"><span class="label">对方主动写信</span><input type="checkbox" id="mailAutoOn" ${mailOn ? 'checked' : ''}></div>
        <div class="set-row"><span class="label">最短间隔（时）</span><input type="number" id="mailAutoMin" value="${mailMin}"></div>
        <div class="set-row"><span class="label">最长间隔（时）</span><input type="number" id="mailAutoMax" value="${mailMax}"></div>
      </div>
      <div class="set-card">
        <div class="set-card-title">朋友圈自动</div>
        <div class="set-row"><span class="label">自动发朋友圈</span><input type="checkbox" id="momentAutoOn" ${momentOn ? 'checked' : ''}></div>
        <div class="set-row"><span class="label">最短间隔（分）</span><input type="number" id="momentAutoMin" value="${momentMin}"></div>
        <div class="set-row"><span class="label">最长间隔（分）</span><input type="number" id="momentAutoMax" value="${momentMax}"></div>
      </div>
      <button class="set-btn" id="saveFeatureSettings">保存</button>
      <div class="set-card">
        <div class="set-card-title">收藏 & 搜索</div>
        <div class="set-row" id="openFavBtn" style="cursor:pointer;">打开收藏夹</div>
        <div class="set-row" id="openSearchBtn" style="cursor:pointer;">搜索聊天记录</div>
      </div>
    `;
    panel.querySelector('#saveFeatureSettings').onclick = () => {
      save('mail_auto_on', panel.querySelector('#mailAutoOn').checked); save('mail_auto_min', parseInt(panel.querySelector('#mailAutoMin').value) || 3); save('mail_auto_max', parseInt(panel.querySelector('#mailAutoMax').value) || 6);
      save('moment_auto_on', panel.querySelector('#momentAutoOn').checked); save('moment_auto_min', parseInt(panel.querySelector('#momentAutoMin').value) || 30); save('moment_auto_max', parseInt(panel.querySelector('#momentAutoMax').value) || 60);
      alert('已保存');
    };
    panel.querySelector('#openFavBtn').onclick = () => { document.getElementById('favModal').classList.remove('hidden'); if (typeof window.renderFavList === 'function') window.renderFavList(); };
    panel.querySelector('#openSearchBtn').onclick = () => { document.getElementById('searchModal').classList.remove('hidden'); };
  }

  function renderOtherTab(panel) {
    panel.innerHTML = `
      <div class="set-card">
        <div class="set-card-title">备份</div>
        <button class="btn-primary" id="exportBtn" style="margin:4px 0; padding:10px; width:100%; border-radius:8px; border:none; background:#222; color:#fff; cursor:pointer;">导出备份</button>
        <button class="btn-secondary" id="importBtn" style="margin:4px 0; padding:10px; width:100%; border-radius:8px; border:1px solid #ddd; background:#fff; color:#333; cursor:pointer;">导入备份</button>
        <textarea class="css-area" id="backupArea" placeholder="备份内容会显示在这里" style="height:160px; width:100%; margin-top:10px; padding:10px; border-radius:8px; border:1px solid #ddd; box-sizing:border-box; font-size:12px;"></textarea>
      </div>
    `;
    panel.querySelector('#exportBtn').onclick = () => {
      const data = { messages: JSON.parse(localStorage.getItem('our_messages') || '[]'), cards: JSON.parse(localStorage.getItem('our_cards') || '[]'), mails: JSON.parse(localStorage.getItem('our_mails') || '[]'), surveys: JSON.parse(localStorage.getItem('our_surveys') || '[]'), moments: JSON.parse(localStorage.getItem('our_moments') || '[]'), shopItems: JSON.parse(localStorage.getItem('our_shop_items') || '[]'), shopOrders: JSON.parse(localStorage.getItem('our_shop_orders') || '[]'), favorites: JSON.parse(localStorage.getItem('our_favorites') || '[]'), annivList: JSON.parse(localStorage.getItem('anniv_list') || '[]'), annivStart: localStorage.getItem('anniv_start') || '', homeQuote: localStorage.getItem('home_quote') || '', talkMine: localStorage.getItem('home_talk_mine') || '', talkTa: localStorage.getItem('home_talk_ta') || '' };
      panel.querySelector('#backupArea').value = '=== 原始数据（勿改） ===\n' + JSON.stringify(data); alert('已生成');
    };
    panel.querySelector('#importBtn').onclick = () => {
      const text = panel.querySelector('#backupArea').value; const match = text.match(/=== 原始数据（勿改） ===\s*(\{[\s\S]*\})/); if (!match) { alert('格式不对'); return; }
      try { const data = JSON.parse(match[1]); Object.keys(data).forEach(k => { if (k === 'annivStart') localStorage.setItem('anniv_start', data[k]); else if (k === 'homeQuote') localStorage.setItem('home_quote', JSON.stringify(data[k])); else if (k === 'talkMine') localStorage.setItem('home_talk_mine', JSON.stringify(data[k])); else if (k === 'talkTa') localStorage.setItem('home_talk_ta', JSON.stringify(data[k])); else if (k === 'annivList') localStorage.setItem('anniv_list', JSON.stringify(data[k])); else localStorage.setItem('our_' + k, JSON.stringify(data[k])); }); alert('导入成功，刷新生效'); } catch (e) { alert('导入失败'); }
    };
  }

  function compressImage(file, maxSize, callback) {
    const reader = new FileReader(); reader.onload = (e) => {
      const img = new Image(); img.onload = () => {
        const canvas = document.createElement('canvas'); let w = img.width, h = img.height;
        if (w > h) { if (w > maxSize) { h = h * maxSize / w; w = maxSize; } } else { if (h > maxSize) { w = w * maxSize / h; h = maxSize; } }
        canvas.width = w; canvas.height = h; canvas.getContext('2d').drawImage(img, 0, 0, w, h); callback(canvas.toDataURL('image/jpeg', 0.85));
      }; img.src = e.target.result;
    }; reader.readAsDataURL(file);
  }

  if (closeBtn) closeBtn.onclick = () => settingsModal.classList.add('hidden');
  window.addEventListener('load', () => { applyAll(); renderMain(); });
  window.applyAllSettings = applyAll;
})();
/* ★★★ settings.js 完全重写修复版 结束 ★★★ */
