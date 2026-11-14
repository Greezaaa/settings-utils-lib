export interface ScreenBox {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export function flyOutTransform(from: ScreenBox, to: ScreenBox): string {
  const x = Math.round(from.left - to.left);
  const y = Math.round(from.top - to.top);
  const scaleX = to.width > 0 ? from.width / to.width : 1;
  const scaleY = to.height > 0 ? from.height / to.height : 1;
  return `translate(${x}px, ${y}px) scale(${scaleX.toFixed(4)}, ${scaleY.toFixed(4)})`;
}
