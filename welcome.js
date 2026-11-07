const bookSelector = document.getElementById("book-selector");
const bookSelectionStatus = document.getElementById("book-selection-status");
const startLearningButton = document.getElementById("start-learning-button");
const bookCatalog = Object.values(window.HANZI_BOOK_CATALOG || {});

let selectedBookId = bookCatalog.find((book) => book.available && !book.legacy)?.id || "";

function renderBookOptions(target, books) {
  if (!target) return;
  target.innerHTML = books.map((book) => `
    <button class="book-option ${book.id === selectedBookId ? "active" : ""}" type="button" data-book-id="${book.id}" ${book.available ? "" : "disabled"}>
      <span>${book.label}</span>
      <small>${book.available ? (book.characterCount ? `${book.characterCount} 个生字` : "已准备") : "待补充"}</small>
    </button>
  `).join("");

  target.querySelectorAll(".book-option:not(:disabled)").forEach((button) => {
    button.addEventListener("click", () => {
      selectedBookId = button.dataset.bookId;
      renderBookSelector();
    });
  });
}

function renderBookSelector() {
  renderBookOptions(bookSelector, bookCatalog.filter((book) => !book.legacy));
  const selectedBook = bookCatalog.find((book) => book.id === selectedBookId);
  bookSelectionStatus.textContent = selectedBook
    ? `当前选择：${selectedBook.label}`
    : "暂无可用教材数据。";
  startLearningButton.disabled = !selectedBook;
}

startLearningButton.addEventListener("click", () => {
  if (selectedBookId) window.location.href = `index.html?book=${encodeURIComponent(selectedBookId)}`;
});

renderBookSelector();
