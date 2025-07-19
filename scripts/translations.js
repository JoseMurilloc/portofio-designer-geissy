const langElementButtons = document.querySelectorAll('.lang-button')
const switches = document.querySelectorAll('.switch')
const toggleThumbs = document.querySelectorAll('.toggle-thumb')


const switchElementButtons = [...switches]
const toggleThumbElementDivs = [...toggleThumbs]

const Keys = {
  LANG: 'SELECT_LANG'
}


function moveSwitch (lang) {
  console.log(lang)
  const positions = {
    pt: {
      left: 'auto',
      right: '4px'
    },
    en: {
      left: '4px',
      right: 'auto'
    }
  }[lang]

  toggleThumbElementDivs.forEach(div => {
    div.style.left = positions.left
    div.style.right = positions.right
  })
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
  toggleThumbElementDivs.map(toggleTumbler => toggleTumbler.classList.remove(prevClasses.toggle))  
  switchElementButtons.map(switchElementButton => switchElementButton.classList.remove(prevClasses.switch))
  
  toggleThumbElementDivs.map(toggleTumbler => toggleTumbler.classList.add(nextClasses.toggle))
  switchElementButtons.map(switchElementButton => switchElementButton.classList.add(nextClasses.switch))

  moveSwitch(lang)
}

langElementButtons.forEach(button => {
  button.onclick = () => {
    const currentLanguage = localStorage.getItem(Keys.LANG);
  
    const browserLang = currentLanguage === 'pt' ? 'en' : 'pt';
  
    changeLanguage(browserLang, updateDownloadResumes);
  }

})

function inicializeSelectFlag () {
  const LANGUAGE_GUARD_BROWSER = localStorage.getItem(Keys.LANG);

  switchElementButtons.map(switchElementButton => switchElementButton.classList.add('switch-' + LANGUAGE_GUARD_BROWSER))
  toggleThumbElementDivs.map(toggleTumbler => toggleTumbler.classList.add('toggle-thumb-' + LANGUAGE_GUARD_BROWSER))

  moveSwitch(LANGUAGE_GUARD_BROWSER);
  changeLanguage(LANGUAGE_GUARD_BROWSER);
}

inicializeSelectFlag()