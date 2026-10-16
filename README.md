# QR Platba CZ – Generátor pro české banky

Jednoduché, rychlé a 100% lokální rozšíření pro prohlížeč Google Chrome (a další prohlížeče založené na jádru Chromium, jako je Edge nebo Brave), které automaticky vytvoří český platební QR kód (formát SPAYD) z textu faktury nebo ručně zadaných údajů.

## ✨ Hlavní funkce
* **Chytré čtení z faktur (Ctrl+V):** Stačí zkopírovat text z PDF faktury, Wordu nebo webu a vložit ho do rozšíření. Algoritmus sám rozpozná číslo účtu (nebo IBAN), částku k úhradě a variabilní symbol.
* **Integrace do pravého tlačítka myši:** Označte text na webové stránce, klikněte pravým tlačítkem a zvolte *"Vytvořit platbu QR kódem"*.
* **Automatický převod na IBAN:** Zadáte-li klasické české číslo účtu (např. `123456789/0800`), rozšíření ho automaticky podle standardu ČNB přepočítá na platný IBAN.
* **100% soukromí a offline chod:** Žádná data se nikam neodesílají. Veškeré zpracování textu i generování QR kódu probíhá výhradně lokálně přímo ve vašem prohlížeči.

## 🚀 Jak rozšíření používat
1. Otevřete fakturu (v prohlížeči, v Adobe Readeru apod.) a zkopírujte z ní platební údaje (`Ctrl+C`), případně vyberte celou stránku (`Ctrl+A` a `Ctrl+C`).
2. Klikněte na ikonu rozšíření **QR Platba CZ** v liště prohlížeče.
3. Vložte text do horního pole pomocí `Ctrl+V` (nebo vyplňte údaje ručně).
4. Klikněte na **Vygenerovat QR platbu** a načtěte kód v mobilní aplikaci vaší banky.

---

## 🔒 Zásady ochrany osobních údajů (Privacy Policy)
Toto rozšíření plně respektuje vaše soukromí:
* **Žádný sběr dat:** Rozšíření neshromažďuje, neukládá na žádné vzdálené servery ani neodesílá třetím stranám žádné osobní, finanční ani analytické údaje.
* **Lokální zpracování:** Veškerá analýza vloženého textu a generování QR kódů probíhá na zařízení uživatele (client-side).
* **Využití oprávnění:** 
  * `storage` (`chrome.storage.local`): Slouží výhradně k dočasnému uložení rozepsaného formuláře ve vašem prohlížeči, aby se údaje nesmazaly při nechtěném zavření vyskakovacího okna. Kliknutím na tlačítko *"Vymazat fakturu"* se tato lokální paměť okamžitě vyčistí.
  * `contextMenus`: Slouží k přidání volby *"Vytvořit platbu QR kódem"* do kontextové nabídky po kliknutí pravým tlačítkem myši na označený text.

---

## ⚠️ Vyloučení odpovědnosti (Disclaimer)
Toto rozšíření je poskytováno zdarma jako pomocný nástroj pro usnadnění vyplňování platebních příkazů. 
* Automatické rozpoznávání textu z faktur (zejména z nestandardně formátovaných PDF dokumentů) má pouze informativní charakter a nemusí být vždy 100% přesné.
* **Uživatel je povinen si před každým potvrzením platby ve své mobilní bankovní aplikaci pečlivě zkontrolovat veškeré platební údaje (zejména číslo účtu/IBAN, celkovou částku a variabilní symbol).**
* Autor rozšíření nenese žádnou právní ani finanční odpovědnost za chybně odeslané platby, finanční ztráty či jiné škody vzniklé v důsledku používání tohoto nástroje.

---

## ❤️ Podpora tvůrce
Pokud vám rozšíření šetří čas a nervy při placení faktur, můžete vývoj podpořit zde:
👉 **[Ko-fi.com/tomrusher](https://ko-fi.com/tomrusher)**

## 📄 Licence a použité knihovny
Projekt je šířen pod licencí **MIT License** – software je poskytován "tak jak je" (AS IS), bez záruky jakéhokoli druhu.
* Pro vykreslování QR kódů je využita open-source knihovna [QRCode.js](https://github.com/davidshimjs/qrcodejs) (Copyright (c) 2012 davidshimjs, licencováno pod MIT License).
