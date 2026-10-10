chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "generate-qr-payment",
    title: "Vytvořit platbu QR kódem",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "generate-qr-payment" && info.selectionText) {
    // Uložíme označený text do lokální paměti prohlížeče
    chrome.storage.local.set({ selectedPaymentText: info.selectionText }, () => {
      // Nastavíme malý nápis "QR" na ikonce rozšíření, aby uživatel viděl, že data jsou připravena
      chrome.action.setBadgeText({ text: "QR" });
      chrome.action.setBadgeBackgroundColor({ color: "#22c55e" });
    });
  }
});