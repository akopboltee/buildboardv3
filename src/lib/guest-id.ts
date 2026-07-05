const GUEST_ID_KEY = "buildboard_guest_id"

export function getOrCreateGuestId(): string {
  let guestId = localStorage.getItem(GUEST_ID_KEY)
  if (!guestId) {
    guestId = crypto.randomUUID()
    localStorage.setItem(GUEST_ID_KEY, guestId)
  }
  return guestId
}

export function getGuestId(): string | null {
  return localStorage.getItem(GUEST_ID_KEY)
}

export function clearGuestId(): void {
  localStorage.removeItem(GUEST_ID_KEY)
}
