let localStorageAvailable: boolean

function storageCheck() {
  if (typeof localStorage === `object`) {
    try {
      localStorage.setItem(`localStorage`, `1`)
      localStorage.removeItem(`localStorage`)
      localStorageAvailable = true
    } catch (e) {
      localStorageAvailable = false
      console.log(
        `LocalStorage is unavailable. Reverting to Cookies as a fallback.`,
      )
    }
  } else localStorageAvailable = false
}

export function set(key: string, value: string) {
  if (localStorageAvailable === undefined) storageCheck()
  if (localStorageAvailable)
    localStorage.setItem(key, value)
  else setCookie(key, value)
}

export function remove(key: string) {
  if (localStorageAvailable === undefined) storageCheck()
  if (localStorageAvailable) localStorage.removeItem(key)
  else setCookie(key, ``, true)
}

export function get(key: string) {
  if (localStorageAvailable === undefined) storageCheck()
  if (localStorageAvailable)
    return localStorage.getItem(key)
  return getCookie(key)
}

function getCookie(key: string) {
  const name = key + `=`
  const decodedCookie = decodeURIComponent(document.cookie)
  const ca = decodedCookie.split(`;`)
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) == ` `) c = c.substring(1)
    if (c.indexOf(name) == 0)
      return c.substring(name.length, c.length)
  }
  return ``
}

function setCookie(
  key: string,
  value: string,
  remove = false,
) {
  const d = new Date()
  d.setTime(
    d.getTime() +
      365 * 24 * 60 * 60 * 1000 * (remove ? -1 : 1),
  )
  const expires = `expires=` + d.toUTCString()
  document.cookie =
    key + `=` + value + `;` + expires + `;path=/`
}
