export function getPrice(price) {
  let totall = "";
  let currency = "";
  let newString = price.toLowerCase();
  for (let i = 0; i < price.length; i++) {
    if (price[i] <= "9" && price[i] >= "0") {
      totall += price[i];
    } else if (newString[i] <= "z" && newString[i] >= "a") {
      currency += price[i];
    } else if (newString[i] == " ") continue;
  }
  price = totall + " " + currency;
  return price;
}
export function extractStringAndNumber(start, end, unit, data, gap = 0) {
  let tmp = "";
  if (gap === 0) {
    for (let i = start; ; i++) {
      if (data[i] === end) break;
      else if (data[i] == " ") continue;
      else tmp += data[i];
    }
  } else {
    let limit = start + gap;
    for (let i = start; i < limit; i++) {
      tmp += data[i];
    }
  }

  let result = tmp + unit;
  return result;
}
export function getProductionMileagePower(data) {
  let result = {};
  let power = data.indexOf("Moc") + 3;
  let productionDate = data.indexOf("produkcji") + 9;
  let mileage = data.indexOf("Przebieg") + 8;
  let registrationDate = data.indexOf("rejestracja") + 11;
  result.power =
    power === 2 ? "null" : extractStringAndNumber(power, "K", " KM", data);
  result.mileage =
    power === 8 ? "null" : extractStringAndNumber(mileage, "k", " km", data);
  result.productionDate =
    power === 7
      ? "null"
      : extractStringAndNumber(productionDate, "", "", data, 4);
  result.registrationDate =
    registrationDate === 10
      ? null
      : extractStringAndNumber(registrationDate, "k", "", data, 10);

  return result;
}

export function controlTheScrpaingPage(collectDataSize) {
  if (collectDataSize > 0) return 1;
  else return 0;
}
