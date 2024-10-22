const padding = { top: 20, right: 40, bottom: 0, left: 0 };
const w = 500 - padding.left - padding.right;
const h = 500 - padding.top - padding.bottom;
const r = Math.min(w, h) / 2;

let rotation = 0;
let oldrotation = 0;
let picked = null;
let oldpick = [];
const color = d3.scale.category20();

// Get member's display name or fallback to empty string
function getMemberDisplay(member) {
  return member.label || "";
}

// Get member's color or fallback to default d3 color
function getMemberColor(i) {
  return currentMembers[i]?.backgroundColor || color(i);
}

// Calculate text color based on background color for better contrast
function getTextColor(bgcolor) {
  const red = parseInt(bgcolor.substring(1, 3), 16);
  const green = parseInt(bgcolor.substring(3, 5), 16);
  const blue = parseInt(bgcolor.substring(5, 7), 16);
  const brightness = red * 0.299 + green * 0.587 + blue * 0.114;
  return brightness > 120 ? "#444444" : "#cccccc";
}

// Countdown timer function
function startCountdown() {
  if (timer) clearInterval(timer);
  timeLeft = 60;
  document.getElementById("timer").textContent = `Time left: ${timeLeft}s`;

  timer = setInterval(function () {
    timeLeft--;
    document.getElementById("timer").textContent = `Time left: ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      document.getElementById("timer").textContent = "Time's up!";
    } else if (timeLeft <= 10) {
      document.getElementById("timer").style.backgroundColor = "#EE4B2B";
    } else if (timeLeft <= 30) {
      document.getElementById("timer").style.backgroundColor = "#FFBF00";
    }
  }, 1000);
}

function app() {
  d3.select("#chart").select("svg").remove();

  const svg = d3
    .select("#chart")
    .append("svg")
    .data([currentMembers])
    .attr("width", w + padding.left + padding.right)
    .attr("height", h + padding.top + padding.bottom);

  const container = svg
    .append("g")
    .attr("class", "chartholder")
    .attr(
      "transform",
      "translate(" + (w / 2 + padding.left) + "," + (h / 2 + padding.top) + ")"
    );

  const vis = container.append("g");

  const pie = d3.layout
    .pie()
    .sort(null)
    .value(function () {
      return 1;
    });
  const arc = d3.svg.arc().outerRadius(r);

  const arcs = vis
    .selectAll("g.winner")
    .data(pie)
    .enter()
    .append("g")
    .attr("class", "winner");

  arcs
    .append("path")
    .attr("fill", function (d, i) {
      return getMemberColor(i);
    })
    .attr("d", arc);

  arcs
    .append("text")
    .attr("transform", function (d) {
      const angle = (d.startAngle + d.endAngle) / 2;
      return (
        "rotate(" +
        ((angle * 180) / Math.PI - 90) +
        ")translate(" +
        (r - 10) +
        ")"
      );
    })
    .style("fill", function (d, i) {
      return getTextColor(getMemberColor(i));
    })
    .attr("text-anchor", "end")
    .text(function (d, i) {
      return currentMembers[i].hasBeenSelected
        ? ""
        : getMemberDisplay(currentMembers[i]);
    });

  container.on("click", spin);

  svg
    .append("g")
    .attr(
      "transform",
      "translate(" +
        (w + padding.left + padding.right) +
        "," +
        (h / 2 + padding.top) +
        ")"
    )
    .append("path")
    .attr("d", "M-" + r * 0.15 + ",0L0," + r * 0.05 + "L0,-" + r * 0.05 + "Z")
    .style("fill", "black");

  container
    .append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 60)
    .style("fill", "white")
    .style("cursor", "pointer");

  container
    .append("text")
    .attr("x", 0)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .text("SPIN")
    .style("font-weight", "bold")
    .style("font-size", "30px")
    .style("fill", "#FF5F1F");

  function spin() {
    if (oldpick.length === currentMembers.length) return;
    if (currentMembers.length === 1 && currentMembers[0].label === "Empty") return;

    container.on("click", null);
    const ps = 360 / currentMembers.length;
    const rng = Math.floor(Math.random() * 1440 + 360);
    rotation = Math.round(rng / ps) * ps + 720;

    picked = Math.round(currentMembers.length - (rotation % 360) / ps);
    picked =
      picked >= currentMembers.length ? picked % currentMembers.length : picked;

    if (oldpick.includes(currentMembers[picked].id)) {
      spin();
      return;
    }

    oldpick.push(currentMembers[picked].id);
    rotation += 90 - Math.round(ps / 2);

    vis
      .transition()
      .duration(1000)
      .attrTween("transform", rotTween)
      .each("end", function () {
        onSpinEnd(picked);
      });

    startCountdown();
  }

  function rotTween() {
    const i = d3.interpolate(oldrotation % 360, rotation);
    return function (t) {
      return "rotate(" + i(t) + ")";
    };
  }

  function onSpinEnd(picked) {
    ALL_MEMBERS.forEach(function (member) {
      if (member.id === currentMembers[picked].id) {
        member.hasBeenSelected = true;
      }
    });
    currentMembers[picked].hasBeenSelected = true;
    d3.select(".winner:nth-child(" + (picked + 1) + ") text").style(
      "display",
      "none"
    );
    d3.select("#winner h1").text(getMemberDisplay(currentMembers[picked]));

    oldrotation = rotation;
    container.on("click", spin);
  }
}
