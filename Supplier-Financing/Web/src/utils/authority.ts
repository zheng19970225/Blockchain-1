// use localStorage to store the authority info, which might be sent from server in actual project.
export function getAuthority(str?: string) {
  const authorityString = typeof str === 'undefined' ? localStorage.getItem('authority') : str;
  let authority;
  try {
    authority = JSON.parse(authorityString!);
  } catch (e) {
    authority = authorityString;
  }
  if (typeof authority === 'string') {
    return [authority];
  }
  return authority || ['guest'];
}

export function setAuthority(authority: string | string[]): void {
  const proAuthority = typeof authority === 'string' ? [authority] : authority;
  return localStorage.setItem('authority', JSON.stringify(proAuthority));
}
