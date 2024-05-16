#! /usr/bin/env bun
import { parseArgs } from "util";
import { Table } from 'console-table-printer';
import { getAndConvertFiles } from "./readDirectory";


const { values } = parseArgs({
    args: Bun.argv,
    options: {
        path: {
            type: 'string'
        },
        fileType: {
            type: 'string'
        }
    },
    strict: true,
    allowPositionals: true,
});

if (values.path) {

    const table = new Table({
        title: 'Conversion result',
        columns: [
            { name: 'name', title: 'Name', alignment: 'left', maxLen: 50 },
            { name: 'beforeType', title: 'Before type', alignment: 'right' },
            { name: 'afterType', title: 'After type', alignment: 'right' },
            { name: 'beforeSize', title: 'Before size' },
            { name: 'afterSize', title: 'After size' },
            { name: 'result', title: 'Result' },
            // { name: 'equality', title: 'Equality'}
        ],
        charLength: { "👍": 2 },
    });
    getAndConvertFiles(values.path).then(result => {
        if (result) {
            let savedData = 0;
            let totalSizeBeforeConvert = 0;
            let totalSizeAfterConvert = 0;
            result.forEach(r => {
                table.addRow({
                    name: r.name,
                    beforeType: r.beforeType,
                    afterType: r.afterType,
                    beforeSize: `${r.beforeSize / 1000} Kb`,
                    afterSize: `${r.afterSize / 1000} Kb`,
                    result: `${r.result/1000 > 0 ? '👍'+ 'Save ' + r.result/1000 + ' Kb' : 'Not saving'}`,
                    // equality: `${r.equality}`
                });
                totalSizeBeforeConvert += r.beforeSize / 1000;
                totalSizeAfterConvert += r.afterSize / 1000;
                savedData += r.result / 1000;
            });
            table.printTable();
            console.log('Total size before convert: %d Kb', totalSizeBeforeConvert);
            console.log('Total size after convert: %d Kb', totalSizeAfterConvert);
            console.log('Total saved data: %d Kb', savedData);
        }
    });
}

