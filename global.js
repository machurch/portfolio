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
  });

  if ("colorScheme" in localStorage) {
    const theme = localStorage.colorScheme;
    document.documentElement.style.setProperty('color-scheme', theme);
    select.value = theme;
  }

export async function fetchJSON(url = '../lib/projects.json') {
  try {
    // Fetch the JSON file from the given URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    const data = await response.json();
    return data;


  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}


export function renderProjects(project, containerElement, headingLevel = 'h2') {
  // Your code will go here
  containerElement.innerHTML = '';
  for (const p of project) {
    const article = document.createElement('article');
    article.innerHTML = `
    <h3>${p.title}</h3>
    <img src="${p.image}" alt="${p.title}" width="240" height="175">
    <h4>${p.year}</h4>
    <p>${p.description}</p>`;
    containerElement.appendChild(article);
  }
}

export async function fetchGitHubData(username) {
  // return statement here
  return fetchJSON(`https://api.github.com/users/${username}`);
}
