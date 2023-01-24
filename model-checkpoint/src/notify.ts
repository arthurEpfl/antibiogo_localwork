import { notify } from '@kyvg/vue3-notification'

const options = {
  duration: 3000,
  speed: 1000
}

function success (text?: any) {
  let displayedText
  if (text === undefined) {
    displayedText = 'Success'
  } else if (text instanceof Error) {
    displayedText = text.message
  } else {
    displayedText = text.toString()
  }
  notify({ ...options, type: 'success', text: displayedText })
}

function error (text?: any) {
  let displayedText
  if (text === undefined) {
    displayedText = 'Success'
  } else if (text instanceof Error) {
    displayedText = text.message
  } else {
    displayedText = text.toString()
  }
  notify({ ...options, type: 'error', text: displayedText })
}

export default { success, error }
