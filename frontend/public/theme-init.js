// Applies the saved theme before first paint to avoid a light/dark flash.
try {
    var pref = localStorage.getItem("theme") || "system";
    var dark = pref === "dark" || (pref === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.theme = dark ? "unlinked-dark" : "unlinked";
} catch {
    document.documentElement.dataset.theme = "unlinked";
}
