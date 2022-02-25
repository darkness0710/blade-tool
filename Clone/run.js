/****************************************************************************/
// Author: Arcuz / Darkness0710
// History:
// 1. 10-01-2022 - Create by Bladead
// 2. 20-01-2022 - Update by Arcuz
// 3. 22-02-2022 - Modified by Bladead
/****************************************************************************/
//Put import CSV into input folder and use Bat to convert Shopbase feeds created 
//with v4 + others options into formated csv file to import into Google Sheet
/****************************************************************************/

// import
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { DefaultDeserializer } = require('v8');
const { hasUncaughtExceptionCaptureCallback } = require('process');

// create folder input & output
// date format yyyy-mm-dd
const today = new Date().toJSON().slice(0, 10);
let folderOutputToday = `${__dirname}/_output/${today}`;
let folderInputToday = `${__dirname}/_input/${today}`;
createFolder(folderOutputToday);
createFolder(folderInputToday);

fs.readdir(`${__dirname}/_input`, function (err, files) {
    if (err) {
        return console.log(`Unable to scan input directory: ${err}`);
    }

    // Filter csv files
    files = files.filter(el => path.extname(el) === '.csv');
    if (files.length == 0) {
        return console.log('File not found!');
    }

    // Looping through files and processing
    files.forEach(function (fileName) {
        let tmpFileName = `${__dirname}/_input/${fileName}`;
        const tmpData = [];
        let index = 1;
        let tmpObjectCompare = {};
        let beforeOptionName1 = '';
        let afterOptionName1 = '';
        let x = 0;
        
        // real read file
        fs.createReadStream(tmpFileName)
            .pipe(csv())
            .on('data', (rowInput) => {
                let rowOutput = mappingRow(rowInput);
                // pushAndTransformData(tmpData, rowInput, false);
                //
                // if (beforeOptionName1 == '') {
                //     beforeOptionName1 = rowOutput['Option1 Value'];
                // }
                // push check data
                if (index == 1) {
                    tmpObjectCompare = Object.assign({}, rowOutput);
                    beforeOptionName1 = rowOutput["Option1 Value"];
                    x = rowOutput["Variant Price"];
                }
                
                if (index != 1 && tmpObjectCompare["Product Id"] != rowOutput["Product Id"]) {
                    // append 2 item
                    appendData(tmpData, tmpObjectCompare, beforeOptionName1, afterOptionName1, x);
                    // clear beforeOptionName1 && afterOptionName1
                    beforeOptionName1 = rowOutput["Option1 Value"];
                    afterOptionName1 = '';
                }
                if (index != 1 && tmpObjectCompare["Option1 Value"] != rowOutput["Option1 Value"]) {
                    afterOptionName1 = rowOutput["Option1 Value"];
                }
                tmpObjectCompare = Object.assign({}, rowOutput);
                // cacluate variant price and per cost item
                // caclulateVpriceAndCostItem(rowOutput);
                // push data
                pushAndTransformData(tmpData, rowOutput, x);
                // increment index
                index++;
            })
            .on('end', () => {
                // append last 2 item
                appendData(tmpData, tmpObjectCompare, beforeOptionName1, afterOptionName1, x);

                const headers = [];
                const firstRecord = Object.keys(tmpData[0]);
                firstRecord.forEach(element => {
                    let object = {
                        id: element,
                        title: element,
                    }
                    headers.push(object);
                });
                let tmpOutput = `${folderOutputToday}/_convert_${fileName}`;
                const csvWriter = createCsvWriter({
                    path: tmpOutput,
                    header: headers
                });
                console.log(`-------Start export CSV from: ${__dirname}/_input/${fileName}`);
                csvWriter
                    .writeRecords(tmpData)
                    .then(() => console.log('Done!'));
                console.log(`-------Success export CSV to: ${tmpOutput}`);
                // moveFiles(fileName);
            });
    });
    //return files;
});

// Mapping each column of input CSV into output CSV
function mappingRow(rowInput) {
    return {
        "Product Id": rowInput["Product Id"],
        "Variant Id": rowInput["Variant Id"],
        "Handle": rowInput["Handle"],
        "Title": rowInput["Title"],
        "Body (Html)": rowInput["Body (Html)"],
        "Vendor": rowInput["Vendor"],
        "Type": rowInput["Type"],
        "Tags": rowInput["Tags"],
        "Published": rowInput["Published"],
        "Custom Option": rowInput["Custom Option"],
        "Option1 Name": rowInput["Option1 Name"],
        "Option1 Value": rowInput["Option1 Value"],
        "Option2 Name": rowInput["Option2 Name"],
        "Option2 Value": getOption2Value(rowInput["Option2 Value"]),
        "Option3 Name": rowInput["Option3 Name"],
        "Option3 Value": rowInput["Option3 Value"],
        "Variant Sku": rowInput["Variant Sku"],
        "Variant Grams": rowInput["Variant Grams"],
        "Variant Inventory Tracker": rowInput["Variant Inventory Tracker"],
        "Variant Inventory Qty": '999',
        "Variant Inventory Policy": rowInput["Variant Inventory Policy"],
        "Variant Fulfillment Service": rowInput["Variant Fulfillment Service"],
        "Variant Price": getVariantPrice(rowInput["Variant Price"]),
        "Variant Compare At Price": rowInput["Variant Compare At Price"],
        "Variant Requires Shipping": rowInput["Variant Requires Shipping"],
        "Variant Taxable": rowInput["Variant Taxable"],
        "Variant Barcode": rowInput["Variant Barcode"],
        "Image Src": rowInput["Image Src"],
        "Image Position": rowInput["Image Position"],
        "Image Alt Text": rowInput["Image Alt Text"],
        "Gift Card": rowInput["Gift Card"],
        "Google Shopping / Mpn": rowInput["Google Shopping / Mpn"],
        "Google Shopping / Age Group": rowInput["Google Shopping / Age Group"],
        "Google Shopping / Gender": rowInput["Google Shopping / Gender"],
        "Google Shopping / Google Product Category": rowInput["Google Shopping / Google Product Category"],
        "Seo Title": rowInput["Seo Title"],
        "Seo Description": rowInput["Seo Description"],
        "Google Shopping / Adwords Grouping": rowInput["Google Shopping / Adwords Grouping"],
        "Google Shopping / Adwords Labels": rowInput["Google Shopping / Adwords Labels"],
        "Google Shopping / Condition": rowInput["Google Shopping / Condition"],
        "Google Shopping / Custom Product": rowInput["Google Shopping / Custom Product"],
        "Google Shopping / Custom Label 0": rowInput["Google Shopping / Custom Label 0"],
        "Google Shopping / Custom Label 1": rowInput["Google Shopping / Custom Label 1"],
        "Google Shopping / Custom Label 2": rowInput["Google Shopping / Custom Label 2"],
        "Google Shopping / Custom Label 3": rowInput["Google Shopping / Custom Label 3"],
        "Google Shopping / Custom Label 4": rowInput["Google Shopping / Custom Label 4"],
        "Variant Image": rowInput["Variant Image"],
        "Variant Weight Unit": rowInput["Variant Weight Unit"],
        "Variant Tax Code": rowInput["Variant Tax Code"],
        "Cost Per Item": getCostPerItem(rowInput["Cost Per Item"]),
        "Available On Listing Pages": rowInput["Available On Listing Pages"],
        "Available On Sitemap Files": rowInput["Available On Sitemap Files"]
    };
}

// Create coresponding folders for storage of CSVs
function createFolder(dir, permission = 0755) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, permission);
    }
    return;
}

// Move processed file into folder of the running today date
function moveFiles(file) {
    let oldPath = `${__dirname}/_input/${file}`;
    let newPath = `${folderInputToday}/${file}`;
    fs.rename(oldPath, newPath, function (err) {
        if (err) {
            return console.log(`Unable to move files: ${err}`);
        }
    });
    console.log(`-------Moving input file into ${newPath}`);
}

// Mapping get option value2
function getOption2Value(oldValue) {
    let result = oldValue;
    let mapping = {
        'XS': 'S',
        'S': 'M',
        'M': 'L',
        'L': 'XL',
        'XL': '2XL',
        '2XL': '3XL',
        '3XL': '4XL',
        '4XL': '5XL'
    };
    for (const [key, value] of Object.entries(mapping)) {
        if (key == oldValue) {
            result = value;
        }
    }
    return result;
}

//
function getVariantPrice(value) {
    return value;
}

//
function getCostPerItem(value) {
    return value;
}

//
function appendData(tmpData, tmpObjectCompare, beforeOptionName1, afterOptionName1, x) {
    // console.log(beforeOptionName1);
    // console.log('--');
    // console.log(afterOptionName1);
    // console.log('--------');
    let tmp1 = Object.assign({}, tmpObjectCompare);
    tmp1["Option1 Value"] = beforeOptionName1;
    tmp1["Option2 Value"] = getOption2Value(tmp1["Option2 Value"]);
    caclulateVpriceAndCostItem(tmp1, x);
    incrementVariant(tmp1);
    let tmp2 = Object.assign({}, tmp1);
    tmp2["Option1 Value"] = afterOptionName1;
    tmp2["Option2 Value"] = getOption2Value(tmp2["Option2 Value"]);
    caclulateVpriceAndCostItem(tmp2, x);
    incrementVariant(tmp2);
    tmpData.push(tmp1);
    tmpData.push(tmp2);
}

//
function pushAndTransformData(tmpData, item, x) {
    caclulateVpriceAndCostItem(item, x);
    tmpData.push(item);
}

function isPreniumItem(item) {
    let name = item["Option1 Value"];
    return name.startsWith('Premium');
}

//
function caclulateVpriceAndCostItem(item, x) {
    let result = parseFloat(x);
    let size = item["Option2 Value"];
    let isPrenium = isPreniumItem(item);
    if (size == 'S') {
        // hehe boy
    } 
    if (size == 'M' || size == 'L' || size == 'XL') {
        result = Math.ceil(result) - 0.01;
    }
    if (size == '2XL') {
        result = Math.ceil(result) - 0.01 + 2;
    }
    if (size == '3XL') {
        result = Math.ceil(result) - 0.01 + 4;
    }
    if (size == '4XL') {
        result = Math.ceil(result) - 0.01 + 6;
    }
    if (size == '5XL') {
        result = Math.ceil(result) - 0.01  + 8;
    }
    if (isPrenium) {
        result = result + 5;
        // throw new hasUncaughtExceptionCaptureCallback('');
    }
    item["Variant Price"] = result;
    item["Cost Per Item"] = result;
}

//
function incrementVariant(item)
{
    // increment Variant Sku
    let variantSkul = item['Variant Sku'];
    let arr = variantSkul.split('-');
    arr[arr.length - 1] = parseInt(arr[arr.length - 1]) + 1;
    item['Variant Sku'] = arr.join('-');
    // increment Variant Id
    item['Variant Id'] = parseInt(item['Variant Id']) + 1;
}