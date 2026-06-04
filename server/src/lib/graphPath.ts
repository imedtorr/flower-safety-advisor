export function appendGraphPath(
  nodeName: string,
  update: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    ...update,
    graphPath: [nodeName],
  };
}
