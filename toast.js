window.showToast = function (message, duration) {
    duration = duration || 2500;
    try {
        if (window.self !== window.top && typeof window.top.showToast === 'function') {
            window.top.showToast(message, duration);
            return;
        }
    } catch (e) { }

    const target = document.body || document.documentElement;
    if (!target) return;

    const existingToasts = target.querySelectorAll('.confe-global-toast');
    existingToasts.forEach(el => el.remove());

    const t = document.createElement('div');
    t.className = 'confe-global-toast';
    t.style.cssText = [
        'position:fixed',
        'bottom:48px',
        'left:50%',
        'transform:translate(-50%, 20px)',
        'background:#001D35',
        'color:#E8F0FE',
        'padding:14px 24px',
        'border-radius:9999px',
        'z-index:999999',
        'font-size:14px',
        "font-family:'Be Vietnam Pro','Outfit',sans-serif",
        'font-weight:500',
        'line-height:20px',
        'letter-spacing:0.25px',
        'box-shadow:0px 4px 8px 3px rgba(0,0,0,0.15), 0px 1px 3px rgba(0,0,0,0.3)',
        'transition:opacity 0.2s cubic-bezier(0.2, 0, 0, 1), transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
        'opacity:0',
        'pointer-events:none',
        'white-space:nowrap',
        'max-width:90vw',
        'text-align:center'
    ].join(';');
    t.textContent = message;
    target.appendChild(t);

    requestAnimationFrame(() => {
        t.style.opacity = '1';
        t.style.transform = 'translate(-50%, 0)';
    });

    setTimeout(() => {
        t.style.opacity = '0';
        t.style.transform = 'translate(-50%, 20px)';
        setTimeout(() => { if (t.parentNode) t.parentNode.removeChild(t); }, 200);
    }, duration);
};

function _attachToastFileListener() {
    document.addEventListener('change', (e) => {
        if (e.target.type === 'file' && e.target.files && e.target.files[0] && e.target.style.display !== 'none') {
            const f = e.target.files[0];
            const name = f.name.length > 20 ? f.name.slice(0, 15) + '...' : f.name;
            window.showToast('Đã chọn: ' + name);
        }
    }, true);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _attachToastFileListener);
} else {
    _attachToastFileListener();
}