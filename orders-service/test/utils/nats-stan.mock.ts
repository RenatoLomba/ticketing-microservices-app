export const natsStanMock = () => {
  return {
    publish: jest.fn((_: string, __: string, callback: () => void) => {
      callback()
    }),
  }
}
