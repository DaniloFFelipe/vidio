import { resolve } from 'node:path'

export function resolvePath(path: string) {
  if (path[0] === '/') {
    return resolve(process.cwd(), path.substring(1))
  }

  return resolve(process.cwd(), path)
}
