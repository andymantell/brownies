import { config } from './config.js'
import { makePanel, makePanelButton } from './engine/index.js'

// The dressing up box! A button on the left opens a panel where you pick
// each player's clothes. Changes show up straight away.
// While the panel is open, the keys don't move the players.

export function createWardrobe(players) {
  const panel = makePanel('Dress up')

  makePanelButton('👗 Dress up', () => {
    panel.openOrClose()
  })

  for (const player of players) {
    const person = player.person
    const looks = player.looks

    panel.addHeading(player.name)

    panel.addColourChoices('Shirt', config.wardrobe.shirtColours, looks.bodyColour, (colour) => {
      person.wearShirt(colour)
    })
  }
}
