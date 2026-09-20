(() => {
 let ready = false;
 window.addEventListener('study-auth-ready', () => { ready = true; });
 setTimeout(() => {
  if (ready) return;
  const overlay = document.querySelector('#auth-loader, #auth-loading-overlay');
  if (!overlay || getComputedStyle(overlay).display === 'none') return;
  const message = document.createElement('p');
  message.textContent = 'Unable to connect to sign-in. Check your connection, then reload.';
  message.style.cssText = 'color:#fff;text-align:center;max-width:360px;padding:20px';
  const retry = document.createElement('button');
  retry.textContent = 'Reload'; retry.onclick = () => location.reload();
  retry.style.cssText = 'padding:12px 24px;border-radius:12px;cursor:pointer';
  overlay.replaceChildren(message, retry);
 }, 15000);
})();
