import { useEffect, useRef, RefObject } from 'react';

export function useExplosiveButton(): { buttonRef: RefObject<HTMLButtonElement>; explode: () => void } {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (buttonRef.current && typeof document.body.animate === 'function') {
      new ExplosiveButton(buttonRef.current);
    }
  }, []);

  const explode = (): void => {
    if (buttonRef.current && typeof document.body.animate === 'function') {
      const button = new ExplosiveButton(buttonRef.current);
      button.explode(1000);
    }
  };

  return { buttonRef, explode };
}

class ExplosiveButton {
  private element: HTMLElement;
  private width: number = 0;
  private height: number = 0;
  private centerX: number = 0;
  private centerY: number = 0;
  private pieceWidth: number = 0;
  private pieceHeight: number = 0;
  private piecesX: number = 9;
  private piecesY: number = 4;
  private duration: number = 1000;

  constructor(el: HTMLElement) {
    this.element = el;
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions.bind(this));
  }

  private updateDimensions(): void {
    this.width = pxToEm(this.element.offsetWidth);
    this.height = pxToEm(this.element.offsetHeight);
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.pieceWidth = this.width / this.piecesX;
    this.pieceHeight = this.height / this.piecesY;
  }

  public explode(duration: number): void {
    const explodingState = "exploding";

    if (!this.element.classList.contains(explodingState)) {
      this.element.classList.add(explodingState);

      this.createParticles("fire", 25, duration);
      this.createParticles("debris", this.piecesX * this.piecesY, duration);
    }
  }

  private createParticles(kind: "fire" | "debris", count: number, duration: number): void {
    for (let c = 0; c < count; ++c) {
      const r = randomFloat(0.25, 0.5);
      const diam = r * 2;
      const xBound = this.centerX - r;
      const yBound = this.centerY - r;
      const easing = "cubic-bezier(0.15,0.5,0.5,0.85)";

      if (kind === "fire") {
        const x = this.centerX + randomFloat(-xBound, xBound);
        const y = this.centerY + randomFloat(-yBound, yBound);
        const a = calcAngle(this.centerX, this.centerY, x, y);
        const dist = randomFloat(1, 5);

        new FireParticle(this.element, x, y, diam, diam, a, dist, duration, easing);
      } else if (kind === "debris") {
        const x = (this.pieceWidth / 2) + this.pieceWidth * (c % this.piecesX);
        const y = (this.pieceHeight / 2) + this.pieceHeight * Math.floor(c / this.piecesX);
        const a = calcAngle(this.centerX, this.centerY, x, y);
        const dist = randomFloat(4, 7);

        new DebrisParticle(this.element, x, y, this.pieceWidth, this.pieceHeight, a, dist, duration, easing);
      }
    }
  }
}

class Particle {
  protected div: HTMLDivElement;
  protected s: { x: number; y: number };
  protected d: { x: number; y: number };

  constructor(parent: HTMLElement, x: number, y: number, w: number, h: number, angle: number, distance: number = 1, className2: string = "") {
    const width = `${w}em`;
    const height = `${h}em`;
    const adjustedAngle = angle + Math.PI / 2;

    this.div = document.createElement("div");
    this.div.className = "particle";

    if (className2)
      this.div.classList.add(className2);

    this.div.style.width = width;
    this.div.style.height = height;

    parent.appendChild(this.div);

    this.s = {
      x: x - w / 2,
      y: y - h / 2
    };
    this.d = {
      x: this.s.x + Math.sin(adjustedAngle) * distance,
      y: this.s.y - Math.cos(adjustedAngle) * distance
    };
  }

  protected runSequence(el: HTMLElement, keyframesArray: Keyframe[], duration: number = 1000, easing: string = "linear", delay: number = 0): void {
    const animation = el.animate(keyframesArray, {
      duration: duration,
      easing: easing,
      delay: delay
    });
    animation.onfinish = () => {
      const parentElement = el.parentElement;

      el.remove();

      if (parentElement && parentElement.classList.length > 0 && !document.querySelector(".particle")) {
        Array.from(parentElement.classList).forEach(className => {
          parentElement.classList.remove(className);
        });
      }
    };
  }
}

class DebrisParticle extends Particle {
  constructor(parent: HTMLElement, x: number, y: number, w: number, h: number, angle: number, distance: number, duration: number, easing: string) {
    super(parent, x, y, w, h, angle, distance, "particle--debris");

    const maxAngle = 1080;
    const rotX = randomInt(0, maxAngle);
    const rotY = randomInt(0, maxAngle);
    const rotZ = randomInt(0, maxAngle);

    this.runSequence(this.div, [
      {
        opacity: 1,
        transform: `translate(${this.s.x}em,${this.s.y}em) rotateX(0) rotateY(0) rotateZ(0)`
      },
      {
        opacity: 1,
      },
      {
        opacity: 1,
      },
      {
        opacity: 1,
      },
      {
        opacity: 0,
        transform: `translate(${this.d.x}em,${this.d.y}em) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`
      }
    ], randomInt(duration / 2, duration), easing);
  }
}

class FireParticle extends Particle {
  constructor(parent: HTMLElement, x: number, y: number, w: number, h: number, angle: number, distance: number, duration: number, easing: string) {
    super(parent, x, y, w, h, angle, distance, "particle--fire");

    const sx = this.s.x;
    const sy = this.s.y;
    const dx = this.d.x;
    const dy = this.d.y;

    this.runSequence(this.div, [
      {
        background: "hsl(60,100%,100%)",
        transform: `translate(${sx}em,${sy}em) scale(1)`
      },
      {
        background: "hsl(60,100%,80%)",
        transform: `translate(${sx + (dx - sx) * 0.25}em,${sy + (dy - sy) * 0.25}em) scale(4)`
      },
      {
        background: "hsl(40,100%,60%)",
        transform: `translate(${sx + (dx - sx) * 0.5}em,${sy + (dy - sy) * 0.5}em) scale(7)`
      },
      {
        background: "hsl(20,100%,40%)"
      },
      {
        background: "hsl(0,0%,20%)",
        transform: `translate(${dx}em,${dy}em) scale(0)`
      }
    ], randomInt(duration / 2, duration), easing);
  }
}

function calcAngle(x1: number, y1: number, x2: number, y2: number): number {
  const opposite = y2 - y1;
  const adjacent = x2 - x1;
  let angle = Math.atan(opposite / adjacent);

  if (adjacent < 0)
    angle += Math.PI;

  if (isNaN(angle))
    angle = 0;

  return angle;
}

function propertyUnitsStripped(el: Element, property: string, unit: string): number {
  const cs = window.getComputedStyle(el);
  const valueRaw = cs.getPropertyValue(property);
  const value = +valueRaw.substr(0, valueRaw.indexOf(unit));

  return value;
}

function pxToEm(px: number): number {
  const el = document.querySelector(":root");
  if (!el) throw new Error("Root element not found");
  return px / propertyUnitsStripped(el, "font-size", "px");
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number): number {
  return Math.round(Math.random() * (max - min)) + min;
}