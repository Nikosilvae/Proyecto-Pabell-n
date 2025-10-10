// src/utils/sidebar.js
const MOBILE_QUERY = '(max-width: 1024px)';
const isMobile = () => window.matchMedia(MOBILE_QUERY).matches;

export function toggleSidebar() {
  if (isMobile()) {
    document.body.classList.toggle('sidebar-open');
  } else {
    const collapsed = document.body.classList.toggle('sidebar-collapsed');
    localStorage.setItem('sidebar:collapsed', collapsed ? '1' : '0');
  }
}

export function openSidebar() {
  if (isMobile()) {
    document.body.classList.add('sidebar-open');
  } else {
    document.body.classList.remove('sidebar-collapsed');
    localStorage.setItem('sidebar:collapsed', '0');
  }
}

export function closeSidebar() {
  if (isMobile()) {
    document.body.classList.remove('sidebar-open');
  } else {
    document.body.classList.add('sidebar-collapsed');
    localStorage.setItem('sidebar:collapsed', '1');
  }
}

export function initSidebarPreference() {
  // Solo aplicamos preferencia de "colapsado" en desktop
  if (!isMobile() && localStorage.getItem('sidebar:collapsed') === '1') {
    document.body.classList.add('sidebar-collapsed');
  }
}
