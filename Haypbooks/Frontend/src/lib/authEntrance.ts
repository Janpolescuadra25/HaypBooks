/**
 * One-shot flag controlling the cinematic auth entrance.
 *
 * Armed by landing-page links (Navbar / Hero / Pricing / FinalCTA /
 * LearnSupport) right before navigating to an auth page. AuthShell
 * consumes the flag on mount: if armed it plays the full choreography
 * and disarms, so auth <-> auth navigation (login -> signup ->
 * verify-otp -> forgot-password ...) renders instantly without
 * replaying the entrance. Direct loads of an auth URL count as
 * "arriving fresh", so they still get the entrance.
 */

let armed = true;

export function armAuthTransition(): void {
  armed = true;
}

export function peekAuthTransitionArmed(): boolean {
  return armed;
}

export function disarmAuthTransition(): void {
  armed = false;
}
