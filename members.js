const _ALL_MEMBERS = [
  { label: "Andrew", backgroundColor: "#0000FF" },
  { label: "Arman", backgroundColor: "#33FF57" },
  { label: "Chris", backgroundColor: "#FFBF00" },
  { label: "Daniel", backgroundColor: "#00FFFF" },
  { label: "David", backgroundColor: "#DAF7A6" },
  { label: "Han", backgroundColor: "#FF5F00" },
  { label: "Kyle", backgroundColor: "#C70039" },
  { label: "Lauren", backgroundColor: "#900C3F" },
  { label: "Mark", backgroundColor: "#581845" },
  { label: "Sarah", backgroundColor: "#28B463" },
];

const ALL_MEMBERS = _ALL_MEMBERS
  .sort((a, b) => a.label.localeCompare(b.label))
  .map((attendee, index) => {
    return {
      ...attendee,
      hasBeenSelected: false,
      id: index,
    };
  });
