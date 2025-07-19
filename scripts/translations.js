const langElementButton = document.querySelector('.lang-button')
const switchElementButton = document.querySelector('.switch')
const toggleThumbElementDiv = document.querySelector('.toggle-thumb')

const Keys = {
  LANG: 'SELECT_LANG'
}


console.log({
  langElementButton
})

function moveSwitch (lang) {
  if (lang === 'pt') {
    toggleThumbElementDiv.style.left = 'auto';
    toggleThumbElementDiv.style.right = '4px';
  } else {
    toggleThumbElementDiv.style.left = '4px';
    toggleThumbElementDiv.style.right = 'auto';
  }
}

function changeLanguage(lang, callbackUpdateDownloadResumes) {
  /**
   * 📃 Armazena nova lang selecionada.
   */
  localStorage.setItem(Keys.LANG, lang);

  callbackUpdateDownloadResumes?.();

  const prevLanguageState = (() => {
    if (lang === 'pt') {
      return 'en'
    } 

    return 'pt'
  })()

  const classes = {
    pt: {
      switch: 'switch-pt',
      toggle: 'toggle-thumb-pt',
    },
    en: {
      switch: 'switch-en',
      toggle: 'toggle-thumb-en',
    }
  };

  const prevClasses = classes[prevLanguageState];
  const nextClasses = classes[lang];

  /**
   * 🎉 Mudas todos as tags com atributos de internacionalização
   */
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    element.textContent = translations[lang][key] || key;
  });


  /** 
   * 🎉 Toggle classes
   */
  toggleThumbElementDiv.classList.remove(prevClasses.toggle)
  switchElementButton.classList.remove(prevClasses.switch)
  
  toggleThumbElementDiv.classList.add(nextClasses.toggle)
  switchElementButton.classList.add(nextClasses.switch)

  moveSwitch(lang)
}

langElementButton.onclick = () => {
  const currentLanguage = localStorage.getItem(Keys.LANG);

  const browserLang = currentLanguage === 'pt' ? 'en' : 'pt';

  changeLanguage(browserLang, updateDownloadResumes);
}

function inicializeSelectFlag () {
  const LANGUAGE_GUARD_BROWSER = localStorage.getItem(Keys.LANG);

  switchElementButton.classList.add('switch-' + LANGUAGE_GUARD_BROWSER)
  toggleThumbElementDiv.classList.add('toggle-thumb-' + LANGUAGE_GUARD_BROWSER)

  moveSwitch(LANGUAGE_GUARD_BROWSER);
  changeLanguage(LANGUAGE_GUARD_BROWSER);
}

inicializeSelectFlag()