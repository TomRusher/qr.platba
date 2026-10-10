// Funkce, která prohledá text na stránce a hledá platební údaje
function extractPaymentData() {
    const pageText = document.body.innerText;

    // Regulární výraz pro IBAN (český začíná na CZ a má 24 znaků)
    const ibanRegex = /CZ\d{2}\s*[\d\s]{20,26}/g;
    
    // Regulární výraz pro číslo účtu v klasickém tvaru (např. 1234567890/0300)
    const accountRegex = /\b\d{2,10}\/\d{4}\b/g;

    // Regulární výraz pro variabilní symbol (např. VS: 1234567892 nebo jen delší číslo u slova VS)
    const vsRegex = /(?:VS|variabilní symbol|v\.s\.)[:\s]*(\d{1,10})/gi;

    // Regulární výraz pro částku (hledá čísla následovaná Kč, CZK nebo EUR)
    const amountRegex = /(\d{1,3}(?:\s\d{3})*(?:[,\.]\d{1,2})?)\s*(?:Kč|CZK|EUR)/gi;

    // Vyhledání shod v textu stránky
    const ibans = pageText.match(ibanRegex) || [];
    const accounts = pageText.match(accountRegex) || [];
    
    // Pro variabilní symboly a částky vytáhneme konkrétní hodnoty přes cyklus
    const vsMatches = [];
    let match;
    while ((match = vsRegex.exec(pageText)) !== null) {
        vsMatches.push(match[1]);
    }

    const amounts = [];
    while ((match = amountRegex.exec(pageText)) !== null) {
        amounts.push(match[1].replace(/\s/g, '')); // odstranění mezer v číslech
    }

    // Sbalíme nalezená data do jednoho objektu
    const foundData = {
        ibans: ibans.map(i => i.replace(/\s/g, '')), // očistíme od mezer
        accounts: accounts,
        variableSymbols: vsMatches,
        amounts: amounts
    };

    return foundData;
}

// Nasloucháme zprávám z popup okna, které se zeptá na nalezená data
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getPaymentData") {
        const data = extractPaymentData();
        sendResponse(data);
    }
});