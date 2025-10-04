const pattern = document.getElementById("pattern");
const bgColor = document.getElementById("bgColor");
const lineColor = document.getElementById("lineColor");
const lineThickness = document.getElementById("lineThickness");
const cellSize = document.getElementById("cellSize");

function updatePattern() {
  const bg = bgColor.value;
  const lc = lineColor.value;
  const lt = lineThickness.value + "px";
  const cs = cellSize.value + "px";

  pattern.style.backgroundColor = bg;
  pattern.style.backgroundImage = `
    repeating-linear-gradient(to right, ${lc} 0 ${lt}, transparent ${lt} ${cs}),
    repeating-linear-gradient(to bottom, ${lc} 0 ${lt}, transparent ${lt} ${cs})
  `;
  pattern.style.setProperty("--line-thickness", lt);
  pattern.style.setProperty("--cell-size", cs);
}

[bgColor, lineColor, lineThickness, cellSize].forEach(input =>
  input.addEventListener("input", updatePattern)
);

updatePattern(); // 初始化
