const bookSelector = document.getElementById("book-selector");
const bookSelectionStatus = document.getElementById("book-selection-status");
const startLearningButton = document.getElementById("start-learning-button");

const bookCatalog = Array.from({ length: 6 }, (_, gradeIndex) => {
  const grade = gradeIndex + 1;
  return ["upper", "lower"].map((term) => ({
    id: `${grade}-${term}`,
    label: `${grade}年级${term === "upper" ? "上册" : "下册"}`,
    dataFile: `${grade}年级${term === "upper" ? "上" : "下"}.txt`,
    available: grade === 3 && term === "upper"
  }));
}).flat();

let selectedBookId = "3-upper";

function renderBookSelector() {
  bookSelector.innerHTML = bookCatalog.map((book) => `
    <button class="book-option ${book.id === selectedBookId ? "active" : ""}" type="button" data-book-id="${book.id}" ${book.available ? "" : "disabled"}>
      <span>${book.label}</span>
      <small>${book.available ? "已准备" : "数据待补充"}</small>
    </button>
  `).join("");

  bookSelector.querySelectorAll(".book-option:not(:disabled)").forEach((button) => {
    button.addEventListener("click", () => {
      selectedBookId = button.dataset.bookId;
      renderBookSelector();
    });
  });

  const selectedBook = bookCatalog.find((book) => book.id === selectedBookId);
  bookSelectionStatus.textContent = `当前选择：${selectedBook.label}（${selectedBook.dataFile}）`;
}

startLearningButton.addEventListener("click", () => {
  window.location.href = `index.html?book=${encodeURIComponent(selectedBookId)}`;
});

renderBookSelector();
