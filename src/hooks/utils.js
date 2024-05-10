export function getTokenFromLocalStorage() {
  return localStorage.getItem("token");
}

export function centsToDollars(cents) {
  const dollars = cents / 100;
  return "$" + dollars.toFixed(2);
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { month: "long", day: "numeric", year: "numeric" };
  return date.toLocaleDateString("en-US", options);
}
