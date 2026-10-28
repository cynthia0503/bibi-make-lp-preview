// 公開用URLを入力。同じリンクを使うCTAはここだけ変更します。
// 未設定のリンクは遷移しません。
const links = {
  line: "",
  consult: "",
  company: "",
  legal: "https://bibi-make.jp/tokushoho/",
  privacy: "https://bibi-make.jp/privacypolicy/",
};

document.querySelectorAll("[data-link]").forEach((link) => {
  const url = links[link.dataset.link];
  if (!url) return;
  link.href = url;
  link.removeAttribute("aria-disabled");
});

// 受講生の声：スワイプと前後ボタンを同期。自動再生なし。
const list = document.querySelector(".voice-list");
const nav = document.querySelector(".voice-nav");
const cards = [...list.children];
const buttons = [...nav.querySelectorAll("[data-step]")];
const dots = nav.querySelector(".voice-dots");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let current = 0;

function showCard(index) {
  list.scrollTo({ left: cardPosition(cards[index]), behavior: reducedMotion.matches ? "instant" : "smooth" });
}

const dotButtons = cards.map((card, index) => {
  const dot = document.createElement("button");
  dot.type = "button";
  dot.setAttribute("aria-label", `${index + 1}人目の受講生の声を表示`);
  dot.setAttribute("aria-controls", "voice-list");
  dot.addEventListener("click", () => showCard(index));
  dots.append(dot);
  return dot;
});

function cardPosition(card) {
  return card.offsetLeft - (list.clientWidth - card.clientWidth) / 2;
}

function updateVoice() {
  current = cards.reduce((best, card, index) =>
    Math.abs(cardPosition(card) - list.scrollLeft) < Math.abs(cardPosition(cards[best]) - list.scrollLeft) ? index : best, 0);
  dotButtons.forEach((dot, index) => {
    if (index === current) dot.setAttribute("aria-current", "true");
    else dot.removeAttribute("aria-current");
  });
  buttons[0].disabled = current === 0;
  buttons[1].disabled = current === cards.length - 1;
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const next = Math.max(0, Math.min(cards.length - 1, current + Number(button.dataset.step)));
    showCard(next);
  });
});
list.addEventListener("scroll", updateVoice, { passive: true });
window.addEventListener("resize", () => {
  list.scrollTo({ left: cardPosition(cards[current]), behavior: "instant" });
  updateVoice();
});
nav.hidden = false;
updateVoice();


// 下からふわっと表示。装飾付き画像は親で表示タイミングを揃え、画像を個別に動かします。
if (!reducedMotion.matches && "IntersectionObserver" in window) {
  const targets = new Set(
    [...document.images]
      .filter(image => /-(?:img|txt)\d*\.[^./]+$/i.test(new URL(image.src).pathname))
      .map(image => image.closest(".sparkle") || image)
  );
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -32px 0px", threshold: 0 });

  targets.forEach(target => {
    target.classList.add("reveal");
    observer.observe(target);
  });

  reducedMotion.addEventListener("change", event => {
    if (!event.matches) return;
    observer.disconnect();
    targets.forEach(target => target.classList.add("visible"));
  });
}


// section-02（受講生の声）を通過したら追従CTAを表示。
const floating = document.querySelector(".float-cta");
const floatStart = document.querySelector(".voice");
const floatEnd = document.querySelector(".footer");
if (floating && floatStart) {
  floating.hidden = false;
  let floatFrame = 0;

  function updateFloating() {
    const footerReached = floatEnd && floatEnd.getBoundingClientRect().top <= window.innerHeight;
    const visible = floatStart.getBoundingClientRect().bottom <= 0 && !footerReached;
    floating.classList.toggle("visible", visible);
    floating.setAttribute("aria-hidden", String(!visible));
    floating.inert = !visible;
    floatFrame = 0;
  }

  function scheduleFloating() {
    if (!floatFrame) floatFrame = requestAnimationFrame(updateFloating);
  }

  window.addEventListener("scroll", scheduleFloating, { passive: true });
  window.addEventListener("resize", scheduleFloating);
  window.addEventListener("pageshow", scheduleFloating);
  updateFloating();
}
