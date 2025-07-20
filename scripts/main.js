const hamburger = document.getElementById('menu-hamburger-button');
const app = document.querySelector('.app');

hamburger.onclick = () => {
  const drawer = document.getElementById("drawer-mobile");
  
  drawer.classList.toggle("change");
  document.body.classList.toggle('no-scroll');
};

function setAppHeightMode () {
  if (isMobileUserAgent()) {
    console.log({ app })
    app.style.height = '100vh';
  }
}

setAppHeightMode();