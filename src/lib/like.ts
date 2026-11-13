/** Escapes LIKE wildcards so user input is matched literally, lowercased, wrapped in %…%. */
export const likePattern = (term: string) => `%${term.toLowerCase().replace(/[\\%_]/g, "\\$&")}%`;
