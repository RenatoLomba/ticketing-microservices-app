export const compareVersions = (newVersion: number, oldVersion: number) => {
  if (newVersion === oldVersion) {
    throw new Error(`Versions are the same, so can't update`)
  }

  if (newVersion - 1 !== oldVersion) {
    throw new Error('Versions are not compatible')
  }

  return
}
