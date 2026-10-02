const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const form = $('#searchForm');
const address = $('#address');
const homeView = $('#homeView');
const webView = $('#webView');
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
function openInNewTab(url) { window.open(url, '_blank', 'noopener,noreferrer'); }
function visit(url, push = true) {
  currentUrl = url;
  address.value = url;
  homeView.hidden = true;
  webView.hidden = false;
  pageStatus.textContent = new URL(url).hostname;
  $('#destinationTitle').textContent = new URL(url).hostname;
  $('#destinationAddress').textContent = url;
  $('#destinationMessage').textContent = 'This site opened in a new browser tab, where its features and sign-in work normally.';
  $('.handoff-instruction').textContent = 'Opened in a new tab. You can open it again below.';
  $('#openAgain').hidden = false;
  openInNewTab(url);
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
    currentUrl = searchUrl;
    homeView.hidden = true;
    webView.hidden = false;
    pageStatus.textContent = `Google Search · ${value}`;
    $('#destinationTitle').textContent = 'Google Search';
    $('#destinationAddress').textContent = value;
    $('#destinationMessage').textContent = 'Your search opened in a new browser tab. Browse results there, or search again here.';
    $('.handoff-instruction').textContent = 'Google Search opened in a new tab. Click below to open it again.';
    $('#openAgain').hidden = false;
    openInNewTab(searchUrl);
  }
});
$('#homeButton').addEventListener('click', event => {
  event.preventDefault();
  currentUrl = ''; address.value = '';
  webView.hidden = true; homeView.hidden = false;
});
$('#homeFromWeb').addEventListener('click', () => $('#homeButton').click());
$('#openAgain').addEventListener('click', () => { if (currentUrl) openInNewTab(currentUrl); });
$$('.link-grid a').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  const url = link.dataset.url;
  address.value = url;
  visit(url);
}));
