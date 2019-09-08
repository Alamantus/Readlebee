import html from 'choo/html';

export const loginPartial = (state, emit) => {
  return html`<section>

  <article class="card">
    <div class="container wide">
      <label>
        <span>Email</span>
        <input type="email" name="email">
      </label>
      <label>
        <span>Password</span>
        <input type="password" name="password">
      </label>
      <input type="submit" value="Log In!">
    </div>
  </article>
  
</section>`;
}