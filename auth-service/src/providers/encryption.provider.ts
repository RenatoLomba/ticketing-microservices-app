import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

import { Injectable } from '@nestjs/common'

@Injectable()
export class EncryptionProvider {
  private key = randomBytes(32)
  private algorithm = 'aes-256-cbc'

  crypt(textToEncrypt: string) {
    const iv = randomBytes(16)

    const cipher = createCipheriv(this.algorithm, Buffer.from(this.key), iv)

    let encrypted = cipher.update(textToEncrypt)

    encrypted = Buffer.concat([encrypted, cipher.final()])

    const encryptedText = `${iv.toString('hex')}.${encrypted.toString('hex')}`

    return encryptedText
  }

  decrypt(encryptedText: string) {
    const [textIv, textEncryptedData] = encryptedText.split('.')

    const iv = Buffer.from(textIv, 'hex')

    const encryptedTextBuffer = Buffer.from(textEncryptedData, 'hex')

    const decipher = createDecipheriv(this.algorithm, Buffer.from(this.key), iv)

    let decrypted = decipher.update(encryptedTextBuffer)

    decrypted = Buffer.concat([decrypted, decipher.final()])

    return decrypted.toString()
  }
}
