const MENU_ROOT_ID = "github-comment-inserter-root";

function normalizeItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
}

async function getItems() {
  const { menuItems } = await chrome.storage.sync.get({ menuItems: ["Hello World!"] });
  return normalizeItems(menuItems);
}

async function rebuildMenu() {
  await chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    id: MENU_ROOT_ID,
    title: "Insert comment text",
    contexts: ["editable"]
  });

  const items = await getItems();
  if (items.length === 0) {
    chrome.contextMenus.create({
      id: "empty",
      parentId: MENU_ROOT_ID,
      title: "No items (open settings)",
      enabled: false,
      contexts: ["editable"]
    });
    return;
  }

  items.forEach((text, index) => {
    chrome.contextMenus.create({
      id: `item-${index}`,
      parentId: MENU_ROOT_ID,
      title: text.length > 40 ? `${text.slice(0, 40)}…` : text,
      contexts: ["editable"]
    });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  rebuildMenu().catch(() => {});
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.menuItems) {
    rebuildMenu().catch(() => {});
  }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || !tab.id) return;
  if (!info.menuItemId.startsWith("item-")) return;

  const items = await getItems();
  const index = Number(info.menuItemId.replace("item-", ""));
  const text = items[index];
  if (!text) return;

  chrome.tabs.sendMessage(tab.id, { type: "INSERT_TEXT", text });
});
