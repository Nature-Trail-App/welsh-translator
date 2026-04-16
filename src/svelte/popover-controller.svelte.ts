/**
 * Shared popover controller that coordinates open/close state across
 * TranslatableText and TranslatableHTML component instances.
 *
 * On mobile/touch devices, bits-ui's pointerdown-based dismiss layer
 * prevents direct popover-to-popover switching in a single tap.
 * This controller bypasses that by driving the open state from a
 * single `$state` rune — Svelte batches the close + open into one tick.
 */

export interface PopoverController {
  /** The currently open popover ID, or null if none is open. */
  readonly openId: string | null;
  /** Open the popover for the given ID (closes any other). */
  set(id: string): void;
  /** Toggle the popover for the given ID. */
  toggle(id: string): void;
  /** Close whichever popover is open. */
  close(): void;
}

export function createPopoverController(): PopoverController {
  let openId = $state<string | null>(null);

  return {
    get openId() {
      return openId;
    },
    set(id: string) {
      openId = id;
    },
    toggle(id: string) {
      openId = openId === id ? null : id;
    },
    close() {
      openId = null;
    },
  };
}
