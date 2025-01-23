console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// let navLinks = $$("nav a")

// let currentLink = navLinks.find(
//   (a) => a.host === location.host && a.pathname === location.pathname
// );

// currentLink?.classList.add('current');

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/index.html', title: 'Projects' },
  {url: 'resume/index.html', title: 'Resume' },
  {url: 'contact/index.html', title: 'Contact'},
  {url: 'https://github.com/machurch', title: 'GitHub'}
];

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  const ARE_WE_HOME = document.documentElement.classList.contains('home');
  url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;
  let title = p.title;
  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;
  nav.append(a);
  if (a.host === location.host && a.pathname === location.pathname) {
    a.classList.add('current');
  }
  if (a.host != location.host) {
    a.target = '_blank'
  }
  }

  document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <label class="color-scheme">
      Theme:
      <select class = 'one'>
        <option value = "light dark"> Automatic </option> 
        <option value = "light"> Light Mode </option> 
        <option value = "dark"> Dark Mode </option> 
      </select>
    </label>`
  );

  let select = document.querySelector(".one")

  select.addEventListener('input', function (event) {
    console.log('color scheme changed to', event.target.value);
    document.documentElement.style.setProperty('color-scheme', event.target.value);

    localStorage.colorScheme = event.target.value;

    if (localStorage.colorScheme) {
      document.documentElement.style.setProperty('color-scheme', event.target.value);
      select.value = localStorage.colorScheme;
    }
  });

