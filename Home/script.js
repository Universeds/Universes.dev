document.addEventListener("DOMContentLoaded", async () => {
  document.querySelectorAll(".float-text").forEach((el) => {
    const text = el.textContent;
    el.innerHTML = text
      .split("")
      .map((letter) => {
        const delay = (Math.random() * 0.5).toFixed(2);
        if (letter === " ") return `<span>&nbsp;</span>`;
        return `<span style="animation-delay: ${delay}s;">${letter}</span>`;
      })
      .join("");
  });

  const grid = document.getElementById("portfolioGrid");
  if (!grid) return;

  const res = await fetch("../Projects/projects.json");
  const folders = await res.json();

  for (const folder of folders) {
    const infoRes = await fetch(`../Projects/${folder}/info.json`);
    const info = await infoRes.json();

    const item = document.createElement("div");
    item.className = "portfolio-item";
    item.innerHTML = `<h3>${info.title}</h3><p>${info.description}</p>`;
    grid.appendChild(item);
  }

  grid.querySelectorAll(".portfolio-item").forEach((item) => {
    item.addEventListener("mousemove", (e) => {
      const rect = item.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateX = -(y - rect.height / 2) / 10;
      const rotateY = (x - rect.width / 2) / 10;
      item.style.transform = `translateY(-10px) scale(1.05) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    item.addEventListener("mouseleave", () => {
      item.style.transform = "";
    });
  });

  spawnCats(grid);
});

const CAT_SCALE = 4;
const CAT_SIZE = 14;
const SCALED_SIZE = CAT_SIZE * CAT_SCALE;
const NUM_CATS = 3;

function spawnCats(grid) {
  const container = document.getElementById("catContainer");
  if (!container) return;

  const items = grid.querySelectorAll(".portfolio-item");
  if (items.length === 0) return;

  // REQUIREMENT:
  // - catContainer should be inside (or overlap) portfolioGrid
  // - portfolioGrid should be position: relative
  // - catContainer should be position: absolute; inset: 0; pointer-events:none;
  // This makes all cat coordinates local to the grid (stable even when the page scrolls).

  for (let i = 0; i < NUM_CATS; i++) {
    const el = document.createElement("div");
    el.className = "cat";
    el.style.width = CAT_SIZE + "px";
    el.style.height = CAT_SIZE + "px";
    el.style.transformOrigin = "top left";
    el.style.position = "absolute";
    el.setAttribute("data-state", "idle");
    container.appendChild(el);

    const cat = {
      el,
      x: 0,
      y: 0,
      state: "idle",
      currentCard: null,
      edge: "top",
      facingLeft: false,
    };

    const startCard = items[Math.floor(Math.random() * items.length)];
    placeOnCard(cat, startCard, "top", container);
    setState(cat, "idle");

    runCatAI(cat, items, container);
  }
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// Use coordinates relative to catContainer to avoid scroll + transformed-rect jitter.
function getCardBox(card, container) {
  const cRect = container.getBoundingClientRect();
  const r = card.getBoundingClientRect();
  return {
    left: r.left - cRect.left,
    top: r.top - cRect.top,
    right: r.right - cRect.left,
    bottom: r.bottom - cRect.top,
    width: r.width,
    height: r.height,
    cx: r.left - cRect.left + r.width / 2,
    cy: r.top - cRect.top + r.height / 2,
  };
}

// Get position for the top or bottom edge of a card (container-local coords)
function getEdgePosition(card, edge, container) {
  const box = getCardBox(card, container);
  const x = box.cx - SCALED_SIZE / 2;
  const y =
    edge === "top"
      ? box.top - (SCALED_SIZE * 2) / 3
      : box.bottom - SCALED_SIZE / 3;
  return { x, y };
}

function isDirectlyBelow(catX, catY, target, container) {
  const b = getCardBox(target, container);
  if (b.top <= catY + SCALED_SIZE) return false;
  return (catX + SCALED_SIZE) > b.left && catX < b.right;
}

function findCardBelow(cat, cards, container) {
  const candidates = [];
  for (const card of cards) {
    if (card !== cat.currentCard && isDirectlyBelow(cat.x, cat.y, card, container)) {
      candidates.push(card);
    }
  }
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function placeOnCard(cat, card, edge, container) {
  const pos = getEdgePosition(card, edge, container);
  cat.x = pos.x + (Math.random() - 0.5) * 40;
  cat.y = pos.y;
  cat.currentCard = card;
  cat.edge = edge;
  updatePosition(cat);
}

function updatePosition(cat) {
  const flip = cat.facingLeft ? " scaleX(-1)" : "";
  const xOffset = cat.facingLeft ? SCALED_SIZE : 0;
  cat.el.style.left = (cat.x + xOffset) + "px";
  cat.el.style.top = cat.y + "px";
  cat.el.style.transform = `scale(${CAT_SCALE})${flip}`;
}

function setState(cat, state) {
  cat.state = state;
  cat.el.setAttribute("data-state", state);
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

async function runCatAI(cat, cards, container) {
  while (true) {
    setState(cat, "idle");
    await sleep(randomBetween(2000, 4000));

    if (Math.random() < 0.35) {
      setState(cat, "itch");
      await sleep(randomBetween(1000, 2000));
      setState(cat, "idle");
      await sleep(randomBetween(500, 1500));
    }

    const cardBelow = findCardBelow(cat, cards, container);

    // Estimate the cat's card edge from its own position
    const catCardEdge = cat.edge === "top"
      ? cat.y + (SCALED_SIZE * 2) / 3
      : cat.y + SCALED_SIZE / 3;

    const adjacentCards = [];
    let nearestLeft = null, nearestLeftDist = Infinity;
    let nearestRight = null, nearestRightDist = Infinity;
    for (const c of cards) {
      if (c === cat.currentCard) continue;
      const b = getCardBox(c, container);
      // Same row: the target card's matching edge must align with the cat's estimated edge
      const targetEdge = cat.edge === "top" ? b.top : b.bottom;
      if (Math.abs(catCardEdge - targetEdge) > 15) continue;
      // Find nearest left and right by X position
      if (b.cx < cat.x) {
        const d = cat.x - b.cx;
        if (d < nearestLeftDist) { nearestLeftDist = d; nearestLeft = c; }
      } else {
        const d = b.cx - cat.x;
        if (d < nearestRightDist) { nearestRightDist = d; nearestRight = c; }
      }
    }
    if (nearestLeft) adjacentCards.push(nearestLeft);
    if (nearestRight) adjacentCards.push(nearestRight);

    let target;
    let moveType;

    if (adjacentCards.length > 0 && Math.random() < 0.7) {
      target = adjacentCards[Math.floor(Math.random() * adjacentCards.length)];
      moveType = "hop";
    } else if (cardBelow && Math.random() < 0.6) {
      target = cardBelow;
      moveType = "drop";
    } else {
      const belowOrSame = Array.from(cards).filter((c) => {
        if (c === cat.currentCard) return false;
        const b = getCardBox(c, container);
        return b.top >= cat.y && b.top <= cat.y + 300;
      });
      if (belowOrSame.length > 0) {
        target = belowOrSame[Math.floor(Math.random() * belowOrSame.length)];
      } else {
        do {
          target = cards[Math.floor(Math.random() * cards.length)];
        } while (target === cat.currentCard && cards.length > 1);
      }
      moveType = "falloff";
    }

    const landEdge = Math.random() < 0.5 ? "top" : "bottom";
    const landPos = getEdgePosition(target, landEdge, container);

    const targetBox = getCardBox(target, container);
    const comingFromLeft = cat.x < targetBox.cx;

    const landX = comingFromLeft
      ? targetBox.left + SCALED_SIZE / 2 + Math.random() * 20
      : targetBox.right - SCALED_SIZE - Math.random() * 20;

    const curBox = getCardBox(cat.currentCard, container);
    cat.facingLeft = landX < cat.x;

    const edgeX = cat.facingLeft
      ? curBox.left + SCALED_SIZE / 2
      : curBox.right - SCALED_SIZE;

    if (moveType === "hop") {
      setState(cat, "walk");
      await moveTo(cat, edgeX, cat.y, 1.5);

      setState(cat, "run");
      await jumpArc(cat, cat.x, cat.y, landX, landPos.y, 400, 15);
    } else if (moveType === "drop") {
      setState(cat, "walk");
      const belowBox = getCardBox(target, container);
      const dropX =
        belowBox.cx - SCALED_SIZE / 2 + (Math.random() - 0.5) * 40;
      await moveTo(cat, dropX, cat.y, 1.5);

      setState(cat, "run");
      await fallTo(cat, dropX, landPos.y, 350);
    } else {
      setState(cat, "walk");
      await moveTo(cat, edgeX, cat.y, 1.5);

      setState(cat, "run");
      const containerH = container.clientHeight || container.getBoundingClientRect().height;
      const offScreenY = containerH + SCALED_SIZE * 2;
      await fallTo(cat, cat.x, offScreenY, 500);

      cat.el.style.visibility = "hidden";
      const cRect = container.getBoundingClientRect();
      const fallStartY = -cRect.top - SCALED_SIZE * 2;
      cat.x = landX;
      cat.y = fallStartY;
      updatePosition(cat);
      await sleep(250);
      cat.el.style.visibility = "";

      await fallTo(cat, landX, landPos.y, 400);
    }

    // Snap to final computed landing spot to avoid micro drift
    cat.x = clamp(cat.x, -SCALED_SIZE * 2, (container.clientWidth || 999999) + SCALED_SIZE * 2);
    cat.y = landPos.y;
    updatePosition(cat);

    cat.currentCard = target;
    cat.edge = landEdge;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function moveTo(cat, targetX, targetY, speed) {
  return new Promise((resolve) => {
    function step() {
      const dx = targetX - cat.x;
      const dy = targetY - cat.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= speed + 0.5) {
        cat.x = targetX;
        cat.y = targetY;
        updatePosition(cat);
        resolve();
        return;
      }

      cat.x += (dx / dist) * speed;
      cat.y += (dy / dist) * speed;
      updatePosition(cat);
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

function jumpArc(cat, startX, startY, endX, endY, duration, jumpHeight) {
  return new Promise((resolve) => {
    const startTime = performance.now();

    function step(now) {
      const t = Math.min((now - startTime) / duration, 1);

      cat.x = startX + (endX - startX) * t;
      const arcOffset = -4 * jumpHeight * t * (t - 1);
      cat.y = startY + (endY - startY) * t - arcOffset;

      updatePosition(cat);

      if (t < 1) requestAnimationFrame(step);
      else {
        cat.x = endX;
        cat.y = endY;
        updatePosition(cat);
        resolve();
      }
    }
    requestAnimationFrame(step);
  });
}

function fallTo(cat, targetX, targetY, duration) {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const startX = cat.x;
    const startY = cat.y;

    function step(now) {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = t * t;

      cat.x = startX + (targetX - startX) * t;
      cat.y = startY + (targetY - startY) * eased;
      updatePosition(cat);

      if (t < 1) requestAnimationFrame(step);
      else {
        cat.x = targetX;
        cat.y = targetY;
        updatePosition(cat);
        resolve();
      }
    }
    requestAnimationFrame(step);
  });
}