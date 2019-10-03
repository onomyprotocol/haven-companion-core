import {
  HavenClient,
  HavenId,
  HavenIdAccount,
  HavenIdAccountLogin,
  HavenIdProvider
} from './interfaces'

/**
 * Core logic for NodeHaven Companion app
 *
 * NodeHaven Companion is used to manage logins and account data
 */
export class HavenCompanion {
  // tslint:disable-next-line: variable-name
  protected _havenId?: HavenId
  protected readonly provider: HavenIdProvider

  constructor(provider: HavenIdProvider) {
    this.provider = provider
  }

  /**
   * @returns the currently active Haven ID or null
   */
  public getHavenId(): HavenId | null {
    return this._havenId || null
  }

  /**
   * Load existing Haven ID if present
   */
  public async loadHavenId(): Promise<HavenId | null> {
    const havenId = await this.provider.loadHavenId()
    if (havenId) {
      this._havenId = havenId
    }
    return havenId
  }

  /**
   * Register a new Haven ID
   */
  public async createHavenId(): Promise<HavenId> {
    if (this._havenId) {
      throw new Error('Already have a HavenID')
    }
    this._havenId = await this.provider.createHavenId()
    return this._havenId
  }

  /**
   * Restore an existing Haven ID with recovery phrase
   *
   * @param recoveryPhrase The secret recovery phrase
   */
  public async restoreHavenId(recoveryPhrase: string): Promise<HavenId> {
    this._havenId = await this.provider.restoreHavenId(recoveryPhrase)
    return this._havenId
  }

  /**
   * Create a new account on the current Haven ID
   */
  public async createAccount({
    alias,
    fullName
  }: {
    alias: string
    fullName: string
  }): Promise<HavenIdAccount> {
    if (!this._havenId) {
      throw new Error('HavenID is required')
    }
    return this.provider.createAccount(this._havenId, { alias, fullName })
  }

  /**
   * Delete an account on the current Haven ID
   *
   * @param client
   * @param account
   */
  public async deleteAccount(account: HavenIdAccount): Promise<void> {
    await this.provider.deleteAccount(account)
  }

  /**
   * Login another client to an account on this Haven ID
   *
   * @param account The account to login the client as
   * @param client The client to authorize
   * @returns the resulting login info
   */
  public async loginClient(
    account: HavenIdAccount,
    client: HavenClient
  ): Promise<HavenIdAccountLogin> {
    if (!this._havenId) {
      throw new Error('HavenID is required')
    }
    const gun = await this.provider.getGun(account)
    await gun.authorizeDevice(client.clientId)
    return {
      account,
      beganAt: new Date(),
      client,
      endedAt: null
    }
  }

  /**
   * Cancel a previously authorized login
   *
   * @param login
   */
  public async revokeLogin(login: HavenIdAccountLogin): Promise<void> {
    const gun = await this.provider.getGun(login.account)
    await gun.deauthorizeDevice(login.client.clientId)
  }

  /**
   * Get a list of all accounts on the current Haven ID
   *
   * @returns an array of HavenIdAccount's
   */
  public async getAccounts(): Promise<readonly HavenIdAccount[]> {
    if (!this._havenId) {
      return []
    }
    return this.provider.getAccounts(this._havenId)
  }

  /**
   * Get a list of recent logins for a given account
   */
  public async getLoginHistory(
    // tslint:disable-next-line: variable-name
    _account: HavenIdAccount
  ): Promise<readonly HavenIdAccountLogin[]> {
    // TODO: Natural Rights needs updating to support this unless we only want to log these locally
    return []
  }
}
