import {
  getPrice,
  getProductionMileagePower,
  controlTheScrpaingPage,
} from "./helper.js";
import { readWriteJsonData } from "./dataReadWrite.js";
const _importDynamic = new Function("modulePath", "return import(modulePath)");
async function fetch(...args) {
  const { default: fetch } = await _importDynamic("node-fetch");
  return fetch(...args);
}
import * as cheerio from "cheerio";
import * as fs from "fs";




const initialUrl = "https://www.otomoto.pl/ciezarowe/uzytkowe/mercedes-benz";
let start = 1; //use for control the pagination number
let controler = 1; //use it for collect data syncronusly

//this function provide respose value from a site
const getPageHtml = async (url) => {
  try {
    const response = await fetch(url);
    const html = await response.text();
    return html;
  } catch {
    console.log("data can not scrape from the page number" + start);
    main(start);
  }
};

//its use for provide next page url
const getNextPageUrl = (pageNumber) => initialUrl + "?page=" + pageNumber;

//here we collect all individual add page url and there id
const addItem = async (html) => {
  const $ = cheerio.load(html);
  let idUrls = [];
  $(".e1b25f6f18").each((i, el) => {
    let id = $(el).attr("id");
    let url = $(el).children("div").children("h2").children("a").attr("href");
    let objectData = {
      id,
      url,
    };
    idUrls.push(objectData);
  });
  return idUrls;
};

//this function retrun the number of totall add we need scrape
const getTotallAddCount = async (url) => {
  const html = await getPageHtml(url);
  const $ = cheerio.load(html);
  const stringData = $(".ooa-njzfp").children("div").children("h1").text();
  let size = "";
  (async function loop() {
    for (let i = 0; i < stringData.length; i++) {
      if (stringData[i] <= "9" && stringData[i] >= "0") {
        size += stringData[i];
      }
    }
  })();

  return parseInt(size);
};

//here we collect the individual track data based on the url
//which we get from fuction addItem
const scrapTrackItem = async (idUrls) => {
  let finalResult = [];
  const promises = idUrls.map(async (value, index, arr) => {
    try{
      const html = await getPageHtml(value.url);
      const $ = cheerio.load(html);
    
      let title = $(".offer-summary")
        .children(".fake-title")
        .text()
        .replace(/\s\s+/g, "");
      
      let price = $(".price-wrapper")
        .children(".offer-price")
        .children(".offer-price__number")
        .text();
      price = getPrice(price);

      let summary = $(".offer-params")
        .children("ul")
        .children("li")
        .text()
        .replace(/\s\s+/g, "");
      
      let { productionDate, mileage, power, registrationDate } =
        getProductionMileagePower(summary);
      let result = {
        id: value.id,
        title,
        price,
        productionDate,
        registrationDate,
        mileage,
        power,
      };
      finalResult.push(result);
    }
    catch{
      console.log('opps!! something error occur to collect this data from this url')
      console.log(value.url)
    }
    
  });
  await Promise.all(promises);
  return finalResult;
};

//for control all the functionality step by step
const main = async (pageNumber) => {
  const url = getNextPageUrl(pageNumber);
  const html = await getPageHtml(url);
  const idUrls = await addItem(html);
  const scrapData = await scrapTrackItem(idUrls);
  
  //this function use for store data in json format
  readWriteJsonData(scrapData);
  console.log(`complete scrap the data of page number ${pageNumber}`);

  //scrapData.length>0 means we can collect data succesfully
  //else we need to rescrap the data
  start += controlTheScrpaingPage(scrapData.length);
  controler = 1; //this indicate scraping a page complete so next can start
};

let totallAdd = await getTotallAddCount(initialUrl);
//a page provide 32 ads maximum
let totallPage = Math.ceil(totallAdd / 32);
console.log(
  `totall ${totallPage} page we need to scrape and we get totall ${totallAdd} add`
);

const interval = setInterval(() => {
  console.log("scrpaing the data page number.... " + start);
  if (controler == 1){
     main(start);
     controler = 0;
   }

  if (start === totallPage) {
    clearInterval(interval);
  }
}, 6000);

