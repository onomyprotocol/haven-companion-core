import { NaturalRightsChainGun } from 'natural-rights-chaingun'

/**
 * A Specific HavenID implementation
 */
export interface HavenIdProvider {
  /**
   * Creates a new HavenId
   */
  readonly createHavenId: () => Promise<HavenId>

  /**
   * Restores a previously created HavenId from a recovery phrase
   */
  readonly restoreHavenId: (recoveryPhrase: string) => Promise<HavenId>

  /**
   * Load existing HavenId from storage
   */
  readonly loadHavenId: () => Promise<HavenId | null>

  /**
   * Create a new account on an existing HavenId
   *
   * @returns the newly created account
   */
  readonly createAccount: (
    havenId: HavenId,
    info: {
      alias: string
      fullName: string
    }
  ) => Promise<HavenIdAccount>

  /**
   * Irreversivly delete an account
   */
  readonly deleteAccount: (account: HavenIdAccount) => Promise<void>

  /**
   * Get a list of accounts associated with the given havenId
   */
  readonly getAccounts: (havenId: HavenId) => Promise<readonly HavenIdAccount[]>

  /**
   * Get an instance of NaturalRightsChainGun logged in to an account
   */
  readonly getGun: (account: HavenIdAccount) => Promise<NaturalRightsChainGun>
}

/**
 * A single Haven ID
 */
export interface HavenId {
  readonly id: string
}

/**
 * An account associated with a Haven ID
 */
export interface HavenIdAccount {
  readonly accountId: string
  readonly havenId: HavenId
  readonly alias: string
  readonly fullName: string
}

/**
 * Occurence of a login of an account on a specific client
 */
export interface HavenIdAccountLogin {
  readonly account: HavenIdAccount
  readonly client: HavenClient
  readonly beganAt: Date
  readonly endedAt: Date | null
}

/**
 * A specific client to the NodeHaven system
 *
 * Generally represents a specific app on a specific device
 */
export interface HavenClient {
  readonly name: string
  readonly clientId: string
}

/**
 * Any asymetric cryptographic key pair
 */
export interface KeyPair {
  readonly pubKey: string
  readonly privKey: string
}

/**
 * Specific implementation of Proxy Re-Encryption primitives for Natural Rights
 */
export interface PREPrimitivesInterface {
  readonly cryptKeyGen: () => Promise<KeyPair>

  readonly cryptTransformKeyGen: (
    fromKeyPair: KeyPair,
    toPubKey: string,
    signKeyPair: KeyPair
  ) => Promise<string>

  readonly signKeyGen: () => Promise<KeyPair>

  readonly signTransformKeyGen?: (
    fromKeyPair: KeyPair,
    toPubKey: string
  ) => Promise<string>

  readonly encrypt: (
    pubKey: string,
    plaintext: string,
    signKeyPair: KeyPair
  ) => Promise<string>

  readonly cryptTransform: (
    transformKey: string,
    ciphertext: string,
    signKeyPair: KeyPair
  ) => Promise<string>

  readonly decrypt: (keyPair: KeyPair, ciphertext: string) => Promise<string>

  readonly sign: (keyPair: KeyPair, text: string) => Promise<string>

  readonly signTransform?: (
    transformKey: string,
    signature: string
  ) => Promise<string>

  readonly verify: (
    pubKey: string,
    signature: string,
    text: string
  ) => Promise<boolean>
}
