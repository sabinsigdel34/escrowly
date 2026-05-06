export function cn(...inputs) {
  return inputs
    .flatMap((item) => {
      if (!item) return [];
      if (typeof item === "string") return [item];
      if (Array.isArray(item)) return item.filter(Boolean);
      if (typeof item === "object") {
        return Object.entries(item)
          .filter(([, value]) => Boolean(value))
          .map(([key]) => key);
      }
      return [];
    })
    .join(" ");
}
