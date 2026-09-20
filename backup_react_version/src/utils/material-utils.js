export function safeMaterialURL(value) {
    try {
        const url = new URL(value);
        const firebase = url.hostname === 'firebasestorage.googleapis.com' && url.pathname.startsWith('/v0/b/alpha-c3c01.firebasestorage.app/o/materials%2F');
        const supabase = url.hostname === 'rjeqphxewhbinkidspdm.supabase.co' && url.pathname.startsWith('/storage/v1/object/authenticated/study-materials/materials/');
        return url.protocol === 'https:' && (firebase || supabase) ? url.href : '';
    } catch { return ''; }
}
const types = {
 pdf:'application/pdf', doc:'application/msword', docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 ppt:'application/vnd.ms-powerpoint', pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation',
 zip:'application/zip', txt:'text/plain'
};
export function contentTypeForFile(file) {
 const expected=types[file.name.split('.').pop().toLowerCase()];
 if (!expected) return '';
 if (!file.type || file.type === 'application/octet-stream') return expected;
 if (file.type === expected || (expected === 'application/zip' && file.type === 'application/x-zip-compressed')) return expected;
 return '';
}
export function subjectKey(text) { return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
