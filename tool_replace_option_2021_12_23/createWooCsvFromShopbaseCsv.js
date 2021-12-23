// Code by Arcuz / Darkness0710

const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { DefaultDeserializer } = require('v8');

fs.readdir(`${__dirname}/_input`, function (err, files) {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }

    files.forEach(function (fileName) {
        let tmpFileName = `${__dirname}/_input/` + fileName;
        const tmpData = [];

        const listImageSrc = [];
        let indexTmp = 1;
        let indexReal = 1;

        // tmp read image src
        fs.createReadStream(tmpFileName)
            .pipe(csv())
            .on('data', (rowInput) => {
                listImageSrc[indexTmp] = rowInput['Image Src'] || '';
                indexTmp++;
            })
            .on('end', () => {
            });

        fs.createReadStream(tmpFileName)
            .pipe(csv())
            .on('data', (rowInput) => {
                let rowOutput = mappingRow(rowInput, indexReal, listImageSrc);
                if (rowOutput['Name'] != '') {
                    tmpData.push(rowOutput);
                }
                indexReal++;
            })
            .on('end', () => {
                const headers = [];
                const firstRecord = Object.keys(tmpData[0]);
                firstRecord.forEach(element => {
                    let object = {
                        id: element,
                        title: element,
                    }
                    headers.push(object);
                });
                const csvWriter = createCsvWriter({
                    path: `${__dirname}/_output/` + '_convert_' + fileName,
                    header: headers
                });
                console.log('-------Start export csv from: ' + `${__dirname}/_input/` + fileName);
                csvWriter
                    .writeRecords(tmpData)
                    .then(() => console.log('Done!'));
                console.log('-------Sucess export CSV to: ' + `${__dirname}/_output/` + '_convert_' + fileName);
            });
    });
});

function mappingRow(rowInput, indexReal, listImageSrc)
{
    console.log(rowInput);
    return {
        "ID" : "",
        "Type" : formatRowType(rowInput),
        "SKU" : formatRowSku(rowInput),
        "Name" : rowInput['Title'] || '',
        "Published" : "",
        "Is featured?" : "",
        "Visibility in catalog" : "",
        "Short description" : "",
        "Description" : rowInput['Body (Html)'] || '',
        "Date sale price ends" : "",
        "Tax status" : "",
        "Tax class" : "",
        "In stock?" : "",
        "Stock" : "",
        "Low stock amount" : "",
        "Backorders allowed?" : "",
        "Sold individually?" : "",
        "Weight (kg)" : "",
        "Length (cm)" : "",
        "Width (cm)" : "",
        "Height (cm)" : "",
        "Allow customer reviews?" : "",
        "Purchase note" : "",
        "Sale price" : "",
        "Regular price" : rowInput['Variant Price'] || '',
        "Categories" : "",
        "Tags" : formatRowTags(rowInput),
        "Shipping class" : "",
        "Images" : formatImages(rowInput, indexReal, listImageSrc),
        "Download limit" : "",
        "Download expiry days" : "",
        "Parent" : "",
        "Grouped products" : "",
        "Upsells" : "",
        "Cross-sells" : "",
        "External URL" : "",
        "Button text" : "",
        "Position" : "",
        "Attribute 1 value(s)" : "",
        "Attribute 1 visible" : "",
        "Attribute 1 global" : "",
        "Attribute 1 default" : "",
        "Attribute 2 name" : "",
        "Attribute 2 value(s)" : "",
        "Attribute 2 visible" : "",
        "Attribute 2 global" : "",
        "Attribute 2 default" : "",
        "Attribute 3 name" : "",
        "Attribute 3 value(s)" : "",
        "Attribute 3 visible" : "",
        "Attribute 3 global" : "",
        "Attribute 3 default" : "",
        // "Vendor": "Custom"
    };
}

function formatRowType(rowInput)
{
    let re = /(Back Cross Dress| Baseball Jacket| Baseball Jersey| Bathroom Curtain| Bedding Set| Fleece Blanket| Bomber Jacket| Cardigan Hooded Jacket| Carpet| Crew Neck Dress| Crop Top Zip Hoodie| Doormat| A-line Dress| Fleece Bomber Jacket| Fleece Hoodie Dress| Fleece Hoodie| Hawaiian Shirt| Hooded Blanket| Hoodie Dress| Hoodie Jogger| Hoodie| Hoodie Leather Jacket| Jogger Pants| Lace-up Sweatshirt| Leather Bomber Jacket| Legging| Long Sweatshirt| Long Zip Hoodie| Longsleeve Lapel Dress| Mesh Sneakers| Net Backless Tanktop| O-neck Dress| One Piece Swimsuit| Batwing Pocket Dress| Polo Collar Dress| Polo shirt| Premium Leather Hooded Jacket| Quilt| Ring Neck Halter Dress| Romper Jumpsuit| Short Sleeve Hoodie| Sleeveless Dress| Sleeveless Hoodie| Sleeveless Long Dress| Sweater| T-shirt| Ugly Sweater| V-neck Lapel Blouse| V-neck Romper Jumpsuit| V-neck Short Sleeve Blouse| Waist Hollow Hip Dress| Zip Hoodie| Zip Sleeveless Hoodie)(?!.*\1)/g;

    return rowInput['Title'] !== 0
        ? rowInput['Title'].match(re)
        : "";
}

function formatRowTags(rowInput)
{
    return rowInput['Tags'].search('sc-')
        ? rowInput['Tags'].replace(/\,sc\-.+\-\d+/, '').replace(/\,d\d{6}/, '')
        : "";
}

function formatRowSku(rowInput)
{
    return rowInput['Variant Sku'] !== 0
        ? rowInput['Variant Sku'].slice(0,16)
        : "";
}

function formatImages(rowInput, indexReal, listImageSrc)
{
    if (rowInput['Title'] == '') {
        return '';
    }
    let left = [];
    let right = [];

    for (let i = (indexReal - 1); i >= 1; i--) {
        if (listImageSrc[i] != '') {
            left.push(listImageSrc[i]);
        } else {
            break;
        }
    }

    for (let j = (indexReal + 1); j <= listImageSrc.length; j++) {
        if (listImageSrc[j] != '') {
            right.push(listImageSrc[j]);
        } else {
            break;
        }
    }

    return [...left, ...right, listImageSrc[indexReal]].toString();
}