import './commands'
import 'cypress-axe'

// Typing delay only slows the tests down; none of them rely on keystroke timing
Cypress.Commands.overwrite('type', (originalFn, element, text, options) =>
  originalFn(element, text, { delay: 0, ...options }),
)
