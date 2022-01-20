// Code by Arcuz / Darkness0710
// Last update 20-01-2022

const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { DefaultDeserializer } = require('v8');

// create folder input & output
const today = new Date().toJSON().slice(0, 10);
let foderOutputToday = `${__dirname}/_output/${today}`;
let foderInputToday = `${__dirname}/_input/${today}`;
createFolder(foderOutputToday);
createFolder(foderInputToday);

fs.readdir(`${__dirname}/_input`, function (err, files) {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }
    // filter csv file
    files = files.filter(el => path.extname(el) === '.csv');
    if (files.length == 0) {
        return console.log('File not found!');
    }

    // process file
    files.forEach(function (fileName) {
        let tmpFileName = `${__dirname}/_input/` + fileName;
        const tmpData = [];

        fs.createReadStream(tmpFileName)
            .pipe(csv())
            .on('data', (rowInput) => {
                let rowOutput = mappingRow(rowInput);
                tmpData.push(rowOutput);
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
                let tmpOutput = foderOutputToday +  '/_convert_' + fileName;
                const csvWriter = createCsvWriter({
                    path: tmpOutput,
                    header: headers
                });
                console.log('-------Start export csv from: ' + `${__dirname}/_input/` + fileName);
                csvWriter
                    .writeRecords(tmpData)
                    .then(() => console.log('Done!'));
                console.log('-------Sucess export CSV to: ' + tmpOutput);
                moveFiles([fileName]);
            });
    });

    return files;
});

function mappingRow(rowInput) {
    return {
        "id": rowInput['id'],
        "availability": "in stock",
        "condition": "new",
        "description": rowInput['description'],
        "image_link": rowInput['image_link'],
        "link": rowInput['link'],
        "title": rowInput['title'],
        "price": rowInput['price'],
        "gtin": "",
        "brand": "",
        "additional_image_link": "",
        "age_group": "Adult",
        "color": "Black",
        "gender": "Unisex",
        "item_group_id": rowInput['item_group_id'],
        "google_product_category": getGoogleProductCategory(rowInput),
        "material": "",
        "pattern": "",
        "product_type": "",
        "sale_price": "",
        "shipping": "",
        "shipping_weight": "",
        "size": rowInput['size'],
        "custom_label_0": "",
        "custom_label_1": "",
        "custom_label_2": "",
        "custom_label_3": rowInput['price'],
        "custom_label_4": "",
        "identifier_exists": "",
        "ads_label": "",
        "ads_grouping": "",
        "shipping_label": "",
        "product_identifier": "",
        "size_system": "",
        "size_type": "",
        "unit_pricing_measure": "",
        "unit_pricing_base_measure": "",
        "pricing_measure": "",
        "pricing_base_measure": "",
        "vendor": "",
        "mpn": rowInput['item_group_id']
    };
}

function getGoogleProductCategory(rowInput) {
    let result = "";
    let title = rowInput['title'];

    const category = {
        "baseball jacket": "Apparel & Accessories > Clothing > Outerwear > Coats & Jackets",
        "blanket": "Home & Garden > Linens & Bedding > Bedding > Blankets",
        "bomber jacket": "Apparel & Accessories > Clothing > Outerwear > Coats & Jackets",
        "doormat": "Home & Garden > Decor > Door Mats",
        "fleece bomber": "Apparel & Accessories > Clothing > Outerwear > Coats & Jackets",
        "fleece hoodie": "Apparel & Accessories > Clothing > Shirts & Tops",
        "hawaiian shirt": "Apparel & Accessories > Clothing > Shirts & Tops",
        "hooded blanket": "Home & Garden > Linens & Bedding > Bedding > Blankets",
        "hoodie": "Apparel & Accessories > Clothing > Shirts & Tops",
        "hoodie dress": "Apparel & Accessories > Clothing > Shirts & Tops",
        "jogger": "Apparel & Accessories > Clothing > Pants",
        "legging": "Apparel & Accessories > Clothing > Pants",
        "pocket dress": "Apparel & Accessories > Clothing > Dresses",
        "polo shirt": "Apparel & Accessories > Clothing > Shirts & Tops",
        "quilt": "Home & Garden > Linens & Bedding > Bedding > Quilts & Comforters",
        "romper": "Apparel & Accessories > Clothing > One-Pieces > Jumpsuits & Rompers",
        "sweater": "Apparel & Accessories > Clothing > Shirts & Tops",
        "tshirt": "Apparel & Accessories > Clothing > Shirts & Tops",
        "zip hoodie": "Apparel & Accessories > Clothing > Shirts & Tops",
        "poster": "Home & Garden > Decor > Artwork > Posters, Prints, & Visual Artwork",
        "Blanket": "Home & Garden > Linens & Bedding > Bedding > Blankets",
        "canvas": "Home & Garden > Decor > Artwork > Posters, Prints, & Visual Artwork",
        "t-shirt": "Apparel & Accessories > Clothing > Shirts & Tops",
        "mug": "Home & Garden > Kitchen & Dining > Tableware > Drinkware > Mugs",
        "premium jacket": "Apparel & Accessories > Clothing > Outerwear > Coats & Jackets",
        "Net backless tanktop": "Apparel & Accessories > Clothing > Shirts & Tops",
        "Back Cross Dress": "Apparel & Accessories > Clothing > Dresses",
        "A-line Dress": "Apparel & Accessories > Clothing > Dresses",
        "Sleeveless Hoodie": "Apparel & Accessories > Clothing > Shirts & Tops",
        "Short Sleeve Hoodie": "Apparel & Accessories > Clothing > Shirts & Tops",
        "V-neck Romper": "Apparel & Accessories > Clothing > One-Pieces > Jumpsuits & Rompers",
        "One Piece Swimsuit": "Apparel & Accessories > Clothing > Swimwear",
        "O-neck Dress": "Apparel & Accessories > Clothing > Dresses",
        "Sleeveless Dress": "Apparel & Accessories > Clothing > Dresses",
        "Short Sleeve Blouse": "Apparel & Accessories > Clothing > Shirts & Tops",
        "Lapel Blouse": "Apparel & Accessories > Clothing > Shirts & Tops",
        "baseball jersey": "Apparel & Accessories > Clothing > Uniforms > Sports Uniforms > Baseball Uniforms",
        "Crew Neck Dress": "Apparel & Accessories > Clothing > Dresses",
        "Hollow Hip Dress": "Apparel & Accessories > Clothing > Dresses",
        "Long Dress": "Apparel & Accessories > Clothing > Dresses",
        "Longsleeve Lapel Dress": "Apparel & Accessories > Clothing > Dresses",
        "Ring Neck Halter Dress": "Apparel & Accessories > Clothing > Dresses",
        "Polo Collar Dress": "Apparel & Accessories > Clothing > Dresses"
    };
    for (let item in category) {
        if (title.toLowerCase().slice(title.length - 20).includes(item.toLowerCase())) {
            result = category[item];
        }
    }

    return result;
}

function createFolder(dir, permission = 0755) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, permission);
    }
    return;
}

function moveFiles(files) {
    console.log('move files');
    console.log(files);
    files.forEach(fileName => {
        let oldPath = `${__dirname}/_input/` + fileName;
        let newPath = foderInputToday + '/' + fileName;
        fs.rename(oldPath, newPath, function (err) {
            console.log(err);
        });
    });
}
