import { auth, signOut, onAuthStateChanged } from "./firebase-config.js";

// Add global styles for bottom navigation
const style = document.createElement('style');
style.textContent = `
    .bottom-nav {
        position: fixed;
        bottom: env(safe-area-inset-bottom, 16px);
        left: 50%;
        transform: translateX(-50%);
        width: calc(100% - 40px);
        max-width: 400px;
        height: 72px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-radius: 100px;
        box-shadow: 0 8px 32px rgba(15, 23, 42, 0.1);
        display: flex;
        align-items: center;
        justify-content: space-around;
        padding: 0 12px;
        z-index: 50;
        border: 1px solid rgba(226, 232, 240, 0.8);
    }
    .b-nav-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        width: 64px;
        height: 64px;
        color: #94a3b8;
        text-decoration: none;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        border-radius: 16px;
    }
    .b-nav-item[aria-current="page"] {
        color: #2563eb;
    }
    .b-nav-item:active {
        transform: scale(0.9);
        background: #f1f5f9;
    }
    .b-nav-item:focus-visible {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
    }
    .b-nav-icon {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .b-nav-text {
        font-size: 0.65rem;
        font-weight: 600;
    }
    body {
        padding-bottom: calc(72px + env(safe-area-inset-bottom, 16px) + 20px) !important;
    }
`;
document.head.appendChild(style);

export function initBottomNav() {
    const navContainer = document.querySelector('.bottom-nav') || document.createElement('nav');
    if (!document.querySelector('.bottom-nav')) {
        navContainer.className = 'bottom-nav';
        document.body.appendChild(navContainer);
    }

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    // Save last year page for "Subjects" link
    if (currentPath.includes('-year')) {
        localStorage.setItem('dbatu_last_year_page', currentPath);
    }
    const subjectsLink = localStorage.getItem('dbatu_last_year_page') || 'choose-path.html';

    navContainer.innerHTML = \`
        <a href="choose-path.html" class="b-nav-item" id="nav-home" aria-label="Home" \${currentPath === 'choose-path.html' ? 'aria-current="page"' : ''}>
            <span class="b-nav-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></span>
            <span class="b-nav-text">Home</span>
        </a>
        <a href="\${subjectsLink}" class="b-nav-item" id="nav-subjects" aria-label="Subjects" \${currentPath.includes('-year') ? 'aria-current="page"' : ''}>
            <span class="b-nav-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg></span>
            <span class="b-nav-text">Subjects</span>
        </a>
        <a href="subject.html" class="b-nav-item" id="nav-downloads" aria-label="Downloads" \${currentPath === 'subject.html' ? 'aria-current="page"' : ''}>
            <span class="b-nav-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></span>
            <span class="b-nav-text">Downloads</span>
        </a>
        <a href="profile.html" class="b-nav-item" id="nav-profile" aria-label="Profile" \${currentPath === 'profile.html' ? 'aria-current="page"' : ''}>
            <span class="b-nav-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></span>
            <span class="b-nav-text">Profile</span>
        </a>
    \`;
}

document.addEventListener('DOMContentLoaded', initBottomNav);
