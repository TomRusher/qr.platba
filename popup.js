document.addEventListener("DOMContentLoaded", () => {
  const inputs = {
    account: document.getElementById("account"),
    amount: document.getElementById("amount"),
    vs: document.getElementById("vs"),
    message: document.getElementById("message")
  };
  const pasteArea = document.getElementById("paste-area");

  const saveFormData = () => {
    chrome.storage.local.set({
      savedFormData: {
        account: inputs.account.value,
        amount: inputs.amount.value,
        vs: inputs.vs.value,
        message: inputs.message.value
      }
    });
  };

  Object.values(inputs).forEach(input => {
    input.addEventListener("input", saveFormData);
  });

  const highlightInput = (element) => {
      element.style.transition = "all 0.4s ease";
      element.style.backgroundColor = "#dcfce7";
      element.style.borderColor = "#10b981";
      setTimeout(() => {
          element.style.backgroundColor = "#ffffff";
          element.style.borderColor = "#cbd5e1";
      }, 1500);
  };

  const showPasteFeedback = (success) => {
      if (!pasteArea) return;
      pasteArea.value = ""; 
      
      if (success) {
          pasteArea.placeholder = "✓ Úspěšně doplněno!";
          pasteArea.style.borderColor = "#10b981";
          pasteArea.style.backgroundColor = "#f0fdf4";
      } else {
          pasteArea.placeholder = "⚠️ Text se nepodařilo rozpoznat.";
          pasteArea.style.borderColor = "#f59e0b";
          pasteArea.style.backgroundColor = "#fffbeb";
      }
      
      setTimeout(() => {
          pasteArea.placeholder = "Sem vložte text z faktury (Ctrl+V)...";
          pasteArea.style.borderColor = "#cbd5e1";
          pasteArea.style.backgroundColor = "#ffffff";
      }, 2000);
  };

  const parseTextAndFill = (rawText) => {
      let wasMatched = false;
      
      const cleanNormalizedText = rawText.replace(/\|/g, ' ').replace(/\s+/g, ' ');
      const cleanText = rawText.replace(/\s+/g, '');
      
      const previousValues = {
          account: inputs.account.value,
          amount: inputs.amount.value,
          vs: inputs.vs.value,
          message: inputs.message.value
      };

      // --- A) HLEDÁNÍ ÚČTU NEBO IBANU ---
      const czSkIbanMatch = cleanNormalizedText.match(/(?:CZ|SK)[0-9]{2}(?:[\s]*[0-9]){20}/i) || rawText.match(/(?:CZ|SK)[0-9]{2}(?:[\s]*[0-9]){20}/i);
      const accountMatch = cleanNormalizedText.match(/([0-9\-]{2,16}\/[0-9]{4})/);
      
      if (czSkIbanMatch) {
        inputs.account.value = czSkIbanMatch[0].replace(/\s+/g, '').toUpperCase();
        wasMatched = true;
      } else if (accountMatch) {
        inputs.account.value = accountMatch[1];
        wasMatched = true;
      } else {
         const ibanKeywordMatch = cleanNormalizedText.match(/IBAN[\s:]*([A-Za-z]{2}[0-9]{2}[A-Za-z0-9\s]{11,30})/i);
         if (ibanKeywordMatch) {
             const rawIban = ibanKeywordMatch[1].split(/[a-z]/)[0];
             inputs.account.value = rawIban.replace(/\s+/g, '').toUpperCase();
             wasMatched = true;
         }
      }

      // --- B) HLEDÁNÍ VARIABILNÍHO SYMBOLU ---
      const vsKeywordMatch = cleanNormalizedText.match(/(?:VS|Variabilní symbol|Variabilný symbol|Var\.\s*sym\.)[\s.:-]*([0-9]{4,10})/i);
      if (vsKeywordMatch) {
         inputs.vs.value = vsKeywordMatch[1];
         wasMatched = true;
      } else if (/^[0-9]{4,10}$/.test(cleanText)) {
         inputs.vs.value = cleanText;
         wasMatched = true;
      }

      // --- C) HLEDÁNÍ ČÁSTKY (Nejchytřejší logika: Zkombinuje měnu a max hodnotu) ---
      let maxVal = 0;
      let maxStr = null;

      // KROK 1: Nejprve hledáme POUZE čísla, za kterými je MĚNA (Kč, CZK, €, EUR).
      // Tím totálně odfiltrujeme slepené sloupce a řádky zboží v tabulkách (jako např. DPH 12 a cena 293.75).
      const currencyRegex = /([0-9]{1,3}(?:[ \u00A0]*[0-9]{3})*(?:[.,][0-9]{1,2})?)\s*(?:Kč|CZK|EUR|€)/gi;
      let matchCurrency;
      while ((matchCurrency = currencyRegex.exec(cleanNormalizedText)) !== null) {
          let val = parseFloat(matchCurrency[1].replace(/\s+/g, '').replace(',', '.'));
          if (!isNaN(val) && val > maxVal) {
              maxVal = val;
              maxStr = matchCurrency[1].replace(/\s+/g, '').replace('.', ',');
          }
      }

      // KROK 2: Pokud se v textu vůbec nenašlo slovo "Kč" (jako u naší 1. faktury), vezmeme max desetinné číslo z RAW textu.
      // Použijeme RAW text, abychom nezničili případné tabelátory a předešli spojování sloupců.
      if (maxVal === 0) {
          const decimalRegex = /(?:^|[^\d.,])([0-9]{1,3}(?:[ \u00A0]?[0-9]{3})*[.,][0-9]{2})(?:[^\d.,]|$)/g;
          let matchDecimal;
          while ((matchDecimal = decimalRegex.exec(rawText)) !== null) {
              let val = parseFloat(matchDecimal[1].replace(/\s+/g, '').replace(',', '.'));
              if (!isNaN(val) && val > maxVal) {
                  maxVal = val;
                  maxStr = matchDecimal[1].replace(/\s+/g, '').replace('.', ',');
              }
          }
      }

      // KROK 3: Konečný fallback přes silná klíčová slova (pro jistotu).
      if (maxVal === 0) {
          const strictKeywordRegex = /(?:K zaplacení|Celkem k úhradě|Celková cena vč\. DPH|K úhradě|Celkem s DPH)[\s:\-|]*([0-9]{1,3}(?:[\s]*[0-9]{3})*(?:[.,][0-9]{1,2})?)(?!\d)/i;
          const kwMatch = cleanNormalizedText.match(strictKeywordRegex);
          if (kwMatch) {
              maxStr = kwMatch[1].replace(/\s+/g, '').replace('.', ',');
          }
      }

      if (maxStr) {
          inputs.amount.value = maxStr;
          wasMatched = true;
      }

      // --- D) ZPRÁVA PRO PŘÍJEMCE ---
      if (!wasMatched && rawText.length > 0 && rawText.length < 50 && !/^[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{4}$/.test(cleanText)) {
         inputs.message.value = rawText;
         wasMatched = true; 
      }
      
      if (inputs.account.value !== previousValues.account) highlightInput(inputs.account);
      if (inputs.amount.value !== previousValues.amount) highlightInput(inputs.amount);
      if (inputs.vs.value !== previousValues.vs) highlightInput(inputs.vs);
      if (inputs.message.value !== previousValues.message) highlightInput(inputs.message);

      saveFormData(); 
      return wasMatched;
  };

  if (pasteArea) {
      pasteArea.addEventListener("paste", (e) => {
          e.preventDefault(); 
          const text = (e.clipboardData || window.clipboardData).getData('text');
          if (text) {
              const success = parseTextAndFill(text);
              showPasteFeedback(success);
          }
      });
  }

  chrome.storage.local.get(["savedFormData", "selectedPaymentText"], (result) => {
    if (result.savedFormData) {
      if (result.savedFormData.account) inputs.account.value = result.savedFormData.account;
      if (result.savedFormData.amount) inputs.amount.value = result.savedFormData.amount;
      if (result.savedFormData.vs) inputs.vs.value = result.savedFormData.vs;
      if (result.savedFormData.message) inputs.message.value = result.savedFormData.message;
    }

    if (result.selectedPaymentText) {
      parseTextAndFill(result.selectedPaymentText.trim());
      chrome.action.setBadgeText({ text: "" });
      chrome.storage.local.remove("selectedPaymentText");
    }
  });

  document.getElementById("generate-btn").addEventListener("click", () => {
    const account = inputs.account.value;
    let amount = inputs.amount.value;
    const vs = inputs.vs.value;
    const message = inputs.message.value;
    
    if (!account) {
      alert("Pro vygenerování kódu je potřeba zadat číslo účtu nebo IBAN.");
      return;
    }

    let iban = account.replace(/\s+/g, '').toUpperCase();
    
    if (iban.includes('/')) {
        const parts = iban.split('/');
        const accPart = parts[0];
        const bank = parts[1].padStart(4, '0');
        let prefix = "000000";
        let acc = accPart;
        
        if (accPart.includes('-')) {
            const p = accPart.split('-');
            prefix = p[0].padStart(6, '0');
            acc = p[1].padStart(10, '0');
        } else {
            acc = accPart.padStart(10, '0');
        }
        
        const numStr = bank + prefix + acc + "123500";
        let mod = 0;
        for (let i = 0; i < numStr.length; i++) {
            mod = (mod * 10 + parseInt(numStr[i])) % 97;
        }
        const check = (98 - mod).toString().padStart(2, '0');
        iban = `CZ${check}${bank}${prefix}${acc}`;
    }

    let spayd = `SPD*1.0*ACC:${iban}*`;
    
    if (amount) {
        amount = amount.replace(',', '.'); 
        spayd += `AM:${amount}*CC:CZK*`;
    }

    if (vs) {
        spayd += `X-VS:${vs}*`;
    }
    
    if (message) {
        const cleanMsg = message.substring(0, 60).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        spayd += `MSG:${encodeURIComponent(cleanMsg)}*`;
    }
    
    spayd = spayd.slice(0, -1); 

    const resultDiv = document.getElementById("qr-result");
    resultDiv.style.display = "flex";
    resultDiv.style.flexDirection = "column";
    resultDiv.style.alignItems = "center";
    resultDiv.innerHTML = ""; 

    new QRCode(resultDiv, {
        text: spayd,
        width: 180,
        height: 180,
        colorDark : "#0f172a",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.M
    });

    const clearBtn = document.createElement("button");
    clearBtn.id = "clear-btn";
    clearBtn.innerText = "Vymazat fakturu";
    clearBtn.style.cssText = "margin-top: 16px; background: transparent; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 6px; cursor: pointer; color: #475569; font-weight: 600; width: 100%; transition: background 0.2s;";
    
    clearBtn.onmouseover = () => clearBtn.style.background = "#f1f5f9";
    clearBtn.onmouseout = () => clearBtn.style.background = "transparent";
    
    clearBtn.onclick = () => {
      chrome.storage.local.remove(["savedFormData", "selectedPaymentText"], () => {
         window.location.reload();
      });
    };
    
    resultDiv.appendChild(clearBtn);

    setTimeout(() => {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth"
        });
    }, 100); 
  });
});