export default function error(message, code = 1) {
  console.error('zns-escrow:', message);
  process.exit(code);
}
