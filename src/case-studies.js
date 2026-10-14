// Locked case files: shake, stamp "Still cooking", and say why.
const lines = [
  "That file's still cooking. Real numbers take time to verify.",
  "Still cooking. I only publish results I can prove.",
  "Patience. This one's in the oven until the numbers are final.",
];
const note = document.querySelector("[data-cooking-note]");
let clicks = 0;

document.querySelectorAll("[data-cooking]").forEach((folder) => {
  folder.addEventListener("click", () => {
    folder.classList.add("is-cooking");
    folder.classList.remove("is-shaking");
    void folder.offsetWidth; // restart the shake on repeat clicks
    folder.classList.add("is-shaking");
    note.textContent = lines[clicks++ % lines.length];
  });
  folder.addEventListener("animationend", () => folder.classList.remove("is-shaking"));
});
