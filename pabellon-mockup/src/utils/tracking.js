export const track = (name, params = {}) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", name, params);
  }
  // Log para depurar (luego lo puedes quitar)
  console.log("[track]", name, params);
};