import html from 'choo/html';

export const modal = (modalId, controller, contentHTML, options = {}) => {
  /* Options:
   * controller <class>: Pass the controller class with state; Requires get/set for openModal in state.
   * buttonHTML <choo/html>: Displayed in place of the default button to open the modal
   * buttonText <string>: Displayed if no buttonHTML is specified
   * noHeader <bool>: Set to `true` and exclude headerHTML to not include a modal header
   * headerHTML <choo/html>: Displayed in place of the default header; Recommended to use `<header>` tag
   * headerText <string>: Displayed in an `<h3>` if no header is specified
   * noFooter <bool>: Set to `true` and exclude footerHTML to not include a modal footer
   * footerHTML <choo/html>: Displayed in place of the default footer; Recommended to use `<footer>` tag
   */
  
  const isOpen = controller.openModal === modalId;
   
  return [
    (
      typeof options.buttonHTML === 'undefined'
      ? html`<label for=${modalId} class="button">${options.buttonText}</label>`
      : options.buttonHTML
    ),
    
    // Modals in Picnic CSS uses pure CSS with clever usage of invisible checkboxes and labels
    html`<div class="modal">
      <input id=${modalId} type="checkbox" ${!isOpen ? null : 'checked'}
        onchange=${() => controller.openModal = isOpen ? modalId : null }/>
      <label for=${modalId} class="overlay"></label>
      <article style=${typeof options.styles !== 'undefined' ? options.styles : null}>

        ${typeof options.headerHTML === 'undefined'
          ? (
            options.noHeader
            ? null
            : html`<header>
              <h3>${options.headerText}</h3>
              <label for=${modalId} class="close">${'\u00d7'}</label>
            </header>`
          )
          : options.headerHTML
        }

        <section class="content">
          ${typeof contentHTML === 'undefined'
            ? null
            : contentHTML
          }
        </section>
        
        
        ${typeof options.footerHTML === 'undefined'
          ? (
            options.noFooter
            ? null
            : html`<footer>
              <label for=${modalId} class="button dangerous">
                Close
              </label>
            </footer>`
          )
          : options.footerHTML
        }
      </article>
    </div>`,
  ];
}