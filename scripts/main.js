const hamburger = document.getElementById('menu-hamburger-button');

const drawer = document.getElementById("drawer-mobile");

hamburger.onclick = () => {
  drawer.classList.toggle("change");
  document.body.classList.toggle('no-scroll');
};

