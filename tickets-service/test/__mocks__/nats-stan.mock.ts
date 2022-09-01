export const natsStanMock = () => {
  return {
    publish: jest.fn(),
  }
}
