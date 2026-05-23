/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/treadmill-repair-dallas',
        destination: '/services/treadmill-repair-dallas',
        permanent: false,
      },
      {
        source: '/elliptical-repair-dallas',
        destination: '/services/elliptical-repair-dallas',
        permanent: false,
      },
      {
        source: '/exercise-bike-repair-dallas',
        destination: '/services/exercise-bike-repair-dallas',
        permanent: false,
      },
      {
        source: '/fitness-equipment-assembly-dallas',
        destination: '/services/fitness-equipment-assembly-dallas',
        permanent: false,
      },
      {
        source: '/home-gym-installation-dallas',
        destination: '/services/home-gym-installation-dallas',
        permanent: false,
      },
      {
        source: '/preventative-maintenance-dallas',
        destination: '/services/preventative-maintenance-dallas',
        permanent: false,
      },
      {
        source: '/strength-equipment-repair-dallas',
        destination: '/services/strength-equipment-repair-dallas',
        permanent: false,
      },
      {
        source: '/cable-machine-repair-dallas',
        destination: '/services/cable-machine-repair-dallas',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig