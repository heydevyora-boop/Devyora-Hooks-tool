import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import { env } from '../config/env.js'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12 // recommended IV length for GCM

/**
 * AES-256-GCM encryption for secrets at rest — currently only Instagram
 * OAuth tokens (Chunk 2 blueprint §9: "tokens stored encrypted at rest,
 * never logged"). Output is `iv:authTag:ciphertext`, all hex, so it's a
 * single text column with no extra schema needed.
 */
export function encryptSecret(plaintext: string): string {
  const key = Buffer.from(env.ENCRYPTION_KEY, 'hex')
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

export function decryptSecret(ciphertext: string): string {
  const [ivHex, authTagHex, encryptedHex] = ciphertext.split(':')
  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error('Malformed ciphertext')
  }

  const key = Buffer.from(env.ENCRYPTION_KEY, 'hex')
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'))
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))

  const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedHex, 'hex')), decipher.final()])
  return decrypted.toString('utf8')
}
