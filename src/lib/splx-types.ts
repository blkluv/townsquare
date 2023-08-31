export interface SolarplexCommunity {
  id: string
  name: string
  description: string
  createdAt: string
  published: boolean
  // account handle
  uri: string | undefined
  image: string | undefined
  banner: string | undefined
}
