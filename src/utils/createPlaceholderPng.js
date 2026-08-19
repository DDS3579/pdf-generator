const zlib = require("zlib");

const PNG_SIGNATURE = Buffer.from([
    137,
    80,
    78,
    71,
    13,
    10,
    26,
    10
]);

let crcTable;

function getCrcTable() {
    if (crcTable) {
        return crcTable;
    }

    crcTable = [];

    for (let n = 0; n < 256; n += 1) {
        let c = n;

        for (let k = 0; k < 8; k += 1) {
            if (c & 1) {
                c = 0xedb88320 ^ (c >>> 1);
            } else {
                c = c >>> 1;
            }
        }

        crcTable[n] = c >>> 0;
    }

    return crcTable;
}

function crc32(buffer) {
    const table = getCrcTable();

    let c = 0xffffffff;

    for (let i = 0; i < buffer.length; i += 1) {
        c = table[(c ^ buffer[i]) & 0xff] ^ (c >>> 8);
    }

    return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
    const typeBuffer = Buffer.from(type, "ascii");

    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);

    const crcInput = Buffer.concat([typeBuffer, data]);

    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(crcInput), 0);

    return Buffer.concat([
        length,
        typeBuffer,
        data,
        crc
    ]);
}

function createPlaceholderPng(width = 600, height = 400, options = {}) {
    const background = options.background || {
        r: 240,
        g: 240,
        b: 240
    };

    const border = options.border || {
        r: 0,
        g: 0,
        b: 0
    };

    const borderWidth = options.borderWidth ?? 3;

    const raw = Buffer.alloc(height * (width * 3 + 1));

    let offset = 0;

    for (let y = 0; y < height; y += 1) {
        raw[offset] = 0;
        offset += 1;

        for (let x = 0; x < width; x += 1) {
            const isBorder =
                x < borderWidth ||
                y < borderWidth ||
                x >= width - borderWidth ||
                y >= height - borderWidth;

            const color = isBorder
                ? border
                : background;

            raw[offset] = color.r;
            offset += 1;

            raw[offset] = color.g;
            offset += 1;

            raw[offset] = color.b;
            offset += 1;
        }
    }

    const ihdr = Buffer.alloc(13);

    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);

    ihdr[8] = 8;
    ihdr[9] = 2;
    ihdr[10] = 0;
    ihdr[11] = 0;
    ihdr[12] = 0;

    const idat = zlib.deflateSync(raw);

    return Buffer.concat([
        PNG_SIGNATURE,
        chunk("IHDR", ihdr),
        chunk("IDAT", idat),
        chunk("IEND", Buffer.alloc(0))
    ]);
}

module.exports = {
    createPlaceholderPng
};