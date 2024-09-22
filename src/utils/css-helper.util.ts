export const truncateTextByLine = (line: number) => ({
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: line,
});
