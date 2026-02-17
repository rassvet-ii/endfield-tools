// https://vike.dev/Head

import logoUrl from '../assets/logo.svg';

export function Head() {
  return (
    <>
      <link rel='icon' href={logoUrl} />
      <link rel='preconnect' href='https://fonts.googleapis.com' />
      <link rel='preconnect' href='https://fonts.gstatic.com' />
      <link
        rel='stylesheet'
        href='https://fonts.googleapis.com/css2?family=Bitcount+Grid+Double:wght@100..900&family=Google+Sans+Flex:opsz,wght@6..144,1..1000&family=Noto+Sans+JP:wght@100..900&family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap'
      />
    </>
  );
}
