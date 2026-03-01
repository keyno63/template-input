const list = document.getElementById("items-list");
const addButton = document.getElementById("add-item");
const saveButton = document.getElementById("save-items");
const status = document.getElementById("status");

function createItemRow(value = "") {
  const li = document.createElement("li");
  li.className = "item";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Text to insert";
  input.value = value;

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "ghost";
  remove.textContent = "Remove";
  remove.addEventListener("click", () => {
    li.remove();
  });

  li.appendChild(input);
  li.appendChild(remove);
  return li;
}

function readItemsFromUI() {
  const values = [];
  list.querySelectorAll("input").forEach((input) => {
    const trimmed = input.value.trim();
    if (trimmed.length > 0) values.push(trimmed);
  });
  return values;
}

function setStatus(message) {
  status.textContent = message;
  if (message) {
    window.setTimeout(() => {
      status.textContent = "";
    }, 2000);
  }
}

async function loadItems() {
  const { menuItems } = await chrome.storage.sync.get({ menuItems: ["Hello World!"] });
  list.innerHTML = "";
  menuItems.forEach((item) => list.appendChild(createItemRow(item)));
}

addButton.addEventListener("click", () => {
  list.appendChild(createItemRow(""));
});

saveButton.addEventListener("click", async () => {
  const items = readItemsFromUI();
  await chrome.storage.sync.set({ menuItems: items });
  setStatus("Saved");
});

loadItems().catch(() => setStatus("Failed to load settings"));
