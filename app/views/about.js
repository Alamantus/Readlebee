import html from 'choo/html';

export const aboutView = (state, emit, i18n) => {
  const content = html`<section class="content"><i class="icon-loading animate-spin"></i></section>`;
  const community = html`<section class="content"></section>`;

  const promises = [];
  if (typeof i18n.pages.about === 'undefined' || typeof i18n.pages.community === 'undefined') {
    promises.push(i18n.fetchLocalePage('about'));
    promises.push(i18n.fetchLocalePage('community'));
  } else {
    content.innerHTML = i18n.pages.about;
    community.innerHTML = i18n.pages.community;
  }
  if (promises.length > 0) {
    Promise.all(promises).then(fulfilled => emit(state.events.RENDER));
  }
  return [
    content,
    community,
  ];
}