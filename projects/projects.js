import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');

renderProjects(projects, projectsContainer, 'h2');

const projectTitle = document.querySelector('.project-title')

const numProjects = projects.length

projectTitle.textContent = `${numProjects} Projects`

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
// let data = [
//     { value: 1, label: 'apples' },
//     { value: 2, label: 'oranges' },
//     { value: 3, label: 'mangos' },
//     { value: 4, label: 'pears' },
//     { value: 5, label: 'limes' },
//     { value: 5, label: 'cherries' },
//   ];
let rolledData = d3.rollups(
  projects,
  (v) => v.length,
  (d) => d.year,
);

let data = rolledData.map(([year, count]) => {
  return { value: count, label: year };
});

let sliceGenerator = d3.pie().value((d) => d.value);
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));
arcs.forEach(arc => {
    // TODO, fill in step for appending path to svg using D3
    d3.select('svg').append('path').attr('d', arc).attr('fill', 'red');
  })
  let colors = d3.scaleOrdinal(d3.schemeSet2);
  arcs.forEach((arc, idx) => {
    d3.select('svg')
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(idx)); // Fill in the attribute for fill color via indexing the colors variable
})

let legend = d3.select('.legend');
data.forEach((d, idx) => {
    legend.append('li')
          .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
          .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`) // set the inner html of <li>
          .attr('class', 'legend-item');
})

// Refactor all plotting into one function
function renderPieChart(projectsGiven) {
  // re-calculate rolled data
  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );
  // re-calculate data
  let newData = newRolledData.map(([year, count]) => {
    return { value: count, label: year }; // TODO
  });
  // re-calculate slice generator, arc data, arc, etc.
  let newSliceGenerator = d3.pie().value((d) => d.value);
  let newArcData = newSliceGenerator(newData);
  let arcGenerator = d3.arc().innerRadius(0).outerRadius(40);
  let newArcs = newArcData.map((d) => arcGenerator(d));
  // TODO: clear up paths and legends

  let newSVG = d3.select('svg'); 
  newSVG.selectAll('path').remove();
  // update paths and legends, refer to steps 1.4 and 2.2
  newSVG
  .selectAll('path')
  .data(newArcData)
  .enter()
  .append('path')
  .attr('d', arcGenerator)
  .attr('fill', (d, idx) => colors(idx)) // Use indexed color;
  let newLegend = d3.select('.legend');
  newLegend.selectAll('li').remove();
  newData.forEach((d, idx) => {
    newLegend.append('li')
          .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
          .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`) // set the inner html of <li>
          .attr('class', 'legend-item');
      })
}

// Call this function on page load
renderPieChart(projects);

let query = '';
let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
  // update query value
  query = event.target.value;
  // filter projects
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
  // render filtered projects
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
});

let selectedIndex = -1;

let svg = d3.select('svg');
  svg.selectAll('path').remove();
  arcs.forEach((arc, i) => {
    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(i))
      .on('click', () => {
        selectedIndex = selectedIndex === i ? -1 : i;
        console.log(selectedIndex)
        
        svg
          .selectAll('path')
          .attr('class', (_, idx) => (
            idx === selectedIndex ? 'pie-slice selected' : 'pie-slice'
            // TODO: filter idx to find correct pie slice and apply CSS from above
          ));

          legend
          .selectAll('li')
          .attr('class', (_, idx) => (
            idx === selectedIndex ? 'legend-item selected' : 'legend-item'
          // TODO: filter idx to find correct legend and apply CSS from above
          ));
          if (selectedIndex === -1) {
            renderProjects(projects, projectsContainer, 'h2');
          } else {
            // TODO: filter projects and project them onto webpage
            // Hint: `.label` might be useful
            let selectedYear = arcData[selectedIndex].data.label;
        
            // Filter projects by the selected year
            let filteredProjects = projects.filter((project) => project.year === selectedYear);
        
            // Render only the filtered projects
            renderProjects(filteredProjects, projectsContainer, 'h2');
          }
      });
  });


