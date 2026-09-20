import { auth } from './firebase-config.js';

export const STORAGE_ORIGIN = 'https://rjeqphxewhbinkidspdm.supabase.co';
const API = `${STORAGE_ORIGIN}/functions/v1/study-storage`;
const PUBLIC_KEY = 'sb_publishable_joi1I_G8T1N0ucbVDpIRFQ_aZ1rFIqU';
const PREFIX = `${STORAGE_ORIGIN}/storage/v1/object/authenticated/study-materials/`;
const endpoint = (action, path) => `${API}?${new URLSearchParams({ action, path })}`;
async function token() {
  if (!auth.currentUser) throw new Error('Please sign in again.');
  return auth.currentUser.getIdToken();
}
export const materialReference = path => PREFIX + path.split('/').map(encodeURIComponent).join('/');
export function supabasePath(url) {
  try { return url.startsWith(PREFIX) ? decodeURIComponent(url.slice(PREFIX.length)) : ''; } catch { return ''; }
}
export async function storageRequest(action, path) {
  const response = await fetch(endpoint(action, path), {
    method: 'POST', headers: { Authorization: `Bearer ${await token()}`, apikey: PUBLIC_KEY },
    signal: AbortSignal.timeout(45000)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Storage request failed.');
  return data;
}
export async function uploadMaterial(path, file, contentType, onProgress) {
  const bearer = await token();
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint('upload', path));
    xhr.timeout = 120000;
    xhr.setRequestHeader('Authorization', `Bearer ${bearer}`);
    xhr.setRequestHeader('apikey', PUBLIC_KEY);
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.upload.onprogress = event => { if(event.lengthComputable) onProgress?.(Math.round(event.loaded / event.total * 100)); };
    xhr.onload = () => {
      let data; try { data = JSON.parse(xhr.responseText); } catch { reject(new Error('Invalid storage response.')); return; }
      if(xhr.status >= 200 && xhr.status < 300) resolve(materialReference(path));
      else reject(new Error(data.error || 'File upload failed.'));
    };
    xhr.onerror = () => reject(new Error('Connection failed. Check your network and retry.'));
    xhr.ontimeout = () => reject(new Error('Upload timed out. Check your network and retry.'));
    xhr.send(file);
  });
}
export const deleteMaterialFile = path => storageRequest('delete', path);
// Signed download links last two minutes; durable metadata never stores an expired URL.
export function connectMaterialLinks(container = document) {
  container.addEventListener('click', async event => {
    const link = event.target.closest('a[href]');
    const path = link && supabasePath(link.href);
    if(!path) return;
    event.preventDefault();
    if(link.dataset.busy) return;
    link.dataset.busy = 'true'; 
    link.setAttribute('aria-busy','true');
    const originalHTML = link.innerHTML;
    link.innerHTML = '<span>Preparing...</span>';
    
    try {
      const data = await storageRequest('download', path);
      const destination = new URL(data.url);
      if(destination.origin !== STORAGE_ORIGIN || !destination.pathname.startsWith('/storage/v1/object/sign/study-materials/')) throw new Error('Invalid download link.');
      // Same-tab navigation avoids popup blocking after asynchronous authorization.
      window.location.assign(destination.href);
    } catch(error) { 
      alert(error.message || 'Unable to open the file.'); 
    } finally { 
      delete link.dataset.busy; 
      link.removeAttribute('aria-busy'); 
      link.innerHTML = originalHTML; 
    }
  });
}
