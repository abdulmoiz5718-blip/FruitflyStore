const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const form = $('#searchForm');
const address = $('#address');
const homeView = $('#homeView');
const webView = $('#webView');
const pageFrame = $('#pageFrame');
const pageStatus = $('#pageStatus');
let currentUrl = '';
const visited = [];
let visitIndex = -1;
function googleSearch(query) { return `https://www.google.com/search?q=${encodeURIComponent(query)}`; }
function cleanUrl(value) {
  const candidate = /^(https?:)?\/\//i.test(value) ? value : `https://${value}`;
  const url = new URL(candidate);
  if (!['http:','https:'].includes(url.protocol)) throw new Error('Only web addresses beginning with http or https are supported.');
  return url.href;
}
function askParentToOpen(url) {
  if (window.parent !== window) {
    window.parent.postMessage({ type:'fruitfly-open-url', url }, '*');
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
function visit(url, push = true) {
  currentUrl = url;
  address.value = url;
  homeView.hidden = true;
  webView.hidden = false;
  pageStatus.textContent = new URL(url).hostname;
  pageFrame.src = url;
  if (push) {
    visited.splice(visitIndex + 1);
    visited.push(url);
    visitIndex = visited.length - 1;
  }
}
form.addEventListener('submit', event => {
  event.preventDefault();
  const value = address.value.trim();
  if (!value) return;
  const looksLikeAddress = /^(https?:)?\/\//i.test(value) || (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(value) && !/\s/.test(value));
  if (looksLikeAddress) {
    try { visit(cleanUrl(value)); }
    catch (error) { pageStatus.textContent = error.message; webView.hidden = false; homeView.hidden = true; }
  } else {
    const searchUrl = googleSearch(value);
    pageStatus.textContent = `Searching Google for “${value}”`;
    askParentToOpen(searchUrl);
  }
});
$('#homeButton').addEventListener('click', event => {
  event.preventDefault();
  pageFrame.src = 'about:blank'; currentUrl = ''; address.value = '';
  webView.hidden = true; homeView.hidden = false;
});
$('#openExternal').addEventListener('click', () => {
  if (currentUrl) askParentToOpen(currentUrl);
});
$$('.link-grid a').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  const url = link.dataset.url;
  address.value = url;
  visit(url);
}));
pageFrame.addEventListener('load', () => {
  if (currentUrl) pageStatus.textContent = new URL(currentUrl).hostname;
});
