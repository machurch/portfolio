import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let data = [];

let commits = [];

async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: Number(row.line), // or just +row.line
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),
    }));
    processCommits();
    displayStats();
    createScatterplot();
    brushSelector();
  }

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
});

function processCommits() {
    commits = d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        // Each 'lines' array contains all lines modified in this commit
        // All lines in a commit have the same author, date, etc.
        // So we can get this information from the first line
        let first = lines[0];

        let { author, date, time, timezone, datetime } = first;
  
        // What information should we return about this commit?
        let ret = {
          id: commit,
          url: 'https://github.com/machurch/portfolio/commit/' + commit,
          author,
          date,
          time,
          timezone,
          datetime,
          // e.g., 2:30 PM = 14.5
          hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
          totalLines: lines.length,
        };
        Object.defineProperty(ret, 'lines', {
            value: lines,
            // What other options do we need to set?
            // Hint: look up configurable, writable, and enumerable
          });

        return ret
      });
      console.log(commits);
  }

function displayStats() {
    // Process commits first
    processCommits();
  
    // Create the dl element
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');
  
    // Add total commits
    dl.append('dt').text('Total commits');
    dl.append('dd').text(commits.length);

    // Add total LOC
    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(data.length);
  
    // Add number of files
    dl.append('dt').text('Files');
    dl.append('dd').text(d3.group(data, d => d.file).size)

    // Add average file length
    const fileLengths = d3.rollups(
        data,
        (v) => d3.max(v, (v) => v.line),
        (d) => d.file
      );
    const averageFileLength = d3.mean(fileLengths, (d) => d[1]);

    dl.append('dt').text('Avg. File Length');
    dl.append('dd').text(averageFileLength);

    // Add time of day most work is done
    const workByPeriod = d3.rollups(
        data,
        (v) => v.length,
        (d) => new Date(d.datetime).toLocaleString('en', { dayPeriod: 'short' })
      );
    const maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];

    dl.append('dt').text('Most Common Time');
    dl.append('dd').text(maxPeriod);

    const weekdays = d3.rollups(
      data,
      (v) => v.length,
      (d) => new Date(d.datetime).toLocaleString('en', { weekday: 'long' })
    )

    const maxDay = d3.greatest(weekdays, (d) => d[1])?.[0];

    dl.append('dt').text('Most Common Day');
    dl.append('dd').text(maxDay);
  }

let xScale = '';
let yScale = '';

// Creating a scatter plot of commits across times
function createScatterplot() {
    const width = 1000;
    const height = 600;

    const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

    xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, width])
    .nice();

    yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

    const margin = { top: 10, right: 10, bottom: 30, left: 20 };

    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
      };
      
      // Update scales with new ranges
      xScale.range([usableArea.left, usableArea.right]);
      yScale.range([usableArea.bottom, usableArea.top]);

    // Add gridlines BEFORE the axes
    // const gridlines = svg
    //     .append('g')
    //     .attr('class', 'gridlines')
    //      .attr('transform', `translate(${usableArea.left}, 0)`);

    // add color to gridlines
    const gridlines = svg
        .append('g')
        .attr('class', 'gridlines')
       .attr('transform', `translate(${usableArea.left}, 0)`);

      // Get tick values for the yScale
      const yTicks = yScale.ticks();

      // Create a color scale from orange to blue
      const colorScale = d3.scaleSequential(d3.interpolateRgb("#415A77", "#FF9F1C"))
        .domain([d3.min(yTicks), d3.max(yTicks)]);

      // Apply axis to create gridlines (but do not duplicate)
      gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

      // Select existing gridline elements and apply color
      gridlines.selectAll('line')
        .attr('stroke', d => colorScale(d))  // Apply color scale
        .attr('stroke-width', 1)
        .attr('opacity', 0.7);






      // Create the axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3
        .axisLeft(yScale)
        .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

    // Add X axis
    svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

    // Add Y axis
    svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);

    const sortedCommits = d3.sort(commits, (d) => -d.totalLines)

    const dots = svg.append('g').attr('class', 'dots');

    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
    const rScale = d3
        .scaleSqrt() // Change only this line
        .domain([minLines, maxLines])
        .range([5, 30]);

    dots
    .selectAll('circle')
    .data(sortedCommits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => rScale(d.totalLines))
    .style('fill-opacity', 0.7)
    .attr('fill', '#80CED7')
    .on('mouseenter', (event, commit) => {
      updateTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mouseleave', () => {
      updateTooltipContent({});
      updateTooltipVisibility(false);
    });
}

//update tooltip content
function updateTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const time = document.getElementById('commit-time');
  const author = document.getElementById('commit-author');
  const line_edits = document.getElementById('commit-lines-edited');

  if (Object.keys(commit).length === 0) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', {
  dateStyle: 'full',
});
  time.textContent = commit.time;
  author.textContent = commit.author;
  line_edits.textContent = commit.totalLines;
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  if (isVisible) {
    tooltip.style.opacity = '1';
    tooltip.style.visibility = 'visible';
  } else {
    tooltip.style.opacity = '0';
    tooltip.style.visibility = 'hidden';
  }
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;
}

function brushSelector() {
  const svg = document.querySelector('svg');
  d3.select(svg).call(d3.brush());
  // Raise dots and everything after overlay
  d3.select(svg).selectAll('.dots, .overlay ~ *').raise();
  d3.select(svg).call(d3.brush().on('start brush end', brushed));
}

let brushSelection = null;

function brushed(event) {
  brushSelection = event.selection;
  updateSelection();
  updateSelectionCount();
  updateLanguageBreakdown();
}

function isCommitSelected(commit) {
  if (!brushSelection) {
    return false;
  }
  // TODO: return true if commit is within brushSelection
  // and false if not
  const [[x0, y0], [x1, y1]] = brushSelection; // Get brush selection bounds

  const commitX = xScale(commit.datetime); // Map commit datetime to x-scale
  const commitY = yScale(commit.hourFrac); // Map commit hourFrac to y-scale

  return commitX >= x0 && commitX <= x1 && commitY >= y0 && commitY <= y1;
}

function updateSelection() {
  // Update visual state of dots based on selection
  d3.selectAll('circle').classed('selected', (d) => isCommitSelected(d));
}

function updateSelectionCount() {
  const selectedCommits = brushSelection
    ? commits.filter(isCommitSelected)
    : [];

  const countElement = document.getElementById('selection-count');
  countElement.textContent = `${
    selectedCommits.length || 'No'
  } commits selected`;

  return selectedCommits;
}

function updateLanguageBreakdown() {
  const selectedCommits = brushSelection
    ? commits.filter(isCommitSelected)
    : [];
  const container = document.getElementById('language-breakdown');

  if (selectedCommits.length === 0) {
    container.innerHTML = '';
    return;
  }
  const requiredCommits = selectedCommits.length ? selectedCommits : commits;
  const lines = requiredCommits.flatMap((d) => d.lines);

  // Use d3.rollup to count lines per language
  const breakdown = d3.rollup(
    lines,
    (v) => v.length,
    (d) => d.type
  );

  // Update DOM with breakdown
  container.innerHTML = '';

  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format('.1~%')(proportion);

    container.innerHTML += `
            <dt>${language}</dt>
            <dd>${count} lines (${formatted})</dd>
        `;
  }

  return breakdown;
}

