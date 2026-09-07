export function getUserId(): string {
  let id = localStorage.getItem('fs_user_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('fs_user_id', id);
  }
  return id;
}

export function generateKeyPair(): { publicKey: string; privateKey: string } {
  const pub = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
  const priv = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
  return { publicKey: pub, privateKey: priv };
}
