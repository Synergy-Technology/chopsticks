import { chain, setupAll, setupApi } from './helper'
import { decodeKey, decodeKeyValue } from '../src/utils/decoder'
import { describe, expect, it } from 'vitest'

setupApi({
  endpoint: 'wss://acala-rpc-1.aca-api.network',
})

const SYSTEM_ACCOUNT =
  '0x26aa394eea5630e07c48ae0c9558cef7b99d880ec681799c0cf30e8886371da9de1e86a9a8c739864cf3cc5ec2bea59fd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d'
const TOKENS_ACCOUNTS =
  '0x99971b5749ac43e0235e41b0d37869188ee7418a6531173d60d1f6a82d8f4d51de1e86a9a8c739864cf3cc5ec2bea59fd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d01a12dfa1fa4ab9a0000'

describe('decoder', () => {
  it('decode keys', async () => {
    const { storage, decodedKey } = await decodeKey(chain.head, SYSTEM_ACCOUNT)
    expect(storage?.section).eq('system')
    expect(storage?.method).eq('account')
    expect(decodedKey?.args.map((x) => x.toHuman())).contains('25fqepuLngYL2DK9ApTejNzqPadUUZ9ALYyKWX2jyvEiuZLa')
  })

  it('decode key-value', async () => {
    const meta = await chain.head.meta
    const data = { data: { free: 10000000000 } }
    const value = meta.registry.createType('AccountInfo', data)
    expect(await decodeKeyValue(chain.head, SYSTEM_ACCOUNT, value.toHex())).toMatchSnapshot()

    const ormlAccountData = meta.registry.createType('AccountData', data.data)
    expect(await decodeKeyValue(chain.head, TOKENS_ACCOUNTS, ormlAccountData.toHex())).toMatchSnapshot()
    await new Promise((resolve) => setTimeout(resolve, 1000))
  })

  it('works with multiple chains', async () => {
    const { setup, teardownAll } = await setupAll({ endpoint: 'wss://rpc.polkadot.io' })
    const { chain } = await setup()

    const meta = await chain.head.meta
    const data = { data: { free: 10000000000 } }
    const value = meta.registry.createType('AccountInfo', data)
    expect(await decodeKeyValue(chain.head, SYSTEM_ACCOUNT, value.toHex())).toMatchSnapshot()

    await teardownAll()
  })
})
