function formatDate(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Monate sind von 0-11 in JavaScript
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

export { formatDate };
