#! /usr/bin/env bun
import { parseArgs } from "util";
import { Table } from 'console-table-printer';
import { getFiles } from "./readDirectory";


const { values } = parseArgs({
    args: Bun.argv,
    options: {
        path: {
            type: 'string'
        },
    },
    strict: true,
    allowPositionals: true,
});


if (values.path) {

    const table = new Table({
        title: 'Analytics result',
        columns: [
            { name: 'name', title: 'Name', alignment: 'left', maxLen: 50 },
            { name: 'type', title: 'Type', alignment: 'right' },
            { name: 'size', title: 'Size' },
        ],
    });
    getFiles(values.path).then(result => {
        if (result) {      
            result.forEach(r => {
                table.addRow({name: r.name, type: r.type, size: `${r.size/1000} Kb`});
            });
            table.printTable();
        }
    });
}

