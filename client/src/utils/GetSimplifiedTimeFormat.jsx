function GetSimplifiedTimeFormat(date) {
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };
  const formattedDate = new Date(date).toLocaleString("en-US", options);
  return formattedDate
    .replace(", ", " - ")
    .replace(/:[0-9]{2}(am|pm)/i, "$1")
    .toUpperCase();
}

export default GetSimplifiedTimeFormat;
