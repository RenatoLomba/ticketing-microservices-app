import * as bcrypt from 'bcrypt'

import { Injectable } from '@nestjs/common'

@Injectable()
export class HashProvider {
  async toHash(textToHash: string) {
    const salt = await bcrypt.genSalt()

    const hash = await bcrypt.hash(textToHash, salt)

    return hash
  }

  async compare(text: string, hash: string) {
    const isMatch = await bcrypt.compare(text, hash)

    return isMatch
  }
}
