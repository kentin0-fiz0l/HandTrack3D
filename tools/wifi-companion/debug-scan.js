#!/usr/bin/env node

/**
 * Debug WiFi Scan
 * More verbose scanning with error details
 */

import wifi from 'node-wifi';

console.log('Initializing WiFi scanner...');
wifi.init({ iface: null });

console.log('Attempting scan...');

wifi.scan()
  .then((networks) => {
    console.log(`Success! Found ${networks.length} networks`);
    console.log(JSON.stringify(networks, null, 2));
  })
  .catch((error) => {
    console.error('Scan failed with error:');
    console.error(error);
    console.error('\nError details:');
    console.error('  Message:', error.message);
    console.error('  Stack:', error.stack);
  });
