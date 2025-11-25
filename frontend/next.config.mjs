/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'www.jumbo.cl',
      'www.lider.cl',
      'www.santaisabel.cl',
      'www.acuenta.cl',
      'www.unimarc.cl',
      'www.mayorista10.cl',
      'cugat.cl',
      'www.supertrebol.cl',
      'www.eltit.cl',
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  },
};

export default nextConfig;
