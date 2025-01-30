import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';

const projects = await fetchJSON('./lib/projects.json');
const latestProjects = projects.slice(0, 3);

const projectsContainer = document.querySelector('.projects');

renderProjects(latestProjects, projectsContainer, 'h2');

const githubData = await fetchGitHubData('machurch');

const profileStats = document.querySelector('#profile-stats');

if (profileStats) {
    profileStats.innerHTML = `
        <h2>GitHub Stats</h2>
         <dl class="github-stats">
            <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
            <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
            <dt>Followers:</dt><dd>${githubData.followers}</dd>
            <dt>Following:</dt><dd>${githubData.following}</dd>
        </dl>

        <style>
            .github-stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
        }
  
        .github-stats dt {
        grid-row: 1;
        font-weight: bold;
        }
  
        .github-stats dd {
        grid-row: 2;
        margin: 0;
        }
        </style>
     `;
  }