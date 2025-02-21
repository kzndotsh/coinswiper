export function shortenAddress(address: string, chars = 8): string {
  return `${address.substring(0, chars)}...`
}

