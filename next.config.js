/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*.webp',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*.png',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*.jpg',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },

  async redirects() {
    return [
      {
        source: '/treadmill-repair-dallas',
        destination: '/services/treadmill-repair-dallas',
        permanent: true,
      },
      {
        source: '/elliptical-repair-dallas',
        destination: '/services/elliptical-repair-dallas',
        permanent: true,
      },
      {
        source: '/exercise-bike-repair-dallas',
        destination: '/services/exercise-bike-repair-dallas',
        permanent: true,
      },
      {
        source: '/fitness-equipment-assembly-dallas',
        destination: '/services/fitness-equipment-assembly-dallas',
        permanent: true,
      },
      {
        source: '/home-gym-installation-dallas',
        destination: '/services/home-gym-installation-dallas',
        permanent: true,
      },
      {
        source: '/preventative-maintenance-dallas',
        destination: '/services/preventative-maintenance-dallas',
        permanent: true,
      },
      {
        source: '/strength-equipment-repair-dallas',
        destination: '/services/strength-equipment-repair-dallas',
        permanent: true,
      },
      {
        source: '/cable-machine-repair-dallas',
        destination: '/services/cable-machine-repair-dallas',
        permanent: true,
      },
      {
        source: '/commercial-gym-installation-dallas',
        destination: '/services/commercial-gym-installation-dallas',
        permanent: true,
      },
      {
        source: '/equipment-parts',
        destination: '/',
        permanent: true,
      },
      {
        source: '/basketball-hoops',
        destination: '/',
        permanent: true,
      },
      {
        source: '/bookings',
        destination: '/contact',
        permanent: true,
      },
      {
        source: '/chat-with-roman',
        destination: '/',
        permanent: true,
      },
      {
        source: '/owner-manuals',
        destination: '/manuals',
        permanent: true,
      },
      {
        source: '/manuals/brands/:brand',
        destination: '/brands/:brand',
        permanent: true,
      },
      {
        source: '/marcy-gym',
        destination: '/manuals',
        permanent: true,
      },
      {
        source: '/m/create-account',
        destination: '/',
        permanent: true,
      },
      {
        source: '/m/login',
        destination: '/',
        permanent: true,
      },
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig