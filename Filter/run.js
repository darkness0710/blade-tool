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
        
        // real read file
        fs.createReadStream(tmpFileName)
            .pipe(csv())
            .on('data', (rowInput) => {
                let rowOutput = mappingRow(rowInput);
                tmpData.push(rowOutput);
            })
            .on('end', () => {
                const newData = [];
                // tranform data
                let isValid = false;
                for (let i = 0; i <= tmpData.length; i++) {
                    let entity = tmpData[i];
                    if (entity == undefined) {
                        continue;
                    }
                    let value = filterByTitle(entity['Title']);
                    if (value == true) {
                        console.log(entity);
                        newData.push(entity);
                        isValid = true;
                    }
                    if (value == false) {
                        if (entity["Title"] != 0) {
                            isValid = false;
                            continue;
                        }
                        if (isValid == true) {
                            newData.push(entity);
                        }
                    }
                }
                // console.log(newData);
                const headers = [];
                const firstRecord = Object.keys(newData[0]);
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
                    .writeRecords(newData)
                    .then(() => console.log('Done!'));
                console.log(`-------Success export CSV to: ${tmpOutput}`);
                moveFiles(fileName);
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
        "Option2 Value": rowInput["Option2 Value"],
        "Option3 Name": rowInput["Option3 Name"],
        "Option3 Value": rowInput["Option3 Value"],
        "Variant Sku": rowInput["Variant Sku"],
        "Variant Grams": rowInput["Variant Grams"],
        "Variant Inventory Tracker": rowInput["Variant Inventory Tracker"],
        "Variant Inventory Qty": '999',
        "Variant Inventory Policy": rowInput["Variant Inventory Policy"],
        "Variant Fulfillment Service": rowInput["Variant Fulfillment Service"],
        "Variant Price": rowInput["Variant Price"],
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
        "Cost Per Item": rowInput["Cost Per Item"],
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

function filterByTitle(title) {
    if (title == '') {
        return false;
    }
    console.log(title);
    regex = /Gucci|Versace|Louis-Vuitton|Dior|Prada|Chanel|Saint-Laurent|Hermes|Fendi|Balenciaga|Burberry|Celine|Dolce-Gabbana|Bottega Veneta|Valentino|Tory-Burch|Loewe|Moncler|Tiffany-Co|Off-White|supreme(?!.*\1)/gi;
    return title.match(regex) != null;
}
// Add neccessary tags
// function appendTags(rowInput) {
//     let result = "";
//     let inputTags = rowInput['Tags'].replace("sc-10117721-all-products-917","sc-10108445-all-sizecharts-509");
//     if (inputTags != "") {
//         result = `${inputTags},${dateTag},${concatTag}`;

//         return result;
//     }
// }

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
