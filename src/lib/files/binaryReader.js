export async function binary_file_reader(filename, record="") {
    filename = `./data/files/${filename}.bin`;
    record = record.split(",");
    let res = Array.from(record, () => []); // Initialize an array of arrays for each field in the record
    let record_size = 0;
    for (let i = 0; i < record.length; i++) {
        record[i] = record[i].trim().toLowerCase();
        if (record[i] === "size_t") record_size += 8;
        else if (record[i] === "double") record_size += 8; // 64 bit double
        else if (record[i] === "bool") record_size += 1;
    }
    console.log(`Each record size: ${record_size} bytes`);
    try {
        let file = await fetch(filename);
        let buf = await file.arrayBuffer(); // get the binary data
        if (!buf) {
            throw new Error(`Failed to read binary file: ${filename}`);
        }

        let record_count = buf.byteLength / record_size;
        if (!Number.isInteger(record_count)) {
            throw new Error(`The file size (${buf.byteLength}) is not a multiple of record size (${record_size}).`);
        }
        console.log(`Total records found: ${record_count}`);
        let dataView = new DataView(buf);
        let offset = 0;
        for (let i = 0; i < record_count; i++) {
            for (let j = 0; j < record.length; j++) {
                if (record[j] === "size_t") {
                    res[j].push(Number(dataView.getBigUint64(offset, /* littleEndian= */ true))); // Read 64-bit unsigned integer (size_t)
                    offset += 8; // Move to the next field (8 bytes for size_t)
                }
                else if (record[j] === "double") {
                    res[j].push(dataView.getFloat64(offset, /* littleEndian= */ true)); // Read 64-bit float (double)
                    offset += 8; // Move to the next field (8 bytes for double)
                }
                else if (record[j] === "bool") {
                    res[j].push(!!dataView.getUint8(offset)); // Read 1 byte for boolean
                    offset += 1; // Move to the next field (1 byte for bool)
                }
            }
        }
        return res; // Return the array of parsed records
    
    } catch (e) {
        console.log(`Error: ${e}`);
    }
}



export async function binary_file_reader_obl_instant_cache(filename) {
    filename = `./data/files/${filename}`;
    let out = {
        count: 0,
        level_count: 0,
        bid_max: 0,
        ask_max: 0,
        bid_avg: 0,
        ask_avg: 0,

        t: [],
        b_start: [],
        b: [],
        a_start: [],
        a: [],
    };
    try {
        let file = await fetch(filename);
        let buf = await file.arrayBuffer(); // get the binary data
        if (!buf) {
            throw new Error(`Failed to read binary file: ${filename}`);
        }

        let dataView = new DataView(buf);
        let offset = 0;

        out.count = Number(dataView.getBigUint64(offset, /* littleEndian= */ true)); // Read 64-bit unsigned integer (size_t)
        offset += 8; // Move to the next field (8 bytes for size_t)
        out.level_count = Number(dataView.getBigUint64(offset, /* littleEndian= */ true)); // Read 64-bit unsigned integer (size_t)
        offset += 8; // Move to the next field (8 bytes for size_t)
        out.bid_max = dataView.getFloat64(offset, /* littleEndian= */ true); // Read 64-bit float (double)
        offset += 8; // Move to the next field (8 bytes for double)
        out.ask_max = dataView.getFloat64(offset, /* littleEndian= */ true); // Read 64-bit float (double)
        offset += 8; // Move to the next field (8 bytes for double)
        out.bid_avg = dataView.getFloat64(offset, /* littleEndian= */ true); // Read 64-bit float (double)
        offset += 8; // Move to the next field (8 bytes for double)
        out.ask_avg = dataView.getFloat64(offset, /* littleEndian= */ true); // Read 64-bit float (double)
        offset += 8; // Move to the next field (8 bytes for double)
        for (let i = 0; i < out.count; i++) {
            out.t.push(Number(dataView.getBigUint64(offset, /* littleEndian= */ true))); // Read 64-bit unsigned integer (size_t)
            offset += 8; // Move to the next field (8 bytes for size_t)
            let bb = [];
            let aa = [];
            out.b_start.push(Number(dataView.getBigUint64(offset, /* littleEndian= */ true))); // Read 64-bit unsigned integer (size_t)
            offset += 8; // Move to the next field (8 bytes for size_t)
            for (let j = 0; j < out.level_count; j++) {
                bb.push(dataView.getFloat64(offset, /* littleEndian= */ true)); // Read 64-bit float (double)
                offset += 8; // Move to the next field (8 bytes for double)
            }
            out.a_start.push(Number(dataView.getBigUint64(offset, /* littleEndian= */ true))); // Read 64-bit unsigned integer (size_t)
            offset += 8; // Move to the next field (8 bytes for size_t)
            for (let j = 0; j < out.level_count; j++) {
                aa.push(dataView.getFloat64(offset, /* littleEndian= */ true)); // Read 64-bit float (double)
                offset += 8; // Move to the next field (8 bytes for double)
            }
            out.b.push(bb);
            out.a.push(aa);
        }

        if (offset !== buf.byteLength) {
            throw new Error(`The file size (${buf.byteLength}) does not match the output size (${offset}).`);
        }

        return out;
    
    } catch (e) {
        console.log(`Error: ${e}`);
    }
}



export async function binary_file_reader_obl_snapshots(filename) {
    filename = `./data/files/${filename}`;
    let count = 0;
    let l1 = 0;
    let l2 = 0;
    let t = [];
    let bids = [];
    let asks = [];

    let file = await fetch(filename);
    let buf = await file.arrayBuffer(); // get the binary data
    if (!buf) {
        throw new Error(`Failed to read binary file: ${filename}`);
    }

    let dataView = new DataView(buf);
    let offset = 0;

    count = Number(dataView.getBigUint64(offset, /* littleEndian= */ true)); // Read 64-bit unsigned integer (size_t)
    offset += 8; // Move to the next field (8 bytes for size_t)
    l1 = Number(dataView.getBigUint64(offset, /* littleEndian= */ true)); // Read 64-bit unsigned integer (size_t)
    offset += 8; // Move to the next field (8 bytes for size_t)
    l2 = Number(dataView.getBigUint64(offset, /* littleEndian= */ true)); // Read 64-bit unsigned integer (size_t)
    offset += 8; // Move to the next field (8 bytes for size_t)

    for (let i = 0; i < count; i++) {
        let bb = [];
        let aa = [];
        t.push(Number(dataView.getBigUint64(offset, /* littleEndian= */ true))); // Read 64-bit unsigned integer (size_t)
        offset += 8; // Move to the next field (8 bytes for size_t)
        for (let l = 0; l < l2 - l1 + 1; l++) {
            bb.push(dataView.getFloat64(offset, /* littleEndian= */ true)); // Read 64-bit float (double)
            offset += 8; // Move to the next field (8 bytes for double)
        }
        for (let l = 0; l < l2 - l1 + 1; l++) {
            aa.push(dataView.getFloat64(offset, /* littleEndian= */ true)); // Read 64-bit float (double)
            offset += 8; // Move to the next field (8 bytes for double)
        }
        bids.push(bb);
        asks.push(aa);
    }

    return { l1, l2, t, bids, asks };
    
}
