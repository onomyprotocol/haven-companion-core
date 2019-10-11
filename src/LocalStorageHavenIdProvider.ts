import { NaturalRightsChainGun } from '@natural-rights/chaingun'
import {
  HavenId,
  HavenIdAccount,
  HavenIdProvider,
  KeyPair,
  PREPrimitivesInterface
} from './interfaces'

/**
 * Example Haven ID Provider using LocalStorage
 *
 * This is a mock/example and not intended to be used in production
 */
export default function initLocalStorageProvider({
  prePrimitives,
  nrUrl,
  gunUrl
}: {
  readonly prePrimitives: PREPrimitivesInterface
  readonly nrUrl: string
  readonly gunUrl: string
}): HavenIdProvider {
  /**
   * Creates a new HavenId
   */
  async function createHavenId(): Promise<HavenId> {
    const id = Math.random()
      .toString(36)
      .slice(2)

    return {
      id
    }
  }

  /**
   * Restores a previously created HavenId from a recovery phrase
   */
  async function restoreHavenId(recoveryPhrase: string): Promise<HavenId> {
    return {
      id: recoveryPhrase
    }
  }

  /**
   * Load existing HavenId from storage
   */
  async function loadHavenId(): Promise<HavenId | null> {
    // TODO
    return null
  }

  /**
   * Create a new account on an existing HavenId
   *
   * @returns the newly created account
   */
  async function createAccount(
    havenId: HavenId,
    {
      alias,
      fullName
    }: {
      alias: string
      fullName: string
    }
  ): Promise<HavenIdAccount> {
    const gun = _newGun()

    const credentials = await gun.newSession()
    // TODO: Actual implementations should prove Haven ID here
    const accountId = gun.accountId()

    if (!accountId) {
      throw new Error('Account creation failed')
    }

    _writeHavenId(havenId, {
      ..._readHavenId(havenId),
      [accountId]: {
        alias,
        credentials,
        fullName
      }
    })

    return {
      accountId,
      alias,
      fullName,
      havenId
    }
  }

  /**
   * Irreversivly delete an account
   */
  async function deleteAccount(account: HavenIdAccount): Promise<void> {
    const data = _readHavenId(account.havenId)
    const modified = Object.keys(data).reduce(
      (res, key) =>
        key === account.accountId ? res : { ...res, [key]: data[key] },
      {}
    )
    _writeHavenId(account.havenId, modified)
  }

  /**
   * Get a list of accounts associated with the given havenId
   */
  async function getAccounts(
    havenId: HavenId
  ): Promise<readonly HavenIdAccount[]> {
    const data = _readHavenId(havenId)
    return Object.keys(data).map(accountId => ({
      accountId,
      alias: data[accountId].alias,
      fullName: data[accountId].fullName,
      havenId
    }))
  }

  /**
   * Get an instance of NaturalRightsChainGun logged in to an account
   */
  async function getGun(
    account: HavenIdAccount
  ): Promise<NaturalRightsChainGun> {
    const gun = _newGun()
    const [cryptKeyPair, signKeyPair] = _readCredentials(account)
    await gun.login(cryptKeyPair, signKeyPair)

    if (gun.accountId() !== account.accountId) {
      throw new Error('Login failed')
    }

    return gun
  }

  // Convenience method to encapsulate gun settings
  function _newGun(): NaturalRightsChainGun {
    return new NaturalRightsChainGun(prePrimitives, nrUrl, {
      peers: [gunUrl]
    })
  }

  return {
    createAccount,
    createHavenId,
    deleteAccount,
    getAccounts,
    getGun,
    loadHavenId,
    restoreHavenId
  }
}

// LocalStorage specific interaction functions

interface LocalStorageHavenIdData {
  readonly [accountId: string]: {
    alias: string
    fullName: string
    readonly credentials: {
      readonly clientCryptKeyPair: KeyPair
      readonly clientSignKeyPair: KeyPair
    }
  }
}

function _readHavenId(havenId: HavenId): LocalStorageHavenIdData {
  return JSON.parse(localStorage.getItem(`havenIds/${havenId.id}`) || '{}')
}

function _writeHavenId(havenId: HavenId, data: LocalStorageHavenIdData): void {
  localStorage.setItem(`havenIds/${havenId.id}`, JSON.stringify(data))
}

function _readCredentials(
  account: HavenIdAccount
): readonly [KeyPair, KeyPair] {
  const idData = _readHavenId(account.havenId)
  const accountData = idData[account.accountId]

  if (!accountData) {
    throw new Error('Account data missing')
  }

  return [
    accountData.credentials.clientCryptKeyPair,
    accountData.credentials.clientSignKeyPair
  ]
}
