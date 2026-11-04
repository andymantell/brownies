import { switchKeysOff, switchKeysOn } from './input.js'

// A panel that slides out on the left of the screen, full of buttons to pick things.
// While it's open, the keys don't move anyone (so you can't walk off by accident).
//   const panel = makePanel('Dress up')
//   makePanelButton('👗 Dress up', () => { panel.openOrClose() })
//   panel.addHeading('Player one')
//   panel.addColourChoices('Shirt', ['red', 'blue'], 'red', (colour) => { ... })
//   panel.addWordChoices('Hair', ['short', 'long'], 'long', (word) => { ... })

export function makePanel(title) {
  loadStyles()

  const panel = document.createElement('div')
  panel.className = 'side-panel'
  document.body.append(panel)

  const heading = document.createElement('h2')
  heading.textContent = title
  panel.append(heading)

  // Everything we add goes in here, above the Done button.
  const insides = document.createElement('div')
  panel.append(insides)

  const doneButton = makeButton('Done', 'done-button', () => {
    close()
  })
  panel.append(doneButton)

  function open() {
    panel.classList.add('showing')
    switchKeysOff()
  }

  function close() {
    panel.classList.remove('showing')
    switchKeysOn()
  }

  function isOpen() {
    return panel.classList.contains('showing')
  }

  // A row of buttons. Clicking one picks it, and lights it up.
  function addChoices(label, choices, startingChoice, whenPicked, makeChoiceButton) {
    const row = document.createElement('div')
    row.className = 'choice-row'

    const words = document.createElement('div')
    words.className = 'choice-label'
    words.textContent = label
    row.append(words)

    const buttons = document.createElement('div')
    buttons.className = 'choice-buttons'
    row.append(buttons)

    for (const choice of choices) {
      const button = makeChoiceButton(choice)
      button.addEventListener('click', () => {
        for (const other of buttons.children) {
          other.classList.remove('picked')
        }
        button.classList.add('picked')
        whenPicked(choice)
      })
      if (choice === startingChoice) {
        button.classList.add('picked')
      }
      buttons.append(button)
    }

    insides.append(row)
  }

  return {
    open,
    close,
    isOpen,

    openOrClose() {
      if (isOpen()) {
        close()
      } else {
        open()
      }
    },

    addHeading(words) {
      const heading = document.createElement('h3')
      heading.textContent = words
      insides.append(heading)
    },

    addColourChoices(label, colours, startingColour, whenPicked) {
      addChoices(label, colours, startingColour, whenPicked, (colour) => {
        const button = makeButton('', 'colour-choice', () => {})
        button.style.background = colour
        button.title = colour
        return button
      })
    },

    addWordChoices(label, words, startingWord, whenPicked) {
      addChoices(label, words, startingWord, whenPicked, (word) => {
        return makeButton(word, 'word-choice', () => {})
      })
    },
  }
}

// A big friendly button on the left of the screen.
export function makePanelButton(words, whenClicked) {
  loadStyles()
  const button = makeButton(words, 'panel-button', whenClicked)
  document.body.append(button)
  return button
}

function makeButton(words, className, whenClicked) {
  const button = document.createElement('button')
  button.className = className
  button.textContent = words
  button.addEventListener('click', () => {
    whenClicked()
    button.blur() // so the space bar jumps, instead of clicking this button again
  })
  return button
}

let stylesAreLoaded = false

function loadStyles() {
  if (stylesAreLoaded) {
    return
  }
  stylesAreLoaded = true

  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = new URL('./panel.css', import.meta.url).href
  document.head.append(link)
}
