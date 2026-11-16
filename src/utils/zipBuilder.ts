/**
 * @license
 * SPDX-License-Identifier: MIT
 */

export interface ZipEntryInput {
  name: string;
  data: Uint8Array | string;
  executable?: boolean;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function getDosDateTime(date = new Date()): { time: number; dosDate: number } {
  const year = Math.max(1980, date.getFullYear());
  const time =
    ((date.getHours() & 0x1f) << 11) |
    ((date.getMinutes() & 0x3f) << 5) |
    ((date.getSeconds() >> 1) & 0x1f);
  const dosDate =
    (((year - 1980) & 0x7f) << 9) |
    (((date.getMonth() + 1) & 0x0f) << 5) |
    (date.getDate() & 0x1f);
  return { time, dosDate };
}

/**
 * Pure TypeScript PKZIP 2.0 Store (method 0) archive generator.
 * Preserves UNIX file permissions (including +x 0755 for macOS .command launchers)
 * and opens cleanly in macOS Archive Utility, Keka, unzip, and Windows Explorer.
 */
export function buildZipBlob(entries: ZipEntryInput[]): Blob {
  const encoder = new TextEncoder();
  const { time, dosDate } = getDosDateTime();

  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const cleanName = entry.name.replace(/^\/+/, '');
    const nameBytes = encoder.encode(cleanName);
    const dataBytes = typeof entry.data === 'string' ? encoder.encode(entry.data) : entry.data;
    const crc = crc32(dataBytes);
    const size = dataBytes.length;

    // Local File Header (30 bytes + filename)
    const lfh = new Uint8Array(30 + nameBytes.length);
    const lfv = new DataView(lfh.buffer);
    lfv.setUint32(0, 0x04034b50, true); // signature PK\x03\x04
    lfv.setUint16(4, 20, true);         // version needed to extract (2.0)
    lfv.setUint16(6, 0x0800, true);     // UTF-8 filename flag
    lfv.setUint16(8, 0, true);          // compression: Store (0)
    lfv.setUint16(10, time, true);
    lfv.setUint16(12, dosDate, true);
    lfv.setUint32(14, crc, true);
    lfv.setUint32(18, size, true);
    lfv.setUint32(22, size, true);
    lfv.setUint16(26, nameBytes.length, true);
    lfv.setUint16(28, 0, true);         // extra field length
    lfh.set(nameBytes, 30);

    localParts.push(lfh, dataBytes);

    // Central Directory Header (46 bytes + filename)
    const cdh = new Uint8Array(46 + nameBytes.length);
    const cdv = new DataView(cdh.buffer);
    cdv.setUint32(0, 0x02014b50, true); // signature PK\x01\x02
    cdv.setUint16(4, 0x031e, true);     // version made by: UNIX (3), zip 3.0
    cdv.setUint16(6, 20, true);         // version needed to extract
    cdv.setUint16(8, 0x0800, true);     // UTF-8 filename flag
    cdv.setUint16(10, 0, true);         // compression: Store (0)
    cdv.setUint16(12, time, true);
    cdv.setUint16(14, dosDate, true);
    cdv.setUint32(16, crc, true);
    cdv.setUint32(20, size, true);
    cdv.setUint32(24, size, true);
    cdv.setUint16(28, nameBytes.length, true);
    cdv.setUint16(30, 0, true);         // extra len
    cdv.setUint16(32, 0, true);         // comment len
    cdv.setUint16(34, 0, true);         // disk number start
    cdv.setUint16(36, 0, true);         // internal attrs
    const unixMode = entry.executable ? 0o100755 : 0o100644;
    cdv.setUint32(38, (unixMode << 16) >>> 0, true); // external attrs (UNIX permissions)
    cdv.setUint32(42, offset, true);    // relative offset of local header
    cdh.set(nameBytes, 46);

    centralParts.push(cdh);
    offset += lfh.length + dataBytes.length;
  }

  let centralSize = 0;
  for (const part of centralParts) centralSize += part.length;

  // End of Central Directory Record (22 bytes)
  const eocd = new Uint8Array(22);
  const eocdv = new DataView(eocd.buffer);
  eocdv.setUint32(0, 0x06054b50, true); // signature PK\x05\x06
  eocdv.setUint16(4, 0, true);
  eocdv.setUint16(6, 0, true);
  eocdv.setUint16(8, entries.length, true);
  eocdv.setUint16(10, entries.length, true);
  eocdv.setUint32(12, centralSize, true);
  eocdv.setUint32(16, offset, true);
  eocdv.setUint16(20, 0, true);

  const blobParts: BlobPart[] = [
    ...localParts.map((u) => new Uint8Array(u)),
    ...centralParts.map((u) => new Uint8Array(u)),
    new Uint8Array(eocd),
  ];
  return new Blob(blobParts, { type: 'application/zip' });
}

export function isValidZipBytes(buf: ArrayBuffer | Uint8Array): boolean {
  const b = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return b.length >= 22 && b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04;
}
