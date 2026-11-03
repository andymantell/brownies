import { config } from './config.js'
import { makeSpeechBubble, randomNumberBetween, pickAtRandom } from './engine/index.js'

// 💬 Things our hero says, every now and then, in a speech bubble.
// Add your own to the list! (Keep them kind.)

const phrases = [
  'This is boring!',
  "I'm sooo bored...",
  'Is anything going to happen?',
  'Can we do something fun now?',
  'Yawn...',
  "There's nothing to do here!",
  'Grass, grass and more grass...',
  'Somebody add a game, please!',
  "I've walked everywhere already!",
  "Wake me up when it's exciting",
  'Are we nearly there yet?',
]

export function createSpeech(screen, character) {
  const bubble = makeSpeechBubble(screen)
  const timings = config.speech

  let isTalking = false
  let lastPhrase = null

  // Counts down to the next thing that happens: either start talking, or stop.
  let secondsUntilNextChange = timings.quietForAtLeast

  return {
    // Called every frame by the game loop.
    update(secondsPassed) {
      // Keep the bubble just above the character's head.
      bubble.stayAbove(character.position, 2.6)

      secondsUntilNextChange -= secondsPassed
      if (secondsUntilNextChange > 0) {
        return // not time yet
      }

      if (isTalking) {
        // Stop talking, and be quiet for a while.
        bubble.hide()
        isTalking = false
        secondsUntilNextChange = randomNumberBetween(timings.quietForAtLeast, timings.quietForAtMost)
      } else {
        // Say something new.
        lastPhrase = pickNewPhrase(lastPhrase)
        bubble.say(lastPhrase)
        isTalking = true
        secondsUntilNextChange = timings.showForSeconds
      }
    },
  }
}

// Pick a phrase at random, but never the same one twice in a row.
function pickNewPhrase(lastPhrase) {
  let phrase = pickAtRandom(phrases)
  while (phrase === lastPhrase) {
    phrase = pickAtRandom(phrases)
  }
  return phrase
}
