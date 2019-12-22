import html from 'choo/html';

export const shelfView = (homeController, emit) => {
  const { __ } = homeController.i18n;

  return [
    html`<section>
      <h2>To Do</h2>
    </section>`,
  ];
}