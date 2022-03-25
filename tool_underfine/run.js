// Code by Arcuz / Darkness0710

const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { DefaultDeserializer } = require('v8');

let tmpTitle = null;
let tmpData = [];
let count = 0;

fs.readdir(`${__dirname}/_input`, function (err, files) {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }

    files.forEach(function (fileName) {
        let tmpFileName = `${__dirname}/_input/` + fileName;
        tmpTitle = null;
        tmpData = [];
        count = 0;

        fs.createReadStream(tmpFileName)
            .pipe(csv())
            .on('data', (rowInput) => {
                transformData(rowInput);
            })
            .on('end', () => {
                exportData(fileName);
            });
    });
});

function transformData(rowInput) {
    if (tmpTitle === null) {
        tmpTitle = rowInput["Title"];
    }
    if (rowInput["Title"] != '') {
        tmpTitle = rowInput["Title"];
    }
    if (rowInput["Image Alt Text"] != '') {
        if (tmpTitle == rowInput["Image Alt Text"]) {
            let arr = tmpData[tmpTitle];
            if (arr === undefined) {
                tmpData[tmpTitle] = [rowInput["Image Src"]];
                if (count < 1) {
                    count = 1;
                }
            } else {
                arr.push(rowInput["Image Src"])
                tmpData[tmpTitle] = arr;
                if (count < tmpData[tmpTitle].length) {
                    count = tmpData[tmpTitle].length;
                }
            }
        }
    }
}

function exportData(fileName) {
    let finalData = [];
    let headers = [];
    for (const [key, value] of Object.entries(getTemplateObject())) {
        let object = {
            id: key,
            title: key,
        }
        headers.push(object);
    }

    for (var key in tmpData) {
        var value = tmpData[key];
        let object = getTemplateObject();
        object["Title"] = key;
        for (var index in value) {
            let slot = parseInt(index) + 1;
            object["Image" + slot] = value[index];
        }
        finalData.push(object);
    }
    const csvWriter = createCsvWriter({
        path: `${__dirname}/_output/` + '_convert_' + fileName,
        header: headers,
    });

    // console.log(finalData, headers);

    console.log('-------Start export csv from: ' + `${__dirname}/_input/` + fileName);
    csvWriter
        .writeRecords(finalData)
        .then(() => console.log('Done!'));
    console.log('-------Sucess export CSV to: ' + `${__dirname}/_output/` + '_convert_' + fileName);
}

function getTemplateObject() {
    let obj = {
        'Title': '',
    };
    for (let i = 1; i <= count; i++) {
        obj["Image" + i] = '';
    }
    return obj;
}