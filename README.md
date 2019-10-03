# nodehaven-companion

NodeHaven Companion Core Application Logic

## Example Usage

    import { HavenCompanion, initProvider } from "nodehaven-companion-core"

    const companion = new HavenCompanion(
      initProvider({
        prePrimitives: PREPrimitives,
        nrUrl: "https://naturalrightsserver.example.com",
        gunUrl: "https://gundbserver.example.com"
      })
    )

    let havenId = await companion.loadHavenId()
    if (!havenId) {
      havenId = await companion.createHavenId()
    }

    console.log("accounts", await companion.getAccounts())

    const account = await companion.createAccount({
      alias: "exampleUser",
      fullName: "John Doe"
    })

    const login = await companion.loginClient(
      account,
      {
        name: "MacBook Pro Haven Social",
        clientId // Natural Rights deviceId
      }
    )

    console.log("login history", await companion.getLoginHistory(account))

    await companion.revokeLogin(login)

    await companion.deleteAccount(account)
