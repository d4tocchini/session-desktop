import { getPasswordHash } from '../../js/modules/data';

export async function hasPassword() {
  // @ts-ignore
  const hash = await getPasswordHash();

  return !!hash;
}
