const { getCollections } = require("../../util/database")

describe('getCollections', () => {
  it('returns inference and audio collections', () => {
    const mockColl = jest.fn()
    const mockClient = {
      db: jest.fn(() => ({
        collection: jest.fn(() => mockColl)
      }))
    }
    const collections = getCollections(mockClient)

    expect(collections).toMatchObject({
      inference: mockColl,
      audio: mockColl
    })
  })
})