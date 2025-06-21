const generateSlug = (title) => {
  return (
    title
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "") +
    "-" +
    Date.now()
  );
};

export { generateSlug };
