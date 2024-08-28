// Found at: https://github.com/kittykatattack/learningPixi?tab=readme-ov-file#keyboard-movement
// Adapted to TypeScript

export interface IKey {
  value: string;
  isDown: boolean;
  isUp: boolean;
  press: (() => void) | undefined;
  release: (() => void) | undefined
  unsubscribe: () => void;
  downHandler: (event: KeyboardEvent) => void;
  upHandler: (event: KeyboardEvent) => void;

}

export function KeyHandler(
  value: string,
  press: (() => void) | undefined = undefined,
  release: (() => void) | undefined = undefined
): IKey {
  const key: Partial<IKey> = {
    value: value,
    isDown: false,
    isUp: true,
    press: press,
    release: release
  };

  key.downHandler = (event) => {
    if (event.key === key.value) {
      if (key.isUp && key.press) {
        key.press();
      }
      key.isDown = true;
      key.isUp = false;
      event.preventDefault();
    }
  };

  key.upHandler = (event) => {
    if (event.key === key.value) {
      if (key.isDown && key.release) {
        key.release();
      }
      key.isDown = false;
      key.isUp = true;
      event.preventDefault();
    }
  };

  //Attach event listeners
  const downListener = key.downHandler.bind(key);
  const upListener = key.upHandler.bind(key);

  window.addEventListener("keydown", downListener, false);
  window.addEventListener("keyup", upListener, false);

  // Detach event listeners
  key.unsubscribe = () => {
    window.removeEventListener("keydown", downListener);
    window.removeEventListener("keyup", upListener);
  };

  return key as IKey;
}