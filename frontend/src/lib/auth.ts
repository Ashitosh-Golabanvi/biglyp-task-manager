export function getToken() {
  return localStorage.getItem("token");
}

export function getUser() {
  const user =
    localStorage.getItem("user");

  return user
    ? JSON.parse(user)
    : null;
}

export function removeToken() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}