const searchService = (() => {
  const search = async (keyword) => {
    const response = await fetch(`/api/search?keyword=${encodeURIComponent(keyword)}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Fetch error");
    }

    return await response.json();
  };

  return { search };
})();
