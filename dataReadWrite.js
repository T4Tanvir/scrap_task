import fs from "fs";

//write data to the json file
//at first we need to create a empty file likes file_name.json
//which contain only ..[ ] empty json
export const readWriteJsonData = (scrapData) => {
  fs.readFile("adsData.json", function (err, data) {
    var json = JSON.parse(data);
    scrapData.map((val) => json.push(val));
    fs.writeFile("adsData.json", JSON.stringify(json, null, 2), function (err) {
      if (err) throw err;
      console.log("the data save successfully.... :)");
    });
  });
};
