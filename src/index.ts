import initLocalStorageProvider from './LocalStorageHavenIdProvider'
export { HavenCompanion as NodeHavenCompanion } from './HavenCompanion'
export * from './interfaces'

// TODO: uPort Provider
export const initProvider = initLocalStorageProvider
