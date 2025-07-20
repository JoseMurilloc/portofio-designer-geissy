const hamburger = document.getElementById('menu-hamburger-button');
const app = document.querySelector('.app');

hamburger.onclick = () => {
  const headerElement = document.querySelector('.header');
  const drawer = document.getElementById("drawer-mobile");


  drawer.classList.toggle("change");
  headerElement.classList.toggle('no-blur-header');
  document.body.classList.toggle('no-scroll');
  
};

function setAppHeightMode () {
  if (isMobileUserAgent()) {
    app.style.height = '100vh';
  }
}

setAppHeightMode();